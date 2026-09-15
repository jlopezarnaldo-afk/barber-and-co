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

export interface BarberScheduleDay {
  active: boolean;
  branchId: BranchId | null;
  start: string | null; // e.g. '10:00'
  end: string | null;   // e.g. '19:00'
}

export interface Barber {
  id: string;
  name: string;
  branchId: BranchId; // primary / legacy branch
  avatarUrl: string;
  rating: number;
  reviewsCount: number;
  specialties: string[];
  phone: string;
  assignedBranches: BranchId[];
  schedule: Record<number, BarberScheduleDay>; // 0: Sunday to 6: Saturday
  customDaysOff: string[]; // 'YYYY-MM-DD'
  isActive?: boolean; // active/paused status
}

export interface BarberSettings {
  allowClientSelectBarber: boolean; // true: client can pick, false: automatic unified allocation
}


export type ServiceCategory = 'Corte' | 'Barba' | 'Combos' | 'Tratamientos';

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  durationMinutes: number;
  price: number;
  branchPrices?: Partial<Record<BranchId, number>>;
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
