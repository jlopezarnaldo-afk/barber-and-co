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

  // Load data
  const refreshData = () => {
    setAppointments(storageService.getAppointments());
    setBranches(storageService.getBranches());
    setStaff(storageService.getStaff());
    setServices(storageService.getServices());
  };

  // Filtered staff for active branch
  const branchStaff = staff.filter((s) => s.branchId === selectedBranchId);

  // Filter appointments
  const filteredAppointments = appointments
    .filter((app) => {
      const matchBranch = app.branchId === selectedBranchId;
      const matchDate = app.date === selectedDate;
      const matchBarber =
        selectedBarberId === 'all' ||
        app.barberId === selectedBarberId ||
        app.barberId === 'any';
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

  // WhatsApp Reminder URL
  const getWhatsAppReminderUrl = (app: Appointment) => {
    const branch = branches.find((b) => b.id === app.branchId);
    const branchName = branch?.name || 'Barber & Co.';
    const rawPhone = app.clientPhone.replace(/\D/g, '');

    const message = `Hola ${app.clientName}, te recordamos tu turno de hoy a las ${app.timeSlot} hs en Barber & Co (${branchName}). ¡Te esperamos!`;
    return `https://wa.me/${rawPhone}?text=${encodeURIComponent(message)}`;
  };

  const activeBarber = staff.find((s) => s.id === selectedBarberId);
  const activeBranch = branches.find((b) => b.id === selectedBranchId);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20 pt-20">
      {/* Top Header Bar */}
      <div className="border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-md sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-zinc-950 font-black">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-zinc-100">
                  Panel del Peluquero
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-bold">
                  PIN 1111
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Puesto de trabajo • {activeBranch?.name}{' '}
                {activeBarber ? `(${activeBarber.name})` : '(Todas las sillas)'}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[44px] rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-rose-400 text-xs font-semibold border border-zinc-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar Turno / Bloquear</span>
            <span className="sm:hidden">Bloquear</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Filter Controls Card */}
        <div className="p-4 sm:p-5 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <Filter className="w-4 h-4 text-amber-500" />
            <span>Filtros Operativos de Silla</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Branch Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                Sucursal Activa
              </label>
              <select
                value={selectedBranchId}
                onChange={(e) => {
                  setSelectedBranchId(e.target.value as BranchId);
                  setSelectedBarberId('all');
                }}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-xl bg-zinc-950 border border-zinc-800 text-sm font-semibold text-zinc-200 focus:outline-none focus:border-amber-500"
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
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                Barbero / Silla
              </label>
              <select
                value={selectedBarberId}
                onChange={(e) => setSelectedBarberId(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[44px] rounded-xl bg-zinc-950 border border-zinc-800 text-sm font-semibold text-zinc-200 focus:outline-none focus:border-amber-500"
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
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                Jornada
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedDate(getDateString(0))}
                  className={`py-2 min-h-[44px] rounded-xl text-xs font-bold border transition-all ${
                    selectedDate === getDateString(0)
                      ? 'bg-amber-500 text-zinc-950 border-amber-500 shadow'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  Hoy ({getDateString(0).slice(5)})
                </button>
                <button
                  onClick={() => setSelectedDate(getDateString(1))}
                  className={`py-2 min-h-[44px] rounded-xl text-xs font-bold border transition-all ${
                    selectedDate === getDateString(1)
                      ? 'bg-amber-500 text-zinc-950 border-amber-500 shadow'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
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
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-zinc-400 font-medium">Turnos Agendados</div>
              <div className="text-2xl font-extrabold text-zinc-100 mt-0.5">
                {totalBookedToday}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-zinc-400 font-medium">Turnos Atendidos</div>
              <div className="text-2xl font-extrabold text-emerald-400 mt-0.5">
                {totalAttendedToday}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-zinc-400 font-medium">Producción Estimada</div>
              <div className="text-2xl font-extrabold text-amber-500 mt-0.5">
                {formatCurrency(totalRevenueToday)}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Timeline Agenda */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6">
            <div>
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <span>Línea de Tiempo Operativa</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {filteredAppointments.length} turnos programados para el {selectedDate}
              </p>
            </div>

            <button
              onClick={refreshData}
              className="text-xs text-zinc-400 hover:text-zinc-200 p-2 min-h-[44px] rounded-lg hover:bg-zinc-800 flex items-center gap-1 font-semibold"
            >
              Actualizar
            </button>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-sm">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40 text-zinc-600" />
              <p>No hay turnos registrados con los filtros seleccionados.</p>
              <p className="text-xs mt-1 text-zinc-600">
                Cambia la fecha o selecciona "Todas las sillas".
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((app) => {
                const service = services.find((s) => s.id === app.serviceId);
                const barber = staff.find((s) => s.id === app.barberId);

                return (
                  <div
                    key={app.id}
                    className={`p-4 sm:p-5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      app.status === 'Atendido'
                        ? 'bg-zinc-950/40 border-emerald-900/30'
                        : app.status === 'Cancelado'
                        ? 'bg-zinc-950/30 border-rose-900/30 opacity-60'
                        : 'bg-zinc-950/80 border-zinc-800'
                    }`}
                  >
                    {/* Time & Client info */}
                    <div className="flex items-start gap-4">
                      {/* Big Time Badge */}
                      <div className="text-center bg-zinc-900 border border-zinc-700/80 rounded-xl px-3 py-2 min-w-[72px] shrink-0">
                        <span className="block text-base sm:text-lg font-black text-amber-400 font-mono">
                          {app.timeSlot}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-semibold block uppercase">
                          {app.durationMinutes} min
                        </span>
                      </div>

                      {/* Client Details */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-zinc-100">{app.clientName}</h3>
                          <span className="text-[10px] font-mono text-zinc-500">{app.id}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
                          <span className="text-zinc-200 font-medium">
                            {service?.name || 'Servicio'}
                          </span>
                          <span>•</span>
                          <span className="text-amber-500 font-bold">
                            {formatCurrency(app.price)}
                          </span>
                          <span>•</span>
                          <span className="text-zinc-400">
                            Barbero: {barber ? barber.name : 'Cualquiera'}
                          </span>
                        </div>

                        {app.notes && (
                          <p className="text-[11px] text-zinc-500 italic">
                            Nota: "{app.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions: 1-Click Status + WhatsApp Reminder */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-850">
                      {/* Direct WhatsApp Reminder Button */}
                      <a
                        href={getWhatsAppReminderUrl(app)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-all active:scale-95"
                        title="Enviar recordatorio por WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5 fill-current" />
                        <span>Recordar por WhatsApp</span>
                      </a>

                      {/* 1-Click Status Badges */}
                      <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                        <button
                          onClick={() => handleStatusChange(app.id, 'Confirmado')}
                          className={`px-2.5 py-1.5 min-h-[36px] rounded-lg text-xs font-bold transition-colors ${
                            app.status === 'Confirmado'
                              ? 'bg-blue-600 text-white shadow'
                              : 'text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          Confirmado
                        </button>

                        <button
                          onClick={() => handleStatusChange(app.id, 'Atendido')}
                          className={`px-2.5 py-1.5 min-h-[36px] rounded-lg text-xs font-bold transition-colors ${
                            app.status === 'Atendido'
                              ? 'bg-emerald-600 text-white shadow'
                              : 'text-zinc-400 hover:text-emerald-400'
                          }`}
                        >
                          Atendido
                        </button>

                        <button
                          onClick={() => handleStatusChange(app.id, 'Cancelado')}
                          className={`px-2.5 py-1.5 min-h-[36px] rounded-lg text-xs font-bold transition-colors ${
                            app.status === 'Cancelado'
                              ? 'bg-rose-600 text-white shadow'
                              : 'text-zinc-400 hover:text-rose-400'
                          }`}
                        >
                          Cancelado
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
