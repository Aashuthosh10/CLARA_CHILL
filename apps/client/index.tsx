import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Modality, Blob, FunctionDeclaration, Type } from '@google/genai';
import { CallService } from './src/services/CallService';

// --- Helper functions for Audio Encoding/Decoding ---

function encode(bytes) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data, ctx, sampleRate, numChannels) {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data) {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
}


// --- React Components & Icons ---

const MicOnIcon = ({size=24}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
);
const MicOffIcon = ({size=24}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
);
const CameraOnIcon = ({size=24}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"></path></svg>
);
const CameraOffIcon = ({size=24}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M21 6.5l-4 4V7h-6.18l2 2H16v.92l4 4V6.5zm-1.12 9.38L18.8 15.3l-4-4V7H8.8l-2-2H16c.55 0 1 .45 1 1v3.5l4 4zm-16-1.59l1.41-1.41 1.47 1.47-1.41 1.41-1.47-1.47zM4.41 6.41L3 4.99 4.41 3.58 3 2.17l1.41-1.41 18 18-1.41 1.41-2.92-2.92H4c-.55 0-1-.45-1-1V7c0-.55.45-1 1-1h.41l-1.59-1.59z"></path></svg>
);
const RobotIcon = ({size = 24}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M20 12h-2V9c0-1.1-.9-2-2-2h-1c-.55 0-1 .45-1 1s.45 1 1 1h1v2H8V9h1c.55 0 1-.45 1-1s-.45-1-1-1H8c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1v1c0 .55.45 1 1 1s1-.45 1-1v-1h10v1c0 .55.45 1 1 1s1-.45 1-1v-1h1c1.1 0 2-.9 2-2v-2c0-1.1-.9-2-2-2zm-4.5 3h-7c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h7c.28 0 .5.22.5.5s-.22.5-.5.5zM15 11H9V9h6v2z"></path></svg>
);
const UserIcon = ({size = 24}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>
);
const GraduationCapIcon = ({size=16}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 8.47L4.5 8 12 5l7.5 3L12 11.47zM10.5 13.5v3.45c0 1.15.39 2.18 1.05 2.94.66.77 1.63 1.21 2.7 1.21 1.76 0 3.25-1.49 3.25-3.32V13.5h-1.5v3.28c0 .99-.6 1.82-1.75 1.82-.92 0-1.75-.83-1.75-1.82V13.5h-2.5z"></path></svg>
);
const StaffLoginIcon = ({size=16}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>
);
const VideoCallHeaderIcon = ({size=16}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"></path></svg>
);
const SpeakerIcon = ({size=20}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path></svg>
);
const PencilIcon = ({size=20}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg>
);


const staffList = [
    { name: 'Prof. Lakshmi Durga N', shortName: 'LDN' },
    { name: 'Prof. Anitha C S', shortName: 'ACS' },
    { name: 'Dr. G Dhivyasri', shortName: 'GD' },
    { name: 'Prof. Nisha S K', shortName: 'NSK' },
    { name: 'Prof. Amarnath B Patil', shortName: 'ABP' },
    { name: 'Dr. Nagashree N', shortName: 'NN' },
    { name: 'Prof. Anil Kumar K V', shortName: 'AKV' },
    { name: 'Prof. Jyoti Kumari', shortName: 'JK' },
    { name: 'Prof. Vidyashree R', shortName: 'VR' },
    { name: 'Dr. Bhavana A', shortName: 'BA' },
    { name: 'Prof. Bhavya T N', shortName: 'BTN' },
];

const initiateVideoCallFunction: FunctionDeclaration = {
    name: 'initiateVideoCall',
    description: 'Initiates a video call with a specific staff member.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            staffShortName: {
                type: Type.STRING,
                description: 'The short name (e.g., "ACS", "LDN") of the staff member to call.',
            },
        },
        required: ['staffShortName'],
    },
};

const PreChatModal = ({ onStart }) => {
    const [details, setDetails] = useState({
        name: '',
        phone: '+91',
        purpose: '',
        staffShortName: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (details.name.trim() && details.purpose.trim()) {
            onStart(details);
        } else {
            alert('Please fill in your name and purpose.');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <RobotIcon size={28} />
                    <h1>Start Conversation with Clara</h1>
                </div>
                <p>Please provide your details below to begin.</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-field">
                        <label htmlFor="name">Name</label>
                        <input type="text" id="name" name="name" value={details.name} onChange={handleChange} required />
                    </div>
                    <div className="form-field">
                        <label htmlFor="phone">Phone Number</label>
                        <input type="tel" id="phone" name="phone" value={details.phone} onChange={handleChange} />
                    </div>
                    <div className="form-field">
                         <label htmlFor="purpose">Purpose</label>
                         <textarea id="purpose" name="purpose" value={details.purpose} onChange={handleChange} required />
                    </div>
                    <div className="form-field">
                        <label htmlFor="staff">Connect with (Optional)</label>
                        <select id="staff" name="staffShortName" value={details.staffShortName} onChange={handleChange}>
                            <option value="">Select a staff member...</option>
                            {staffList.map(staff => (
                                <option key={staff.shortName} value={staff.shortName}>
                                    {staff.name} ({staff.shortName})
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type="submit">Start Chatting</button>
                </form>
            </div>
        </div>
    );
};

const VideoCallView = ({ staff, onEndCall, activeCall }) => {
    const userVideoRef = useRef(null);
    const staffVideoRef = useRef(null);
    const streamRef = useRef(null);
    const animationFrameRef = useRef(null);
    const audioContextRef = useRef(null);

    const [countdown, setCountdown] = useState(3);
    const [isConnected, setIsConnected] = useState(false);
    const [isUserSpeaking, setIsUserSpeaking] = useState(false);
    const [isStaffSpeaking, setIsStaffSpeaking] = useState(false);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);

    // Countdown effect
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            setIsConnected(true);
        }
    }, [countdown]);
    
    // Watch for remote stream and update staff video
    useEffect(() => {
        if (activeCall?.remoteStream && staffVideoRef.current) {
            staffVideoRef.current.srcObject = activeCall.remoteStream;
            setIsConnected(true);
        }
    }, [activeCall?.remoteStream]);

    // Simulated staff speaking effect (only if no remote stream)
    useEffect(() => {
        if (!isConnected || activeCall?.remoteStream) return;
        const interval = setInterval(() => {
            setIsStaffSpeaking(prev => Math.random() > 0.5 ? !prev : prev);
        }, 1200);
        return () => clearInterval(interval);
    }, [isConnected, activeCall?.remoteStream]);

    useEffect(() => {
        const startCameraAndAudio = async () => {
            try {
                // Use activeCall's local stream if available, otherwise get new stream
                let stream: MediaStream;
                if (activeCall?.localStream) {
                    stream = activeCall.localStream;
                    streamRef.current = stream;
                } else {
                    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    streamRef.current = stream;
                }
                
                if (userVideoRef.current) {
                    userVideoRef.current.srcObject = stream;
                }

                // Setup audio analysis for speaker detection
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                audioContextRef.current = audioContext;
                const source = audioContext.createMediaStreamSource(stream);
                const analyser = audioContext.createAnalyser();
                analyser.fftSize = 512;
                source.connect(analyser);

                const dataArray = new Uint8Array(analyser.frequencyBinCount);
                const checkSpeaking = () => {
                    analyser.getByteTimeDomainData(dataArray);
                    let sum = 0;
                    for (const amplitude of dataArray) {
                        sum += Math.pow(amplitude / 128 - 1, 2);
                    }
                    const volume = Math.sqrt(sum / dataArray.length);
                    const SPEAKING_THRESHOLD = 0.02;
                    
                    const audioTrack = streamRef.current?.getAudioTracks()[0];
                    if (audioTrack?.enabled) {
                        setIsUserSpeaking(volume > SPEAKING_THRESHOLD);
                    } else {
                        setIsUserSpeaking(false);
                    }
                    animationFrameRef.current = requestAnimationFrame(checkSpeaking);
                };
                checkSpeaking();

                // Remote stream handling is done in separate useEffect above

            } catch (err) {
                console.error("Error accessing camera/mic:", err);
                alert("Could not access your camera or microphone. Please check permissions and try again.");
                onEndCall();
            }
        };

        startCameraAndAudio();

        return () => {
            cancelAnimationFrame(animationFrameRef.current);
            // Don't stop tracks if they're from activeCall (will be cleaned up by CallService)
            if (streamRef.current && !activeCall?.localStream) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (audioContextRef.current) {
                audioContextRef.current.close().catch(console.error);
            }
        };
    }, [onEndCall, activeCall]);

    const toggleMic = () => {
        if (streamRef.current) {
            const audioTrack = streamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMicOn(audioTrack.enabled);
            }
        }
    };
    
    const toggleCamera = () => {
        if (streamRef.current) {
            const videoTrack = streamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsCameraOn(videoTrack.enabled);
            }
        }
    };

    return (
        <div className="video-call-container">
             {countdown > 0 && (
                <div className="countdown-overlay">
                    <div className="countdown-number">{countdown}</div>
                </div>
            )}
            <div className="staff-video-view">
                {activeCall?.remoteStream ? (
                    <video ref={staffVideoRef} autoPlay playsInline className="staff-video"></video>
                ) : (
                    <div className={`staff-avatar-placeholder ${isStaffSpeaking && isConnected ? 'speaking' : ''}`}>
                        <StaffLoginIcon size={80} />
                    </div>
                )}
                <h2>{staff.name}</h2>
                <p>{isConnected ? 'Connected' : 'Connecting...'}</p>
                 <div className="video-call-branding">
                    <RobotIcon size={20} /> Clara Video
                </div>
            </div>
            <div className={`user-video-view ${isUserSpeaking ? 'speaking' : ''}`}>
                 {isCameraOn ? (
                    <video ref={userVideoRef} autoPlay playsInline muted></video>
                ) : (
                    <div className="user-video-placeholder">
                        <UserIcon size={48} />
                    </div>
                )}
            </div>
            <div className="video-controls">
                <button className={`control-button ${!isMicOn ? 'off' : ''}`} onClick={toggleMic} aria-label={isMicOn ? 'Mute microphone' : 'Unmute microphone'}>
                    {isMicOn ? <MicOnIcon size={24}/> : <MicOffIcon size={24}/>}
                </button>
                <button className={`control-button ${!isCameraOn ? 'off' : ''}`} onClick={toggleCamera} aria-label={isCameraOn ? 'Turn off camera' : 'Turn on camera'}>
                     {isCameraOn ? <CameraOnIcon size={24}/> : <CameraOffIcon size={24}/>}
                </button>
                <button className="end-call-button" onClick={onEndCall}>
                    End Call
                </button>
            </div>
        </div>
    );
};


const App = () => {
    const [messages, setMessages] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [status, setStatus] = useState('Click the microphone to speak');
    const [showPreChatModal, setShowPreChatModal] = useState(true);
    const [preChatDetails, setPreChatDetails] = useState(null);
    const [view, setView] = useState('chat'); // 'chat', 'video_call'
    const [videoCallTarget, setVideoCallTarget] = useState(null);
    const [unifiedCallService, setUnifiedCallService] = useState<CallService | null>(null);
    const [isUnifiedCalling, setIsUnifiedCalling] = useState(false);
    const [activeCall, setActiveCall] = useState<{ callId: string; pc: RTCPeerConnection; localStream: MediaStream; remoteStream: MediaStream | null } | null>(null);
    
    const sessionPromiseRef = useRef(null);
    const isReconnectingRef = useRef(false);
    const reconnectAttemptsRef = useRef(0);
    const maxReconnectAttempts = 3;
    const isIntentionallyClosingRef = useRef(false);
    const inputAudioContextRef = useRef(null);
    const outputAudioContextRef = useRef(null);
    const outputNodeRef = useRef(null);
    const scriptProcessorRef = useRef(null);
    const mediaStreamSourceRef = useRef(null);
    const streamRef = useRef(null);
    const sourcesRef = useRef(new Set());
    const nextStartTimeRef = useRef(0);
    const chatContainerRef = useRef(null);
    const silenceStartRef = useRef(null);
    const isRecordingRef = useRef(false);
    // Accumulators for streaming transcriptions so full sentences are shown
    const inputAccumRef = useRef<string>('');
    const outputAccumRef = useRef<string>('');

    // Merge incremental transcript chunks without duplicating words
    const appendDelta = (prev: string, next: string) => {
        if (!prev) return next || '';
        if (!next) return prev;
        if (next.startsWith(prev)) return next;
        const needsSpace = !(prev.endsWith(' ') || next.startsWith(' '));
        return prev + (needsSpace ? ' ' : '') + next;
    };

    useEffect(() => {
        // Clear sessionStorage on page load/refresh to force fresh start
        try {
            sessionStorage.removeItem('clara-prechat-details');
            sessionStorage.removeItem('clara-chat-history');
        } catch (error) {
            console.error("Failed to clear session storage", error);
        }
        
        // Initialize unified call service if enabled
        const enableUnified = import.meta.env.VITE_ENABLE_UNIFIED_MODE === 'true';
        if (enableUnified) {
            // Get or create token
            let token = localStorage.getItem('clara-jwt-token');
            if (!token) {
                // Auto-login for demo (in production, this should come from auth)
                const apiBase = import.meta.env.VITE_API_BASE || 
                  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8080');
                fetch(`${apiBase}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: 'client-' + Date.now(),
                        role: 'client',
                    }),
                })
                    .then((res) => res.json())
                .then((data) => {
                    token = data.token;
                    if (token) {
                        localStorage.setItem('clara-jwt-token', token);
                        const clientId = 'client-' + Date.now();
                        localStorage.setItem('clara-client-id', clientId);
                        const service = new CallService({
                            token,
                            clientId,
                        });
                        setUnifiedCallService(service);
                    }
                })
                    .catch(console.error);
            } else {
                const service = new CallService({
                    token,
                    clientId: localStorage.getItem('clara-client-id') || 'client-' + Date.now(),
                });
                setUnifiedCallService(service);
            }
        }
        
        // Initialize output audio context on page load (required for audio playback)
        if (typeof window !== 'undefined' && !outputAudioContextRef.current) {
            try {
                outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                outputNodeRef.current = outputAudioContextRef.current.createGain();
                outputNodeRef.current.connect(outputAudioContextRef.current.destination);
                outputNodeRef.current.gain.value = 1.0;
            } catch (error) {
                console.error('Error initializing audio context on page load:', error);
            }
        }
        
        // Don't set messages here - let handleStartConversation set the greeting after login
        // Pre-chat modal will show because showPreChatModal defaults to true
    }, []);

    useEffect(() => {
        try {
            if (preChatDetails) {
                sessionStorage.setItem('clara-prechat-details', JSON.stringify(preChatDetails));
            }
            if (messages.length > 0) {
              sessionStorage.setItem('clara-chat-history', JSON.stringify(messages));
            }
        } catch (error) {
            console.error("Failed to save to session storage", error);
        }
    }, [preChatDetails, messages]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Helper function to create message handler
    const createMessageHandler = () => {
        return async (message) => {
            // Handle tool calls first
            if (message.toolCall) {
                for (const fc of message.toolCall.functionCalls) {
                    if (fc.name === 'initiateVideoCall') {
                        const { staffShortName } = fc.args;
                        const staffToCall = staffList.find(s => s.shortName === staffShortName);
                        
                        if (staffToCall && unifiedCallService) {
                            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            setMessages(prev => [...prev, { sender: 'clara', text: `Initiating video call with ${staffToCall.name}...`, isFinal: true, timestamp }]);
                            stopRecording(true);
                            
                            // Actually start the WebRTC call
                            unifiedCallService.startCall({
                                targetStaffId: staffToCall.shortName, // Use shortName as staffId
                                purpose: 'Voice-initiated video call',
                                onAccepted: (callId, pc, remoteStream) => {
                                    console.log('Call accepted:', callId);
                                    // Update activeCall with remote stream
                                    setActiveCall(prev => prev ? {
                                        ...prev,
                                        remoteStream,
                                    } : null);
                                    
                                    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    setMessages(prev => [...prev, { sender: 'clara', text: `Video call with ${staffToCall.name} connected!`, isFinal: true, timestamp }]);
                                },
                                onDeclined: (reason) => {
                                    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    setMessages(prev => [...prev, { sender: 'clara', text: `Call declined${reason ? ': ' + reason : ''}.`, isFinal: true, timestamp }]);
                                    setView('chat');
                                },
                                onError: (error) => {
                                    console.error('Call error:', error);
                                    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    setMessages(prev => [...prev, { sender: 'clara', text: `Failed to start call: ${error.message}`, isFinal: true, timestamp }]);
                                    setView('chat');
                                }
                            }).then((result) => {
                                if (result) {
                                    // Store local stream from result immediately
                                    const callState = {
                                        callId: result.callId,
                                        pc: result.pc,
                                        localStream: result.stream,
                                        remoteStream: null as MediaStream | null,
                                    };
                                    setActiveCall(callState);
                                    setVideoCallTarget(staffToCall);
                                    setView('video_call');
                                } else {
                                    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    setMessages(prev => [...prev, { sender: 'clara', text: 'Failed to start call. Please try again.', isFinal: true, timestamp }]);
                                }
                            }).catch((error) => {
                                console.error('Call initiation error:', error);
                                const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                setMessages(prev => [...prev, { sender: 'clara', text: `Failed to start call: ${error.message}`, isFinal: true, timestamp }]);
                            });

                            sessionPromiseRef.current.then((session) => {
                                session.sendToolResponse({
                                    functionResponses: { id: fc.id, name: fc.name, response: { result: "Video call initiated successfully." } }
                                })
                            }).catch(console.error);
                        } else {
                            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            const errorMsg = !staffToCall 
                                ? `Sorry, I couldn't find a staff member with the ID "${staffShortName}".` 
                                : 'Video calling is not available. Please enable unified mode.';
                            setMessages(prev => [...prev, { sender: 'clara', text: errorMsg, isFinal: true, timestamp }]);
                        }
                    }
                }
                return;
            }

            // Handle real-time transcription updates (user) – accumulate full text
            if (message.serverContent?.inputTranscription) {
                const newText = message.serverContent.inputTranscription.text || '';
                inputAccumRef.current = appendDelta(inputAccumRef.current, newText);
                // Update or create user message in real-time
                setMessages(prev => {
                    let lastUserMsgIndex = -1;
                    for (let i = prev.length - 1; i >= 0; i--) {
                        if (prev[i].sender === 'user' && !prev[i].isFinal) {
                            lastUserMsgIndex = i;
                            break;
                        }
                    }
                    if (lastUserMsgIndex >= 0) {
                        const updated = [...prev];
                        updated[lastUserMsgIndex] = {
                            ...updated[lastUserMsgIndex],
                            text: inputAccumRef.current,
                            isFinal: false,
                            timestamp: updated[lastUserMsgIndex].timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        };
                        return updated;
                    }
                    return [...prev, {
                        sender: 'user',
                        text: inputAccumRef.current,
                        isFinal: false,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }];
                });
            }

            // Handle output transcription (Clara) – accumulate full text
            if (message.serverContent?.outputTranscription) {
                const newText = message.serverContent.outputTranscription.text || '';
                outputAccumRef.current = appendDelta(outputAccumRef.current, newText);
                setMessages(prev => {
                    let lastClaraMsgIndex = -1;
                    for (let i = prev.length - 1; i >= 0; i--) {
                        if (prev[i].sender === 'clara' && !prev[i].isFinal) {
                            lastClaraMsgIndex = i;
                            break;
                        }
                    }
                    if (lastClaraMsgIndex >= 0) {
                        const updated = [...prev];
                        updated[lastClaraMsgIndex] = {
                            ...updated[lastClaraMsgIndex],
                            text: outputAccumRef.current,
                            isFinal: false,
                            timestamp: updated[lastClaraMsgIndex].timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        };
                        return updated;
                    }
                    return [...prev, {
                        sender: 'clara',
                        text: outputAccumRef.current,
                        isFinal: false,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }];
                });
            }

            // Handle turn completion - finalize messages and flush accumulators
            if (message.serverContent?.turnComplete) {
                setMessages(prev => {
                    const updated = [...prev];
                    // Finalize last user message
                    let lastUserIndex = -1;
                    for (let i = updated.length - 1; i >= 0; i--) {
                        if (updated[i].sender === 'user' && !updated[i].isFinal) { lastUserIndex = i; break; }
                    }
                    if (lastUserIndex >= 0) {
                        updated[lastUserIndex] = { ...updated[lastUserIndex], text: inputAccumRef.current || updated[lastUserIndex].text, isFinal: true };
                    }
                    // Finalize last Clara message
                    let lastClaraIndex = -1;
                    for (let i = updated.length - 1; i >= 0; i--) {
                        if (updated[i].sender === 'clara' && !updated[i].isFinal) { lastClaraIndex = i; break; }
                    }
                    if (lastClaraIndex >= 0) {
                        updated[lastClaraIndex] = { ...updated[lastClaraIndex], text: outputAccumRef.current || updated[lastClaraIndex].text, isFinal: true };
                    }
                    return updated;
                });
                // clear for next turn
                inputAccumRef.current = '';
                outputAccumRef.current = '';

                // Check when audio playback is done and reset status
                const checkPlaybackAndReset = () => {
                    const isPlaying = nextStartTimeRef.current > outputAudioContextRef.current.currentTime;
                    if (sourcesRef.current.size === 0 && !isPlaying) {
                        setStatus('Click the microphone to speak');
                    } else {
                        setTimeout(checkPlaybackAndReset, 100);
                    }
                };
                setTimeout(checkPlaybackAndReset, 50);
            }

            // Handle audio playback - process immediately without delay
            const base64EncodedAudioString = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64EncodedAudioString) {
                setStatus('Responding...');
                
                try {
                    // Ensure audio context is running
                    if (!outputAudioContextRef.current || outputAudioContextRef.current.state === 'closed') {
                        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                        outputNodeRef.current = outputAudioContextRef.current.createGain();
                        outputNodeRef.current.connect(outputAudioContextRef.current.destination);
                        outputNodeRef.current.gain.value = 1.0;
                    }
                    
                    // Resume if suspended (critical for audio playback)
                    if (outputAudioContextRef.current.state === 'suspended') {
                        try {
                            await outputAudioContextRef.current.resume();
                            console.log('Audio context resumed for playback');
                        } catch (resumeError) {
                            console.error('Error resuming audio context for playback:', resumeError);
                            // Try to create new context if resume fails
                            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                            outputNodeRef.current = outputAudioContextRef.current.createGain();
                            outputNodeRef.current.connect(outputAudioContextRef.current.destination);
                            outputNodeRef.current.gain.value = 1.0;
                        }
                    }
                    
                    const decodedAudio = decode(base64EncodedAudioString);
                    const audioBuffer = await decodeAudioData(decodedAudio, outputAudioContextRef.current, 24000, 1);

                    // Use current time for immediate playback, but queue properly
                    const currentTime = outputAudioContextRef.current.currentTime;
                    const startTime = Math.max(nextStartTimeRef.current, currentTime);
                    
                    const source = outputAudioContextRef.current.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(outputNodeRef.current);
                    source.start(startTime);
                    
                    // Update next start time for proper queuing
                    nextStartTimeRef.current = startTime + audioBuffer.duration;
                    
                    sourcesRef.current.add(source);
                    source.onended = () => {
                        sourcesRef.current.delete(source);
                        // Clear nextStartTime if all sources are done
                        if (sourcesRef.current.size === 0) {
                            nextStartTimeRef.current = 0;
                            // Update status when audio is done
                            if (!isRecordingRef.current) {
                                setStatus('Click the microphone to speak');
                            }
                        }
                    };
                } catch (error) {
                    console.error('Error processing audio:', error);
                    setStatus('Audio playback error. Click mic to try again.');
                }
            }
        };
    };

    // Helper function to initialize session
    const initializeSession = async (shouldGreet = false) => {
        // Check if we have preChatDetails before attempting to initialize
        if (!preChatDetails) {
            console.warn('Cannot initialize session: preChatDetails missing');
            throw new Error('Session initialization requires user details. Please complete the pre-chat form.');
        }
        
        // Clear any existing session first
        isIntentionallyClosingRef.current = true; // Mark as intentional to prevent reconnection loop
        if (sessionPromiseRef.current) {
            try {
                const oldSession = await sessionPromiseRef.current;
                if (oldSession) {
                    oldSession.close().catch(console.error);
                }
            } catch (error) {
                console.error('Error closing old session:', error);
            }
            sessionPromiseRef.current = null;
        }
        isIntentionallyClosingRef.current = false; // Reset after cleanup

        // Reset accumulators
        inputAccumRef.current = '';
        outputAccumRef.current = '';

        // Get user details first (needed for error messages)
        const { name, purpose, staffShortName } = preChatDetails || {};

        // Validate API key first
        if (!process.env.API_KEY) {
            const errorMsg = 'Gemini API key is missing. Please set GEMINI_API_KEY in your .env file.';
            console.error(errorMsg);
            setStatus(errorMsg);
            if (shouldGreet) {
                const greetingText = name 
                    ? `Hi ${name}! I'm Clara, but I'm having trouble connecting. Please check the API key configuration.`
                    : "Hi there! I'm Clara, but I'm having trouble connecting. Please check the API key configuration.";
                setMessages([{ sender: 'clara', text: greetingText, isFinal: true, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
            }
            throw new Error(errorMsg);
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        if (!outputAudioContextRef.current || outputAudioContextRef.current.state === 'closed') {
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        
        // Resume audio context if suspended (required after user interaction)
        if (outputAudioContextRef.current.state === 'suspended') {
            try {
                await outputAudioContextRef.current.resume();
            } catch (error) {
                console.error('Error resuming audio context:', error);
            }
        }
        
        if (!outputNodeRef.current) {
            outputNodeRef.current = outputAudioContextRef.current.createGain();
            outputNodeRef.current.connect(outputAudioContextRef.current.destination);
            outputNodeRef.current.gain.value = 1.0;
        }
        const selectedStaff = staffList.find(s => s.shortName === staffShortName);
        const staffHint = selectedStaff ? `${selectedStaff.name} (${selectedStaff.shortName})` : 'Not specified';
        
        const systemInstruction = `**PRIMARY DIRECTIVE: You MUST detect the user's language and respond ONLY in that same language. This is a strict requirement.**

You are CLARA, the official, friendly, and professional AI receptionist for Sai Vidya Institute of Technology (SVIT). Your goal is to assist users efficiently. Keep your spoken responses concise and to the point to ensure a fast, smooth conversation.

**Caller Information (Context):**
- Name: ${name || 'Unknown'}
- Stated Purpose: ${purpose || 'Not specified'}
- Staff to connect with: ${staffHint}

**Your Capabilities & Rules:**
1.  **Staff Knowledge:** You know the following staff members. Use this map to identify them if mentioned:
    - LDN: Prof. Lakshmi Durga N
    - ACS: Prof. Anitha C S
    - GD: Dr. G Dhivyasri
    - NSK: Prof. Nisha S K
    - ABP: Prof. Amarnath B Patil
    - NN: Dr. Nagashree N
    - AKV: Prof. Anil Kumar K V
    - JK: Prof. Jyoti Kumari
    - VR: Prof. Vidyashree R
    - BA: Dr. Bhavana A
    - BTN: Prof. Bhavya T N
2.  **College Information:** Answer questions about admissions, fees, placements, facilities, departments, and general college info.
3.  **Actions:**
    - If the user expresses a clear intent to start a video call or meet with a specific staff member (e.g., 'call Anitha', 'I want to see Prof. Lakshmi'), you MUST use the \`initiateVideoCall\` tool. Do not just confirm; use the tool directly.
    - If asked about schedules or availability, offer to check.
4.  **General Queries:** For topics outside of SVIT, act as a helpful general AI assistant.
5.  **Tone:** Always be polite, professional, and helpful.`;
        
        const messageHandler = createMessageHandler();
        
        let greetingSent = false;
        const greetingText = name 
            ? `Hi ${name}! I'm Clara, your friendly AI receptionist! I'm so excited to help you today! How can I assist you?`
            : "Hi there! I'm Clara, your friendly AI receptionist! I'm so excited to help you today! How can I assist you?";
        
        sessionPromiseRef.current = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: async () => {
                    setStatus('Clara is ready!');
                    
                    // Resume output audio context for greeting playback
                    if (outputAudioContextRef.current && outputAudioContextRef.current.state === 'suspended') {
                        try {
                            await outputAudioContextRef.current.resume();
                        } catch (error) {
                            console.error('Error resuming audio context for greeting:', error);
                        }
                    }
                    
                    // Send greeting if requested
                    if (shouldGreet && !greetingSent) {
                        greetingSent = true;
                        try {
                            const session = await sessionPromiseRef.current;
                            if (session) {
                                // Send as text input to trigger audio response
                                session.sendRealtimeInput({ text: greetingText });
                                // Also add text greeting immediately so user sees it
                                setMessages(prev => {
                                    const exists = prev.some(msg => msg.sender === 'clara' && msg.text === greetingText);
                                    if (!exists) {
                                        return [...prev, { sender: 'clara', text: greetingText, isFinal: false, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }];
                                    }
                                    return prev;
                                });
                            }
                        } catch (error) {
                            console.error('Error sending greeting:', error);
                            // Fallback to text message - ensure it's added
                            setMessages(prev => {
                                const exists = prev.some(msg => msg.sender === 'clara' && msg.text === greetingText);
                                if (!exists) {
                                    return [...prev, { sender: 'clara', text: greetingText, isFinal: true, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }];
                                }
                                return prev;
                            });
                        }
                    }
                },
                onmessage: messageHandler,
                onerror: (e) => {
                    console.error('Session error:', e);
                    const errorMessage = e.message || 'Session error occurred';
                    
                    // Check for API key errors
                    if (errorMessage.includes('API key') || errorMessage.includes('authentication') || errorMessage.includes('401') || errorMessage.includes('403')) {
                        setStatus('API key error. Please check your GEMINI_API_KEY in .env file.');
                        sessionPromiseRef.current = null;
                        isRecordingRef.current = false;
                        setIsRecording(false);
                        return;
                    }
                    
                    // Check if it's a session expiration error
                    if (errorMessage.includes('expired') || errorMessage.includes('timeout') || errorMessage.includes('closed')) {
                        if (!isReconnectingRef.current && reconnectAttemptsRef.current < maxReconnectAttempts && preChatDetails) {
                            reconnectAttemptsRef.current++;
                            setStatus('Reconnecting...');
                            isReconnectingRef.current = true;
                            // Auto-reconnect after a short delay
                            setTimeout(() => {
                                const wasGreeting = shouldGreet;
                                sessionPromiseRef.current = null;
                                initializeSession(wasGreeting).then(() => {
                                    isReconnectingRef.current = false;
                                    reconnectAttemptsRef.current = 0; // Reset on success
                                    setStatus('Clara is ready!');
                                }).catch(err => {
                                    console.error('Failed to reconnect:', err);
                                    isReconnectingRef.current = false;
                                    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
                                        setStatus('Connection failed. Click mic to retry.');
                                    } else {
                                        setStatus('Connection issue. Click mic to retry.');
                                    }
                                });
                            }, 1000);
                        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
                            setStatus('Connection failed. Click mic to retry.');
                        }
                    } else {
                        // Don't show error status for minor errors - keep session active
                        console.warn('Session error (non-fatal):', errorMessage);
                        // Don't change status - let user continue
                    }
                    // Don't close session on error - let it try to recover
                },
                onclose: (event) => {
                    console.log('Session closed:', event);
                    
                    // Don't reconnect if:
                    // 1. Already reconnecting (error handler is managing it)
                    // 2. Session was intentionally closed
                    // 3. No preChatDetails (can't initialize without user info)
                    // 4. Max reconnect attempts reached
                    if (isReconnectingRef.current || isIntentionallyClosingRef.current) {
                        return;
                    }
                    
                    // Only auto-reconnect if we have valid context and haven't exceeded retry limit
                    if (preChatDetails && reconnectAttemptsRef.current < maxReconnectAttempts) {
                        reconnectAttemptsRef.current++;
                        setStatus('Reconnecting...');
                        isReconnectingRef.current = true;
                        
                        setTimeout(() => {
                            const wasGreeting = false; // Don't re-send greeting on reconnect
                            sessionPromiseRef.current = null;
                            initializeSession(wasGreeting).then(() => {
                                isReconnectingRef.current = false;
                                reconnectAttemptsRef.current = 0; // Reset on success
                                setStatus('Clara is ready!');
                            }).catch(err => {
                                console.error('Failed to reconnect:', err);
                                isReconnectingRef.current = false;
                                if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
                                    setStatus('Connection failed. Click mic to retry.');
                                    reconnectAttemptsRef.current = 0; // Reset so user can manually retry
                                } else {
                                    setStatus('Reconnecting...');
                                }
                            });
                        }, 1000);
                    } else {
                        // No more reconnection attempts or missing context
                        setStatus('Session ended. Click mic to start again.');
                        reconnectAttemptsRef.current = 0; // Reset so user can manually retry
                    }
                },
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                systemInstruction: systemInstruction,
                inputAudioTranscription: {
                    // Enable transcription for any language
                    languageCode: 'auto', // Auto-detect language
                    model: 'latest_long',
                },
                outputAudioTranscription: {
                    // Enable transcription for Clara's responses
                    languageCode: 'auto',
                    model: 'latest_long',
                },
                tools: [{ functionDeclarations: [initiateVideoCallFunction] }],
            },
        });
        
        // Wait for session to be ready and send greeting if needed
        try {
            await sessionPromiseRef.current;
        } catch (error) {
            console.error('Session initialization failed:', error);
            // If session fails, show text greeting
            if (shouldGreet) {
                setMessages(prev => {
                    const exists = prev.some(msg => msg.sender === 'clara' && msg.text === greetingText);
                    if (!exists) {
                        return [...prev, { sender: 'clara', text: greetingText, isFinal: true, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }];
                    }
                    return prev;
                });
            }
            throw error;
        }
    };

    const handleStartConversation = async (details) => {
        setPreChatDetails(details);
        setShowPreChatModal(false);
        
        // Reset reconnect attempts when starting fresh
        reconnectAttemptsRef.current = 0;
        
        // Show loading status
        setStatus('Connecting to Clara...');
        
        // Initialize session and send greeting with retry logic
        let retries = 0;
        const maxRetries = 3;
        
        while (retries < maxRetries) {
            try {
                await initializeSession(true); // true = send greeting
                setStatus('Clara is ready!');
                reconnectAttemptsRef.current = 0; // Reset on successful initialization
                break; // Success, exit retry loop
            } catch (error) {
                console.error(`Error initializing greeting (attempt ${retries + 1}):`, error);
                retries++;
                
                if (retries >= maxRetries) {
                    // Final fallback - show text greeting
                    const welcomeText = details.name 
                        ? `Hi ${details.name}! I'm Clara, your friendly AI receptionist! I'm so excited to help you today! How can I assist you?` 
                        : "Hi there! I'm Clara, your friendly AI receptionist! I'm so excited to help you today! How can I assist you?";
                    
                    setMessages(prev => {
                        const exists = prev.some(msg => msg.sender === 'clara' && msg.text === welcomeText);
                        if (!exists) {
                            return [...prev, { sender: 'clara', text: welcomeText, isFinal: true, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }];
                        }
                        return prev;
                    });
                    setStatus('Ready to chat (text mode)');
                } else {
                    // Wait before retrying
                    await new Promise(resolve => setTimeout(resolve, 1000 * retries));
                }
            }
        }
    };
    
    const stopRecording = useCallback((closeSession = false) => {
        // Default to false to keep session alive between interactions
        if (!isRecordingRef.current) return; // Prevent multiple stops
        
        isRecordingRef.current = false;
        setIsRecording(false);
        setStatus('Click the microphone to speak');

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }
        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            inputAudioContextRef.current.close().catch(console.error);
            inputAudioContextRef.current = null;
        }
        
        silenceStartRef.current = null;
        
        // Only close session if explicitly requested (e.g., when ending conversation or starting video call)
        if (closeSession && sessionPromiseRef.current) {
            isIntentionallyClosingRef.current = true; // Mark as intentional to prevent reconnection
            sessionPromiseRef.current.then(session => {
                session.close().catch(console.error);
            }).catch(console.error);
            sessionPromiseRef.current = null;
            // Reset flag after a delay to allow close handler to see it
            setTimeout(() => {
                isIntentionallyClosingRef.current = false;
            }, 100);
        }
    }, []);

    const handleEndCall = () => {
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const staffName = videoCallTarget?.name || 'Staff';
        setMessages(prev => [...prev, { sender: 'clara', text: `Video call with ${staffName} ended.`, isFinal: true, timestamp }]);
        
        // Cleanup active call
        if (activeCall && unifiedCallService) {
            unifiedCallService.endCall(activeCall.callId);
        }
        
        setActiveCall(null);
        setView('chat');
        setVideoCallTarget(null);
    };

    const handleMicClick = async () => {
        if (isRecordingRef.current) {
            stopRecording(false);
            setStatus('Processing...');
            return;
        }
        
        // Reset reconnect attempts when user manually clicks mic (fresh attempt)
        reconnectAttemptsRef.current = 0;
        
        // Resume audio context on user interaction (required for audio playback)
        if (outputAudioContextRef.current && outputAudioContextRef.current.state === 'suspended') {
            try {
                await outputAudioContextRef.current.resume();
            } catch (error) {
                console.error('Error resuming audio context:', error);
            }
        }
        
        isRecordingRef.current = true;
        setIsRecording(true);
        setStatus('Listening...');

        try {
            // Initialize session if it doesn't exist (reuses existing session from greeting)
            if (!sessionPromiseRef.current) {
                if (!preChatDetails) {
                    setStatus('Please complete the pre-chat form first.');
                    isRecordingRef.current = false;
                    setIsRecording(false);
                    return;
                }
                await initializeSession(false); // false = don't send greeting
                reconnectAttemptsRef.current = 0; // Reset on successful initialization
            }
            
            // Update status when session is ready
            if (sessionPromiseRef.current) {
                try {
                    const session = await sessionPromiseRef.current;
                    if (session) {
                        setStatus('Listening...');
                    } else {
                        throw new Error('Session not available');
                    }
                } catch (err) {
                    console.error('Error in session:', err);
                    // Try to reinitialize
                    sessionPromiseRef.current = null;
                    await initializeSession(false);
                    setStatus('Listening...');
                }
            } else {
                // No session, create one
                await initializeSession(false);
                setStatus('Listening...');
            }
            
            // Ensure input audio context exists and is ready
            if (!inputAudioContextRef.current || inputAudioContextRef.current.state === 'closed') {
                try {
                    inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                } catch (error) {
                    console.error('Error creating input audio context:', error);
                    throw new Error('Failed to initialize audio. Please allow microphone access.');
                }
            }
            
            // Resume input audio context if suspended
            if (inputAudioContextRef.current.state === 'suspended') {
                try {
                    await inputAudioContextRef.current.resume();
                } catch (error) {
                    console.error('Error resuming input audio context:', error);
                    throw new Error('Audio context blocked. Please interact with the page.');
                }
            }

            // Get user media
            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Verify audio context is still valid before creating media stream source
            if (!inputAudioContextRef.current || inputAudioContextRef.current.state === 'closed') {
                throw new Error('Audio context is not available');
            }
            
            try {
                mediaStreamSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
            } catch (error) {
                console.error('Error creating media stream source:', error);
                // Clean up stream if media source creation fails
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                    streamRef.current = null;
                }
                throw new Error('Failed to process audio input. Please try again.');
            }
            scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            
            const calculateRMS = (data) => {
                let sum = 0;
                for (let i = 0; i < data.length; i++) {
                    sum += data[i] * data[i];
                }
                return Math.sqrt(sum / data.length);
            };
            
            silenceStartRef.current = null;
            
            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                
                const pcmBlob = createBlob(inputData);
                if (sessionPromiseRef.current) {
                    sessionPromiseRef.current.then((session) => {
                        session.sendRealtimeInput({ media: pcmBlob });
                    }).catch(err => console.error("Error sending audio:", err));
                }

                // Automatic stop on silence
                const volume = calculateRMS(inputData);
                const SILENCE_THRESHOLD = 0.01;
                const SPEECH_TIMEOUT = 1200; // 1.2 seconds

                if (volume > SILENCE_THRESHOLD) {
                    silenceStartRef.current = null;
                } else {
                    if (silenceStartRef.current === null) {
                        silenceStartRef.current = Date.now();
                    } else if (Date.now() - silenceStartRef.current > SPEECH_TIMEOUT) {
                        if (isRecordingRef.current) {
                            stopRecording(false);
                            setStatus('Processing...');
                        }
                    }
                }
            };

            // Verify audio context is still valid before connecting
            if (!inputAudioContextRef.current || inputAudioContextRef.current.state === 'closed') {
                throw new Error('Audio context is not available');
            }

            mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);

        } catch (error) {
            console.error('Error starting recording:', error);
            setStatus(`Error: ${error.message || 'Failed to start recording'}`);
            isRecordingRef.current = false;
            setIsRecording(false);
            
            // Clean up any partial setup
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
            if (mediaStreamSourceRef.current) {
                try {
                    mediaStreamSourceRef.current.disconnect();
                } catch (e) {
                    console.error('Error disconnecting media stream source:', e);
                }
                mediaStreamSourceRef.current = null;
            }
            if (scriptProcessorRef.current) {
                try {
                    scriptProcessorRef.current.disconnect();
                } catch (e) {
                    console.error('Error disconnecting script processor:', e);
                }
                scriptProcessorRef.current = null;
            }
        }
    };
    
    const renderContent = () => {
        if (showPreChatModal) {
            return <PreChatModal onStart={handleStartConversation} />;
        }
        if (view === 'video_call' && videoCallTarget) {
            return <VideoCallView staff={videoCallTarget} onEndCall={handleEndCall} activeCall={activeCall} />;
        }
        return (
            <div className="app-container">
                <div className="header">
                     <div className="header-left">
                        <RobotIcon size={28} />
                        <span>Clara</span>
                    </div>
                    <div className="header-right">
                        <div className="header-button college-demo">
                            <GraduationCapIcon />
                            <span>College Demo</span>
                        </div>
                        <div className="header-button staff-login">
                            <StaffLoginIcon />
                            <span>Staff Login</span>
                        </div>
                        <div className="header-button video-call">
                            <VideoCallHeaderIcon />
                            <span>Video Call</span>
                        </div>
                        {import.meta.env.VITE_ENABLE_UNIFIED_MODE === 'true' && unifiedCallService && (
                            <div 
                                className="header-button unified-call" 
                                onClick={async () => {
                                    if (isUnifiedCalling) return;
                                    setIsUnifiedCalling(true);
                                    try {
                                        const result = await unifiedCallService.startCall({
                                            department: 'general',
                                            purpose: 'Client video call',
                                            onAccepted: (callId, pc, stream) => {
                                                console.log('Call accepted:', callId);
                                                // Handle accepted call - could show video UI
                                                setMessages(prev => [...prev, {
                                                    sender: 'clara',
                                                    text: 'Video call connected!',
                                                    isFinal: true,
                                                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                                }]);
                                            },
                                            onDeclined: (reason) => {
                                                setMessages(prev => [...prev, {
                                                    sender: 'clara',
                                                    text: reason || 'Call declined',
                                                    isFinal: true,
                                                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                                }]);
                                            },
                                            onError: (error) => {
                                                console.error('Call error:', error);
                                                setMessages(prev => [...prev, {
                                                    sender: 'clara',
                                                    text: 'Failed to start call: ' + error.message,
                                                    isFinal: true,
                                                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                                }]);
                                            },
                                        });
                                        if (result) {
                                            setMessages(prev => [...prev, {
                                                sender: 'clara',
                                                text: 'Initiating video call...',
                                                isFinal: true,
                                                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                            }]);
                                        }
                                    } catch (error) {
                                        console.error('Failed to start call:', error);
                                    } finally {
                                        setIsUnifiedCalling(false);
                                    }
                                }}
                                style={{ cursor: isUnifiedCalling ? 'not-allowed' : 'pointer', opacity: isUnifiedCalling ? 0.6 : 1 }}
                            >
                                <VideoCallHeaderIcon />
                                <span>{isUnifiedCalling ? 'Calling...' : 'Unified Call'}</span>
                            </div>
                        )}
                         <div className="status-indicator">
                            <div className="status-dot"></div>
                            <span>Ready to chat</span>
                        </div>
                    </div>
                </div>

                <div className="chat-container" ref={chatContainerRef}>
                    {messages.map((msg, index) => (
                        <div key={index} className={`message-wrapper ${msg.sender}`}>
                            <div className="message-avatar">
                                {msg.sender === 'user' ? <UserIcon size={20} /> : <RobotIcon size={20} />}
                            </div>
                            <div className="message-content">
                                <p>{msg.text}</p>
                            </div>
                             <div className="timestamp">{msg.timestamp}</div>
                        </div>
                    ))}
                </div>

                <div className="footer">
                     <button 
                        className={`mic-button ${isRecording ? 'recording' : ''}`} 
                        onClick={handleMicClick}
                        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                    >
                        <MicOnIcon size={28} />
                    </button>
                    <div className="footer-status-text">
                        {status}
                    </div>
                    <div className="footer-options">
                        <div className="option-item">
                            <SpeakerIcon />
                            <span>Clara voice enabled</span>
                        </div>
                        <div className="option-item">
                            <PencilIcon />
                            <span>Text cleaning enabled</span>
                        </div>
                    </div>
                </div>
            </div>
                );
    };

        return <>{renderContent()}</>;
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);
