// Database types for API routes
// These match the Prisma schema structure

export interface Patient {
  id: string;
  name: string;
  breed: string;
  birthDate: Date;
  gender: 'MALE' | 'FEMALE';
  weight?: number | null;
  color?: string | null;
  microchipId?: string | null;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string | null;
  medicalNotes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  startTime: Date;
  endTime: Date;
  title: string;
  description?: string | null;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | 'NO_SHOW';
  patientId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  sessionDate: Date;
  duration?: number | null;
  symptoms?: string | null;
  diagnosis?: string | null;
  treatment?: string | null;
  notes?: string | null;
  homework?: string | null;
  nextVisitDate?: Date | null;
  followUpNotes?: string | null;
  attachments: string[];
  patientId: string;
  appointmentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Types for API responses
export interface PatientWithCounts extends Patient {
  _count: {
    appointments: number;
    sessions: number;
  };
}

export interface PatientWithRelations extends Patient {
  appointments: Appointment[];
  sessions: Session[];
}
