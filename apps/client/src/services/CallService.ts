import { io, Socket } from 'socket.io-client';

interface CallUpdateEvent {
  state: 'created' | 'ringing' | 'accepted' | 'declined' | 'ended';
  staffId?: string;
  reason?: string;
}

interface CallSDPEvent {
  callId: string;
  type: 'offer' | 'answer';
  sdp: string;
}

interface CallICEEvent {
  callId: string;
  candidate: RTCIceCandidateInit;
}

const API_BASE = import.meta.env.VITE_API_BASE || 
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8080');
const SOCKET_PATH = import.meta.env.VITE_SOCKET_PATH || '/socket';
const ENABLE_UNIFIED = import.meta.env.VITE_ENABLE_UNIFIED_MODE === 'true';

export interface CallServiceOptions {
  apiBase?: string;
  token: string;
  clientId: string;
}

export class CallService {
  private socket: Socket | null = null;
  private apiBase: string;
  private token: string;
  private clientId: string;
  private activeCalls: Map<string, { pc: RTCPeerConnection; stream: MediaStream }> = new Map();

  constructor({ apiBase = API_BASE, token, clientId }: CallServiceOptions) {
    this.apiBase = apiBase;
    this.token = token;
    this.clientId = clientId;
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  private async ensureValidToken(): Promise<boolean> {
    // Simply check if token exists and refresh proactively
    // JWT tokens expire in 15 minutes, so we refresh if token is old
    if (!this.token) {
      return await this.refreshToken();
    }
    
    // Check token expiration (refresh if expires in less than 5 minutes)
    try {
      const tokenData = JSON.parse(atob(this.token.split('.')[1]));
      const timeUntilExpiry = tokenData.exp - (Date.now() / 1000);
      // If token expires in less than 5 minutes (300 seconds), refresh it
      if (timeUntilExpiry < 300) {
        return await this.refreshToken();
      }
      return true;
    } catch (error) {
      // If token parsing fails, refresh it
      console.error('Token validation error:', error);
      return await this.refreshToken();
    }
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const apiBase = this.apiBase.replace(/\/api$/, '') || 
        (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8080');
      
      const res = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: this.clientId,
          role: 'client',
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to refresh token: ${res.statusText}`);
      }

      const data = await res.json();
      if (data.token) {
        this.token = data.token;
        localStorage.setItem('clara-jwt-token', this.token);
        
        // Reconnect socket with new token
        if (this.socket) {
          this.socket.disconnect();
          this.socket = null;
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return false;
    }
  }

  private ensureSocket() {
    if (!this.socket) {
      const socketUrl = this.apiBase.replace(/\/api$/, '');
      this.socket = io(`${socketUrl}/rtc`, {
        path: SOCKET_PATH,
        auth: { token: this.token },
      });
    }
    return this.socket;
  }

  async startCall({
    targetStaffId,
    department,
    purpose,
    onAccepted,
    onDeclined,
    onError,
  }: {
    targetStaffId?: string;
    department?: string;
    purpose?: string;
    onAccepted?: (callId: string, pc: RTCPeerConnection, stream: MediaStream) => void;
    onDeclined?: (reason?: string) => void;
    onError?: (error: Error) => void;
  }): Promise<{ callId: string; pc: RTCPeerConnection; stream: MediaStream } | null> {
    if (!ENABLE_UNIFIED) {
      console.warn('Unified mode disabled');
      return null;
    }

    try {
      // Ensure token is valid before making call
      const tokenValid = await this.ensureValidToken();
      if (!tokenValid) {
        throw new Error('Authentication failed. Please refresh the page.');
      }

      // Initiate call
      const res = await fetch(`${this.apiBase}/api/calls/initiate`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ clientId: this.clientId, targetStaffId, department, purpose }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          // Token expired during call, try refreshing once more
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Retry the call with new token
            const retryRes = await fetch(`${this.apiBase}/api/calls/initiate`, {
              method: 'POST',
              headers: this.getHeaders(),
              body: JSON.stringify({ clientId: this.clientId, targetStaffId, department, purpose }),
            });
            if (!retryRes.ok) {
              throw new Error(`Failed to initiate call: ${retryRes.statusText}`);
            }
            const retryData = await retryRes.json();
            return await this.setupCallConnection(retryData.callId, onAccepted, onDeclined);
          } else {
            throw new Error('Authentication failed. Please refresh the page.');
          }
        }
        const errorText = await res.text();
        throw new Error(`Failed to initiate call: ${res.statusText} - ${errorText}`);
      }

      const { callId } = await res.json();
      return await this.setupCallConnection(callId, onAccepted, onDeclined);
    } catch (error) {
      console.error('CallService.startCall error:', error);
      if (onError) onError(error as Error);
      return null;
    }
  }

  private async setupCallConnection(
    callId: string,
    onAccepted?: (callId: string, pc: RTCPeerConnection, stream: MediaStream) => void,
    onDeclined?: (reason?: string) => void
  ): Promise<{ callId: string; pc: RTCPeerConnection; stream: MediaStream }> {
    // Join call room
    const socket = this.ensureSocket();
    socket.emit('join:call', { callId });

    // Create peer connection
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    // Get user media
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    // Handle ICE candidates
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        fetch(`${this.apiBase}/api/calls/ice`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ callId, from: this.clientId, candidate: e.candidate }),
        }).catch(console.error);
      }
    };

    // Handle remote stream
    pc.ontrack = (e) => {
      if (onAccepted) {
        onAccepted(callId, pc, e.streams[0]);
      }
    };

    // Listen for call updates
    socket.on('call:update', ({ state, reason }: CallUpdateEvent) => {
      if (state === 'declined') {
        stream.getTracks().forEach((t) => t.stop());
        pc.close();
        this.activeCalls.delete(callId);
        if (onDeclined) onDeclined(reason);
      } else if (state === 'accepted') {
        // Create and send offer
        this.createOffer(callId, pc);
      }
    });

    // Listen for SDP answer
    socket.on('call:sdp', async ({ type, sdp }: CallSDPEvent) => {
      if (type === 'answer') {
        await pc.setRemoteDescription({ type: 'answer', sdp });
      }
    });

    // Listen for ICE candidates
    socket.on('call:ice', async ({ candidate }: CallICEEvent) => {
      if (candidate) {
        await pc.addIceCandidate(candidate);
      }
    });

    this.activeCalls.set(callId, { pc, stream });

    return { callId, pc, stream };
  }

  private async createOffer(callId: string, pc: RTCPeerConnection) {
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      await fetch(`${this.apiBase}/api/calls/sdp`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ callId, from: this.clientId, type: 'offer', sdp: offer.sdp }),
      });
    } catch (error) {
      console.error('Failed to create offer:', error);
    }
  }

  endCall(callId: string) {
    const call = this.activeCalls.get(callId);
    if (call) {
      call.stream.getTracks().forEach((t) => t.stop());
      call.pc.close();
      this.activeCalls.delete(callId);
    }
  }

  disconnect() {
    this.activeCalls.forEach((call) => {
      call.stream.getTracks().forEach((t) => t.stop());
      call.pc.close();
    });
    this.activeCalls.clear();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

