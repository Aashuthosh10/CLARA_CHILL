// Session model for managing client-staff sessions
export interface Session {
  sessionId: string;
  clientId: string;
  staffId: string;
  status: 'active' | 'ended' | 'paused';
  createdAt: number;
  endedAt?: number;
  lastActivity: number;
  metadata: {
    clientName?: string;
    staffName?: string;
    purpose?: string;
    callCount?: number;
    messageCount?: number;
  };
}

export interface SessionRepository {
  create(session: Session): Promise<void>;
  get(sessionId: string): Promise<Session | null>;
  update(session: Session): Promise<void>;
  findByStaff(staffId: string, status?: string): Promise<Session[]>;
  findByClient(clientId: string, status?: string): Promise<Session[]>;
  endSession(sessionId: string): Promise<void>;
  updateActivity(sessionId: string): Promise<void>;
}

// In-memory implementation (can be replaced with database)
export class InMemorySessionRepository implements SessionRepository {
  private sessions: Map<string, Session> = new Map();

  async create(session: Session): Promise<void> {
    this.sessions.set(session.sessionId, { ...session });
  }

  async get(sessionId: string): Promise<Session | null> {
    const session = this.sessions.get(sessionId);
    return session ? { ...session } : null;
  }

  async update(session: Session): Promise<void> {
    this.sessions.set(session.sessionId, { ...session });
  }

  async findByStaff(staffId: string, status?: string): Promise<Session[]> {
    const sessions = Array.from(this.sessions.values())
      .filter(s => s.staffId === staffId && (!status || s.status === status));
    return sessions.map(s => ({ ...s }));
  }

  async findByClient(clientId: string, status?: string): Promise<Session[]> {
    const sessions = Array.from(this.sessions.values())
      .filter(s => s.clientId === clientId && (!status || s.status === status));
    return sessions.map(s => ({ ...s }));
  }

  async endSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'ended';
      session.endedAt = Date.now();
      this.sessions.set(sessionId, session);
    }
  }

  async updateActivity(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = Date.now();
      this.sessions.set(sessionId, session);
    }
  }
}

