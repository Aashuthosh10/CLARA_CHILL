// Appointment model for managing appointments
export interface Appointment {
  appointmentId: string;
  clientId: string;
  staffId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  purpose: string;
  appointmentDate: Date;
  appointmentTime: {
    start: string;
    end: string;
  };
  duration: number; // in minutes
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'No-Show';
  appointmentType: 'Video Call' | 'In-Person' | 'Phone Call';
  location?: string;
  notes?: string;
  staffNotes?: string;
  qrCode?: {
    data: string;
    imageUrl?: string;
    generatedAt: Date;
  };
  videoCallDetails?: {
    callId: string;
    startTime: Date;
    endTime?: Date;
    duration?: number;
    recordingUrl?: string;
  };
  cancellationReason?: string;
  cancelledBy?: 'Client' | 'Staff' | 'System';
  cancelledAt?: Date;
  createdAt: number;
  updatedAt: number;
}

export interface AppointmentRepository {
  create(appointment: Appointment): Promise<void>;
  get(appointmentId: string): Promise<Appointment | null>;
  update(appointment: Appointment): Promise<void>;
  findByStaff(staffId: string, filters?: { status?: string; startDate?: Date; endDate?: Date }): Promise<Appointment[]>;
  findByClient(clientId: string, filters?: { status?: string; startDate?: Date; endDate?: Date }): Promise<Appointment[]>;
  delete(appointmentId: string): Promise<void>;
}

// In-memory implementation (can be replaced with database)
export class InMemoryAppointmentRepository implements AppointmentRepository {
  private appointments: Map<string, Appointment> = new Map();

  async create(appointment: Appointment): Promise<void> {
    this.appointments.set(appointment.appointmentId, { ...appointment });
  }

  async get(appointmentId: string): Promise<Appointment | null> {
    const appointment = this.appointments.get(appointmentId);
    return appointment ? { ...appointment } : null;
  }

  async update(appointment: Appointment): Promise<void> {
    this.appointments.set(appointment.appointmentId, { ...appointment });
  }

  async findByStaff(staffId: string, filters?: { status?: string; startDate?: Date; endDate?: Date }): Promise<Appointment[]> {
    let appointments = Array.from(this.appointments.values())
      .filter(a => a.staffId === staffId);

    if (filters?.status) {
      appointments = appointments.filter(a => a.status === filters.status);
    }

    if (filters?.startDate) {
      appointments = appointments.filter(a => a.appointmentDate >= filters.startDate!);
    }

    if (filters?.endDate) {
      appointments = appointments.filter(a => a.appointmentDate <= filters.endDate!);
    }

    return appointments.map(a => ({ ...a }));
  }

  async findByClient(clientId: string, filters?: { status?: string; startDate?: Date; endDate?: Date }): Promise<Appointment[]> {
    let appointments = Array.from(this.appointments.values())
      .filter(a => a.clientId === clientId);

    if (filters?.status) {
      appointments = appointments.filter(a => a.status === filters.status);
    }

    if (filters?.startDate) {
      appointments = appointments.filter(a => a.appointmentDate >= filters.startDate!);
    }

    if (filters?.endDate) {
      appointments = appointments.filter(a => a.appointmentDate <= filters.endDate!);
    }

    return appointments.map(a => ({ ...a }));
  }

  async delete(appointmentId: string): Promise<void> {
    this.appointments.delete(appointmentId);
  }
}

