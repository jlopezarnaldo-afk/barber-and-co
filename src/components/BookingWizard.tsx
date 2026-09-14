import React, { useState, useMemo } from 'react';
import type {
  BranchId,
  Appointment,
} from '../types';
import {
  storageService,
  formatCurrency,
  formatDuration,
  getDateString,
} from '../services/storageService';
import { getAvailableTimeSlots } from '../services/bookingEngine';
import {
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Scissors,
  Star,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookingWizardProps {
  initialBranchId?: BranchId;
  initialServiceId?: string;
  onAppointmentCreated?: (appointment: Appointment) => void;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({
  initialBranchId,
  initialServiceId,
  onAppointmentCreated,
}) => {
  const [step, setStep] = useState<number>(initialServiceId ? 2 : 1);

  // Selections state
  const [selectedBranchId, setSelectedBranchId] = useState<BranchId>(
    initialBranchId || 'palermo'
  );
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    initialServiceId || 'serv-1'
  );
  const [selectedBarberId, setSelectedBarberId] = useState<string>('any');
  const [selectedDate, setSelectedDate] = useState<string>(getDateString(0));
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');

  // Client form state
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientNotes, setClientNotes] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // Confirmed appointment state
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);

  const branches = storageService.getBranches();
  const services = storageService.getServices();
  const staff = storageService.getStaff(selectedBranchId);

  const currentBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];
  const currentService = services.find((s) => s.id === selectedServiceId) || services[0];
  const currentBarber =
    selectedBarberId === 'any'
      ? null
      : staff.find((b) => b.id === selectedBarberId);

  const selectedServiceDuration = currentService ? currentService.durationMinutes : 30;

  // Compute dynamic time slots reactively using useMemo
  const availableSlots = useMemo(() => {
    return getAvailableTimeSlots({
      branchId: selectedBranchId,
      date: selectedDate,
      durationMinutes: selectedServiceDuration,
      barberId: selectedBarberId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranchId, selectedDate, selectedBarberId, selectedServiceDuration]);

  // Generate next 7 days list
  const availableDates = useMemo(() => {
    return Array.from({ length: 8 }).map((_, index) => {
      const dateStr = getDateString(index);
      const dateObj = new Date();
      dateObj.setDate(dateObj.getDate() + index);

      const dayName = dateObj.toLocaleDateString('es-AR', { weekday: 'short' });
      const dayNumber = dateObj.getDate();
      const monthName = dateObj.toLocaleDateString('es-AR', { month: 'short' });

      let prefix = dayName.toUpperCase();
      if (index === 0) prefix = 'HOY';
      if (index === 1) prefix = 'MAÑANA';

      return {
        dateStr,
        prefix,
        label: `${dayNumber} ${monthName}`,
      };
    });
  }, []);

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setFormError('Por favor ingrese su nombre completo.');
      return;
    }
    if (!clientPhone.trim() || clientPhone.replace(/\D/g, '').length < 8) {
      setFormError('Por favor ingrese un número de teléfono / WhatsApp válido.');
      return;
    }

    setFormError('');

    // Determine assigned barber if 'any' was selected
    let finalBarberId = selectedBarberId;
    if (finalBarberId === 'any') {
      const chosenSlot = availableSlots.find((s) => s.time === selectedTimeSlot);
      if (chosenSlot && chosenSlot.assignedBarberId) {
        finalBarberId = chosenSlot.assignedBarberId;
      } else {
        finalBarberId = staff[0]?.id || 'any';
      }
    }

    const appointment = storageService.saveAppointment({
      branchId: selectedBranchId,
      serviceId: currentService.id,
      barberId: finalBarberId,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      durationMinutes: currentService.durationMinutes,
      price: currentService.price,
      status: 'Confirmado',
      notes: clientNotes.trim(),
    });

    setCreatedAppointment(appointment);
    setStep(5); // Success step

    // Fire celebration confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#fbbf24', '#ffffff'],
      });
    } catch {
      // safe fallback
    }

    if (onAppointmentCreated) {
      onAppointmentCreated(appointment);
    }
  };

  const getWhatsAppBookingUrl = () => {
    if (!createdAppointment) return '';

    const branch = branches.find((b) => b.id === createdAppointment.branchId);
    const service = services.find((s) => s.id === createdAppointment.serviceId);
    const barber =
      createdAppointment.barberId === 'any'
        ? 'Primer profesional disponible'
        : storageService.getBarberById(createdAppointment.barberId)?.name || 'Barbero de turno';

    const branchPhone = branch?.phone.replace(/\D/g, '') || '5491148201122';

    const message = `¡Hola! Quiero confirmar mi turno en Barber & Co:\n📍 Sucursal: ${branch?.name || ''}\n✂️ Servicio: ${service?.name || ''} (${createdAppointment.durationMinutes} min)\n💈 Barbero: ${barber}\n📅 Fecha: ${createdAppointment.date} a las ${createdAppointment.timeSlot} hs\n👤 A nombre de: ${createdAppointment.clientName}`;

    return `https://wa.me/${branchPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <section id="reservar" className="py-16 md:py-24 bg-zinc-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Sistema de Reserva Online</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
            Reserva tu espacio en Barber &amp; Co.
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-2 max-w-md mx-auto">
            Disfruta de una atención personalizada en cualquiera de nuestras 3 sucursales.
          </p>
        </div>

        {/* Step Indicator (Steps 1 to 4) */}
        {step < 5 && (
          <div className="flex items-center justify-between mb-8 max-w-xl mx-auto px-2">
            {[
              { num: 1, label: 'Sede' },
              { num: 2, label: 'Servicio & Staff' },
              { num: 3, label: 'Fecha & Hora' },
              { num: 4, label: 'Tus Datos' },
            ].map((s) => (
              <div key={s.num} className="flex flex-col items-center flex-1 relative">
                <button
                  disabled={step < s.num}
                  onClick={() => setStep(s.num)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                    step === s.num
                      ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/30 scale-110'
                      : step > s.num
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-850 text-zinc-500 border border-zinc-800'
                  }`}
                >
                  {step > s.num ? <CheckCircle className="w-4 h-4" /> : s.num}
                </button>
                <span
                  className={`text-[11px] font-semibold mt-1.5 hidden sm:block ${
                    step === s.num ? 'text-amber-400' : step > s.num ? 'text-zinc-300' : 'text-zinc-500'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Wizard Container */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8">
          {/* STEP 1: SUCURSAL SELECTION */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-zinc-800 pb-4">
                <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-500" />
                  <span>Paso 1: Elige la Sucursal</span>
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  Contamos con 3 sedes equipadas con la máxima tecnología y confort.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {branches.map((branch) => (
                  <div
                    key={branch.id}
                    onClick={() => setSelectedBranchId(branch.id)}
                    className={`cursor-pointer rounded-xl p-4 border transition-all duration-150 flex flex-col justify-between ${
                      selectedBranchId === branch.id
                        ? 'bg-zinc-850 border-amber-500 ring-2 ring-amber-500/20 shadow-lg'
                        : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="h-32 rounded-lg overflow-hidden mb-3 relative">
                        <img
                          src={branch.image}
                          alt={branch.name}
                          className="w-full h-full object-cover brightness-90"
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-zinc-950/80 text-[10px] text-amber-400 font-bold border border-zinc-800">
                          {branch.chairsCount} Sillas
                        </div>
                      </div>

                      <h4 className="font-bold text-base text-zinc-100">{branch.name}</h4>
                      <p className="text-xs text-zinc-400 mt-0.5">{branch.address}</p>
                      <p className="text-[11px] text-zinc-500 mt-1">{branch.schedule}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                      <span className="text-[11px] text-zinc-400 font-medium">
                        {selectedBranchId === branch.id ? '✓ Seleccionada' : 'Seleccionar'}
                      </span>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          selectedBranchId === branch.id
                            ? 'border-amber-500 bg-amber-500 text-zinc-950'
                            : 'border-zinc-700'
                        }`}
                      >
                        {selectedBranchId === branch.id && <CheckCircle className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 px-6 py-3.5 min-h-[44px] rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm shadow-md active:scale-98 transition-all"
                >
                  <span>Continuar a Servicios</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SERVICIO & BARBERO SELECTION */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-zinc-800 pb-4">
                <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-amber-500" />
                  <span>Paso 2: Elige el Servicio y Barbero</span>
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  Sede activa: <span className="text-amber-400 font-semibold">{currentBranch.name}</span>
                </p>
              </div>

              {/* Service Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                  1. Servicio Deseado
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => setSelectedServiceId(service.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        selectedServiceId === service.id
                          ? 'bg-zinc-850 border-amber-500 ring-2 ring-amber-500/20'
                          : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-zinc-100">{service.name}</h4>
                        <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                          {service.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs font-bold text-amber-400">
                            {formatCurrency(service.price)}
                          </span>
                          <span className="text-[11px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                            {formatDuration(service.durationMinutes)}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border shrink-0 mt-0.5 flex items-center justify-center ${
                          selectedServiceId === service.id
                            ? 'border-amber-500 bg-amber-500 text-zinc-950'
                            : 'border-zinc-700'
                        }`}
                      >
                        {selectedServiceId === service.id && <div className="w-1.5 h-1.5 bg-zinc-950 rounded-full" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Barber Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                  2. Profesional de Preferencia
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => setSelectedBarberId('any')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                      selectedBarberId === 'any'
                        ? 'bg-zinc-850 border-amber-500 ring-2 ring-amber-500/20'
                        : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-zinc-100">
                        Primer disponible
                      </h4>
                      <p className="text-[11px] text-zinc-400">Mayor disponibilidad</p>
                    </div>
                  </div>

                  {staff.map((barber) => (
                    <div
                      key={barber.id}
                      onClick={() => setSelectedBarberId(barber.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                        selectedBarberId === barber.id
                          ? 'bg-zinc-850 border-amber-500 ring-2 ring-amber-500/20'
                          : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <img
                        src={barber.avatarUrl}
                        alt={barber.name}
                        className="w-10 h-10 rounded-full object-cover border border-zinc-700 shrink-0"
                      />
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-xs sm:text-sm text-zinc-100 truncate">
                          {barber.name}
                        </h4>
                        <div className="flex items-center gap-1 text-[11px] text-amber-400">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{barber.rating.toFixed(1)}</span>
                          <span className="text-zinc-500 text-[10px]">({barber.reviewsCount})</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="pt-4 flex items-center justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 px-4 py-3 min-h-[44px] rounded-xl text-zinc-400 hover:text-zinc-100 text-xs font-semibold transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Atrás</span>
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-2 px-6 py-3.5 min-h-[44px] rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm shadow-md active:scale-98 transition-all"
                >
                  <span>Continuar a Fecha y Hora</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: FECHA Y HORARIO DINÁMICO */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-zinc-800 pb-4">
                <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <span>Paso 3: Fecha y Horario Dinámico</span>
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 mt-1">
                  <span>
                    Duración calculada:{' '}
                    <strong className="text-amber-400 font-bold">
                      {formatDuration(currentService.durationMinutes)}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Profesional:{' '}
                    <strong className="text-zinc-200">
                      {currentBarber ? currentBarber.name : 'Primer disponible'}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Date Selector Chips */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                  Selecciona el Día
                </label>
                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                  {availableDates.map((item) => (
                    <button
                      key={item.dateStr}
                      onClick={() => {
                        setSelectedDate(item.dateStr);
                        setSelectedTimeSlot('');
                      }}
                      className={`px-4 py-3 min-h-[52px] rounded-xl border text-center shrink-0 transition-all ${
                        selectedDate === item.dateStr
                          ? 'bg-amber-500 text-zinc-950 border-amber-500 font-extrabold shadow-md'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                      }`}
                    >
                      <div className="text-[10px] tracking-wider uppercase font-bold">
                        {item.prefix}
                      </div>
                      <div className="text-sm mt-0.5 font-bold">{item.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Time Slot Grid */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Horarios de Atención (10:00 a 20:00 hs)
                  </label>
                  <span className="text-[11px] text-zinc-400">
                    Intervalos calculados por motor de silla
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-[300px] overflow-y-auto p-1">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedTimeSlot === slot.time;
                    return (
                      <button
                        key={slot.time}
                        disabled={!slot.available}
                        onClick={() => setSelectedTimeSlot(slot.time)}
                        title={slot.reason || 'Disponible'}
                        className={`py-3 min-h-[44px] rounded-xl text-xs font-bold border transition-all duration-150 flex flex-col items-center justify-center ${
                          isSelected
                            ? 'bg-emerald-600 border-emerald-500 text-white ring-2 ring-emerald-500/40 shadow-lg scale-102'
                            : slot.available
                            ? 'bg-zinc-950 border-zinc-800 text-zinc-200 hover:border-amber-500/60 hover:bg-zinc-850'
                            : 'bg-zinc-950/30 border-zinc-900/60 text-zinc-600 line-through cursor-not-allowed opacity-50'
                        }`}
                      >
                        <span className="text-sm font-extrabold">{slot.time}</span>
                        <span className="text-[9px] uppercase font-normal opacity-80">
                          {slot.available ? 'Libre' : 'Ocupado'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {selectedTimeSlot && (
                  <div className="mt-3 p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs text-emerald-300">
                    <span className="flex items-center gap-1.5 font-medium">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      Horario reservado: <strong>{selectedTimeSlot} hs</strong> ({selectedDate})
                    </span>
                    <span className="font-bold text-zinc-200">
                      Finaliza ~{' '}
                      {(() => {
                        const [h, m] = selectedTimeSlot.split(':').map(Number);
                        const endTotal = h * 60 + m + currentService.durationMinutes;
                        const eh = Math.floor(endTotal / 60);
                        const em = endTotal % 60;
                        return `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
                      })()}{' '}
                      hs
                    </span>
                  </div>
                )}
              </div>

              {/* Navigation Actions */}
              <div className="pt-4 flex items-center justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 px-4 py-3 min-h-[44px] rounded-xl text-zinc-400 hover:text-zinc-100 text-xs font-semibold transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Atrás</span>
                </button>
                <button
                  disabled={!selectedTimeSlot}
                  onClick={() => setStep(4)}
                  className={`inline-flex items-center gap-2 px-6 py-3.5 min-h-[44px] rounded-xl font-bold text-sm shadow-md transition-all ${
                    selectedTimeSlot
                      ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 active:scale-98'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  <span>Continuar a Datos</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: CLIENT DATA & SUMMARY */}
          {step === 4 && (
            <form onSubmit={handleConfirmBooking} className="space-y-6 animate-fadeIn">
              <div className="border-b border-zinc-800 pb-4">
                <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-500" />
                  <span>Paso 4: Datos del Cliente</span>
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  Enviaremos la confirmación instantánea a tu WhatsApp.
                </p>
              </div>

              {/* Order Summary Card */}
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Sucursal:</span>
                  <strong className="text-zinc-200">{currentBranch.name}</strong>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Servicio:</span>
                  <strong className="text-zinc-200">
                    {currentService.name} ({formatDuration(currentService.durationMinutes)})
                  </strong>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Profesional:</span>
                  <strong className="text-zinc-200">
                    {currentBarber ? currentBarber.name : 'Primer disponible'}
                  </strong>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Fecha &amp; Hora:</span>
                  <strong className="text-amber-400 font-bold">
                    {selectedDate} a las {selectedTimeSlot} hs
                  </strong>
                </div>
                <div className="pt-2 border-t border-zinc-800 flex justify-between items-center font-bold text-base text-zinc-100">
                  <span>Total a Abonar en Sede:</span>
                  <span className="text-amber-500 font-black">{formatCurrency(currentService.price)}</span>
                </div>
              </div>

              {/* Input Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Nombre Completo *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Ej: Martín Rodríguez"
                      className="w-full pl-10 pr-4 py-3 min-h-[46px] rounded-xl bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 text-sm focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Teléfono / WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="Ej: +54 9 11 5522-3344"
                      className="w-full pl-10 pr-4 py-3 min-h-[46px] rounded-xl bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 text-sm focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Notas o preferencias (opcional)
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                    <textarea
                      rows={2}
                      value={clientNotes}
                      onChange={(e) => setClientNotes(e.target.value)}
                      placeholder="Ej: Piel sensible, recorte de cejas, café express..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-amber-500 text-zinc-100 text-sm focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {formError && (
                  <p className="text-xs text-rose-400 font-semibold">{formError}</p>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-1.5 px-4 py-3 min-h-[44px] rounded-xl text-zinc-400 hover:text-zinc-100 text-xs font-semibold transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Atrás</span>
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 min-h-[48px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-950/40 active:scale-98 transition-all"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Confirmar Reserva</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 5: SUCCESS & WHATSAPP CONFIRMATION */}
          {step === 5 && createdAppointment && (
            <div className="text-center space-y-6 animate-fadeIn py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-lg">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-amber-400 text-xs font-mono font-bold">
                  {createdAppointment.id}
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight mt-3">
                  ¡Turno Agendado con Éxito!
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-md mx-auto">
                  Tu reserva ha quedado guardada en nuestro sistema de Barber &amp; Co.
                </p>
              </div>

              {/* Summary Card */}
              <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-2xl text-left max-w-md mx-auto space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>Sucursal:</span>
                  <strong className="text-zinc-100">{currentBranch.name}</strong>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Dirección:</span>
                  <strong className="text-zinc-300">{currentBranch.address}</strong>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Servicio:</span>
                  <strong className="text-zinc-100">
                    {currentService.name} ({formatDuration(createdAppointment.durationMinutes)})
                  </strong>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Barbero:</span>
                  <strong className="text-zinc-100">
                    {createdAppointment.barberId === 'any'
                      ? 'Cualquiera disponible'
                      : storageService.getBarberById(createdAppointment.barberId)?.name || 'Asignado'}
                  </strong>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Día y Horario:</span>
                  <strong className="text-amber-400 font-bold">
                    {createdAppointment.date} a las {createdAppointment.timeSlot} hs
                  </strong>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>A nombre de:</span>
                  <strong className="text-zinc-100">{createdAppointment.clientName}</strong>
                </div>
                <div className="pt-2 border-t border-zinc-800 flex justify-between items-center text-base font-bold text-zinc-100">
                  <span>Monto Total:</span>
                  <span className="text-emerald-400 font-extrabold">
                    {formatCurrency(createdAppointment.price)}
                  </span>
                </div>
              </div>

              {/* Mandatory Green WhatsApp Confirmation Button */}
              <div className="max-w-md mx-auto space-y-3 pt-2">
                <a
                  href={getWhatsAppBookingUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 min-h-[50px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-emerald-950/50 active:scale-98 transition-all"
                >
                  <MessageSquare className="w-5 h-5 fill-current" />
                  <span>Confirmar y agendar por WhatsApp</span>
                </a>

                <button
                  onClick={() => {
                    setStep(1);
                    setCreatedAppointment(null);
                    setSelectedTimeSlot('');
                    setClientName('');
                    setClientPhone('');
                    setClientNotes('');
                  }}
                  className="w-full py-3 min-h-[44px] rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-semibold transition-colors"
                >
                  Reservar otro turno
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
