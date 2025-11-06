import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { SessionRepository, InMemorySessionRepository } from '../models/Session.js';

type AuthPayload = {
  userId: string;
  role: 'client' | 'staff';
  staffId?: string;
  dept?: string;
  tenant?: string;
};

type AuthRequest = {
  user?: AuthPayload;
  body: any;
  params: any;
  query: any;
};

const router = Router();
const sessionRepo: SessionRepository = new InMemorySessionRepository();

// Create a new session
router.post('/create', async (req: AuthRequest, res: Response) => {
  try {
    const { clientId, staffId, purpose } = req.body;
    
    if (!clientId || !staffId) {
      return res.status(400).json({ error: 'Client ID and Staff ID are required' });
    }

    // Check if there's already an active session between this client and staff
    const existingSessions = await sessionRepo.findByStaff(staffId, 'active');
    const existingSession = existingSessions.find(s => s.clientId === clientId);

    if (existingSession) {
      return res.status(409).json({ 
        error: 'Active session already exists',
        sessionId: existingSession.sessionId
      });
    }

    // Create new session
    const sessionId = uuidv4();
    const session = {
      sessionId,
      clientId,
      staffId,
      status: 'active' as const,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      metadata: {
        clientName: req.user?.userId || 'Client',
        staffName: staffId,
        purpose: purpose || 'General inquiry',
        callCount: 0,
        messageCount: 0
      }
    };

    await sessionRepo.create(session);

    res.status(201).json({
      success: true,
      sessionId,
      session: {
        sessionId,
        clientId,
        staffId,
        clientName: session.metadata.clientName,
        staffName: session.metadata.staffName,
        purpose: session.metadata.purpose,
        createdAt: session.createdAt
      }
    });

  } catch (error: any) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// End a session
router.post('/end', async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const session = await sessionRepo.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check if user has permission to end this session
    if (req.user?.role === 'staff' && session.staffId !== req.user.staffId) {
      return res.status(403).json({ error: 'Not authorized to end this session' });
    }
    if (req.user?.role === 'client' && session.clientId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to end this session' });
    }

    await sessionRepo.endSession(sessionId);

    res.json({
      success: true,
      message: 'Session ended successfully',
      sessionId
    });

  } catch (error: any) {
    console.error('Error ending session:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
});

// Get active sessions for a staff member
router.get('/:staffId/active', async (req: AuthRequest, res: Response) => {
  try {
    const { staffId } = req.params;
    
    // Verify staff exists and user has permission
    if (req.user?.role === 'staff' && req.user.staffId !== staffId) {
      return res.status(403).json({ error: 'Not authorized to view these sessions' });
    }

    const sessions = await sessionRepo.findByStaff(staffId, 'active');

    res.json({
      success: true,
      sessions: sessions.map(session => ({
        sessionId: session.sessionId,
        clientId: session.clientId,
        clientName: session.metadata.clientName,
        staffName: session.metadata.staffName,
        purpose: session.metadata.purpose,
        callCount: session.metadata.callCount,
        messageCount: session.metadata.messageCount,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity
      }))
    });

  } catch (error: any) {
    console.error('Error fetching active sessions:', error);
    res.status(500).json({ error: 'Failed to fetch active sessions' });
  }
});

// Get session details
router.get('/:sessionId', async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    const session = await sessionRepo.get(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check permissions
    if (req.user?.role === 'staff' && session.staffId !== req.user.staffId) {
      return res.status(403).json({ error: 'Not authorized to view this session' });
    }
    if (req.user?.role === 'client' && session.clientId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to view this session' });
    }

    res.json({
      success: true,
      session: {
        sessionId: session.sessionId,
        clientId: session.clientId,
        clientName: session.metadata.clientName,
        staffName: session.metadata.staffName,
        purpose: session.metadata.purpose,
        status: session.status,
        callCount: session.metadata.callCount,
        messageCount: session.metadata.messageCount,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity
      }
    });

  } catch (error: any) {
    console.error('Error fetching session details:', error);
    res.status(500).json({ error: 'Failed to fetch session details' });
  }
});

// Update session activity
router.patch('/:sessionId/activity', async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    const session = await sessionRepo.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check permissions
    if (req.user?.role === 'staff' && session.staffId !== req.user.staffId) {
      return res.status(403).json({ error: 'Not authorized to update this session' });
    }
    if (req.user?.role === 'client' && session.clientId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to update this session' });
    }

    await sessionRepo.updateActivity(sessionId);

    res.json({
      success: true,
      message: 'Session activity updated'
    });

  } catch (error: any) {
    console.error('Error updating session activity:', error);
    res.status(500).json({ error: 'Failed to update session activity' });
  }
});

export default router;

