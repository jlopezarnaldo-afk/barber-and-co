import type { Appointment, BranchId, TimeSlotAvailability } from '../types';
import { storageService } from './storageService';

// Convert "HH:MM" to total minutes from midnight
export const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Convert total minutes from midnight to "HH:MM"
export const minutesToTime = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
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

export interface SlotGeneratorOptions {
  branchId: BranchId;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  barberId: string; // specific barber ID or 'any'
  customAppointments?: Appointment[]; // optional override
}

export const getAvailableTimeSlots = (options: SlotGeneratorOptions): TimeSlotAvailability[] => {
  const { branchId, date, durationMinutes, barberId, customAppointments } = options;

  const branch = storageService.getBranches().find((b) => b.id === branchId);
  const branchStaff = storageService.getStaff(branchId);
  const appointments = (customAppointments || storageService.getAppointments()).filter(
    (app) => app.branchId === branchId && app.date === date && app.status !== 'Cancelado'
  );

  // Business hours: 10:00 to 20:00 (600 to 1200 minutes)
  const START_HOUR_MINUTES = 10 * 60; // 10:00
  const END_HOUR_MINUTES = 20 * 60; // 20:00
  const SLOT_INTERVAL = 30; // 30 min intervals

  const results: TimeSlotAvailability[] = [];

  // Check if current date is today, to filter past hours
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;
  const isToday = date === todayStr;
  const currentMinutesToday = now.getHours() * 60 + now.getMinutes();

  for (
    let slotStart = START_HOUR_MINUTES;
    slotStart < END_HOUR_MINUTES;
    slotStart += SLOT_INTERVAL
  ) {
    const slotEnd = slotStart + durationMinutes;
    const timeString = minutesToTime(slotStart);

    // Rule 1: Cannot finish after closing time (20:00)
    if (slotEnd > END_HOUR_MINUTES) {
      results.push({
        time: timeString,
        available: false,
        reason: 'Supera el horario de cierre (20:00 hs)',
      });
      continue;
    }

    // Rule 2: Past slots today
    // Allow a small grace margin or disable past slots
    if (isToday && slotStart <= currentMinutesToday) {
      results.push({
        time: timeString,
        available: false,
        reason: 'Horario pasado',
      });
      continue;
    }

    // Rule 3: Specific Barber vs Any Available
    if (barberId !== 'any') {
      // Check if this specific barber has conflicting appointments
      const conflictingAppointment = appointments.find((app) => {
        if (app.barberId !== barberId && app.barberId !== 'any') return false;
        const appStart = timeToMinutes(app.timeSlot);
        const appEnd = appStart + app.durationMinutes;
        return doIntervalsOverlap(slotStart, slotEnd, appStart, appEnd);
      });

      if (conflictingAppointment) {
        results.push({
          time: timeString,
          available: false,
          reason: 'Barbero ocupado',
        });
      } else {
        results.push({
          time: timeString,
          available: true,
          assignedBarberId: barberId,
        });
      }
    } else {
      // "Cualquiera disponible":
      // Find at least one barber in this branch who is free for the entire duration
      const availableBarber = branchStaff.find((barber) => {
        const hasConflict = appointments.some((app) => {
          if (app.barberId !== barber.id) return false;
          const appStart = timeToMinutes(app.timeSlot);
          const appEnd = appStart + app.durationMinutes;
          return doIntervalsOverlap(slotStart, slotEnd, appStart, appEnd);
        });
        return !hasConflict;
      });

      // Also check chairs count limit
      const overlappingAppointmentsCount = appointments.filter((app) => {
        const appStart = timeToMinutes(app.timeSlot);
        const appEnd = appStart + app.durationMinutes;
        return doIntervalsOverlap(slotStart, slotEnd, appStart, appEnd);
      }).length;

      const chairsLimit = branch ? branch.chairsCount : 3;

      if (availableBarber && overlappingAppointmentsCount < chairsLimit) {
        results.push({
          time: timeString,
          available: true,
          assignedBarberId: availableBarber.id,
        });
      } else {
        results.push({
          time: timeString,
          available: false,
          reason: 'Sillas ocupadas / Sin barbero libre',
        });
      }
    }
  }

  return results;
};
