import React, { useState } from 'react';
import type {
  Appointment,
  Barber,
  Branch,
  Service,
  AppointmentStatus,
  BranchId,
} from '../types';
import {
  storageService,
  formatCurrency,
  getDateString,
  normalizeWhatsAppPhone,
} from '../services/storageService';
import {
  Calendar,
  Clock,
  CheckCircle2,
  MessageSquare,
  LogOut,
  Scissors,
  DollarSign,
  Filter,
  CalendarCheck,
} from 'lucide-react';

interface StaffPanelProps {
  onLogout: () => void;
}

export const StaffPanel: React.FC<StaffPanelProps> = ({ onLogout }) => {
  const [appointments, setAppointments] = useState<Appointment[]>(() => storageService.getAppointments());
  const [branches, setBranches] = useState<Branch[]>(() => storageService.getBranches());
  const [staff, setStaff] = useState<Barber[]>(() => storageService.getStaff());
  const [services, setServices] = useState<Service[]>(() => storageService.getServices());

  // Filters
  const [selectedBranchId, setSelectedBranchId] = useState<BranchId>('palermo');
  const [selectedBarberId, setSelectedBarberId] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(getDateString(0)); // Default 'Hoy'

  // Schedule self-management state
  const [newDayOffInput, setNewDayOffInput] = useState<string>('');
  const [scheduleNotice, setScheduleNotice] = useState<string>('');

  // Load data
  const refreshData = () => {
    setAppointments(storageService.getAppointments());
    setBranches(storageService.getBranches());
    setStaff(storageService.getStaff());
    setServices(storageService.getServices());
  };

  const flashScheduleNotice = (msg: string) => {
    setScheduleNotice(msg);
    setTimeout(() => setScheduleNotice(''), 3000);
  };

  // Filtered staff for active branch (assigned branches check)
  const branchStaff = staff.filter((s) =>
    s.assignedBranches ? s.assignedBranches.includes(selectedBranchId) : s.branchId === selectedBranchId
  );

  // Filter appointments strictly for this chair / barber
  const filteredAppointments = appointments
    .filter((app) => {
      const matchBranch = app.branchId === selectedBranchId;
      const matchDate = app.date === selectedDate;
      const matchBarber =
        selectedBarberId === 'all' ||
        app.barberId === selectedBarberId;
      return matchBranch && matchDate && matchBarber;
    })
    .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

  // Daily KPIs
  const totalBookedToday = filteredAppointments.length;
  const totalAttendedToday = filteredAppointments.filter((a) => a.status === 'Atendido').length;
  const totalRevenueToday = filteredAppointments
    .filter((a) => a.status === 'Atendido' || a.status === 'Confirmado')
    .reduce((sum, a) => sum + a.price, 0);

  // Status handler
  const handleStatusChange = (appointmentId: string, newStatus: AppointmentStatus) => {
    storageService.updateAppointmentStatus(appointmentId, newStatus);
    refreshData();
  };

  // WhatsApp Reminder URL with valid normalized Argentine phone number
  const getWhatsAppReminderUrl = (app: Appointment) => {
    const branch = branches.find((b) => b.id === app.branchId);
    const branchName = branch?.name || 'Barber & Co.';
    const normalizedPhone = normalizeWhatsAppPhone(app.clientPhone);

    const message = `Hola ${app.clientName}, te recordamos tu turno de hoy a las ${app.timeSlot} hs en Barber & Co (${branchName}). ¡Te esperamos!`;
    return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
  };

  const activeBarber = staff.find((s) => s.id === selectedBarberId);
  const activeBranch = branches.find((b) => b.id === selectedBranchId);

  // Self schedule handlers for active barber
  const handleToggleSelfDayOff = (dateStr: string) => {
    if (!activeBarber) return;
    storageService.toggleCustomDayOff(activeBarber.id, dateStr);
    refreshData();
    flashScheduleNotice(`Disponibilidad actualizada para el día ${dateStr}.`);
  };

  const handleAddSelfDayOff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBarber || !newDayOffInput) return;
    storageService.toggleCustomDayOff(activeBarber.id, newDayOffInput);
    setNewDayOffInput('');
    refreshData();
    flashScheduleNotice(`Día franco ${newDayOffInput} registrado exitosamente.`);
  };

  return (
    <div className="min-h-screen bg-[#ECE7DE] text-[#141210] pb-24 font-sans">
      {/* Top Header Bar */}
      <div className="border-b border-[#141210]/25 bg-[#ECE7DE] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[2px] border border-[#141210]/25 flex items-center justify-center text-[#141210]">
              <Scissors className="w-4 h-4 stroke-[1.75]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-lg font-bold text-[#141210] tracking-tight">
                  Panel del Peluquero
                </h1>
                <span className="px-2 py-0.5 rounded-[2px] bg-[#DDD6C8] border border-[#141210]/25 text-[#141210] text-[10px] font-medium tracking-wider uppercase">
                  PIN 1111
                </span>
              </div>
              <p className="text-xs text-[#141210]/70">
                Puesto de trabajo • {activeBranch?.name}{' '}
                {activeBarber ? `(${activeBarber.name})` : '(Todas las sillas)'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-[2px] bg-[#141210] hover:bg-[#141210]/90 text-[#ECE7DE] text-xs font-medium transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 stroke-[1.75]" />
            <span className="hidden sm:inline">Cerrar Turno / Bloquear</span>
            <span className="sm:hidden">Bloquear</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Filter Controls Card */}
        <div className="p-5 sm:p-6 bg-[#DDD6C8]/40 border border-[#141210]/25 rounded-[2px] space-y-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[#141210]/70">
            <Filter className="w-4 h-4 stroke-[1.75]" />
            <span>Filtros Operativos de Silla</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Branch Selector */}
            <div>
              <label className="block text-xs font-medium text-[#141210]/70 mb-1.5">
                Sucursal Activa
              </label>
              <select
                value={selectedBranchId}
                onChange={(e) => {
                  setSelectedBranchId(e.target.value as BranchId);
                  setSelectedBarberId('all');
                }}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 text-xs font-medium text-[#141210] focus:outline-none"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Barber / Chair Selector */}
            <div>
              <label className="block text-xs font-medium text-[#141210]/70 mb-1.5">
                Barbero / Silla
              </label>
              <select
                value={selectedBarberId}
                onChange={(e) => setSelectedBarberId(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 text-xs font-medium text-[#141210] focus:outline-none"
              >
                <option value="all">Ver toda la sede (Todas las sillas)</option>
                {branchStaff.map((barber) => (
                  <option key={barber.id} value={barber.id}>
                    {barber.name} ({barber.specialties[0]})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Quick Selector */}
            <div>
              <label className="block text-xs font-medium text-[#141210]/70 mb-1.5">
                Jornada
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDate(getDateString(0))}
                  className={`py-2 min-h-[44px] rounded-[2px] text-xs font-medium border transition-colors cursor-pointer ${
                    selectedDate === getDateString(0)
                      ? 'bg-[#141210] text-[#ECE7DE] border-[#141210]'
                      : 'bg-[#ECE7DE] text-[#141210]/70 border-[#141210]/25 hover:border-[#141210]/50'
                  }`}
                >
                  Hoy ({getDateString(0).slice(5)})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDate(getDateString(1))}
                  className={`py-2 min-h-[44px] rounded-[2px] text-xs font-medium border transition-colors cursor-pointer ${
                    selectedDate === getDateString(1)
                      ? 'bg-[#141210] text-[#ECE7DE] border-[#141210]'
                      : 'bg-[#ECE7DE] text-[#141210]/70 border-[#141210]/25 hover:border-[#141210]/50'
                  }`}
                >
                  Mañana ({getDateString(1).slice(5)})
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Staff KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 flex items-center justify-between">
            <div>
              <div className="text-xs text-[#141210]/60 font-medium">Turnos Agendados</div>
              <div className="font-serif text-2xl sm:text-3xl font-bold text-[#141210] mt-1">
                {totalBookedToday}
              </div>
            </div>
            <div className="w-10 h-10 rounded-[2px] border border-[#141210]/20 flex items-center justify-center text-[#141210]">
              <Calendar className="w-5 h-5 stroke-[1.75]" />
            </div>
          </div>

          <div className="p-5 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 flex items-center justify-between">
            <div>
              <div className="text-xs text-[#141210]/60 font-medium">Turnos Atendidos</div>
              <div className="font-serif text-2xl sm:text-3xl font-bold text-[#141210] mt-1">
                {totalAttendedToday}
              </div>
            </div>
            <div className="w-10 h-10 rounded-[2px] border border-[#141210]/20 flex items-center justify-center text-[#141210]">
              <CheckCircle2 className="w-5 h-5 stroke-[1.75]" />
            </div>
          </div>

          <div className="p-5 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 flex items-center justify-between">
            <div>
              <div className="text-xs text-[#141210]/60 font-medium">Producción Estimada</div>
              <div className="font-serif text-2xl sm:text-3xl font-bold text-[#141210] mt-1">
                {formatCurrency(totalRevenueToday)}
              </div>
            </div>
            <div className="w-10 h-10 rounded-[2px] border border-[#141210]/20 flex items-center justify-center text-[#141210]">
              <DollarSign className="w-5 h-5 stroke-[1.75]" />
            </div>
          </div>
        </div>

        {/* SECTION: MI AGENDA & DISPONIBILIDAD (Self-service when a barber is selected) */}
        {activeBarber && (
          <div className="p-6 rounded-[2px] bg-[#DDD6C8]/40 border border-[#141210]/25 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#141210]/20 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#141210] flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 stroke-[1.75]" />
                  <span>Mi Agenda &amp; Disponibilidad: {activeBarber.name}</span>
                </h3>
                <p className="text-xs text-[#141210]/70 mt-0.5">
                  Gestioná tus descansos puntuales o consultá tus horarios semanales asignados.
                </p>
              </div>

              {scheduleNotice && (
                <div className="text-xs font-medium px-3 py-1.5 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 text-[#141210]">
                  {scheduleNotice}
                </div>
              )}
            </div>

            {/* Weekly Assigned Hours Grid */}
            <div>
              <div className="text-[11px] font-medium tracking-wider text-[#141210]/70 uppercase mb-2">
                Horario habitual semanal:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {[
                  { idx: 1, label: 'Lunes' },
                  { idx: 2, label: 'Martes' },
                  { idx: 3, label: 'Miércoles' },
                  { idx: 4, label: 'Jueves' },
                  { idx: 5, label: 'Viernes' },
                  { idx: 6, label: 'Sábado' },
                ].map((d) => {
                  const day = activeBarber.schedule ? activeBarber.schedule[d.idx] : null;
                  const isActive = day?.active ?? true;
                  const branchName = day?.branchId ? branches.find((b) => b.id === day.branchId)?.name.replace('Sede ', '') : 'Asignada';

                  return (
                    <div
                      key={d.idx}
                      className={`p-2.5 rounded-[2px] border text-xs ${
                        isActive
                          ? 'bg-[#ECE7DE] border-[#141210]/25'
                          : 'bg-[#DDD6C8]/60 border-[#141210]/15 opacity-60'
                      }`}
                    >
                      <div className="font-bold text-[11px] text-[#141210]">{d.label}</div>
                      {isActive ? (
                        <div className="text-[11px] text-[#141210]/70 mt-1 space-y-0.5">
                          <div>{day?.start || '10:00'} - {day?.end || '20:00'} hs</div>
                          <div className="text-[10px] text-[#141210]/50">{branchName}</div>
                        </div>
                      ) : (
                        <div className="text-[10px] text-[#141210]/50 italic mt-1">Franco</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Self Day-Off Management */}
            <div className="pt-3 border-t border-[#141210]/20 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs font-medium text-[#141210]">
                  Mis Francos Puntuales / Vacaciones (Fechas bloqueadas):
                </span>

                <form onSubmit={handleAddSelfDayOff} className="flex items-center gap-2">
                  <input
                    type="date"
                    required
                    value={newDayOffInput}
                    onChange={(e) => setNewDayOffInput(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 text-[#141210]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 min-h-[36px] rounded-[2px] bg-[#141210] hover:bg-[#141210]/90 text-[#ECE7DE] text-xs font-medium cursor-pointer"
                  >
                    + Bloquear Fecha
                  </button>
                </form>
              </div>

              {activeBarber.customDaysOff && activeBarber.customDaysOff.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {activeBarber.customDaysOff.map((offDate) => (
                    <span
                      key={offDate}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 text-xs text-[#141210]"
                    >
                      <span>{offDate}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleSelfDayOff(offDate)}
                        className="text-[#141210]/50 hover:text-[#B23A2E] cursor-pointer"
                        title="Desbloquear fecha"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#141210]/60 italic">
                  No tenés francos extraordinarios registrados.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Timeline Agenda */}
        <div className="bg-[#DDD6C8]/40 border border-[#141210]/25 rounded-[2px] p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#141210]/25 gap-2">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#141210] flex items-center gap-2">
                <Clock className="w-5 h-5 stroke-[1.75]" />
                <span>Cronograma de Turnos ({selectedDate})</span>
              </h2>
              <p className="text-xs text-[#141210]/70 mt-0.5">
                {activeBranch?.name} • {filteredAppointments.length} turnos agendados
              </p>
            </div>

            <div className="text-xs text-[#141210]/60">
              Orden cronológico de atención
            </div>
          </div>

          {/* Empty state */}
          {filteredAppointments.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-[2px] border border-[#141210]/20 flex items-center justify-center text-[#141210] mx-auto">
                <Calendar className="w-6 h-6 stroke-[1.75]" />
              </div>
              <h3 className="font-serif text-base font-bold text-[#141210]">
                Sin turnos en esta jornada
              </h3>
              <p className="text-xs text-[#141210]/60 max-w-sm mx-auto">
                No hay citas registradas para la fecha y filtros seleccionados en esta sucursal.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#141210]/25">
              {filteredAppointments.map((app) => {
                const service = services.find((s) => s.id === app.serviceId);
                const barber = staff.find((s) => s.id === app.barberId);

                return (
                  <div
                    key={app.id}
                    className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors"
                  >
                    {/* Time Slot & Client Info */}
                    <div className="flex items-start gap-4">
                      {/* Time Block Badge */}
                      <div className="p-2.5 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 text-center min-w-[75px] shrink-0">
                        <span className="font-serif font-bold text-sm block text-[#141210]">
                          {app.timeSlot} hs
                        </span>
                        <span className="text-[10px] text-[#141210]/60 block uppercase mt-0.5">
                          {app.durationMinutes} min
                        </span>
                      </div>

                      {/* Client Details */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif font-bold text-base text-[#141210]">{app.clientName}</h3>
                          <span className="text-[10px] text-[#141210]/50 font-mono">{app.id}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#141210]/70">
                          <span className="text-[#141210] font-medium">
                            {service?.name || 'Servicio'}
                          </span>
                          <span>•</span>
                          <span className="font-serif font-bold text-[#141210]">
                            {formatCurrency(app.price)}
                          </span>
                          <span>•</span>
                          <span className="text-[#141210]/70">
                            Barbero: {barber ? barber.name : 'Cualquiera'}
                          </span>
                        </div>

                        {app.notes && (
                          <p className="text-[11px] text-[#141210]/60 italic">
                            Nota: "{app.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions: 1-Click Status + WhatsApp Reminder */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
                      {/* Direct WhatsApp Reminder Button */}
                      <a
                        href={getWhatsAppReminderUrl(app)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-[2px] bg-[#ECE7DE] hover:bg-[#DDD6C8] text-[#141210] border border-[#141210]/25 text-xs font-medium transition-colors cursor-pointer"
                        title="Enviar recordatorio por WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5 stroke-[1.75]" />
                        <span>Recordar por WhatsApp</span>
                      </a>

                      {/* 1-Click Status Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-[2px] bg-[#DDD6C8]/40 border border-[#141210]/20">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(app.id, 'Confirmado')}
                          className={`px-2.5 py-1.5 min-h-[36px] rounded-[2px] text-xs font-medium border transition-colors cursor-pointer ${
                            app.status === 'Confirmado'
                              ? 'bg-[#141210] text-[#ECE7DE] border-[#141210]'
                              : 'bg-[#ECE7DE] text-[#141210] border-[#141210]/40 hover:border-[#141210]'
                          }`}
                        >
                          Confirmado
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(app.id, 'Atendido')}
                          className={`px-2.5 py-1.5 min-h-[36px] rounded-[2px] text-xs font-medium border transition-colors cursor-pointer ${
                            app.status === 'Atendido'
                              ? 'bg-[#4B5842] text-white border-[#4B5842]'
                              : 'bg-[#ECE7DE] text-[#4B5842] border-[#4B5842]/50 hover:border-[#4B5842]'
                          }`}
                        >
                          Atendido
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(app.id, 'Cancelado')}
                          className={`px-2.5 py-1.5 min-h-[36px] rounded-[2px] text-xs font-medium border transition-colors cursor-pointer ${
                            app.status === 'Cancelado'
                              ? 'bg-[#B23A2E] text-white border-[#B23A2E]'
                              : 'bg-[#ECE7DE] text-[#B23A2E] border-[#B23A2E]/50 hover:border-[#B23A2E]'
                          }`}
                        >
                          Cancelado
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(app.id, 'No Asistió')}
                          className={`px-2.5 py-1.5 min-h-[36px] rounded-[2px] text-xs font-medium border transition-colors cursor-pointer ${
                            app.status === 'No Asistió'
                              ? 'bg-[#A67C3D] text-white border-[#A67C3D]'
                              : 'bg-[#ECE7DE] text-[#A67C3D] border-[#A67C3D]/50 hover:border-[#A67C3D]'
                          }`}
                          title="Cliente no se presentó al turno"
                        >
                          No Asistió
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
