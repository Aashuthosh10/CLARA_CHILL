import { Router, Response } from 'express';
import { AppointmentRepository, InMemoryAppointmentRepository } from '../models/Appointment.js';

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
const appointmentRepo: AppointmentRepository = new InMemoryAppointmentRepository();

// Generate unique appointment ID
function generateAppointmentId(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `APT${year}${month}${day}${random}`;
}

// Get appointments with pagination and filters
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      staffId, 
      clientId, 
      startDate, 
      endDate 
    } = req.query;

    let appointments: any[] = [];
    
    if (staffId) {
      appointments = await appointmentRepo.findByStaff(staffId as string, {
        status: status as string | undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      });
    } else if (clientId) {
      appointments = await appointmentRepo.findByClient(clientId as string, {
        status: status as string | undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      });
    }

    // Simple pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const start = (pageNum - 1) * limitNum;
    const end = start + limitNum;
    const paginatedAppointments = appointments.slice(start, end);

    res.json({
      success: true,
      appointments: paginatedAppointments,
      pagination: {
        page: pageNum,
        pages: Math.ceil(appointments.length / limitNum),
        total: appointments.length,
        limit: limitNum
      }
    });
  } catch (error: any) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Get appointment details
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const appointment = await appointmentRepo.get(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({
      success: true,
      appointment
    });
  } catch (error: any) {
    console.error('Get appointment details error:', error);
    res.status(500).json({ error: 'Failed to fetch appointment details' });
  }
});

// Create new appointment
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const {
      clientId,
      staffId,
      purpose,
      appointmentDate,
      appointmentTime,
      location,
      clientName,
      clientEmail,
      clientPhone,
      duration = 30
    } = req.body;

    if (!clientId || !staffId || !purpose || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ 
        error: 'clientId, staffId, purpose, appointmentDate, and appointmentTime are required' 
      });
    }

    const appointmentId = generateAppointmentId();
    const appointment = {
      appointmentId,
      clientId,
      staffId,
      clientName: clientName || 'Client',
      clientEmail: clientEmail || 'client@example.com',
      clientPhone: clientPhone || '',
      purpose,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      duration,
      status: 'Pending' as const,
      appointmentType: 'In-Person' as const,
      location: location || 'Office',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await appointmentRepo.create(appointment);

    res.status(201).json({
      success: true,
      appointment
    });
  } catch (error: any) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// Update appointment
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const {
      purpose,
      appointmentDate,
      appointmentTime,
      location,
      status
    } = req.body;

    const appointment = await appointmentRepo.get(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const updateData = {
      ...appointment,
      updatedAt: Date.now()
    };

    if (purpose) updateData.purpose = purpose;
    if (appointmentDate) updateData.appointmentDate = new Date(appointmentDate);
    if (appointmentTime) updateData.appointmentTime = appointmentTime;
    if (location) updateData.location = location;
    if (status) updateData.status = status as any;

    await appointmentRepo.update(updateData);

    res.json({
      success: true,
      appointment: updateData
    });
  } catch (error: any) {
    console.error('Update appointment error:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// Cancel appointment
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const appointment = await appointmentRepo.get(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const updateData = {
      ...appointment,
      status: 'Cancelled' as const,
      cancelledBy: req.user?.role === 'staff' ? 'Staff' as const : 'Client' as const,
      cancelledAt: new Date(),
      updatedAt: Date.now()
    };

    await appointmentRepo.update(updateData);

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment: updateData
    });
  } catch (error: any) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

export default router;

