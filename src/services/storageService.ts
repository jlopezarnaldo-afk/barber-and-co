import type { Appointment, Barber, Branch, Service, UserRole } from '../types';

const STORAGE_KEYS = {
  BRANCHES: 'barber_branches',
  STAFF: 'barber_staff',
  SERVICES: 'barber_services',
  APPOINTMENTS: 'barber_appointments',
  SESSION_ROLE: 'barber_session_role',
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

// Helper for Argentine Pesos formatting
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper to format duration string
export const formatDuration = (minutes: number): string => {
  if (minutes === 60) return '⏱️ 1 hora';
  if (minutes > 60) {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return `⏱️ ${hours} h ${rest > 0 ? `${rest} m` : ''}`;
  }
  return `⏱️ ${minutes} min`;
};

// INITIAL MOCK DATASETS
const DEFAULT_BRANCHES: Branch[] = [
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

const DEFAULT_STAFF: Barber[] = [
  {
    id: 'barber-1',
    name: 'Facundo Gómez',
    branchId: 'palermo',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    rating: 4.9,
    reviewsCount: 142,
    specialties: ['Fade & Degradé', 'Navaja Libre', 'Diseño de Barba'],
    phone: '+54 9 11 4820-1122',
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
  },
];

const DEFAULT_SERVICES: Service[] = [
  {
    id: 'serv-1',
    name: 'Corte Clásico / Degradé (Fade)',
    category: 'Corte',
    durationMinutes: 30,
    price: 12000,
    description: 'Diagnóstico de visagismo, corte con tijera o máquina, lavado premium, toalla fresca y peinado final.',
    popular: true,
  },
  {
    id: 'serv-2',
    name: 'Perfilado y Afeitado Tradicional de Barba',
    category: 'Barba',
    durationMinutes: 30,
    price: 9000,
    description: 'Ritual con doble toalla caliente infusionada con eucalipto, espuma cremosa, afeitado a navaja y bálsamo hidratante.',
    popular: false,
  },
  {
    id: 'serv-3',
    name: 'Combo Corte + Barba Completa',
    category: 'Combos',
    durationMinutes: 45,
    price: 18000,
    description: 'Nuestra experiencia insignia. Corte completo personalizado + perfilado minucioso de barba con toalla caliente y styling.',
    popular: true,
  },
  {
    id: 'serv-4',
    name: 'Alisado Progresivo / Keratina Capilar',
    category: 'Tratamientos',
    durationMinutes: 60,
    price: 26000,
    description: 'Tratamiento anti-frizz de nutrición intensa a base de aminoácidos y keratina. Suavidad y brillo duradero hasta 3 meses.',
    popular: false,
  },
  {
    id: 'serv-5',
    name: 'Coloración / Camuflaje de Canas',
    category: 'Tratamientos',
    durationMinutes: 45,
    price: 15000,
    description: 'Tonalización sutil y natural sin efecto raíz. Matiza las canas de barba o cabello devolviendo vigor en minutos.',
    popular: false,
  },
  {
    id: 'serv-6',
    name: 'Limpieza Facial Express',
    category: 'Tratamientos',
    durationMinutes: 20,
    price: 8000,
    description: 'Exfoliación suave con microesferas, vapor de ozono purificante, máscara de arcilla negra y serum antioxidante.',
    popular: false,
  },
];

// GENERATE INITIAL 12 HYPERREALISTIC APPOINTMENTS
const generateDefaultAppointments = (): Appointment[] => {
  const today = getDateString(0);
  const tomorrow = getDateString(1);
  const dayAfter = getDateString(2);

  return [
    // TODAY
    {
      id: '#TUR-1041',
      branchId: 'palermo',
      serviceId: 'serv-1',
      barberId: 'barber-1',
      clientName: 'Ignacio Pérez',
      clientPhone: '+54 9 11 5521-8833',
      date: today,
      timeSlot: '10:00',
      durationMinutes: 30,
      price: 12000,
      status: 'Atendido',
      notes: 'Fade alto con textura arriba.',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '#TUR-1042',
      branchId: 'palermo',
      serviceId: 'serv-3',
      barberId: 'barber-1',
      clientName: 'Rodrigo Morales',
      clientPhone: '+54 9 11 6789-2244',
      date: today,
      timeSlot: '11:00',
      durationMinutes: 45,
      price: 18000,
      status: 'Confirmado',
      notes: 'Tiene evento a la noche. Cuidar largo de la barba.',
      createdAt: new Date().toISOString(),
    },
    {
      id: '#TUR-1043',
      branchId: 'palermo',
      serviceId: 'serv-2',
      barberId: 'barber-2',
      clientName: 'Federico Álvarez',
      clientPhone: '+54 9 11 4432-9901',
      date: today,
      timeSlot: '11:30',
      durationMinutes: 30,
      price: 9000,
      status: 'Confirmado',
      notes: 'Piel sensible en cuello.',
      createdAt: new Date().toISOString(),
    },
    {
      id: '#TUR-1044',
      branchId: 'palermo',
      serviceId: 'serv-4',
      barberId: 'barber-2',
      clientName: 'Santiago Benítez',
      clientPhone: '+54 9 11 9988-7711',
      date: today,
      timeSlot: '15:00',
      durationMinutes: 60,
      price: 26000,
      status: 'Confirmado',
      notes: 'Repite keratina semestral.',
      createdAt: new Date().toISOString(),
    },
    {
      id: '#TUR-1045',
      branchId: 'belgrano',
      serviceId: 'serv-3',
      barberId: 'barber-4',
      clientName: 'Nicolás Rossi',
      clientPhone: '+54 9 11 3322-1144',
      date: today,
      timeSlot: '12:00',
      durationMinutes: 45,
      price: 18000,
      status: 'Atendido',
      notes: 'Primera vez en Sede Belgrano.',
      createdAt: new Date().toISOString(),
    },
    {
      id: '#TUR-1046',
      branchId: 'belgrano',
      serviceId: 'serv-1',
      barberId: 'barber-3',
      clientName: 'Martín Castelli',
      clientPhone: '+54 9 11 8877-6655',
      date: today,
      timeSlot: '16:30',
      durationMinutes: 30,
      price: 12000,
      status: 'Confirmado',
      notes: 'Corte a tijera en los laterales.',
      createdAt: new Date().toISOString(),
    },
    {
      id: '#TUR-1047',
      branchId: 'recoleta',
      serviceId: 'serv-5',
      barberId: 'barber-5',
      clientName: 'Mariano Díaz',
      clientPhone: '+54 9 11 2233-4455',
      date: today,
      timeSlot: '14:30',
      durationMinutes: 45,
      price: 15000,
      status: 'Cancelado',
      notes: 'Avisó que reprograma por reunión laboral.',
      createdAt: new Date().toISOString(),
    },
    {
      id: '#TUR-1048',
      branchId: 'recoleta',
      serviceId: 'serv-3',
      barberId: 'barber-6',
      clientName: 'Franco Domínguez',
      clientPhone: '+54 9 11 7766-5544',
      date: today,
      timeSlot: '17:00',
      durationMinutes: 45,
      price: 18000,
      status: 'Confirmado',
      notes: 'Quiere café doble de cortesía.',
      createdAt: new Date().toISOString(),
    },

    // TOMORROW
    {
      id: '#TUR-1049',
      branchId: 'palermo',
      serviceId: 'serv-1',
      barberId: 'barber-1',
      clientName: 'Luciano Vega',
      clientPhone: '+54 9 11 6655-4433',
      date: tomorrow,
      timeSlot: '10:30',
      durationMinutes: 30,
      price: 12000,
      status: 'Confirmado',
      notes: 'Fade medio con navaja.',
      createdAt: new Date().toISOString(),
    },
    {
      id: '#TUR-1050',
      branchId: 'belgrano',
      serviceId: 'serv-3',
      barberId: 'barber-4',
      clientName: 'Sebastián Romero',
      clientPhone: '+54 9 11 9911-2288',
      date: tomorrow,
      timeSlot: '14:00',
      durationMinutes: 45,
      price: 18000,
      status: 'Confirmado',
      notes: 'Acompañado de su hijo.',
      createdAt: new Date().toISOString(),
    },

    // DAY AFTER TOMORROW
    {
      id: '#TUR-1051',
      branchId: 'recoleta',
      serviceId: 'serv-1',
      barberId: 'barber-5',
      clientName: 'Julián Navarro',
      clientPhone: '+54 9 11 1122-3399',
      date: dayAfter,
      timeSlot: '11:00',
      durationMinutes: 30,
      price: 12000,
      status: 'Confirmado',
      notes: 'Cliente habitual.',
      createdAt: new Date().toISOString(),
    },
    {
      id: '#TUR-1052',
      branchId: 'palermo',
      serviceId: 'serv-6',
      barberId: 'barber-2',
      clientName: 'Agustín Cabrera',
      clientPhone: '+54 9 11 4455-6677',
      date: dayAfter,
      timeSlot: '16:00',
      durationMinutes: 20,
      price: 8000,
      status: 'Confirmado',
      notes: 'Limpieza antes de casamiento.',
      createdAt: new Date().toISOString(),
    },
  ];
};

// STORAGE REPOSITORY CLASS
class StorageService {
  constructor() {
    this.init();
  }

  private init(): void {
    if (!localStorage.getItem(STORAGE_KEYS.BRANCHES)) {
      localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(DEFAULT_BRANCHES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.STAFF)) {
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(DEFAULT_STAFF));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SERVICES)) {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(DEFAULT_SERVICES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(generateDefaultAppointments()));
    }
  }

  // Reset to initial mock state (useful for demo & admin testing)
  public resetToDefaults(): void {
    localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(DEFAULT_BRANCHES));
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(DEFAULT_STAFF));
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(DEFAULT_SERVICES));
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(generateDefaultAppointments()));
  }

  // BRANCHES
  public getBranches(): Branch[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BRANCHES);
    return raw ? JSON.parse(raw) : DEFAULT_BRANCHES;
  }

  public updateBranch(updated: Branch): void {
    const branches = this.getBranches().map((b) => (b.id === updated.id ? updated : b));
    localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(branches));
  }

  // STAFF
  public getStaff(branchId?: string): Barber[] {
    const raw = localStorage.getItem(STORAGE_KEYS.STAFF);
    const staff: Barber[] = raw ? JSON.parse(raw) : DEFAULT_STAFF;
    if (branchId) {
      return staff.filter((b) => b.branchId === branchId);
    }
    return staff;
  }

  public getBarberById(barberId: string): Barber | undefined {
    return this.getStaff().find((b) => b.id === barberId);
  }

  // SERVICES
  public getServices(): Service[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SERVICES);
    return raw ? JSON.parse(raw) : DEFAULT_SERVICES;
  }

  public getServiceById(serviceId: string): Service | undefined {
    return this.getServices().find((s) => s.id === serviceId);
  }

  public updateService(updated: Service): void {
    const services = this.getServices().map((s) => (s.id === updated.id ? updated : s));
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
  }

  public addService(newService: Omit<Service, 'id'>): Service {
    const services = this.getServices();
    const service: Service = {
      ...newService,
      id: `serv-${Date.now()}`,
    };
    services.push(service);
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    return service;
  }

  public deleteService(serviceId: string): void {
    const services = this.getServices().filter((s) => s.id !== serviceId);
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
  }

  // APPOINTMENTS
  public getAppointments(): Appointment[] {
    const raw = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    return raw ? JSON.parse(raw) : [];
  }

  public saveAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt'>): Appointment {
    const appointments = this.getAppointments();
    const newId = `#TUR-${Math.floor(1000 + Math.random() * 9000)}`;
    const appointment: Appointment = {
      ...appointmentData,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    appointments.unshift(appointment);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
    return appointment;
  }

  public updateAppointmentStatus(appointmentId: string, status: Appointment['status']): void {
    const appointments = this.getAppointments().map((app) =>
      app.id === appointmentId ? { ...app, status } : app
    );
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  }

  public updateAppointment(updated: Appointment): void {
    const appointments = this.getAppointments().map((app) =>
      app.id === updated.id ? updated : app
    );
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  }

  // SESSION ROLE
  public getSessionRole(): UserRole {
    return (localStorage.getItem(STORAGE_KEYS.SESSION_ROLE) as UserRole) || 'guest';
  }

  public setSessionRole(role: UserRole): void {
    if (role === 'guest') {
      localStorage.removeItem(STORAGE_KEYS.SESSION_ROLE);
    } else {
      localStorage.setItem(STORAGE_KEYS.SESSION_ROLE, role);
    }
  }

  // CSV EXPORT HELPER
  public exportAppointmentsToCSV(): void {
    const appointments = this.getAppointments();
    const branches = this.getBranches();
    const services = this.getServices();
    const staff = this.getStaff();

    const headers = [
      'ID Turno',
      'Fecha',
      'Horario',
      'Sucursal',
      'Servicio',
      'Duracion Min',
      'Barbero',
      'Cliente',
      'Telefono',
      'Monto (ARS)',
      'Estado',
      'Notas',
      'Creado En',
    ];

    const rows = appointments.map((app) => {
      const branch = branches.find((b) => b.id === app.branchId)?.name || app.branchId;
      const service = services.find((s) => s.id === app.serviceId)?.name || app.serviceId;
      const barber =
        app.barberId === 'any'
          ? 'Cualquiera disponible'
          : staff.find((st) => st.id === app.barberId)?.name || app.barberId;

      return [
        `"${app.id}"`,
        `"${app.date}"`,
        `"${app.timeSlot}"`,
        `"${branch}"`,
        `"${service}"`,
        app.durationMinutes,
        `"${barber}"`,
        `"${app.clientName}"`,
        `"${app.clientPhone}"`,
        app.price,
        `"${app.status}"`,
        `"${(app.notes || '').replace(/"/g, '""')}"`,
        `"${app.createdAt}"`,
      ].join(',');
    });

    // Add UTF-8 BOM so Excel opens accented characters without encoding errors
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `barber_co_turnos_${getDateString(0)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const storageService = new StorageService();
