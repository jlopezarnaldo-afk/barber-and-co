import React, { useState, useEffect, useMemo, useRef } from 'react';
import type {
  BranchId,
  Appointment,
} from '../types';
import {
  storageService,
  formatCurrency,
  formatDuration,
  getDateString,
  normalizeWhatsAppPhone,
  getServicePrice,
} from '../services/storageService';
import { getAvailableTimeSlots } from '../services/bookingEngine';
import {
  MapPin,
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

  const [settings, setSettings] = useState(() => storageService.getSettings());
  const [, setStaffTick] = useState(0);

  // Mobile & UX scroll/focus references
  const wizardRef = useRef<HTMLDivElement>(null);
  const stepContentRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const isFirstRender = useRef(true);

  const currentStep = step;

  const scrollToWizard = () => {
    const target = stepContentRef.current || wizardRef.current;
    if (!target) return;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  // Auto-scroll to active step header on step transitions
  useEffect(() => {
    // Al cambiar 'currentStep', desplaza suavemente la vista para que el inicio del paso quede visible en pantalla
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (stepContentRef.current) {
      stepContentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentStep]);

  // Advance / change step with explicit smooth scroll to wizard container
  const goToStep = (nextStep: number) => {
    // Dismiss virtual keyboard if an input is active to prevent post-navigation layout shift
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setStep(nextStep);
    setFormError('');
    // If step did not change (same step re-selected), re-align explicitly via requestAnimationFrame
    if (nextStep === step && typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        scrollToWizard();
      });
    }
  };

  // Only auto-focus first text input on desktop with fine pointer (never on mobile/touch to prevent virtual keyboard popups and layout jumps)
  useEffect(() => {
    if (step === 4) {
      const isDesktopWithMouse =
        typeof window !== 'undefined' &&
        window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)').matches;
      if (isDesktopWithMouse) {
        const timer = setTimeout(() => {
          nameInputRef.current?.focus({ preventScroll: true });
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [step]);

  useEffect(() => {
    const handleSettingsUpdated = () => setSettings(storageService.getSettings());
    const handleStaffUpdated = () => setStaffTick((t) => t + 1);

    window.addEventListener('barber_settings_updated', handleSettingsUpdated);
    window.addEventListener('barber_staff_updated', handleStaffUpdated);

    return () => {
      window.removeEventListener('barber_settings_updated', handleSettingsUpdated);
      window.removeEventListener('barber_staff_updated', handleStaffUpdated);
    };
  }, []);

  const branches = storageService.getBranches();
  const services = storageService.getServices();
  // Filter staff who work on this branch and on this date
  const staff = storageService.getStaff(selectedBranchId, selectedDate);
  const allBranchStaff = storageService.getStaff(selectedBranchId);

  const currentBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];
  const currentService = services.find((s) => s.id === selectedServiceId) || services[0];
  const currentBarber =
    selectedBarberId === 'any'
      ? null
      : storageService.getBarberById(selectedBarberId);

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

      let prefix = dayName.charAt(0).toUpperCase() + dayName.slice(1);
      if (index === 0) prefix = 'Hoy';
      if (index === 1) prefix = 'Mañana';

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

    // Strict phone validation rejecting letters and requiring valid phone format
    const phoneDigits = clientPhone.replace(/\D/g, '');
    const phoneValid =
      !/[a-zA-Z]/.test(clientPhone) &&
      /^(\+54\s?9?\s?)?[\d\s\-()]{8,18}$/.test(clientPhone.trim()) &&
      phoneDigits.length >= 8 &&
      phoneDigits.length <= 15;

    if (!phoneValid) {
      setFormError('Por favor ingrese un número de teléfono / WhatsApp válido (ej. +54 9 11 5522-3344).');
      return;
    }

    // Validate that selected slot is still available right now (live storage check)
    const liveSlots = getAvailableTimeSlots({
      branchId: selectedBranchId,
      date: selectedDate,
      durationMinutes: selectedServiceDuration,
      barberId: selectedBarberId,
    });
    const chosenSlot = liveSlots.find((s) => s.time === selectedTimeSlot);
    if (!chosenSlot || !chosenSlot.available) {
      setFormError(
        chosenSlot?.reason ||
          'El horario seleccionado ya no se encuentra disponible. Por favor elija otro turno.'
      );
      goToStep(3);
      return;
    }

    setFormError('');

    // Determine assigned barber if 'any' was selected
    let finalBarberId = selectedBarberId;
    if (finalBarberId === 'any') {
      if (chosenSlot && chosenSlot.assignedBarberId) {
        finalBarberId = chosenSlot.assignedBarberId;
      } else {
        finalBarberId = staff[0]?.id || 'any';
      }
    }

    const bookingPrice = getServicePrice(currentService, selectedBranchId);

    try {
      const appointment = storageService.saveAppointment({
        branchId: selectedBranchId,
        serviceId: currentService.id,
        barberId: finalBarberId,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        durationMinutes: currentService.durationMinutes,
        price: bookingPrice,
        status: 'Confirmado',
        notes: clientNotes.trim(),
      });

      setCreatedAppointment(appointment);
      goToStep(5); // Success step

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
    } catch (err: any) {
      setFormError(
        err?.message ||
          'No fue posible registrar el turno por conflicto de horario. Por favor elija otro momento.'
      );
      goToStep(3);
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

    const branchPhone = normalizeWhatsAppPhone(branch?.phone || '5491148201122');
    const formattedPrice = formatCurrency(createdAppointment.price);

    const message = `¡Hola! Quiero confirmar mi turno en Barber & Co:\n📍 Sucursal: ${branch?.name || ''}\n✂️ Servicio: ${service?.name || ''} (${createdAppointment.durationMinutes} min) - ${formattedPrice}\n💈 Barbero: ${barber}\n📅 Fecha: ${createdAppointment.date} a las ${createdAppointment.timeSlot} hs\n👤 A nombre de: ${createdAppointment.clientName}\n💰 Total: ${formattedPrice}`;

    return `https://wa.me/${branchPhone}?text=${encodeURIComponent(message)}`;
  };

  const stepsList = useMemo(() => [
    { num: 1, label: 'Sede y ubicación', desc: currentBranch.name },
    { num: 2, label: 'Servicio y profesional', desc: currentService.name },
    {
      num: 3,
      label: 'Fecha y horario',
      desc: selectedTimeSlot ? `${selectedDate} • ${selectedTimeSlot} hs` : 'Por seleccionar',
    },
    { num: 4, label: 'Confirmación de datos', desc: 'Datos del cliente' },
  ], [currentBranch.name, currentService.name, selectedDate, selectedTimeSlot]);

  const activeStepItem = stepsList.find((s) => s.num === step) || stepsList[0];

  return (
    <section id="reservar" className="bg-[#ECE7DE] text-[#141210] py-16 lg:py-24 border-t border-[#141210]/25 overflow-x-hidden min-h-screen min-h-dvh flex flex-col justify-start">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 lg:mb-14">
          <div className="text-xs font-medium tracking-wider text-[#141210]/60 mb-3">
            N.º 03 — Reserva de turnos
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141210] tracking-tight">
            Reserva de turnos online
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#141210]/70 max-w-lg">
            Disponibilidad en tiempo real con confirmación directa y puntualidad garantizada en cada sede.
          </p>
        </div>

        {/* Asymmetric Wizard Layout: 4 cols editorial sidebar / 8 cols wizard form */}
        <div ref={wizardRef} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start scroll-mt-20">
          {/* Left Column: Progress & Real-time Booking Context */}
          <div className="lg:col-span-4 space-y-4 lg:space-y-6">
            {/* Step Navigation Indicator */}
            {step < 5 && (
              <>
                {/* Mobile Compact Progress Indicator (< md) */}
                <div className="md:hidden bg-[#DDD6C8]/40 border border-[#141210]/25 p-3 mb-4 rounded-[2px]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-[2px] bg-[#141210] text-[#ECE7DE] font-medium text-[11px] flex items-center justify-center shrink-0">
                        {step}
                      </span>
                      <div className="text-xs font-medium text-[#141210] truncate">
                        Paso {step} de 4 <span className="text-[#141210]/40 font-normal">•</span> {activeStepItem.label}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {stepsList.map((s) => (
                        <button
                          key={s.num}
                          type="button"
                          disabled={step < s.num}
                          onClick={() => goToStep(s.num)}
                          aria-label={`Ir al paso ${s.num}: ${s.label}`}
                          className="w-7 h-7 flex items-center justify-center -my-1 cursor-pointer disabled:cursor-not-allowed"
                        >
                          <span
                            className={`w-2.5 h-2.5 rounded-[1px] transition-colors block ${
                              step === s.num
                                ? 'bg-[#141210]'
                                : step > s.num
                                ? 'bg-[#141210]/60 hover:bg-[#141210]'
                                : 'bg-[#141210]/20'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Desktop Detailed Progress Sidebar (>= md) */}
                <div className="hidden md:block bg-[#DDD6C8]/40 border border-[#141210]/25 p-5 rounded-[2px] space-y-3">
                  <div className="text-xs font-medium tracking-wider text-[#141210]/60">
                    Progreso del turno
                  </div>
                  <div className="space-y-2">
                    {stepsList.map((s) => (
                      <button
                        key={s.num}
                        type="button"
                        disabled={step < s.num}
                        onClick={() => goToStep(s.num)}
                        className={`w-full text-left p-2.5 rounded-[2px] flex items-start gap-3 transition-colors cursor-pointer min-h-[44px] ${
                          step === s.num
                            ? 'bg-[#141210] text-[#ECE7DE]'
                            : step > s.num
                            ? 'bg-[#ECE7DE]/70 text-[#141210] hover:bg-[#ECE7DE]'
                            : 'opacity-40 cursor-not-allowed text-[#141210]'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-[2px] flex items-center justify-center font-medium text-xs shrink-0 ${
                            step === s.num
                              ? 'bg-[#ECE7DE] text-[#141210]'
                              : step > s.num
                              ? 'bg-[#141210] text-[#ECE7DE]'
                              : 'border border-[#141210]/30 text-[#141210]'
                          }`}
                        >
                          {step > s.num ? <CheckCircle className="w-3.5 h-3.5" /> : s.num}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium leading-snug">{s.label}</div>
                          <div
                            className={`text-[11px] truncate mt-0.5 ${
                              step === s.num ? 'text-[#ECE7DE]/70' : 'text-[#141210]/60'
                            }`}
                          >
                            {s.desc}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Quiet Editorial Guarantee Note */}
            <div className="hidden md:block p-5 border border-[#141210]/25 rounded-[2px] bg-[#ECE7DE] space-y-2 text-xs text-[#141210]/70">
              <div className="font-serif font-bold text-sm text-[#141210]">Puntualidad rigurosa</div>
              <p className="leading-relaxed">
                Cada turno inicia en el minuto pactado. En caso de demoras ajenas al cliente, se compensa la sesión sin costo adicional.
              </p>
            </div>
          </div>

          {/* Right Column: Active Step Interactive Form */}
          <div className="lg:col-span-8">
            <div ref={stepContentRef} className="bg-[#DDD6C8]/40 border border-[#141210]/25 rounded-[2px] p-6 sm:p-8 min-h-[480px] flex flex-col justify-between scroll-mt-20">
          {/* STEP 1: SUCURSAL SELECTION */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-[#141210]/25 pb-4">
                <h3 className="font-serif text-xl font-bold text-[#141210] flex items-center gap-2">
                  <MapPin className="w-5 h-5 stroke-[1.75]" />
                  <span>Paso 1: Elige la sucursal</span>
                </h3>
                <p className="text-xs sm:text-sm text-[#141210]/70 mt-1">
                  Contamos con 3 sedes exclusivas en la ciudad.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {branches.map((branch) => (
                  <div
                    key={branch.id}
                    onClick={() => {
                      setSelectedBranchId(branch.id);
                      setSelectedBarberId('any');
                      setSelectedTimeSlot('');
                    }}
                    className={`cursor-pointer rounded-[2px] p-4 border transition-colors flex flex-col justify-between ${
                      selectedBranchId === branch.id
                        ? 'bg-[#ECE7DE] border-[#141210] ring-1 ring-[#141210]'
                        : 'bg-[#ECE7DE]/60 border-[#141210]/25 hover:border-[#141210]/40'
                    }`}
                  >
                    <div>
                      <div className="h-32 rounded-[2px] overflow-hidden mb-3 relative bg-[#DDD6C8]">
                        <img
                          src={branch.image}
                          alt={branch.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-[2px] bg-[#ECE7DE]/95 text-[10px] text-[#141210] font-medium border border-[#141210]/25">
                          {branch.chairsCount} sillones
                        </div>
                      </div>

                      <h4 className="font-serif font-bold text-base text-[#141210]">{branch.name}</h4>
                      <p className="text-xs text-[#141210]/70 mt-0.5">{branch.address}</p>
                      <p className="text-[11px] text-[#141210]/50 mt-1">{branch.schedule}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#141210]/25 flex items-center justify-between">
                      <span className="text-[11px] text-[#141210]/70 font-medium">
                        {selectedBranchId === branch.id ? '✓ Seleccionada' : 'Seleccionar'}
                      </span>
                      <div
                        className={`w-4 h-4 rounded-[2px] border flex items-center justify-center ${
                          selectedBranchId === branch.id
                            ? 'border-[#141210] bg-[#141210] text-[#ECE7DE]'
                            : 'border-[#141210]/30'
                        }`}
                      >
                        {selectedBranchId === branch.id && <CheckCircle className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  className="inline-flex items-center gap-2 px-6 py-3.5 min-h-[44px] rounded-[2px] bg-[#141210] hover:bg-[#141210]/90 text-[#ECE7DE] font-medium text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  <span>Continuar a servicios</span>
                  <ArrowRight className="w-4 h-4 stroke-[1.75]" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SERVICIO & BARBERO SELECTION */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-[#141210]/25 pb-4">
                <h3 className="font-serif text-xl font-bold text-[#141210] flex items-center gap-2">
                  <Scissors className="w-5 h-5 stroke-[1.75]" />
                  <span>Paso 2: Elige el servicio y profesional</span>
                </h3>
                <p className="text-xs sm:text-sm text-[#141210]/70 mt-1">
                  Sede activa: <span className="font-medium text-[#141210]">{currentBranch.name}</span>
                </p>
              </div>

              {/* Service Selection */}
              <div>
                <label className="block text-xs font-medium text-[#141210]/70 mb-2.5">
                  1. Servicio deseado
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => {
                        setSelectedServiceId(service.id);
                        setSelectedTimeSlot('');
                      }}
                      className={`p-3.5 rounded-[2px] border cursor-pointer transition-colors flex items-start justify-between gap-3 ${
                        selectedServiceId === service.id
                          ? 'bg-[#ECE7DE] border-[#141210] ring-1 ring-[#141210]'
                          : 'bg-[#ECE7DE]/60 border-[#141210]/25 hover:border-[#141210]/40'
                      }`}
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-[#141210]">{service.name}</h4>
                        <p className="text-xs text-[#141210]/70 line-clamp-1 mt-0.5">
                          {service.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="font-serif text-sm font-bold text-[#141210]">
                            {formatCurrency(getServicePrice(service, selectedBranchId))}
                          </span>
                          <span className="text-[11px] text-[#141210]/60">
                            {formatDuration(service.durationMinutes)}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-[2px] border shrink-0 mt-0.5 flex items-center justify-center ${
                          selectedServiceId === service.id
                            ? 'border-[#141210] bg-[#141210] text-[#ECE7DE]'
                            : 'border-[#141210]/30'
                        }`}
                      >
                        {selectedServiceId === service.id && <div className="w-1.5 h-1.5 bg-[#ECE7DE] rounded-[1px]" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Barber Selection or Automatic Assignment Notice */}
              <div>
                {settings.allowClientSelectBarber ? (
                  <>
                    <label className="block text-xs font-medium text-[#141210]/70 mb-2.5">
                      2. Profesional de preferencia
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div
                        onClick={() => {
                          setSelectedBarberId('any');
                          setSelectedTimeSlot('');
                        }}
                        className={`p-3 rounded-[2px] border cursor-pointer transition-colors flex items-center gap-3 ${
                          selectedBarberId === 'any'
                            ? 'bg-[#ECE7DE] border-[#141210] ring-1 ring-[#141210]'
                            : 'bg-[#ECE7DE]/60 border-[#141210]/25 hover:border-[#141210]/40'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-[2px] border border-[#141210]/20 flex items-center justify-center text-[#141210] shrink-0">
                          <Sparkles className="w-5 h-5 stroke-[1.75]" />
                        </div>
                        <div>
                          <h4 className="font-medium text-xs sm:text-sm text-[#141210]">
                            Primer disponible
                          </h4>
                          <p className="text-[11px] text-[#141210]/60">Mayor disponibilidad</p>
                        </div>
                      </div>

                      {allBranchStaff.map((barber) => (
                        <div
                          key={barber.id}
                          onClick={() => {
                            setSelectedBarberId(barber.id);
                            setSelectedTimeSlot('');
                          }}
                          className={`p-3 rounded-[2px] border cursor-pointer transition-colors flex items-center gap-3 ${
                            selectedBarberId === barber.id
                              ? 'bg-[#ECE7DE] border-[#141210] ring-1 ring-[#141210]'
                              : 'bg-[#ECE7DE]/60 border-[#141210]/25 hover:border-[#141210]/40'
                          }`}
                        >
                          <img
                            src={barber.avatarUrl}
                            alt={barber.name}
                            className="w-10 h-10 rounded-[2px] object-cover border border-[#141210]/25 shrink-0"
                          />
                          <div className="overflow-hidden">
                            <h4 className="font-medium text-xs sm:text-sm text-[#141210] truncate">
                              {barber.name}
                            </h4>
                            <div className="flex items-center gap-1 text-[11px] text-[#141210]/70">
                              <Star className="w-3 h-3 stroke-[1.75]" />
                              <span>{barber.rating.toFixed(1)}</span>
                              <span className="text-[#141210]/40 text-[10px]">({barber.reviewsCount})</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="p-4 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-[2px] border border-[#141210]/20 flex items-center justify-center text-[#141210] shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4 stroke-[1.75]" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-[#141210]">
                        Asignación automática y coordinada
                      </h4>
                      <p className="text-xs text-[#141210]/70 mt-1 leading-relaxed">
                        Te asignaremos el primer barbero disponible en el horario seleccionado para optimizar tu tiempo de espera.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Actions */}
              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className="inline-flex items-center gap-1.5 px-4 py-3 min-h-[44px] text-[#141210]/70 hover:text-[#141210] text-xs font-medium transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 stroke-[1.75]" />
                  <span>Atrás</span>
                </button>
                <button
                  type="button"
                  onClick={() => goToStep(3)}
                  className="inline-flex items-center gap-2 px-6 py-3.5 min-h-[44px] rounded-[2px] bg-[#141210] hover:bg-[#141210]/90 text-[#ECE7DE] font-medium text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  <span>Continuar a fecha y hora</span>
                  <ArrowRight className="w-4 h-4 stroke-[1.75]" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: FECHA Y HORARIO DINÁMICO */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-[#141210]/25 pb-4">
                <h3 className="font-serif text-xl font-bold text-[#141210] flex items-center gap-2">
                  <Clock className="w-5 h-5 stroke-[1.75]" />
                  <span>Paso 3: Fecha y horario</span>
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#141210]/70 mt-1">
                  <span>
                    Duración calculada:{' '}
                    <strong className="text-[#141210] font-medium">
                      {formatDuration(currentService.durationMinutes)}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Profesional:{' '}
                    <strong className="text-[#141210] font-medium">
                      {currentBarber ? currentBarber.name : 'Primer disponible'}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Date Selector Chips */}
              <div>
                <label className="block text-xs font-medium text-[#141210]/70 mb-2.5">
                  Selecciona el día
                </label>
                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                  {availableDates.map((item) => (
                    <button
                      key={item.dateStr}
                      type="button"
                      onClick={() => {
                        setSelectedDate(item.dateStr);
                        setSelectedTimeSlot('');
                      }}
                      className={`px-4 py-3 min-h-[52px] rounded-[2px] border text-center shrink-0 transition-colors cursor-pointer ${
                        selectedDate === item.dateStr
                          ? 'bg-[#141210] text-[#ECE7DE] border-[#141210] font-medium'
                          : 'bg-[#ECE7DE] border-[#141210]/25 text-[#141210]/70 hover:text-[#141210] hover:border-[#141210]/40'
                      }`}
                    >
                      <div className="text-[10px] tracking-wider font-medium text-[#141210]/60">
                        {item.prefix}
                      </div>
                      <div className="text-sm mt-0.5 font-serif font-bold">{item.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Time Slot Grid */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-medium text-[#141210]/70">
                    Horarios de atención
                  </label>
                  <span className="text-[11px] text-[#141210]/50">
                    Calculados según disponibilidad de sillón
                  </span>
                </div>

                {availableSlots.length > 0 && availableSlots.every((s) => !s.available) && (
                  <div className="p-3.5 mb-3 rounded-[2px] bg-[#DDD6C8]/60 border border-[#141210]/25 text-[#141210] text-xs flex flex-col sm:flex-row items-center justify-between gap-2.5 animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#141210]/60 shrink-0" />
                      <span>
                        No quedan turnos libres para {selectedDate === getDateString(0) ? 'hoy' : selectedDate}.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDate(getDateString(1));
                        setSelectedTimeSlot('');
                      }}
                      className="px-3 py-1.5 min-h-[44px] inline-flex items-center rounded-[2px] bg-[#141210] hover:bg-[#141210]/90 text-[#ECE7DE] font-medium text-xs whitespace-nowrap transition-colors shrink-0 cursor-pointer"
                    >
                      Ver turnos de mañana →
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-[300px] overflow-y-auto p-1">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedTimeSlot === slot.time;
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => setSelectedTimeSlot(slot.time)}
                        title={slot.reason || 'Disponible'}
                        className={`py-3 min-h-[44px] rounded-[2px] text-xs border transition-colors flex flex-col items-center justify-center cursor-pointer ${
                          isSelected
                            ? 'bg-[#141210] border-[#141210] text-[#ECE7DE] font-medium'
                            : slot.available
                            ? 'bg-[#ECE7DE] border-[#141210]/20 text-[#141210] hover:border-[#141210]'
                            : 'bg-[#ECE7DE]/30 border-[#141210]/10 text-[#141210]/30 line-through cursor-not-allowed opacity-50'
                        }`}
                      >
                        <span className="font-serif text-sm font-bold">{slot.time}</span>
                        <span className="text-[9px] font-normal opacity-70">
                          {slot.available ? 'Libre' : 'Ocupado'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {selectedTimeSlot && (
                  <div className="mt-3 p-3 bg-[#ECE7DE] border border-[#141210]/20 rounded-[2px] flex items-center justify-between text-xs text-[#141210] animate-fadeIn">
                    <span className="flex items-center gap-1.5 font-medium">
                      <CheckCircle className="w-4 h-4 text-[#141210]" />
                      Horario seleccionado: <strong>{selectedTimeSlot} hs</strong> ({selectedDate})
                    </span>
                    <span className="text-[#141210]/70">
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
                  type="button"
                  onClick={() => goToStep(2)}
                  className="inline-flex items-center gap-1.5 px-4 py-3 min-h-[44px] text-[#141210]/70 hover:text-[#141210] text-xs font-medium transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 stroke-[1.75]" />
                  <span>Atrás</span>
                </button>
                <button
                  type="button"
                  disabled={!selectedTimeSlot}
                  onClick={() => goToStep(4)}
                  className={`inline-flex items-center gap-2 px-6 py-3.5 min-h-[44px] rounded-[2px] font-medium text-xs sm:text-sm transition-colors ${
                    selectedTimeSlot
                      ? 'bg-[#141210] hover:bg-[#141210]/90 text-[#ECE7DE] cursor-pointer'
                      : 'bg-[#DDD6C8] text-[#141210]/40 border border-[#141210]/25 cursor-not-allowed'
                  }`}
                >
                  <span>Continuar a datos</span>
                  <ArrowRight className="w-4 h-4 stroke-[1.75]" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: CLIENT DATA & SUMMARY */}
          {step === 4 && (
            <form onSubmit={handleConfirmBooking} className="space-y-6 animate-fadeIn">
              <div className="border-b border-[#141210]/25 pb-4">
                <h3 className="font-serif text-xl font-bold text-[#141210] flex items-center gap-2">
                  <User className="w-5 h-5 stroke-[1.75]" />
                  <span>Paso 4: Datos del cliente</span>
                </h3>
                <p className="text-xs sm:text-sm text-[#141210]/70 mt-1">
                  Enviaremos la confirmación instantánea a tu WhatsApp.
                </p>
              </div>

              {/* Order Summary Card */}
              <div className="p-4 bg-[#ECE7DE] border border-[#141210]/25 rounded-[2px] space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between items-center text-[#141210]/70">
                  <span>Sucursal:</span>
                  <strong className="text-[#141210] font-medium">{currentBranch.name}</strong>
                </div>
                <div className="flex justify-between items-center text-[#141210]/70">
                  <span>Servicio:</span>
                  <strong className="text-[#141210] font-medium">
                    {currentService.name} ({formatDuration(currentService.durationMinutes)})
                  </strong>
                </div>
                <div className="flex justify-between items-center text-[#141210]/70">
                  <span>Profesional:</span>
                  <strong className="text-[#141210] font-medium">
                    {currentBarber ? currentBarber.name : 'Primer disponible'}
                  </strong>
                </div>
                <div className="flex justify-between items-center text-[#141210]/70">
                  <span>Fecha y hora:</span>
                  <strong className="text-[#141210] font-medium">
                    {selectedDate} a las {selectedTimeSlot} hs
                  </strong>
                </div>
                <div className="pt-2 border-t border-[#141210]/25 flex justify-between items-center font-bold text-sm sm:text-base text-[#141210]">
                  <span>Total a abonar en sede:</span>
                  <span className="font-serif text-lg font-bold text-[#141210]">
                    {formatCurrency(getServicePrice(currentService, selectedBranchId))}
                  </span>
                </div>
              </div>

              {/* Input Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#141210]/70 mb-1.5">
                    Nombre completo *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#141210]/50 absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[1.75]" />
                    <input
                      ref={nameInputRef}
                      type="text"
                      required
                      maxLength={80}
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Ej: Martín Rodríguez"
                      className="w-full pl-10 pr-4 py-3 min-h-[44px] rounded-[2px] bg-[#ECE7DE] border border-[#141210]/20 focus:border-[#141210] text-[#141210] text-base sm:text-sm focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#141210]/70 mb-1.5">
                    Teléfono / WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#141210]/50 absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[1.75]" />
                    <input
                      type="tel"
                      required
                      maxLength={25}
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="Ej: +54 9 11 5522-3344"
                      className="w-full pl-10 pr-4 py-3 min-h-[44px] rounded-[2px] bg-[#ECE7DE] border border-[#141210]/20 focus:border-[#141210] text-[#141210] text-base sm:text-sm focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#141210]/70 mb-1.5">
                    Notas o preferencias (opcional)
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-[#141210]/50 absolute left-3.5 top-3.5 stroke-[1.75]" />
                    <textarea
                      rows={2}
                      maxLength={300}
                      value={clientNotes}
                      onChange={(e) => setClientNotes(e.target.value)}
                      placeholder="Ej: Piel sensible, recorte de cejas..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/20 focus:border-[#141210] text-[#141210] text-base sm:text-sm focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {formError && (
                  <div className="p-3 bg-rose-50/90 border border-rose-200/80 rounded-[2px] animate-fadeIn">
                    <p className="text-xs text-rose-700 font-medium">{formError}</p>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => goToStep(3)}
                  className="inline-flex items-center gap-1.5 px-4 py-3 min-h-[44px] text-[#141210]/70 hover:text-[#141210] text-xs font-medium transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 stroke-[1.75]" />
                  <span>Atrás</span>
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 min-h-[44px] rounded-[2px] bg-[#141210] hover:bg-[#141210]/90 text-[#ECE7DE] font-medium text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4 stroke-[1.75]" />
                  <span>Confirmar reserva</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 5: SUCCESS & WHATSAPP CONFIRMATION */}
          {step === 5 && createdAppointment && (
            <div className="text-center space-y-6 animate-fadeIn py-4">
              <div className="w-12 h-12 rounded-[2px] border border-[#141210]/20 flex items-center justify-center text-[#141210] mx-auto">
                <CheckCircle className="w-6 h-6 stroke-[1.75]" />
              </div>

              <div>
                <span className="px-2.5 py-1 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/20 text-[#141210] text-xs font-mono font-medium">
                  {createdAppointment.id}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#141210] tracking-tight mt-3">
                  ¡Turno agendado con éxito!
                </h3>
                <p className="text-xs sm:text-sm text-[#141210]/70 mt-1 max-w-md mx-auto">
                  Tu reserva ha quedado guardada en nuestro sistema de Barber &amp; Co.
                </p>
              </div>

              {/* Summary Card */}
              <div className="p-5 bg-[#ECE7DE] border border-[#141210]/25 rounded-[2px] text-left max-w-md mx-auto space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between text-[#141210]/70">
                  <span>Sucursal:</span>
                  <strong className="text-[#141210] font-medium">{currentBranch.name}</strong>
                </div>
                <div className="flex justify-between text-[#141210]/70">
                  <span>Dirección:</span>
                  <strong className="text-[#141210] font-medium">{currentBranch.address}</strong>
                </div>
                <div className="flex justify-between text-[#141210]/70">
                  <span>Servicio:</span>
                  <strong className="text-[#141210] font-medium">
                    {currentService.name} ({formatDuration(createdAppointment.durationMinutes)})
                  </strong>
                </div>
                <div className="flex justify-between text-[#141210]/70">
                  <span>Barbero:</span>
                  <strong className="text-[#141210] font-medium">
                    {createdAppointment.barberId === 'any'
                      ? 'Cualquiera disponible'
                      : storageService.getBarberById(createdAppointment.barberId)?.name || 'Asignado'}
                  </strong>
                </div>
                <div className="flex justify-between text-[#141210]/70">
                  <span>Día y horario:</span>
                  <strong className="text-[#141210] font-medium">
                    {createdAppointment.date} a las {createdAppointment.timeSlot} hs
                  </strong>
                </div>
                <div className="flex justify-between text-[#141210]/70">
                  <span>A nombre de:</span>
                  <strong className="text-[#141210] font-medium">{createdAppointment.clientName}</strong>
                </div>
                <div className="pt-2 border-t border-[#141210]/25 flex justify-between items-center text-sm sm:text-base font-bold text-[#141210]">
                  <span>Monto total:</span>
                  <span className="font-serif font-bold text-lg text-[#141210]">
                    {formatCurrency(createdAppointment.price)}
                  </span>
                </div>
              </div>

              {/* WhatsApp Confirmation Trigger */}
              <div className="max-w-md mx-auto space-y-2.5 pt-2">
                <a
                  href={getWhatsAppBookingUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[44px] rounded-[2px] bg-[#141210] hover:bg-[#141210]/90 text-[#ECE7DE] font-medium text-xs sm:text-sm transition-colors"
                >
                  <MessageSquare className="w-4 h-4 stroke-[1.75]" />
                  <span>Confirmar y agendar por WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    goToStep(1);
                    setCreatedAppointment(null);
                    setSelectedTimeSlot('');
                    setClientName('');
                    setClientPhone('');
                    setClientNotes('');
                  }}
                  className="w-full py-3 min-h-[44px] rounded-[2px] border border-[#141210]/20 text-[#141210]/70 hover:text-[#141210] text-xs font-medium transition-colors cursor-pointer"
                >
                  Reservar otro turno
                </button>
              </div>
            </div>
          )}
        </div>
          </div>
        </div>
      </div>
    </section>
  );
};
