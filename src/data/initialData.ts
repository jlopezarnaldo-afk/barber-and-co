import type { Appointment, Barber, BarberScheduleDay, BarberSettings, Branch, BranchId, Service } from '../types';

// Helper to generate a default full-time schedule (Lun a Sáb active, Dom inactive)
export const createDefaultSchedule = (branchId: BranchId, start = '10:00', end = '20:00'): Record<number, BarberScheduleDay> => {
  return {
    0: { active: false, branchId: null, start: null, end: null }, // Domingo cerrado
    1: { active: true, branchId, start, end }, // Lunes
    2: { active: true, branchId, start, end }, // Martes
    3: { active: true, branchId, start, end }, // Miércoles
    4: { active: true, branchId, start, end }, // Jueves
    5: { active: true, branchId, start, end }, // Viernes
    6: { active: true, branchId, start, end }, // Sábado
  };
};

export const DEFAULT_SETTINGS: BarberSettings = {
  allowClientSelectBarber: true,
};


// Helper to get formatted YYYY-MM-DD for relative days
export const getDateString = (offsetDays: number = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to get exact service price according to the selected branch (or fallback price)
export const getServicePrice = (
  service: Service | undefined | null,
  branchId?: BranchId | string
): number => {
  if (!service) return 0;
  if (branchId && service.branchPrices && branchId in service.branchPrices) {
    const branchPrice = service.branchPrices[branchId as BranchId];
    if (typeof branchPrice === 'number' && branchPrice > 0) {
      return branchPrice;
    }
  }
  return service.price || 0;
};

// INITIAL MOCK DATASETS
export const DEFAULT_BRANCHES: Branch[] = [
  {
    id: 'palermo',
    name: 'Sede Palermo Soho',
    address: 'Honduras 4820',
    phone: '+54 9 11 4820-1122',
    schedule: 'Lun a Sáb de 10:00 a 20:00 hs',
    chairsCount: 4,
    neighborhood: 'Palermo Soho, CABA',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'belgrano',
    name: 'Sede Belgrano R',
    address: 'Av. Juramento 2150',
    phone: '+54 9 11 2150-3344',
    schedule: 'Lun a Sáb de 10:00 a 20:00 hs',
    chairsCount: 3,
    neighborhood: 'Belgrano R, CABA',
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'recoleta',
    name: 'Sede Recoleta',
    address: 'Av. Santa Fe 1420',
    phone: '+54 9 11 1420-5566',
    schedule: 'Lun a Sáb de 10:00 a 20:00 hs',
    chairsCount: 3,
    neighborhood: 'Recoleta, CABA',
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80',
  },
];

export const DEFAULT_STAFF: Barber[] = [
  {
    id: 'barber-1',
    name: 'Facundo Gómez',
    branchId: 'palermo',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    rating: 4.9,
    reviewsCount: 142,
    specialties: ['Fade & Degradé', 'Navaja Libre', 'Diseño de Barba'],
    phone: '+54 9 11 4820-1122',
    assignedBranches: ['palermo', 'belgrano'],
    schedule: createDefaultSchedule('palermo', '10:00', '20:00'),
    customDaysOff: [],
  },
  {
    id: 'barber-2',
    name: 'Enzo Rossi',
    branchId: 'palermo',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    rating: 4.9,
    reviewsCount: 98,
    specialties: ['Corte Clásico', 'Afeitado Tradicional Toalla Caliente'],
    phone: '+54 9 11 4820-1122',
    assignedBranches: ['palermo'],
    schedule: createDefaultSchedule('palermo', '10:00', '20:00'),
    customDaysOff: [],
  },
  {
    id: 'barber-3',
    name: 'Matías Silva',
    branchId: 'belgrano',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    rating: 4.8,
    reviewsCount: 115,
    specialties: ['Coloración & Canas', 'Tratamientos Keratina', 'Texturizado'],
    phone: '+54 9 11 2150-3344',
    assignedBranches: ['belgrano', 'palermo'],
    schedule: createDefaultSchedule('belgrano', '10:00', '20:00'),
    customDaysOff: [],
  },
  {
    id: 'barber-4',
    name: 'Lucas Méndez',
    branchId: 'belgrano',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
    rating: 5.0,
    reviewsCount: 168,
    specialties: ['Skin Fade Precisión', 'Combo Barba Completa', 'Diseño de Cejas'],
    phone: '+54 9 11 2150-3344',
    assignedBranches: ['belgrano'],
    schedule: createDefaultSchedule('belgrano', '10:00', '20:00'),
    customDaysOff: [],
  },
  {
    id: 'barber-5',
    name: 'Joaquín Varela',
    branchId: 'recoleta',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    rating: 4.9,
    reviewsCount: 134,
    specialties: ['Corte Ejecutivo', 'Barba Esculpida', 'Tratamiento Capilar'],
    phone: '+54 9 11 1420-5566',
    assignedBranches: ['recoleta', 'palermo'],
    schedule: createDefaultSchedule('recoleta', '10:00', '20:00'),
    customDaysOff: [],
  },
  {
    id: 'barber-6',
    name: 'Tomás Benítez',
    branchId: 'recoleta',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    rating: 4.8,
    reviewsCount: 89,
    specialties: ['Degradé Moderno', 'Limpieza Facial Express', 'Pompadour'],
    phone: '+54 9 11 1420-5566',
    assignedBranches: ['recoleta'],
    schedule: createDefaultSchedule('recoleta', '10:00', '20:00'),
    customDaysOff: [],
  },
];

export const DEFAULT_SERVICES: Service[] = [
  {
    id: 'serv-1',
    name: 'Corte Clásico / Degradé (Fade)',
    category: 'Corte',
    durationMinutes: 30,
    price: 12000,
    branchPrices: {
      palermo: 14000,
      belgrano: 13000,
      recoleta: 15000,
    },
    description: 'Diagnóstico de visagismo, corte con tijera o máquina, lavado premium, toalla fresca y peinado final.',
    popular: true,
  },
  {
    id: 'serv-2',
    name: 'Perfilado y Afeitado Tradicional de Barba',
    category: 'Barba',
    durationMinutes: 30,
    price: 9000,
    branchPrices: {
      palermo: 10500,
      belgrano: 9500,
      recoleta: 11000,
    },
    description: 'Ritual con doble toalla caliente infusionada con eucalipto, espuma cremosa, afeitado a navaja y bálsamo hidratante.',
    popular: false,
  },
  {
    id: 'serv-3',
    name: 'Combo Corte + Barba Completa',
    category: 'Combos',
    durationMinutes: 45,
    price: 18000,
    branchPrices: {
      palermo: 21000,
      belgrano: 19500,
      recoleta: 22500,
    },
    description: 'Nuestra experiencia insignia. Corte completo personalizado + perfilado minucioso de barba con toalla caliente y styling.',
    popular: true,
  },
  {
    id: 'serv-4',
    name: 'Alisado Progresivo / Keratina Capilar',
    category: 'Tratamientos',
    durationMinutes: 60,
    price: 26000,
    branchPrices: {
      palermo: 29000,
      belgrano: 27000,
      recoleta: 31000,
    },
    description: 'Tratamiento anti-frizz de nutrición intensa a base de aminoácidos y keratina. Suavidad y brillo duradero hasta 3 meses.',
    popular: false,
  },
  {
    id: 'serv-5',
    name: 'Coloración / Camuflaje de Canas',
    category: 'Tratamientos',
    durationMinutes: 45,
    price: 15000,
    branchPrices: {
      palermo: 17000,
      belgrano: 16000,
      recoleta: 18000,
    },
    description: 'Tonalización sutil y natural sin efecto raíz. Matiza las canas de barba o cabello devolviendo vigor en minutos.',
    popular: false,
  },
  {
    id: 'serv-6',
    name: 'Limpieza Facial Express',
    category: 'Tratamientos',
    durationMinutes: 20,
    price: 8000,
    branchPrices: {
      palermo: 9500,
      belgrano: 8500,
      recoleta: 10000,
    },
    description: 'Exfoliación suave con microesferas, vapor de ozono purificante, máscara de arcilla negra y serum antioxidante.',
    popular: false,
  },
];

export const generateDefaultAppointments = (): Appointment[] => {
  const today = getDateString(0);
  const tomorrow = getDateString(1);
  const yesterday = getDateString(-1);

  return [
    {
      id: '#TUR-1041',
      branchId: 'palermo',
      serviceId: 'serv-1',
      barberId: 'barber-1',
      clientName: 'Alejandro Rossi',
      clientPhone: '+54 9 11 4455-6677',
      date: today,
      timeSlot: '10:00',
      durationMinutes: 30,
      price: 14000,
      status: 'Atendido',
      notes: 'Fade medio con navaja, cliente recurrente.',
      createdAt: new Date().toISOString(),
    },
    {
      id: '#TUR-1042',
      branchId: 'palermo',
      serviceId: 'serv-3',
      barberId: 'barber-2',
      clientName: 'Santiago Vidal',
      clientPhone: '+54 9 11 5566-7788',
      date: today,
      timeSlot: '10:30',
      durationMinutes: 45,
      price: 21000,
      status: 'Confirmado',
      notes: 'Llegará 5 min tarde.',
      createdAt: new Date().toISOString(),
    },
    {
      id: '#TUR-1043',
      branchId: 'belgrano',
      serviceId: 'serv-2',
      barberId: 'barber-3',
      clientName: 'Esteban Morales',
      clientPhone: '+54 9 11 6677-8899',
      date: today,
      timeSlot: '11:30',
      durationMinutes: 30,
      price: 9500,
      status: 'No Asistió',
      notes: 'No respondió al llamado telefónico en la sede.',
      createdAt: new Date().toISOString(),
    },
    {
      id: '#TUR-1044',
      branchId: 'belgrano',
      serviceId: 'serv-1',
      barberId: 'barber-4',
      clientName: 'Ignacio Paz',
      clientPhone: '+54 9 11 7788-9900',
      date: today,
      timeSlot: '12:00',
      durationMinutes: 30,
      price: 13000,
      status: 'Confirmado',
      notes: 'Primera vez, pidió corte prolijo para entrevista.',
      createdAt: new Date().toISOString(),
    },
    {
      id: '#TUR-1045',
      branchId: 'recoleta',
      serviceId: 'serv-4',
      barberId: 'barber-5',
      clientName: 'Maximiliano Gómez',
      clientPhone: '+54 9 11 8899-0011',
      date: today,
      timeSlot: '14:00',
      durationMinutes: 60,
      price: 31000,
      status: 'Confirmado',
      notes: 'Tratamiento completo anti-frizz.',
      createdAt: new Date().toISOString(),
    },
    {
      id: '#TUR-1046',
      branchId: 'recoleta',
      serviceId: 'serv-3',
      barberId: 'barber-6',
      clientName: 'Nicolás Benítez',
      clientPhone: '+54 9 11 9900-1122',
      date: today,
      timeSlot: '15:30',
      durationMinutes: 45,
      price: 22500,
      status: 'Atendido',
      notes: 'Pago en efectivo.',
      createdAt: new Date().toISOString(),
    },
    {
      id: '#TUR-1047',
      branchId: 'palermo',
      serviceId: 'serv-5',
      barberId: 'barber-1',
      clientName: 'Mariano Torres',
      clientPhone: '+54 9 11 1234-5678',
      date: today,
      timeSlot: '17:00',
      durationMinutes: 45,
      price: 17000,
      status: 'Confirmado',
      notes: 'Camuflaje de canas en patillas.',
      createdAt: new Date().toISOString(),
    },
    {
      id: '#TUR-1048',
      branchId: 'palermo',
      serviceId: 'serv-6',
      barberId: 'barber-2',
      clientName: 'Rodrigo Cáceres',
      clientPhone: '+54 9 11 2345-6789',
      date: today,
      timeSlot: '18:00',
      durationMinutes: 20,
      price: 9500,
      status: 'Confirmado',
      notes: 'Limpieza de cutis.',
      createdAt: new Date().toISOString(),
    },
    {
      id: '#TUR-1049',
      branchId: 'belgrano',
      serviceId: 'serv-1',
      barberId: 'barber-3',
      clientName: 'Felipe Herrera',
      clientPhone: '+54 9 11 3456-7890',
      date: tomorrow,
      timeSlot: '10:30',
      durationMinutes: 30,
      price: 13000,
      status: 'Confirmado',
      notes: 'Turno matutino.',
      createdAt: new Date().toISOString(),
    },
    {
      id: '#TUR-1050',
      branchId: 'recoleta',
      serviceId: 'serv-3',
      barberId: 'barber-5',
      clientName: 'Lucas Ferreyra',
      clientPhone: '+54 9 11 4567-8901',
      date: tomorrow,
      timeSlot: '11:00',
      durationMinutes: 45,
      price: 22500,
      status: 'Confirmado',
      notes: 'Prepara para evento.',
      createdAt: new Date().toISOString(),
    },
    {
      id: '#TUR-1039',
      branchId: 'palermo',
      serviceId: 'serv-1',
      barberId: 'barber-1',
      clientName: 'Gustavo Lima',
      clientPhone: '+54 9 11 5678-9012',
      date: yesterday,
      timeSlot: '16:00',
      durationMinutes: 30,
      price: 14000,
      status: 'Atendido',
      notes: 'Cliente muy satisfecho.',
      createdAt: new Date().toISOString(),
    },
    {
      id: '#TUR-1040',
      branchId: 'belgrano',
      serviceId: 'serv-2',
      barberId: 'barber-4',
      clientName: 'Julián Castro',
      clientPhone: '+54 9 11 6789-0123',
      date: yesterday,
      timeSlot: '17:30',
      durationMinutes: 30,
      price: 9500,
      status: 'Cancelado',
      notes: 'Avisó con 2 horas de anticipación.',
      createdAt: new Date().toISOString(),
    },
  ];
};
