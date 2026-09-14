export type BranchId = 'palermo' | 'belgrano' | 'recoleta';

export interface Branch {
  id: BranchId;
  name: string;
  address: string;
  phone: string;
  schedule: string;
  chairsCount: number;
  image: string;
  neighborhood: string;
}

export interface Barber {
  id: string;
  name: string;
  branchId: BranchId;
  avatarUrl: string;
  rating: number;
  reviewsCount: number;
  specialties: string[];
  phone: string;
}

export type ServiceCategory = 'Corte' | 'Barba' | 'Combos' | 'Tratamientos';

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  durationMinutes: number;
  price: number;
  description: string;
  popular: boolean;
}

export type AppointmentStatus = 'Confirmado' | 'Atendido' | 'Cancelado' | 'No Asistió';

export interface Appointment {
  id: string;
  branchId: BranchId;
  serviceId: string;
  barberId: string; // Barber ID or 'any'
  clientName: string;
  clientPhone: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:MM
  durationMinutes: number;
  price: number;
  status: AppointmentStatus;
  notes: string;
  createdAt: string;
}

export type UserRole = 'guest' | 'staff' | 'admin';

export interface TimeSlotAvailability {
  time: string; // HH:MM
  available: boolean;
  reason?: string;
  assignedBarberId?: string;
}
