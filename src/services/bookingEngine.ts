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
  const appointments = (customAppointments || storageService.getAppointments()).filter(
    (app) => app.branchId === branchId && app.date === date && app.status !== 'Cancelado'
  );

  // Parse date day of week (0: Sun, 1: Mon, ..., 6: Sat)
  const [y, m, d] = date.split('-').map(Number);
  const dayOfWeek = new Date(y, m - 1, d).getDay();

  // Active staff working at this branch on this date
  const branchStaffOnDate = storageService.getStaff(branchId, date);

  // Business hours: Dynamically parse from branch schedule (e.g. "Lun a Sáb de 10:00 a 20:00 hs")
  let startHourMinutes = 10 * 60; // default 10:00
  let endHourMinutes = 20 * 60;   // default 20:00
  if (branch?.schedule) {
    const match = branch.schedule.match(/(\d{1,2}):(\d{2})\s*a\s*(\d{1,2}):(\d{2})/);
    if (match) {
      startHourMinutes = parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
      endHourMinutes = parseInt(match[3], 10) * 60 + parseInt(match[4], 10);
    }
  }

  const SLOT_INTERVAL = 30; // 30 min intervals
  const chairsLimit = branch ? branch.chairsCount : 3;

  // Validate that requested barber belongs to this branch and works on this date
  const requestedBarber = barberId !== 'any' ? storageService.getBarberById(barberId) : null;
  const isBarberInBranch = requestedBarber && (
    requestedBarber.assignedBranches
      ? requestedBarber.assignedBranches.includes(branchId)
      : requestedBarber.branchId === branchId
  );
  const isBarberActiveToday = isBarberInBranch && branchStaffOnDate.some((b) => b.id === barberId);
  const effectiveBarberId = isBarberInBranch ? barberId : 'any';

  // Specific barber working hours on this day if applicable
  let barberStartMinutes = startHourMinutes;
  let barberEndMinutes = endHourMinutes;
  if (requestedBarber && requestedBarber.schedule && requestedBarber.schedule[dayOfWeek]) {
    const barberDay = requestedBarber.schedule[dayOfWeek];
    if (barberDay.start && barberDay.end) {
      barberStartMinutes = Math.max(startHourMinutes, timeToMinutes(barberDay.start));
      barberEndMinutes = Math.min(endHourMinutes, timeToMinutes(barberDay.end));
    }
  }

  const results: TimeSlotAvailability[] = [];

  // Check if current date is today, to filter past hours
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;
  const isToday = date === todayStr;
  const currentMinutesToday = now.getHours() * 60 + now.getMinutes();

  for (
    let slotStart = startHourMinutes;
    slotStart < endHourMinutes;
    slotStart += SLOT_INTERVAL
  ) {
    const slotEnd = slotStart + durationMinutes;
    const timeString = minutesToTime(slotStart);

    // Rule 1: Cannot finish after branch closing time
    if (slotEnd > endHourMinutes) {
      results.push({
        time: timeString,
        available: false,
        reason: `Supera el horario de cierre (${minutesToTime(endHourMinutes)} hs)`,
      });
      continue;
    }

    // Rule 2: Past slots today
    if (isToday && slotStart <= currentMinutesToday) {
      results.push({
        time: timeString,
        available: false,
        reason: 'Horario pasado',
      });
      continue;
    }

    // Check chair capacity across the branch during this interval
    const overlappingAppointmentsCount = appointments.filter((app) => {
      const appStart = timeToMinutes(app.timeSlot);
      const appEnd = appStart + app.durationMinutes;
      return doIntervalsOverlap(slotStart, slotEnd, appStart, appEnd);
    }).length;

    // Rule 3: Specific Barber vs Any Available
    if (effectiveBarberId !== 'any') {
      // Chair limit check applies globally to branch capacity first
      if (overlappingAppointmentsCount >= chairsLimit) {
        results.push({
          time: timeString,
          available: false,
          reason: 'Capacidad máxima de sillas alcanzada',
        });
        continue;
      }

      // If barber is off today (franco or not scheduled in this branch)
      if (!isBarberActiveToday) {
        results.push({
          time: timeString,
          available: false,
          reason: 'Barbero no disponible hoy (franco / otra sede)',
        });
        continue;
      }

      // If slot is outside barber's working hours
      if (slotStart < barberStartMinutes || slotEnd > barberEndMinutes) {
        results.push({
          time: timeString,
          available: false,
          reason: `Fuera del horario de ${requestedBarber?.name || 'barbero'}`,
        });
        continue;
      }

      // Check if this specific barber has conflicting appointments
      const conflictingAppointment = appointments.find((app) => {
        if (app.barberId !== effectiveBarberId) return false;
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
          assignedBarberId: effectiveBarberId,
        });
      }
    } else {
      // "Cualquiera disponible":
      // Find at least one barber active today in this branch who is within working hours and free
      const availableBarber = branchStaffOnDate.find((barber) => {
        const barberDay = barber.schedule ? barber.schedule[dayOfWeek] : null;
        if (barberDay && barberDay.start && barberDay.end) {
          const bStart = Math.max(startHourMinutes, timeToMinutes(barberDay.start));
          const bEnd = Math.min(endHourMinutes, timeToMinutes(barberDay.end));
          if (slotStart < bStart || slotEnd > bEnd) return false;
        }

        const hasConflict = appointments.some((app) => {
          if (app.barberId !== barber.id) return false;
          const appStart = timeToMinutes(app.timeSlot);
          const appEnd = appStart + app.durationMinutes;
          return doIntervalsOverlap(slotStart, slotEnd, appStart, appEnd);
        });
        return !hasConflict;
      });

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
          reason: overlappingAppointmentsCount >= chairsLimit
            ? 'Capacidad máxima de sillas alcanzada'
            : 'Sin barbero disponible en este horario',
        });
      }
    }
  }

  return results;
};
