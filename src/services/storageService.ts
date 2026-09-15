import type { Appointment, Barber, BarberSettings, Branch, BranchId, Service, UserRole } from '../types';

const STORAGE_KEYS = {
  BRANCHES: 'barber_branches',
  STAFF: 'barber_staff',
  SERVICES: 'barber_services',
  APPOINTMENTS: 'barber_appointments',
  SETTINGS: 'barber_settings',
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

// Normalize Argentine phone numbers for WhatsApp wa.me links
export const normalizeWhatsAppPhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '5491148201122';
  // If already starts with Argentina country code (54)
  if (digits.startsWith('54')) {
    // If it starts with 54 but not 549 and is mobile (e.g. 5411...)
    if (!digits.startsWith('549') && digits.length === 12) {
      return `549${digits.slice(2)}`;
    }
    return digits;
  }
  // If 10 digits (e.g., 1155223344 or 1121503344)
  if (digits.length === 10) {
    return `549${digits}`;
  }
  // If starts with 9 and 10 digits
  if (digits.startsWith('9') && digits.length === 11) {
    return `54${digits}`;
  }
  // Fallback prepend 549
  return `549${digits}`;
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
  if (minutes === 60) return '1 hora';
  if (minutes > 60) {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return `${hours} h ${rest > 0 ? `${rest} m` : ''}`;
  }
  return `${minutes} min`;
};

// Convert "HH:MM" to total minutes from midnight
export const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Check if two time intervals overlap: [startA, endA) and [startB, endB)
export const doIntervalsOverlap = (
  startA: number,
  endA: number,
  startB: number,
  endB: number
): boolean => {
  return Math.max(startA, startB) < Math.min(endA, endB);
};

import {
  DEFAULT_BRANCHES,
  DEFAULT_STAFF,
  DEFAULT_SERVICES,
  DEFAULT_SETTINGS,
  createDefaultSchedule,
  generateDefaultAppointments,
  getServicePrice,
} from '../data/initialData';

export { getServicePrice, DEFAULT_BRANCHES, DEFAULT_STAFF, DEFAULT_SERVICES, DEFAULT_SETTINGS, generateDefaultAppointments };

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
    } else {
      // Migrate existing staff if missing assignedBranches or schedule
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.STAFF);
        if (raw) {
          const stored: Barber[] = JSON.parse(raw);
          const needsMigration = stored.some(
            (b) => !b.assignedBranches || !b.schedule || !b.customDaysOff
          );
          if (needsMigration) {
            const upgraded = stored.map((b) => {
              const def = DEFAULT_STAFF.find((ds) => ds.id === b.id);
              return {
                ...b,
                assignedBranches: b.assignedBranches || def?.assignedBranches || [b.branchId],
                schedule: b.schedule || def?.schedule || createDefaultSchedule(b.branchId),
                customDaysOff: b.customDaysOff || def?.customDaysOff || [],
              };
            });
            localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(upgraded));
          }
        }
      } catch {
        localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(DEFAULT_STAFF));
      }
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SERVICES)) {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(DEFAULT_SERVICES));
    } else {
      // Migrate existing services if they lack branchPrices
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.SERVICES);
        if (raw) {
          const stored: Service[] = JSON.parse(raw);
          const needsMigration = stored.some(
            (s) => !s.branchPrices || Object.keys(s.branchPrices).length === 0
          );
          if (needsMigration) {
            const upgraded = stored.map((s) => {
              const def = DEFAULT_SERVICES.find((ds) => ds.id === s.id);
              return {
                ...s,
                branchPrices:
                  s.branchPrices && Object.keys(s.branchPrices).length > 0
                    ? s.branchPrices
                    : def?.branchPrices || {
                        palermo: s.price,
                        belgrano: s.price,
                        recoleta: s.price,
                      },
              };
            });
            localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(upgraded));
          }
        }
      } catch {
        localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(DEFAULT_SERVICES));
      }
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
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(generateDefaultAppointments()));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('barber_services_updated'));
      window.dispatchEvent(new Event('barber_settings_updated'));
      window.dispatchEvent(new Event('barber_staff_updated'));
    }
  }

  // SETTINGS
  public getSettings(): BarberSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Settings data is invalid');
      }
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch (err) {
      console.warn('Error reading settings from localStorage, resetting to defaults:', err);
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
  }

  public updateSettings(partial: Partial<BarberSettings>): BarberSettings {
    const current = this.getSettings();
    const updated = { ...current, ...partial };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('barber_settings_updated'));
    }
    return updated;
  }

  // BRANCHES
  public getBranches(): Branch[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BRANCHES);
    if (!raw) return DEFAULT_BRANCHES;
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('Branches data is not an array or empty');
      }
      return parsed;
    } catch (err) {
      console.warn('Error reading branches from localStorage, resetting to defaults:', err);
      localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(DEFAULT_BRANCHES));
      return DEFAULT_BRANCHES;
    }
  }

  public updateBranch(updated: Branch): void {
    const branches = this.getBranches().map((b) => (b.id === updated.id ? updated : b));
    localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(branches));
  }

  // STAFF
  public getStaff(branchId?: string, dateStr?: string, includeInactive: boolean = false): Barber[] {
    const raw = localStorage.getItem(STORAGE_KEYS.STAFF);
    let staff: Barber[] = DEFAULT_STAFF;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          throw new Error('Staff data is not an array or empty');
        }
        staff = parsed;
      } catch (err) {
        console.warn('Error reading staff from localStorage, resetting to defaults:', err);
        localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(DEFAULT_STAFF));
        staff = DEFAULT_STAFF;
      }
    }

    // Ensure backwards compatibility properties
    staff = staff.map((b) => ({
      ...b,
      assignedBranches: b.assignedBranches || [b.branchId],
      schedule: b.schedule || createDefaultSchedule(b.branchId),
      customDaysOff: b.customDaysOff || [],
      isActive: b.isActive !== false,
    }));

    if (!includeInactive) {
      staff = staff.filter((b) => b.isActive !== false);
    }

    if (branchId) {
      staff = staff.filter((b) =>
        b.assignedBranches ? b.assignedBranches.includes(branchId as BranchId) : b.branchId === branchId
      );
    }

    if (dateStr) {
      // Filter out barbers who have day off on dateStr or are not scheduled on that day of week for this branch
      const [y, m, d] = dateStr.split('-').map(Number);
      const dayOfWeek = new Date(y, m - 1, d).getDay(); // 0-6

      staff = staff.filter((b) => {
        // Check custom days off
        if (b.customDaysOff && b.customDaysOff.includes(dateStr)) {
          return false;
        }
        // Check schedule on this day of week
        const dayPlan = b.schedule ? b.schedule[dayOfWeek] : null;
        if (!dayPlan || !dayPlan.active) {
          return false;
        }
        // If branchId was specified, check if scheduled for this specific branch
        if (branchId && dayPlan.branchId && dayPlan.branchId !== branchId) {
          return false;
        }
        return true;
      });
    }

    return staff;
  }

  public getAllStaff(): Barber[] {
    return this.getStaff(undefined, undefined, true);
  }

  public getBarberById(barberId: string): Barber | undefined {
    const staff = this.getAllStaff();
    return staff.find((b) => b.id === barberId);
  }

  public addBarber(barberData: Omit<Barber, 'id'> | (Partial<Omit<Barber, 'id'>> & { name: string; assignedBranches: BranchId[] })): Barber {
    const newId = `barber-${Date.now()}`;
    const primaryBranch = barberData.assignedBranches?.[0] || barberData.branchId || 'palermo';
    const assignedBranches = barberData.assignedBranches && barberData.assignedBranches.length > 0
      ? barberData.assignedBranches
      : [primaryBranch];

    const defaultSchedule = createDefaultSchedule(primaryBranch, '10:00', '19:00');

    const newBarber: Barber = {
      id: newId,
      name: barberData.name.trim(),
      branchId: primaryBranch,
      avatarUrl:
        barberData.avatarUrl?.trim() ||
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      rating: typeof barberData.rating === 'number' ? barberData.rating : 5.0,
      reviewsCount: barberData.reviewsCount || 1,
      specialties:
        barberData.specialties && barberData.specialties.length > 0
          ? barberData.specialties
          : ['Corte Clásico', 'Fade', 'Perfilado de Barba'],
      phone: barberData.phone?.trim() || '+54 9 11 4820-1122',
      assignedBranches,
      schedule: barberData.schedule || defaultSchedule,
      customDaysOff: barberData.customDaysOff || [],
      isActive: barberData.isActive !== false,
    };

    const currentStaff = this.getAllStaff();
    const nextStaff = [...currentStaff, newBarber];
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(nextStaff));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('barber_staff_updated'));
    }
    return newBarber;
  }

  public deleteBarber(barberId: string): void {
    const currentStaff = this.getAllStaff();
    const nextStaff = currentStaff.filter((b) => b.id !== barberId);
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(nextStaff));

    // Reassign any appointments for this deleted barber to 'any' to avoid orphaned bookings
    const appointments = this.getAppointments();
    let hasModified = false;
    const updatedAppointments = appointments.map((app) => {
      if (app.barberId === barberId) {
        hasModified = true;
        return {
          ...app,
          barberId: 'any',
        };
      }
      return app;
    });

    if (hasModified) {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(updatedAppointments));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('barber_appointments_updated'));
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('barber_staff_updated'));
    }
  }

  public toggleBarberActive(barberId: string): Barber | undefined {
    const barber = this.getBarberById(barberId);
    if (!barber) return undefined;

    const updatedBarber: Barber = {
      ...barber,
      isActive: barber.isActive === false ? true : false,
    };

    this.updateBarber(updatedBarber);
    return updatedBarber;
  }

  public updateBarber(updated: Barber): void {
    const currentStaff = this.getAllStaff();
    const nextStaff = currentStaff.map((b) => (b.id === updated.id ? updated : b));
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(nextStaff));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('barber_staff_updated'));
    }
  }

  public toggleCustomDayOff(barberId: string, dateStr: string): Barber | undefined {
    const barber = this.getBarberById(barberId);
    if (!barber) return undefined;

    const daysOff = barber.customDaysOff || [];
    const exists = daysOff.includes(dateStr);
    const updatedDaysOff = exists
      ? daysOff.filter((d) => d !== dateStr)
      : [...daysOff, dateStr].sort();

    const updatedBarber: Barber = {
      ...barber,
      customDaysOff: updatedDaysOff,
    };
    this.updateBarber(updatedBarber);
    return updatedBarber;
  }


  // SERVICES
  public getServices(): Service[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SERVICES);
    if (!raw) return DEFAULT_SERVICES;
    try {
      const parsed: Service[] = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('Services data is not an array or empty');
      }
      return parsed.map((s) => {
        if (!s.branchPrices) {
          const def = DEFAULT_SERVICES.find((ds) => ds.id === s.id);
          return {
            ...s,
            branchPrices: def?.branchPrices || {
              palermo: s.price,
              belgrano: s.price,
              recoleta: s.price,
            },
          };
        }
        return s;
      });
    } catch (err) {
      console.warn('Error reading services from localStorage, resetting to defaults:', err);
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(DEFAULT_SERVICES));
      return DEFAULT_SERVICES;
    }
  }

  public getServiceById(serviceId: string): Service | undefined {
    return this.getServices().find(
      (s) =>
        s.id === serviceId ||
        (serviceId === 'corte-fade' && (s.id === 'serv-1' || s.name.includes('Corte Clásico'))) ||
        (serviceId === 'serv-1' && s.id === 'corte-fade')
    );
  }

  public getServicePrice(service: Service | undefined | null, branchId?: BranchId | string): number {
    return getServicePrice(service, branchId);
  }

  public updateService(updated: Service): void {
    const services = this.getServices().map((s) => (s.id === updated.id ? updated : s));
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('barber_services_updated'));
    }
  }

  public updateServiceBranchPrice(serviceId: string, branchId: BranchId, newPrice: number): void {
    const validPrice = !isNaN(newPrice) && newPrice >= 500 ? Math.round(newPrice) : 500;
    const services = this.getServices().map((s) => {
      if (s.id === serviceId) {
        const branchPrices = {
          ...(s.branchPrices || { palermo: s.price, belgrano: s.price, recoleta: s.price }),
          [branchId]: validPrice,
        };
        return {
          ...s,
          branchPrices,
          price: branchId === 'palermo' ? validPrice : s.price,
        };
      }
      return s;
    });
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('barber_services_updated'));
    }
  }

  public updateServiceBranchPrices(
    serviceId: string,
    newBranchPrices: Partial<Record<BranchId, number>>
  ): void {
    const services = this.getServices().map((s) => {
      if (s.id === serviceId) {
        const branchPrices = {
          ...(s.branchPrices || { palermo: s.price, belgrano: s.price, recoleta: s.price }),
        };
        (Object.keys(newBranchPrices) as BranchId[]).forEach((bId) => {
          const val = newBranchPrices[bId];
          if (val !== undefined && !isNaN(val) && val >= 500) {
            branchPrices[bId] = Math.round(val);
          }
        });
        return {
          ...s,
          branchPrices,
          price: branchPrices.palermo ?? s.price,
        };
      }
      return s;
    });
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('barber_services_updated'));
    }
  }

  public addService(newService: Omit<Service, 'id'>): Service {
    const services = this.getServices();
    const service: Service = {
      ...newService,
      id: `serv-${Date.now()}`,
      branchPrices: newService.branchPrices || {
        palermo: newService.price,
        belgrano: newService.price,
        recoleta: newService.price,
      },
    };
    services.push(service);
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('barber_services_updated'));
    }
    return service;
  }

  public deleteService(serviceId: string): void {
    const services = this.getServices().filter((s) => s.id !== serviceId);
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('barber_services_updated'));
    }
  }

  // APPOINTMENTS
  public getAppointments(): Appointment[] {
    const raw = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        throw new Error('Appointments data is not an array');
      }
      return parsed;
    } catch (err) {
      console.warn('Error reading appointments from localStorage, resetting to defaults:', err);
      const defaults = generateDefaultAppointments();
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(defaults));
      return defaults;
    }
  }

  public saveAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt'>): Appointment {
    const appointments = this.getAppointments();

    const newStart = timeToMinutes(appointmentData.timeSlot);
    const newEnd = newStart + appointmentData.durationMinutes;

    // Filter appointments for the same branch and date that are not cancelled
    const activeSameDayAppointments = appointments.filter(
      (app) =>
        app.branchId === appointmentData.branchId &&
        app.date === appointmentData.date &&
        app.status !== 'Cancelado'
    );

    // 1. Check chair capacity limit for this branch during the requested time window
    const branch = this.getBranches().find((b) => b.id === appointmentData.branchId);
    const chairsLimit = branch ? branch.chairsCount : 3;
    const overlappingBranchAppsCount = activeSameDayAppointments.filter((app) => {
      const appStart = timeToMinutes(app.timeSlot);
      const appEnd = appStart + app.durationMinutes;
      return doIntervalsOverlap(newStart, newEnd, appStart, appEnd);
    }).length;

    if (overlappingBranchAppsCount >= chairsLimit) {
      throw new Error('Capacidad máxima de la sucursal alcanzada para el horario seleccionado.');
    }

    // 2. If a specific barber is requested (not 'any'), verify the barber does not have a colliding appointment
    if (appointmentData.barberId && appointmentData.barberId !== 'any') {
      const barberConflict = activeSameDayAppointments.find((app) => {
        if (app.barberId !== appointmentData.barberId) return false;
        const appStart = timeToMinutes(app.timeSlot);
        const appEnd = appStart + app.durationMinutes;
        return doIntervalsOverlap(newStart, newEnd, appStart, appEnd);
      });

      if (barberConflict) {
        throw new Error('El profesional seleccionado ya cuenta con una reserva en ese horario.');
      }
    } else if (appointmentData.barberId === 'any') {
      // If 'any', ensure at least one active barber is available and free
      const branchStaffOnDate = this.getStaff(appointmentData.branchId, appointmentData.date);
      const hasFreeBarber = branchStaffOnDate.some((barber) => {
        const conflict = activeSameDayAppointments.some((app) => {
          if (app.barberId !== barber.id) return false;
          const appStart = timeToMinutes(app.timeSlot);
          const appEnd = appStart + app.durationMinutes;
          return doIntervalsOverlap(newStart, newEnd, appStart, appEnd);
        });
        return !conflict;
      });

      if (!hasFreeBarber) {
        throw new Error('No hay profesionales disponibles en la sucursal para el horario seleccionado.');
      }
    }

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

    const sanitizeCell = (val: string | number | undefined | null): string => {
      if (val === undefined || val === null) return '""';
      let str = String(val);
      // Neutralize Excel formula injection if text starts with =, +, -, @ (including leading whitespace)
      if (/^\s*[=+\-@]/.test(str)) {
        str = `'${str}`;
      }
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = appointments.map((app) => {
      const branch = branches.find((b) => b.id === app.branchId)?.name || app.branchId;
      const service = services.find((s) => s.id === app.serviceId)?.name || app.serviceId;
      const barber =
        app.barberId === 'any'
          ? 'Cualquiera disponible'
          : staff.find((st) => st.id === app.barberId)?.name || app.barberId;

      return [
        sanitizeCell(app.id),
        sanitizeCell(app.date),
        sanitizeCell(app.timeSlot),
        sanitizeCell(branch),
        sanitizeCell(service),
        sanitizeCell(app.durationMinutes),
        sanitizeCell(barber),
        sanitizeCell(app.clientName),
        sanitizeCell(app.clientPhone),
        sanitizeCell(app.price),
        sanitizeCell(app.status),
        sanitizeCell(app.notes),
        sanitizeCell(app.createdAt),
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
