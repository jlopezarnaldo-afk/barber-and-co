import React, { useState } from 'react';
import type {
  Appointment,
  Barber,
  Branch,
  BranchId,
  Service,
  ServiceCategory,
} from '../types';
import {
  storageService,
  formatCurrency,
  formatDuration,
  getDateString,
} from '../services/storageService';
import { createDefaultSchedule } from '../data/initialData';
import {
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Download,
  Plus,
  Edit2,
  Trash2,
  Settings,
  MapPin,
  Clock,
  Phone,
  LogOut,
  Scissors,
  RotateCcw,
  Check,
  X,
  Building2,
  BarChart3,
  Save,
  Users,
  Sliders,
} from 'lucide-react';

interface AdminPanelProps {
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'services' | 'branches' | 'staff' | 'appointments'>('metrics');

  const [appointments, setAppointments] = useState<Appointment[]>(() => storageService.getAppointments());
  const [branches, setBranches] = useState<Branch[]>(() => storageService.getBranches());
  const [services, setServices] = useState<Service[]>(() => storageService.getServices());
  const [staff, setStaff] = useState<Barber[]>(() => storageService.getAllStaff());
  const [settings, setSettings] = useState(() => storageService.getSettings());
  const [newDayOffDate, setNewDayOffDate] = useState<Record<string, string>>({});

  // Pricing tab view state
  const [pricingView, setPricingView] = useState<'comparative' | BranchId>('comparative');

  // Staff management state
  const [showAddBarberModal, setShowAddBarberModal] = useState<boolean>(false);
  const [newBarberName, setNewBarberName] = useState<string>('');
  const [newBarberSpecialties, setNewBarberSpecialties] = useState<string>('Fade, Barba Tradicional');
  const [newBarberBranches, setNewBarberBranches] = useState<BranchId[]>(['palermo']);
  const [newBarberAvatarUrl, setNewBarberAvatarUrl] = useState<string>('');
  const [newBarberStartHour, setNewBarberStartHour] = useState<string>('10:00');
  const [newBarberEndHour, setNewBarberEndHour] = useState<string>('19:00');
  const [barberError, setBarberError] = useState<string>('');
  const [barberToDelete, setBarberToDelete] = useState<Barber | null>(null);

  // Editing state for services
  const [showAddServiceModal, setShowAddServiceModal] = useState<boolean>(false);
  const [newServiceName, setNewServiceName] = useState<string>('');
  const [newServiceCategory, setNewServiceCategory] = useState<ServiceCategory>('Corte');
  const [newServiceDuration, setNewServiceDuration] = useState<number>(30);
  const [newPricePalermo, setNewPricePalermo] = useState<number>(14000);
  const [newPriceBelgrano, setNewPriceBelgrano] = useState<number>(13000);
  const [newPriceRecoleta, setNewPriceRecoleta] = useState<number>(15000);
  const [newServiceDesc, setNewServiceDesc] = useState<string>('');
  const [newServicePopular, setNewServicePopular] = useState<boolean>(false);

  // Quick edit service modal or inline state
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editPricePalermo, setEditPricePalermo] = useState<number>(14000);
  const [editPriceBelgrano, setEditPriceBelgrano] = useState<number>(13000);
  const [editPriceRecoleta, setEditPriceRecoleta] = useState<number>(15000);

  // Price drafts and saved indicators
  const [priceDrafts, setPriceDrafts] = useState<Record<string, Partial<Record<BranchId, number>>>>({});
  const [savedRows, setSavedRows] = useState<Record<string, boolean>>({});

  // Branch editing state
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Success flash message
  const [actionSuccess, setActionSuccess] = useState<string>('');

  const flashMessage = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 3500);
  };

  const refreshData = () => {
    setAppointments(storageService.getAppointments());
    setBranches(storageService.getBranches());
    setServices(storageService.getServices());
    setStaff(storageService.getAllStaff());
    setSettings(storageService.getSettings());
  };

  const handleCreateBarber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBarberName.trim()) {
      setBarberError('Por favor ingrese el nombre del profesional.');
      return;
    }
    if (newBarberBranches.length === 0) {
      setBarberError('Debe seleccionar al menos una sede autorizada.');
      return;
    }

    const specialtiesList = newBarberSpecialties
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const primaryBranch = newBarberBranches[0];
    const initialSchedule = createDefaultSchedule(
      primaryBranch,
      newBarberStartHour || '10:00',
      newBarberEndHour || '19:00'
    );

    for (let day = 1; day <= 6; day++) {
      if (initialSchedule[day]) {
        initialSchedule[day].branchId = primaryBranch;
      }
    }

    storageService.addBarber({
      name: newBarberName.trim(),
      branchId: primaryBranch,
      assignedBranches: newBarberBranches,
      avatarUrl: newBarberAvatarUrl.trim() || undefined,
      specialties: specialtiesList.length > 0 ? specialtiesList : ['Corte Clásico', 'Fade'],
      rating: 5.0,
      reviewsCount: 1,
      phone: '+54 9 11 4820-1122',
      schedule: initialSchedule,
      customDaysOff: [],
      isActive: true,
    });

    setShowAddBarberModal(false);
    setNewBarberName('');
    setNewBarberSpecialties('Fade, Barba Tradicional');
    setNewBarberBranches(['palermo']);
    setNewBarberAvatarUrl('');
    setBarberError('');
    refreshData();
    flashMessage(`Profesional "${newBarberName}" incorporado exitosamente al equipo.`);
  };

  const handleToggleBarberActive = (barber: Barber) => {
    const updated = storageService.toggleBarberActive(barber.id);
    refreshData();
    if (updated) {
      flashMessage(
        updated.isActive
          ? `Barbero "${barber.name}" reactivado en el turnero de reservas.`
          : `Barbero "${barber.name}" pausado temporalmente (oculto de reservas).`
      );
    }
  };

  const handleConfirmDeleteBarber = () => {
    if (!barberToDelete) return;
    const name = barberToDelete.name;
    storageService.deleteBarber(barberToDelete.id);
    setBarberToDelete(null);
    refreshData();
    flashMessage(`Profesional "${name}" eliminado del staff.`);
  };

  const handleToggleAllowClientSelectBarber = () => {
    const updated = storageService.updateSettings({
      allowClientSelectBarber: !settings.allowClientSelectBarber,
    });
    setSettings(updated);
    flashMessage(
      updated.allowClientSelectBarber
        ? 'Configuración guardada: Clientes pueden elegir barbero.'
        : 'Configuración guardada: Asignación automática por sucursal activada.'
    );
  };

  const handleToggleBarberBranch = (barber: Barber, branchId: BranchId) => {
    const currentBranches = barber.assignedBranches || [barber.branchId];
    const hasBranch = currentBranches.includes(branchId);
    if (hasBranch && currentBranches.length === 1) {
      flashMessage('El profesional debe tener asignada al menos una sucursal.');
      return;
    }

    const updatedBranches = hasBranch
      ? currentBranches.filter((b) => b !== branchId)
      : [...currentBranches, branchId];

    const updatedBarber: Barber = {
      ...barber,
      assignedBranches: updatedBranches,
      branchId: updatedBranches[0] || barber.branchId,
    };

    storageService.updateBarber(updatedBarber);
    refreshData();
    flashMessage(`Sedes de ${barber.name} actualizadas.`);
  };

  const handleUpdateBarberDaySchedule = (
    barber: Barber,
    dayIndex: number,
    field: 'active' | 'branchId' | 'start' | 'end',
    value: any
  ) => {
    const currentSchedule = { ...(barber.schedule || {}) };
    const currentDay = currentSchedule[dayIndex] || {
      active: true,
      branchId: barber.branchId,
      start: '10:00',
      end: '20:00',
    };

    const updatedDay = {
      ...currentDay,
      [field]: value,
    };

    const updatedBarber: Barber = {
      ...barber,
      schedule: {
        ...currentSchedule,
        [dayIndex]: updatedDay,
      },
    };

    storageService.updateBarber(updatedBarber);
    refreshData();
  };

  const handleAddDayOff = (barberId: string) => {
    const date = newDayOffDate[barberId];
    if (!date) return;
    storageService.toggleCustomDayOff(barberId, date);
    setNewDayOffDate((prev) => ({ ...prev, [barberId]: '' }));
    refreshData();
    flashMessage('Día franco puntual registrado.');
  };

  const handleRemoveDayOff = (barberId: string, date: string) => {
    storageService.toggleCustomDayOff(barberId, date);
    refreshData();
    flashMessage('Día franco puntual removido.');
  };


  // GLOBAL KPI CALCULATIONS
  const todayStr = getDateString(0);
  const currentMonthPrefix = todayStr.slice(0, 7); // YYYY-MM

  // Total attended
  const totalAttended = appointments.filter((a) => a.status === 'Atendido').length;

  // Revenue today (attended or confirmed, excludes Cancelado and No Asistió)
  const revenueToday = appointments
    .filter(
      (a) =>
        a.date === todayStr &&
        a.status !== 'Cancelado' &&
        a.status !== 'No Asistió'
    )
    .reduce((sum, a) => sum + a.price, 0);

  // Revenue month (current month only, excludes Cancelado and No Asistió)
  const revenueMonth = appointments
    .filter(
      (a) =>
        a.date.startsWith(currentMonthPrefix) &&
        a.status !== 'Cancelado' &&
        a.status !== 'No Asistió'
    )
    .reduce((sum, a) => sum + a.price, 0);

  // Service demand & popularity ranking
  const serviceDemandCount: Record<string, number> = {};
  const serviceRevenueCount: Record<string, number> = {};

  appointments.forEach((a) => {
    if (a.status !== 'Cancelado' && a.status !== 'No Asistió') {
      serviceDemandCount[a.serviceId] = (serviceDemandCount[a.serviceId] || 0) + 1;
      serviceRevenueCount[a.serviceId] = (serviceRevenueCount[a.serviceId] || 0) + a.price;
    }
  });

  const totalValidBookings = Math.max(
    1,
    Object.values(serviceDemandCount).reduce((a, b) => a + b, 0)
  );

  const serviceRankings = services
    .map((s) => {
      const count = serviceDemandCount[s.id] || 0;
      const revenue = serviceRevenueCount[s.id] || 0;
      const percentage = Math.round((count / totalValidBookings) * 100);
      return {
        service: s,
        count,
        revenue,
        percentage,
      };
    })
    .sort((a, b) => b.count - a.count || b.revenue - a.revenue);

  const topService = serviceRankings[0]?.service || services[0];
  const highestBookings = serviceRankings[0]?.count || 0;

  // Branch occupancy comparison
  const branchBookings: Record<string, number> = {
    palermo: 0,
    belgrano: 0,
    recoleta: 0,
  };
  appointments.forEach((a) => {
    if (a.status !== 'Cancelado') {
      branchBookings[a.branchId] = (branchBookings[a.branchId] || 0) + 1;
    }
  });

  const totalActiveBookings = Math.max(
    1,
    Object.values(branchBookings).reduce((a, b) => a + b, 0)
  );

  // Handle draft changes for inline inputs
  const handleDraftChange = (serviceId: string, branchId: BranchId, value: number) => {
    setPriceDrafts((prev) => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        [branchId]: value,
      },
    }));
  };

  // Branch specific price update handler
  const handleUpdateSingleBranchPrice = (
    serviceId: string,
    branchId: BranchId,
    newPrice: number
  ) => {
    if (!newPrice || newPrice < 500) return;
    storageService.updateServiceBranchPrice(serviceId, branchId, newPrice);
    refreshData();
    const branchLabel =
      branchId === 'palermo'
        ? 'Palermo Soho'
        : branchId === 'belgrano'
        ? 'Belgrano R'
        : 'Recoleta';
    flashMessage(`Precio para ${branchLabel} actualizado a ${formatCurrency(newPrice)}.`);
  };

  // Helper to sanitize price inputs
  const sanitizePrice = (val: any, fallback: number): number => {
    const n = Number(val);
    return !isNaN(n) && n >= 500 ? Math.round(n) : fallback;
  };

  // Save all prices for a specific service row in matrix view
  const handleSaveServicePrices = (service: Service) => {
    const drafts = priceDrafts[service.id];
    const defaultPalermo = service.branchPrices?.palermo ?? service.price;
    const defaultBelgrano = service.branchPrices?.belgrano ?? service.price;
    const defaultRecoleta = service.branchPrices?.recoleta ?? service.price;

    const palermoPrice = sanitizePrice(drafts?.palermo ?? defaultPalermo, defaultPalermo);
    const belgranoPrice = sanitizePrice(drafts?.belgrano ?? defaultBelgrano, defaultBelgrano);
    const recoletaPrice = sanitizePrice(drafts?.recoleta ?? defaultRecoleta, defaultRecoleta);

    storageService.updateServiceBranchPrices(service.id, {
      palermo: palermoPrice,
      belgrano: belgranoPrice,
      recoleta: recoletaPrice,
    });

    refreshData();
    setSavedRows((prev) => ({ ...prev, [service.id]: true }));
    setTimeout(() => {
      setSavedRows((prev) => ({ ...prev, [service.id]: false }));
    }, 2500);

    flashMessage(`Precios de "${service.name}" guardados en LocalStorage.`);
  };

  // Save all modified prices across all services
  const handleSaveAllPrices = () => {
    const modifiedServiceIds = Object.keys(priceDrafts);
    if (modifiedServiceIds.length === 0) {
      flashMessage('Todos los precios están al día. No hay cambios pendientes.');
      return;
    }

    modifiedServiceIds.forEach((sId) => {
      const s = services.find((srv) => srv.id === sId);
      if (!s) return;
      const drafts = priceDrafts[sId];
      const defaultPalermo = s.branchPrices?.palermo ?? s.price;
      const defaultBelgrano = s.branchPrices?.belgrano ?? s.price;
      const defaultRecoleta = s.branchPrices?.recoleta ?? s.price;

      const palermoPrice = sanitizePrice(drafts?.palermo ?? defaultPalermo, defaultPalermo);
      const belgranoPrice = sanitizePrice(drafts?.belgrano ?? defaultBelgrano, defaultBelgrano);
      const recoletaPrice = sanitizePrice(drafts?.recoleta ?? defaultRecoleta, defaultRecoleta);

      storageService.updateServiceBranchPrices(sId, {
        palermo: palermoPrice,
        belgrano: belgranoPrice,
        recoleta: recoletaPrice,
      });
    });

    refreshData();
    setPriceDrafts({});
    flashMessage('Todos los precios por sucursal fueron guardados exitosamente.');
  };

  const handleQuickUpdateDuration = (service: Service, newDuration: number) => {
    if (!newDuration || newDuration < 15) return;
    const updated = { ...service, durationMinutes: newDuration };
    storageService.updateService(updated);
    refreshData();
    flashMessage(`Duración de "${service.name}" actualizada a ${formatDuration(newDuration)}.`);
  };

  const openEditServiceModal = (service: Service) => {
    setEditingService(service);
    setEditPricePalermo(service.branchPrices?.palermo ?? service.price);
    setEditPriceBelgrano(service.branchPrices?.belgrano ?? service.price);
    setEditPriceRecoleta(service.branchPrices?.recoleta ?? service.price);
  };

  // HANDLERS
  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;

    storageService.addService({
      name: newServiceName.trim(),
      category: newServiceCategory,
      durationMinutes: Number(newServiceDuration),
      price: Number(newPricePalermo),
      branchPrices: {
        palermo: Number(newPricePalermo),
        belgrano: Number(newPriceBelgrano),
        recoleta: Number(newPriceRecoleta),
      },
      description: newServiceDesc.trim() || 'Servicio profesional Barber & Co.',
      popular: newServicePopular,
    });

    setShowAddServiceModal(false);
    setNewServiceName('');
    setNewServiceDesc('');
    refreshData();
    flashMessage('Nuevo servicio agregado exitosamente al catálogo.');
  };

  const handleUpdateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    const updated: Service = {
      ...editingService,
      price: Number(editPricePalermo),
      branchPrices: {
        palermo: Number(editPricePalermo),
        belgrano: Number(editPriceBelgrano),
        recoleta: Number(editPriceRecoleta),
      },
    };

    storageService.updateService(updated);
    setEditingService(null);
    refreshData();
    flashMessage(`Servicio "${editingService.name}" actualizado en todas las sedes.`);
  };

  const handleDeleteService = (id: string, name: string) => {
    if (window.confirm(`¿Está seguro de eliminar el servicio "${name}"?`)) {
      storageService.deleteService(id);
      refreshData();
      flashMessage(`Servicio "${name}" eliminado.`);
    }
  };

  const handleUpdateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch) return;

    storageService.updateBranch(editingBranch);
    setEditingBranch(null);
    refreshData();
    flashMessage(`Configuración de "${editingBranch.name}" guardada.`);
  };

  const handleResetData = () => {
    if (
      window.confirm(
        '¿Desea restaurar el dataset inicial con turnos vivos y catálogo por defecto?'
      )
    ) {
      storageService.resetToDefaults();
      refreshData();
      flashMessage('Dataset inicial restaurado con éxito.');
    }
  };

  return (
    <div className="min-h-screen bg-[#ECE7DE] text-[#141210] pb-24 font-sans">
      {/* Top Admin Header */}
      <div className="border-b border-[#141210]/25 bg-[#ECE7DE] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[2px] border border-[#141210]/25 flex items-center justify-center text-[#141210]">
              <Building2 className="w-4 h-4 stroke-[1.75]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-lg font-bold text-[#141210] tracking-tight">
                  Panel del Dueño / Gerencia
                </h1>
                <span className="px-2 py-0.5 rounded-[2px] bg-[#DDD6C8] border border-[#141210]/25 text-[#141210] text-[10px] font-medium tracking-wider uppercase">
                  PIN 9999
                </span>
              </div>
              <p className="text-xs text-[#141210]/70">
                Control General de Cadena • Palermo • Belgrano • Recoleta
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => storageService.exportAppointmentsToCSV()}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-[2px] bg-[#ECE7DE] hover:bg-[#DDD6C8] text-[#141210] border border-[#141210]/25 text-xs font-medium transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[1.75]" />
              <span>Exportar CSV</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-[2px] bg-[#141210] hover:bg-[#141210]/90 text-[#ECE7DE] text-xs font-medium transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 stroke-[1.75]" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
              <span className="sm:hidden">Salir</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-4 overflow-x-auto border-t border-[#141210]/15">
          {[
            { id: 'metrics', label: 'Finanzas & KPIs', icon: BarChart3 },
            { id: 'services', label: 'Gestión de Precios', icon: Scissors },
            { id: 'staff', label: 'Equipo & Agendas', icon: Users },
            { id: 'branches', label: 'Sedes & Horarios', icon: MapPin },
            { id: 'appointments', label: 'Historial de Turnos', icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'border-[#B23A2E] text-[#141210] font-bold'
                    : 'border-transparent text-[#141210]/60 hover:text-[#141210]'
                }`}
              >
                <Icon className="w-4 h-4 stroke-[1.75]" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Flash Message */}
        {actionSuccess && (
          <div className="p-3.5 rounded-[2px] bg-[#DDD6C8] border border-[#141210]/25 text-[#141210] text-xs font-medium flex items-center justify-between animate-fadeIn">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#141210]" />
              {actionSuccess}
            </span>
            <button
              type="button"
              onClick={() => setActionSuccess('')}
              className="p-1 text-[#141210]/60 hover:text-[#141210] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 1: METRICS & FINANCES */}
        {/* ================================================================ */}
        {activeTab === 'metrics' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top 4 KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Revenue Day */}
              <div className="p-5 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#141210]/70 font-medium uppercase tracking-wider">
                    Facturación Hoy
                  </span>
                  <div className="w-8 h-8 rounded-[2px] border border-[#141210]/20 flex items-center justify-center text-[#141210]">
                    <DollarSign className="w-4 h-4 stroke-[1.75]" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-[#141210] tabular-nums mt-2">
                  {formatCurrency(revenueToday)}
                </div>
                <p className="text-[11px] text-[#141210]/60 mt-1">Calculado sobre turnos del día</p>
              </div>

              {/* Revenue Total Month */}
              <div className="p-5 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#141210]/70 font-medium uppercase tracking-wider">
                    Facturación Acumulada
                  </span>
                  <div className="w-8 h-8 rounded-[2px] border border-[#141210]/20 flex items-center justify-center text-[#141210]">
                    <TrendingUp className="w-4 h-4 stroke-[1.75]" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-[#141210] tabular-nums mt-2">
                  {formatCurrency(revenueMonth)}
                </div>
                <p className="text-[11px] text-[#141210]/60 mt-1">Total de turnos no cancelados</p>
              </div>

              {/* Attended Count */}
              <div className="p-5 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#141210]/70 font-medium uppercase tracking-wider">
                    Turnos Atendidos
                  </span>
                  <div className="w-8 h-8 rounded-[2px] border border-[#141210]/20 flex items-center justify-center text-[#141210]">
                    <CheckCircle2 className="w-4 h-4 stroke-[1.75]" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-[#141210] tabular-nums mt-2">
                  {totalAttended}
                </div>
                <p className="text-[11px] text-[#141210]/60 mt-1">Servicios completados con éxito</p>
              </div>

              {/* Top Service */}
              <div className="p-5 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#141210]/70 font-medium uppercase tracking-wider">
                    Servicio Más Demandado
                  </span>
                  <div className="w-8 h-8 rounded-[2px] border border-[#141210]/20 flex items-center justify-center text-[#141210]">
                    <Scissors className="w-4 h-4 stroke-[1.75]" />
                  </div>
                </div>
                <div className="text-base sm:text-lg font-bold text-[#141210] mt-2 line-clamp-1">
                  {topService?.name || 'Combo Corte + Barba'}
                </div>
                <p className="text-[11px] text-[#141210]/70 mt-1 tabular-nums">
                  {highestBookings} reservas activas ({formatCurrency(topService?.price || 0)})
                </p>
              </div>
            </div>

            {/* Service Popularity Ranking Table */}
            <div className="p-6 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#141210]/20 pb-4 gap-2">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#141210] flex items-center gap-2">
                    <span>Ranking de Popularidad por Servicio</span>
                  </h3>
                  <p className="text-xs text-[#141210]/70 mt-0.5">
                    Servicios clasificados por demanda efectiva acumulada en toda la cadena
                  </p>
                </div>
                <span className="text-xs font-medium text-[#141210] bg-[#DDD6C8] border border-[#141210]/20 px-3 py-1 rounded-[2px] self-start sm:self-auto">
                  {services.length} Servicios Activos
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#DDD6C8]/50 text-[#141210]/70 text-[11px] uppercase tracking-wider border-b border-[#141210]/25">
                    <tr>
                      <th className="py-2.5 px-3"># Posición</th>
                      <th className="py-2.5 px-3">Servicio</th>
                      <th className="py-2.5 px-3">Categoría</th>
                      <th className="py-2.5 px-3">Duración</th>
                      <th className="py-2.5 px-3">Precio Unitario</th>
                      <th className="py-2.5 px-3">Turnos Reservados</th>
                      <th className="py-2.5 px-3">Participación</th>
                      <th className="py-2.5 px-3 text-right">Facturación Generada</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#141210]/15">
                    {serviceRankings.map((item, idx) => (
                      <tr key={item.service.id} className="hover:bg-[#DDD6C8]/30 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-[2px] border border-[#141210]/25 text-[11px] text-[#141210]">
                            #{idx + 1}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-[#141210] flex items-center gap-2">
                          <span>{item.service.name}</span>
                          {item.service.popular && (
                            <span className="text-[10px] text-[#141210]/60 font-medium">
                              • Destacado
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-[#141210]/70">{item.service.category}</td>
                        <td className="py-2.5 px-3 font-sans tabular-nums text-[#141210]/80">
                          {formatDuration(item.service.durationMinutes)}
                        </td>
                        <td className="py-2.5 px-3 text-[#141210] font-sans tabular-nums font-medium">
                          {formatCurrency(item.service.price)}
                        </td>
                        <td className="py-2.5 px-3 font-sans tabular-nums font-bold text-[#141210]">
                          {item.count} turnos
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-[1px] bg-[#DDD6C8] overflow-hidden">
                              <div
                                className="h-full bg-[#141210] rounded-[1px]"
                                style={{ width: `${Math.max(5, item.percentage)}%` }}
                              />
                            </div>
                            <span className="text-[11px] text-[#141210]/70 font-sans tabular-nums">
                              {item.percentage}%
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-sans tabular-nums font-bold text-[#141210] text-right">
                          {formatCurrency(item.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Occupancy Comparison per Branch */}
            <div className="p-6 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-[#141210]/20 pb-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#141210] flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 stroke-[1.75]" />
                    <span>Ocupación Comparativa por Sucursal</span>
                  </h3>
                  <p className="text-xs text-[#141210]/70 mt-0.5">
                    Distribución porcentual de demanda sobre el total de turnos de la cadena
                  </p>
                </div>
                <span className="text-xs font-sans tabular-nums text-[#141210]/70">
                  {appointments.length} turnos totales
                </span>
              </div>

              <div className="space-y-4">
                {branches.map((b) => {
                  const count = branchBookings[b.id] || 0;
                  const pct = Math.round((count / totalActiveBookings) * 100);

                  return (
                    <div key={b.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="font-medium text-[#141210]">{b.name}</span>
                        <span className="text-[#141210]/70 font-sans tabular-nums">
                          {count} turnos ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-[1px] bg-[#DDD6C8] overflow-hidden">
                        <div
                          className="h-full bg-[#141210] rounded-[1px] transition-all duration-500"
                          style={{ width: `${Math.max(5, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-[2px] bg-[#DDD6C8]/40 border border-[#141210]/25">
              <div className="text-xs text-[#141210]/70">
                <span>¿Deseas restaurar la información a su estado de fábrica?</span>
              </div>
              <button
                type="button"
                onClick={handleResetData}
                className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-[2px] border border-[#141210]/25 bg-[#ECE7DE] hover:bg-[#DDD6C8] text-[#141210] text-xs font-medium transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 stroke-[1.75]" />
                <span>Restaurar Mock Dataset Inicial</span>
              </button>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 2: SERVICES & PRICES MANAGER */}
        {/* ================================================================ */}
        {activeTab === 'services' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#141210] flex items-center gap-2">
                  <Scissors className="w-5 h-5 stroke-[1.75]" />
                  <span>Gestor de Servicios, Tiempos y Precios</span>
                </h3>
                <p className="text-xs text-[#141210]/70 mt-0.5">
                  Los cambios en precios o duraciones se aplican en tiempo real en la web y el motor de intervalos.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddServiceModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-[2px] border border-[#141210] bg-[#ECE7DE] hover:bg-[#DDD6C8] text-[#141210] font-medium text-xs sm:text-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[1.75]" />
                <span>+ Nuevo Servicio</span>
              </button>
            </div>

            {/* Branch Selector Tabs for Pricing (Underline tabs with #B23A2E active) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#141210]/20 pb-1">
              <div className="flex flex-wrap items-center gap-2 sm:gap-6">
                {[
                  { id: 'palermo', label: 'Ver Precios: Palermo Soho' },
                  { id: 'belgrano', label: 'Belgrano R' },
                  { id: 'recoleta', label: 'Recoleta' },
                  { id: 'comparative', label: 'Vista Comparativa' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPricingView(tab.id as any)}
                    className={`pb-2.5 text-xs sm:text-sm font-medium transition-all cursor-pointer border-b-2 ${
                      pricingView === tab.id
                        ? 'border-[#B23A2E] text-[#141210] font-bold'
                        : 'border-transparent text-[#141210]/60 hover:text-[#141210]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {Object.keys(priceDrafts).length > 0 && (
                <button
                  type="button"
                  onClick={handleSaveAllPrices}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 min-h-[36px] rounded-[2px] bg-[#B23A2E] hover:bg-[#B23A2E]/90 text-white font-medium text-xs shadow-sm transition-all self-start sm:self-auto cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 stroke-[1.75]" />
                  <span>Guardar Todos los Precios</span>
                </button>
              )}
            </div>

            {/* Services Table */}
            <div className="bg-[#ECE7DE] border border-[#141210]/25 rounded-[2px] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[#DDD6C8]/50 text-[#141210]/70 text-[11px] uppercase tracking-wider border-b border-[#141210]/25 font-semibold">
                    {pricingView === 'comparative' ? (
                      <tr>
                        <th className="py-3.5 px-4">Servicio</th>
                        <th className="py-3.5 px-3">Duración</th>
                        <th className="py-3.5 px-3">$ Palermo</th>
                        <th className="py-3.5 px-3">$ Belgrano</th>
                        <th className="py-3.5 px-3">$ Recoleta</th>
                        <th className="py-3.5 px-4 text-right">Acciones</th>
                      </tr>
                    ) : (
                      <tr>
                        <th className="py-3.5 px-4">Servicio</th>
                        <th className="py-3.5 px-3">Duración</th>
                        <th className="py-3.5 px-4">
                          $ {pricingView === 'palermo' ? 'Palermo' : pricingView === 'belgrano' ? 'Belgrano' : 'Recoleta'} (ARS)
                        </th>
                        <th className="py-3.5 px-4 text-right">Acciones</th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-[#141210]/15">
                    {services.map((service) => {
                      const isSaved = !!savedRows[service.id];
                      const hasPendingChanges =
                        !!priceDrafts[service.id] && Object.keys(priceDrafts[service.id]).length > 0;
                      const currentPalermo = priceDrafts[service.id]?.palermo ?? service.branchPrices?.palermo ?? service.price;
                      const currentBelgrano = priceDrafts[service.id]?.belgrano ?? service.branchPrices?.belgrano ?? service.price;
                      const currentRecoleta = priceDrafts[service.id]?.recoleta ?? service.branchPrices?.recoleta ?? service.price;

                      return (
                        <tr key={service.id} className="hover:bg-[#DDD6C8]/30 transition-colors">
                          <td className="py-3.5 px-4 font-medium text-[#141210]">
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{service.name}</span>
                              <span className="text-xs text-[#141210]/60 font-normal">
                                {service.category} •
                              </span>
                              {service.popular && (
                                <span className="text-[10px] text-[#141210]/70 font-semibold" title="Popular">
                                  ★
                                </span>
                              )}
                            </div>
                            <span className="block text-[11px] font-normal text-[#141210]/60 line-clamp-1 mt-0.5">
                              {service.description}
                            </span>
                          </td>

                          <td className="py-3.5 px-3">
                            <select
                              value={service.durationMinutes}
                              onChange={(e) =>
                                handleQuickUpdateDuration(service, Number(e.target.value))
                              }
                              className="px-2.5 py-1.5 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 text-[#141210] font-sans font-medium text-xs focus:border-[#B23A2E] focus:outline-none cursor-pointer"
                              title="Modificar duración al instante"
                            >
                              <option value={15}>15 min</option>
                              <option value={20}>20 min</option>
                              <option value={30}>30 min</option>
                              <option value={45}>45 min</option>
                              <option value={60}>60 min</option>
                              <option value={75}>75 min</option>
                              <option value={90}>90 min</option>
                              <option value={120}>120 min</option>
                            </select>
                          </td>

                          {pricingView === 'comparative' ? (
                            <>
                              {/* Palermo */}
                              <td className="py-3.5 px-3">
                                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 focus-within:border-[#B23A2E]">
                                  <span className="text-[#141210]/50 font-semibold text-xs">$</span>
                                  <input
                                    type="number"
                                    step={500}
                                    min={1000}
                                    value={currentPalermo}
                                    onChange={(e) =>
                                      handleDraftChange(service.id, 'palermo', Number(e.target.value))
                                    }
                                    onBlur={(e) => {
                                      const val = Number(e.target.value);
                                      if (val && val !== (service.branchPrices?.palermo ?? service.price)) {
                                        handleUpdateSingleBranchPrice(service.id, 'palermo', val);
                                      }
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        (e.target as HTMLInputElement).blur();
                                      }
                                    }}
                                    className="w-20 bg-transparent text-[#141210] font-sans tabular-nums font-semibold text-xs focus:outline-none"
                                    title="Editar precio Palermo Soho"
                                  />
                                </div>
                              </td>

                              {/* Belgrano */}
                              <td className="py-3.5 px-3">
                                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 focus-within:border-[#B23A2E]">
                                  <span className="text-[#141210]/50 font-semibold text-xs">$</span>
                                  <input
                                    type="number"
                                    step={500}
                                    min={1000}
                                    value={currentBelgrano}
                                    onChange={(e) =>
                                      handleDraftChange(service.id, 'belgrano', Number(e.target.value))
                                    }
                                    onBlur={(e) => {
                                      const val = Number(e.target.value);
                                      if (val && val !== (service.branchPrices?.belgrano ?? service.price)) {
                                        handleUpdateSingleBranchPrice(service.id, 'belgrano', val);
                                      }
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        (e.target as HTMLInputElement).blur();
                                      }
                                    }}
                                    className="w-20 bg-transparent text-[#141210] font-sans tabular-nums font-semibold text-xs focus:outline-none"
                                    title="Editar precio Belgrano R"
                                  />
                                </div>
                              </td>

                              {/* Recoleta */}
                              <td className="py-3.5 px-3">
                                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 focus-within:border-[#B23A2E]">
                                  <span className="text-[#141210]/50 font-semibold text-xs">$</span>
                                  <input
                                    type="number"
                                    step={500}
                                    min={1000}
                                    value={currentRecoleta}
                                    onChange={(e) =>
                                      handleDraftChange(service.id, 'recoleta', Number(e.target.value))
                                    }
                                    onBlur={(e) => {
                                      const val = Number(e.target.value);
                                      if (val && val !== (service.branchPrices?.recoleta ?? service.price)) {
                                        handleUpdateSingleBranchPrice(service.id, 'recoleta', val);
                                      }
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        (e.target as HTMLInputElement).blur();
                                      }
                                    }}
                                    className="w-20 bg-transparent text-[#141210] font-sans tabular-nums font-semibold text-xs focus:outline-none"
                                    title="Editar precio Recoleta"
                                  />
                                </div>
                              </td>
                            </>
                          ) : (
                            <td className="py-3.5 px-4">
                              <div className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 focus-within:border-[#B23A2E]">
                                <span className="text-[#141210]/50 font-semibold text-xs">$</span>
                                <input
                                  type="number"
                                  step={500}
                                  min={1000}
                                  value={priceDrafts[service.id]?.[pricingView] ?? service.branchPrices?.[pricingView] ?? service.price}
                                  onChange={(e) =>
                                    handleDraftChange(service.id, pricingView, Number(e.target.value))
                                  }
                                  onBlur={(e) => {
                                    const val = Number(e.target.value);
                                    if (val && val !== (service.branchPrices?.[pricingView] ?? service.price)) {
                                      handleUpdateSingleBranchPrice(service.id, pricingView, val);
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      (e.target as HTMLInputElement).blur();
                                    }
                                  }}
                                  className="w-28 bg-transparent text-[#141210] font-sans tabular-nums font-semibold text-sm focus:outline-none"
                                  title={`Modificar precio en ${pricingView}`}
                                />
                              </div>
                            </td>
                          )}

                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center justify-end gap-2">
                              {/* Botón Guardar Precios (Oxblood sólo si hay cambios pendientes, sino texto plano) */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (pricingView === 'comparative') {
                                    handleSaveServicePrices(service);
                                  } else {
                                    const val =
                                      priceDrafts[service.id]?.[pricingView] ??
                                      service.branchPrices?.[pricingView] ??
                                      service.price;
                                    handleUpdateSingleBranchPrice(service.id, pricingView, val);
                                    setSavedRows((prev) => ({ ...prev, [service.id]: true }));
                                    setTimeout(() => {
                                      setSavedRows((prev) => ({ ...prev, [service.id]: false }));
                                    }, 2500);
                                  }
                                }}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[34px] rounded-[2px] text-xs font-medium transition-colors cursor-pointer ${
                                  isSaved
                                    ? 'bg-[#141210] text-[#ECE7DE]'
                                    : hasPendingChanges
                                    ? 'bg-[#B23A2E] text-white hover:bg-[#B23A2E]/90'
                                    : 'border border-[#141210]/25 bg-[#ECE7DE] hover:bg-[#DDD6C8] text-[#141210]/80 hover:text-[#141210]'
                                }`}
                                title="Guardar Precios de este servicio"
                              >
                                {isSaved ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>¡Guardado!</span>
                                  </>
                                ) : (
                                  <>
                                    <Save className="w-3.5 h-3.5" />
                                    <span>Guardar Precios</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => openEditServiceModal(service)}
                                className="p-2 min-h-[34px] rounded-[2px] border border-[#141210]/20 bg-[#ECE7DE] hover:bg-[#DDD6C8] text-[#141210] transition-colors cursor-pointer"
                                title="Editar servicio completo"
                              >
                                <Edit2 className="w-3.5 h-3.5 stroke-[1.75]" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteService(service.id, service.name)}
                                className="p-2 min-h-[34px] rounded-[2px] border border-[#141210]/20 bg-[#ECE7DE] hover:bg-[#DDD6C8] text-[#141210]/60 hover:text-[#B23A2E] transition-colors cursor-pointer"
                                title="Eliminar servicio"
                              >
                                <Trash2 className="w-3.5 h-3.5 stroke-[1.75]" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 4: BRANCHES CONFIGURATION */}
        {/* ================================================================ */}
        {activeTab === 'branches' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#141210] flex items-center gap-2">
                <Building2 className="w-5 h-5 stroke-[1.75]" />
                <span>Configuración de Sedes y Horarios</span>
              </h3>
              <p className="text-xs text-[#141210]/70 mt-0.5">
                Edita los horarios de apertura, teléfonos de WhatsApp y cantidad de puestos/sillas para cada local.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {branches.map((b) => (
                <div
                  key={b.id}
                  className="p-5 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 shadow-sm space-y-4 flex flex-col justify-between text-[#141210]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-serif font-bold text-base text-[#141210]">{b.name}</h4>
                      <span className="text-xs text-[#141210] font-medium bg-[#DDD6C8] px-2.5 py-0.5 rounded-[2px] border border-[#141210]/20">
                        {b.chairsCount} Sillas
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs text-[#141210]/80 mt-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 stroke-[1.75] text-[#141210] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium text-[#141210]">{b.address}</div>
                          <div className="text-[11px] text-[#141210]/60">{b.neighborhood}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 stroke-[1.75] text-[#141210] shrink-0" />
                        <span>{b.schedule}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 stroke-[1.75] text-[#141210] shrink-0" />
                        <span>{b.phone}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditingBranch(b)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 min-h-[44px] rounded-[2px] border border-[#141210]/25 bg-[#ECE7DE] hover:bg-[#DDD6C8] text-[#141210] text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Settings className="w-4 h-4 stroke-[1.75]" />
                    <span>Modificar Horarios &amp; Teléfono</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 3: EQUIPO & AGENDAS (STAFF & SCHEDULES) */}
        {/* ================================================================ */}
        {activeTab === 'staff' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Global Allocation Setting Card */}
            <div className="p-6 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 shadow-sm text-[#141210]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] font-medium tracking-wider text-[#141210]/60 mb-1">
                    Directiva de asignación al cliente
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#141210] flex items-center gap-2">
                    <Sliders className="w-5 h-5 stroke-[1.75]" />
                    <span>Selección de Profesionales</span>
                  </h3>
                  <p className="text-xs text-[#141210]/70 mt-1 max-w-xl leading-relaxed">
                    Define si el cliente puede elegir específicamente a su barbero durante la reserva web o si el sistema distribuye automáticamente la carga entre los profesionales disponibles en la sucursal elegida.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-medium text-[#141210]/70">
                    {settings.allowClientSelectBarber
                      ? 'Cliente elige barbero'
                      : 'Asignación automática (agenda unificada)'}
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleAllowClientSelectBarber}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      settings.allowClientSelectBarber ? 'bg-[#141210]' : 'bg-[#DDD6C8]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#ECE7DE] shadow ring-0 transition duration-200 ease-in-out ${
                        settings.allowClientSelectBarber ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Barber List and Weekly Schedule Matrix */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#141210]/25 pb-3 gap-3">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#141210] flex items-center gap-2">
                    <Users className="w-5 h-5 stroke-[1.75]" />
                    <span>Equipo Profesional y Disponibilidad Semanal</span>
                  </h3>
                  <p className="text-xs text-[#141210]/70 mt-0.5">
                    Configura sedes autorizadas, jornadas de trabajo semanales y francos programados.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setBarberError('');
                    setShowAddBarberModal(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-[2px] border border-[#141210] bg-[#ECE7DE] hover:bg-[#DDD6C8] text-[#141210] font-medium text-xs sm:text-sm transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4 stroke-[1.75]" />
                  <span>+ Nuevo Barbero</span>
                </button>
              </div>

              {staff.map((barber) => {
                const assigned = barber.assignedBranches || [barber.branchId];
                const barberDaysOff = barber.customDaysOff || [];

                return (
                  <div
                    key={barber.id}
                    className="p-5 sm:p-6 rounded-[2px] bg-[#DDD6C8]/30 border border-[#141210]/25 space-y-6 text-[#141210]"
                  >
                    {/* Barber Header, Status & Actions */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#141210]/20 pb-4">
                      <div className="flex items-start sm:items-center gap-3.5">
                        <img
                          src={barber.avatarUrl}
                          alt={barber.name}
                          className="w-12 h-12 rounded-[2px] object-cover border border-[#141210]/25 shrink-0"
                        />
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-serif font-bold text-base text-[#141210]">{barber.name}</h4>
                            <span className="text-[11px] px-2 py-0.5 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 text-[#141210]/80 font-sans tabular-nums">
                              ★ {barber.rating.toFixed(1)}
                            </span>
                            {/* Status Badge */}
                            {barber.isActive !== false ? (
                              <span className="px-2 py-0.5 rounded-[2px] bg-[#4B5842] text-white text-[10px] font-medium tracking-wider uppercase">
                                Activo
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-[2px] bg-[#A67C3D] text-white text-[10px] font-medium tracking-wider uppercase">
                                En Pausa
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#141210]/70">
                            {barber.specialties.join(' • ')}
                          </p>
                        </div>
                      </div>

                      {/* Status Controls & Branch Selector */}
                      <div className="flex flex-wrap items-center gap-4">
                        {/* Toggle Active / Pause & Delete */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleBarberActive(barber)}
                            className={`px-3 py-1.5 min-h-[36px] rounded-[2px] text-xs font-medium border transition-colors cursor-pointer ${
                              barber.isActive !== false
                                ? 'border-[#141210]/30 bg-[#ECE7DE] hover:bg-[#DDD6C8] text-[#141210]'
                                : 'border-[#4B5842] bg-[#ECE7DE] hover:bg-[#DDD6C8] text-[#4B5842] font-semibold'
                            }`}
                            title={
                              barber.isActive !== false
                                ? 'Pausar temporalmente (ocultar del turnero)'
                                : 'Reactivar en el turnero de reservas'
                            }
                          >
                            {barber.isActive !== false ? 'Pausar' : 'Activar'}
                          </button>

                          <button
                            type="button"
                            onClick={() => setBarberToDelete(barber)}
                            className="inline-flex items-center gap-1 text-[#B23A2E] hover:bg-[#B23A2E]/10 px-2.5 py-1.5 min-h-[36px] rounded-[2px] border border-transparent hover:border-[#B23A2E]/30 text-xs font-medium transition-colors cursor-pointer"
                            title="Eliminar profesional del staff"
                          >
                            <Trash2 className="w-3.5 h-3.5 stroke-[1.75]" />
                            <span>Eliminar</span>
                          </button>
                        </div>

                        {/* Branch Assignment Selector */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-medium tracking-wider text-[#141210]/70 uppercase block">
                            Sedes autorizadas:
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {branches.map((br) => {
                              const isAssigned = assigned.includes(br.id);
                              return (
                                <button
                                  key={br.id}
                                  type="button"
                                  onClick={() => handleToggleBarberBranch(barber, br.id)}
                                  className={`px-2.5 py-1 min-h-[32px] rounded-[2px] text-xs font-medium border transition-colors flex items-center gap-1 cursor-pointer ${
                                    isAssigned
                                      ? 'bg-[#141210] text-[#ECE7DE] border-[#141210]'
                                      : 'bg-[#ECE7DE] text-[#141210]/70 border-[#141210]/25 hover:border-[#141210]/50'
                                  }`}
                                >
                                  {isAssigned && <Check className="w-3 h-3" />}
                                  <span>{br.name.replace('Sede ', '')}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Weekly Schedule Days: Lun (1) to Sáb (6) */}
                    <div>
                      <div className="text-xs font-medium tracking-wider text-[#141210]/70 uppercase mb-3">
                        Horario de atención semanal (Lunes a Sábado):
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
                        {[
                          { idx: 1, label: 'Lunes' },
                          { idx: 2, label: 'Martes' },
                          { idx: 3, label: 'Miércoles' },
                          { idx: 4, label: 'Jueves' },
                          { idx: 5, label: 'Viernes' },
                          { idx: 6, label: 'Sábado' },
                        ].map((d) => {
                          const daySched = barber.schedule ? barber.schedule[d.idx] : null;
                          const isActive = daySched?.active ?? true;
                          const currentDayBranch = daySched?.branchId || assigned[0] || 'palermo';
                          const startHour = daySched?.start || '10:00';
                          const endHour = daySched?.end || '20:00';

                          return (
                            <div
                              key={d.idx}
                              className={`p-3 rounded-[2px] border text-xs transition-colors flex flex-col justify-between space-y-2 ${
                                isActive
                                  ? 'bg-[#ECE7DE] border-[#141210]/25'
                                  : 'bg-[#DDD6C8]/50 border-[#141210]/15 opacity-60'
                              }`}
                            >
                              <div className="flex items-center justify-between border-b border-[#141210]/15 pb-1.5">
                                <span className="font-serif font-bold text-xs text-[#141210]">{d.label}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateBarberDaySchedule(barber, d.idx, 'active', !isActive)
                                  }
                                  className={`px-1.5 py-0.5 rounded-[2px] text-[10px] font-medium border cursor-pointer ${
                                    isActive
                                      ? 'bg-[#141210] text-[#ECE7DE] border-[#141210]'
                                      : 'bg-[#ECE7DE] text-[#141210]/60 border-[#141210]/25'
                                  }`}
                                >
                                  {isActive ? 'Activo' : 'Franco'}
                                </button>
                              </div>

                              {isActive ? (
                                <div className="space-y-1.5 pt-1">
                                  <div>
                                    <label className="text-[10px] text-[#141210]/60 block mb-0.5">Sede</label>
                                    <select
                                      value={currentDayBranch}
                                      onChange={(e) =>
                                        handleUpdateBarberDaySchedule(
                                          barber,
                                          d.idx,
                                          'branchId',
                                          e.target.value
                                        )
                                      }
                                      className="w-full text-[11px] p-1 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 text-[#141210]"
                                    >
                                      {assigned.map((bId) => {
                                        const bObj = branches.find((b) => b.id === bId);
                                        return (
                                          <option key={bId} value={bId}>
                                            {bObj?.name.replace('Sede ', '') || bId}
                                          </option>
                                        );
                                      })}
                                    </select>
                                  </div>

                                  <div className="grid grid-cols-2 gap-1">
                                    <div>
                                      <label className="text-[10px] text-[#141210]/60 block mb-0.5">Entrada</label>
                                      <input
                                        type="text"
                                        value={startHour}
                                        placeholder="10:00"
                                        onChange={(e) =>
                                          handleUpdateBarberDaySchedule(
                                            barber,
                                            d.idx,
                                            'start',
                                            e.target.value
                                          )
                                        }
                                        className="w-full text-[11px] p-1 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 text-[#141210]"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[10px] text-[#141210]/60 block mb-0.5">Salida</label>
                                      <input
                                        type="text"
                                        value={endHour}
                                        placeholder="20:00"
                                        onChange={(e) =>
                                          handleUpdateBarberDaySchedule(
                                            barber,
                                            d.idx,
                                            'end',
                                            e.target.value
                                          )
                                        }
                                        className="w-full text-[11px] p-1 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 text-[#141210]"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="py-4 text-center text-[11px] text-[#141210]/50 italic">
                                  Día de descanso
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Days Off Section */}
                    <div className="pt-2 border-t border-[#141210]/15 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-[11px] font-medium tracking-wider text-[#141210]/70 uppercase">
                          Francos puntuales o licencias (Fechas bloqueadas):
                        </span>

                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            value={newDayOffDate[barber.id] || ''}
                            onChange={(e) =>
                              setNewDayOffDate((prev) => ({ ...prev, [barber.id]: e.target.value }))
                            }
                            className="px-2.5 py-1.5 text-xs rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 text-[#141210]"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddDayOff(barber.id)}
                            className="px-3 py-1.5 min-h-[34px] rounded-[2px] bg-[#141210] hover:bg-[#141210]/90 text-[#ECE7DE] text-xs font-medium cursor-pointer"
                          >
                            + Agregar Franco
                          </button>
                        </div>
                      </div>

                      {barberDaysOff.length > 0 ? (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {barberDaysOff.map((offDate) => (
                            <span
                              key={offDate}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 text-xs text-[#141210]"
                            >
                              <span>{offDate}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveDayOff(barber.id, offDate)}
                                className="text-[#141210]/50 hover:text-[#B23A2E] cursor-pointer"
                                title="Eliminar fecha bloqueada"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[#141210]/50 italic">
                          No posee francos extraordinarios registrados.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}


        {/* ================================================================ */}
        {/* TAB 5: APPOINTMENTS HISTORY & EXPORT */}
        {/* ================================================================ */}
        {activeTab === 'appointments' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#141210] flex items-center gap-2">
                  <Calendar className="w-5 h-5 stroke-[1.75]" />
                  <span>Historial General de Reservas</span>
                </h3>
                <p className="text-xs text-[#141210]/70 mt-0.5">
                  Visualiza y exporta a Excel/CSV todos los turnos registrados.
                </p>
              </div>

              <button
                type="button"
                onClick={() => storageService.exportAppointmentsToCSV()}
                className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-[2px] border border-[#141210] bg-[#ECE7DE] hover:bg-[#DDD6C8] text-[#141210] font-medium text-xs sm:text-sm transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 stroke-[1.75]" />
                <span>Descargar Planilla CSV</span>
              </button>
            </div>

            {/* Appointments Table */}
            <div className="bg-[#ECE7DE] border border-[#141210]/25 rounded-[2px] overflow-hidden shadow-sm">
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#DDD6C8]/50 text-[#141210]/70 text-[11px] uppercase tracking-wider border-b border-[#141210]/25 font-semibold sticky top-0">
                    <tr>
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Fecha &amp; Hora</th>
                      <th className="py-3 px-4">Sucursal</th>
                      <th className="py-3 px-4">Cliente</th>
                      <th className="py-3 px-4">Servicio</th>
                      <th className="py-3 px-4">Barbero</th>
                      <th className="py-3 px-4">Monto</th>
                      <th className="py-3 px-4">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#141210]/15">
                    {appointments.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-xs text-[#141210]/60">
                          <p className="font-serif text-sm font-bold text-[#141210] mb-1">
                            No hay reservas registradas
                          </p>
                          <p className="text-[11px] text-[#141210]/50">
                            Las reservas agendadas por los clientes aparecerán listadas aquí.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      appointments.map((app) => {
                        const branch = branches.find((b) => b.id === app.branchId);
                        const service = services.find((s) => s.id === app.serviceId);
                        const barber = staff.find((st) => st.id === app.barberId);

                        return (
                          <tr key={app.id} className="hover:bg-[#DDD6C8]/30 transition-colors">
                            <td className="py-3 px-4 font-mono text-[#141210]/60">
                              {app.id}
                            </td>
                            <td className="py-3 px-4 font-medium text-[#141210]">
                              {app.date}{' '}
                              <span className="font-sans tabular-nums font-bold text-[#141210]">({app.timeSlot} hs)</span>
                            </td>
                            <td className="py-3 px-4 text-[#141210]/80">{branch?.name}</td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-[#141210]">{app.clientName}</div>
                              <div className="text-[11px] text-[#141210]/60">{app.clientPhone}</div>
                            </td>
                            <td className="py-3 px-4 text-[#141210]">
                              {service?.name || app.serviceId}
                            </td>
                            <td className="py-3 px-4 text-[#141210]/70">
                              {barber ? barber.name : 'Cualquiera'}
                            </td>
                            <td className="py-3 px-4 font-bold font-sans tabular-nums text-[#141210]">
                              {formatCurrency(app.price)}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-[2px] text-[11px] font-medium ${
                                  app.status === 'Atendido'
                                    ? 'bg-[#4B5842] text-white'
                                    : app.status === 'Cancelado'
                                    ? 'bg-[#B23A2E] text-white'
                                    : app.status === 'No Asistió'
                                    ? 'bg-[#A67C3D] text-white'
                                    : 'bg-[#141210] text-[#ECE7DE]'
                                }`}
                              >
                                {app.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/* MODAL: ADD NEW SERVICE */}
      {/* ================================================================ */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141210]/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md max-h-[90dvh] overflow-y-auto p-6 bg-[#ECE7DE] border border-[#141210]/25 rounded-[2px] shadow-2xl text-[#141210]">
            <button
              type="button"
              onClick={() => setShowAddServiceModal(false)}
              className="absolute top-4 right-4 p-2 text-[#141210]/60 hover:text-[#141210] rounded-[2px] cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[1.75]" />
            </button>

            <h3 className="font-serif text-lg font-bold text-[#141210] flex items-center gap-2 mb-4">
              <Plus className="w-5 h-5 stroke-[1.75]" />
              <span>Agregar Nuevo Servicio</span>
            </h3>

            <form onSubmit={handleCreateService} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-[#141210]/70 font-medium text-xs uppercase tracking-wider mb-1">Nombre del Servicio *</label>
                <input
                  type="text"
                  required
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="Ej: Afeitado Head Shave Premium"
                  className="w-full px-3 py-2 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 text-[#141210] focus:border-[#B23A2E] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#141210]/70 font-medium text-xs uppercase tracking-wider mb-1">Categoría</label>
                  <select
                    value={newServiceCategory}
                    onChange={(e) => setNewServiceCategory(e.target.value as ServiceCategory)}
                    className="w-full px-3 py-2 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 text-[#141210] focus:border-[#B23A2E] focus:outline-none cursor-pointer"
                  >
                    <option value="Corte">Corte</option>
                    <option value="Barba">Barba</option>
                    <option value="Combos">Combos</option>
                    <option value="Tratamientos">Tratamientos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#141210]/70 font-medium text-xs uppercase tracking-wider mb-1">Duración (min)</label>
                  <input
                    type="number"
                    required
                    min={15}
                    max={120}
                    step={5}
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 text-[#141210] font-sans tabular-nums focus:border-[#B23A2E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2 p-3 rounded-[2px] bg-[#DDD6C8]/40 border border-[#141210]/20">
                <label className="block text-[#141210] font-medium text-xs uppercase tracking-wider">Precios por Sucursal (ARS $)</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-[#141210]/70 font-medium mb-0.5">Palermo Soho</label>
                    <input
                      type="number"
                      required
                      min={1000}
                      step={500}
                      value={newPricePalermo}
                      onChange={(e) => setNewPricePalermo(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 text-[#141210] text-xs font-sans tabular-nums font-semibold focus:border-[#B23A2E] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#141210]/70 font-medium mb-0.5">Belgrano R</label>
                    <input
                      type="number"
                      required
                      min={1000}
                      step={500}
                      value={newPriceBelgrano}
                      onChange={(e) => setNewPriceBelgrano(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 text-[#141210] text-xs font-sans tabular-nums font-semibold focus:border-[#B23A2E] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#141210]/70 font-medium mb-0.5">Recoleta</label>
                    <input
                      type="number"
                      required
                      min={1000}
                      step={500}
                      value={newPriceRecoleta}
                      onChange={(e) => setNewPriceRecoleta(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 text-[#141210] text-xs font-sans tabular-nums font-semibold focus:border-[#B23A2E] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[#141210]/70 font-medium text-xs uppercase tracking-wider mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={newServiceDesc}
                  onChange={(e) => setNewServiceDesc(e.target.value)}
                  placeholder="Detalles del procedimiento..."
                  className="w-full px-3 py-2 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 text-[#141210] focus:border-[#B23A2E] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="popularCheck"
                  checked={newServicePopular}
                  onChange={(e) => setNewServicePopular(e.target.checked)}
                  className="w-4 h-4 rounded-[2px] border-[#141210]/30 text-[#141210] focus:ring-0"
                />
                <label htmlFor="popularCheck" className="text-xs text-[#141210]/80">
                  Marcar como servicio destacado / popular
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddServiceModal(false)}
                  className="px-4 py-2 min-h-[44px] rounded-[2px] text-[#141210]/70 hover:text-[#141210] text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 min-h-[44px] rounded-[2px] bg-[#141210] hover:bg-[#141210]/90 text-[#ECE7DE] font-medium text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
                >
                  Guardar Servicio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* MODAL: EDIT SERVICE */}
      {/* ================================================================ */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141210]/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md max-h-[90dvh] overflow-y-auto p-6 bg-[#ECE7DE] border border-[#141210]/25 rounded-[2px] shadow-2xl text-[#141210]">
            <button
              type="button"
              onClick={() => setEditingService(null)}
              className="absolute top-4 right-4 p-2 text-[#141210]/60 hover:text-[#141210] rounded-[2px] cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[1.75]" />
            </button>

            <h3 className="font-serif text-lg font-bold text-[#141210] flex items-center gap-2 mb-4">
              <Edit2 className="w-5 h-5 stroke-[1.75]" />
              <span>Editar Precio y Duración</span>
            </h3>

            <form onSubmit={handleUpdateService} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-[#141210]/70 font-medium text-xs uppercase tracking-wider mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={editingService.name}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 text-[#141210] focus:border-[#B23A2E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#141210]/70 font-medium text-xs uppercase tracking-wider mb-1">Duración (minutos)</label>
                <input
                  type="number"
                  required
                  min={15}
                  max={180}
                  step={5}
                  value={editingService.durationMinutes}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      durationMinutes: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 text-[#141210] font-sans tabular-nums font-semibold focus:border-[#B23A2E] focus:outline-none"
                />
              </div>

              <div className="space-y-2 p-3 rounded-[2px] bg-[#DDD6C8]/40 border border-[#141210]/20">
                <label className="block text-[#141210] font-medium text-xs uppercase tracking-wider">Precios Diferenciados por Sucursal (ARS $)</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-[#141210]/70 font-medium mb-0.5">Palermo Soho</label>
                    <input
                      type="number"
                      required
                      min={1000}
                      step={500}
                      value={editPricePalermo}
                      onChange={(e) => setEditPricePalermo(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 text-[#141210] text-xs font-sans tabular-nums font-semibold focus:border-[#B23A2E] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#141210]/70 font-medium mb-0.5">Belgrano R</label>
                    <input
                      type="number"
                      required
                      min={1000}
                      step={500}
                      value={editPriceBelgrano}
                      onChange={(e) => setEditPriceBelgrano(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 text-[#141210] text-xs font-sans tabular-nums font-semibold focus:border-[#B23A2E] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#141210]/70 font-medium mb-0.5">Recoleta</label>
                    <input
                      type="number"
                      required
                      min={1000}
                      step={500}
                      value={editPriceRecoleta}
                      onChange={(e) => setEditPriceRecoleta(Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 text-[#141210] text-xs font-sans tabular-nums font-semibold focus:border-[#B23A2E] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[#141210]/70 font-medium text-xs uppercase tracking-wider mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={editingService.description}
                  onChange={(e) =>
                    setEditingService({ ...editingService, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 text-[#141210] focus:border-[#B23A2E] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 min-h-[44px] rounded-[2px] text-[#141210]/70 hover:text-[#141210] text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 min-h-[44px] rounded-[2px] bg-[#141210] hover:bg-[#141210]/90 text-[#ECE7DE] font-medium text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* MODAL: EDIT BRANCH */}
      {/* ================================================================ */}
      {editingBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141210]/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md p-6 bg-[#ECE7DE] border border-[#141210]/25 rounded-[2px] shadow-2xl text-[#141210]">
            <button
              type="button"
              onClick={() => setEditingBranch(null)}
              className="absolute top-4 right-4 p-2 text-[#141210]/60 hover:text-[#141210] rounded-[2px] cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[1.75]" />
            </button>

            <h3 className="font-serif text-lg font-bold text-[#141210] flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 stroke-[1.75]" />
              <span>Configuración: {editingBranch.name}</span>
            </h3>

            <form onSubmit={handleUpdateBranch} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-[#141210]/70 font-medium text-xs uppercase tracking-wider mb-1">Horario Comercial</label>
                <input
                  type="text"
                  required
                  value={editingBranch.schedule}
                  onChange={(e) => setEditingBranch({ ...editingBranch, schedule: e.target.value })}
                  placeholder="Ej: Lun a Sáb de 10:00 a 20:00 hs"
                  className="w-full px-3 py-2 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 text-[#141210] focus:border-[#B23A2E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#141210]/70 font-medium text-xs uppercase tracking-wider mb-1">Teléfono de Contacto / WhatsApp</label>
                <input
                  type="text"
                  required
                  value={editingBranch.phone}
                  onChange={(e) => setEditingBranch({ ...editingBranch, phone: e.target.value })}
                  placeholder="Ej: +54 9 11 4820-1122"
                  className="w-full px-3 py-2 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 text-[#141210] focus:border-[#B23A2E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#141210]/70 font-medium text-xs uppercase tracking-wider mb-1">Cantidad de Sillas Operativas</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={20}
                  value={editingBranch.chairsCount}
                  onChange={(e) =>
                    setEditingBranch({ ...editingBranch, chairsCount: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 text-[#141210] font-sans tabular-nums focus:border-[#B23A2E] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBranch(null)}
                  className="px-4 py-2 min-h-[44px] rounded-[2px] text-[#141210]/70 hover:text-[#141210] text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 min-h-[44px] rounded-[2px] bg-[#141210] hover:bg-[#141210]/90 text-[#ECE7DE] font-medium text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
                >
                  Guardar Configuración
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* MODAL: ADD NEW BARBER */}
      {/* ================================================================ */}
      {showAddBarberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141210]/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md max-h-[90dvh] overflow-y-auto p-6 bg-[#ECE7DE] border border-[#141210]/25 rounded-[2px] shadow-2xl text-[#141210]">
            <button
              type="button"
              onClick={() => {
                setShowAddBarberModal(false);
                setBarberError('');
              }}
              className="absolute top-4 right-4 p-2 text-[#141210]/60 hover:text-[#141210] rounded-[2px] cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[1.75]" />
            </button>

            <h3 className="font-serif text-lg font-bold text-[#141210] flex items-center gap-2 mb-4">
              <Plus className="w-5 h-5 stroke-[1.75]" />
              <span>Alta de Nuevo Barbero</span>
            </h3>

            {barberError && (
              <div className="p-2.5 mb-3 rounded-[2px] bg-[#B23A2E]/10 border border-[#B23A2E]/30 text-[#B23A2E] text-xs font-medium">
                {barberError}
              </div>
            )}

            <form onSubmit={handleCreateBarber} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-[#141210]/70 font-medium text-xs uppercase tracking-wider mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={newBarberName}
                  onChange={(e) => setNewBarberName(e.target.value)}
                  placeholder="Ej: Nicolás Benítez"
                  className="w-full px-3 py-2 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 text-[#141210] focus:border-[#B23A2E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#141210]/70 font-medium text-xs uppercase tracking-wider mb-1">
                  Especialidades (separadas por coma)
                </label>
                <input
                  type="text"
                  value={newBarberSpecialties}
                  onChange={(e) => setNewBarberSpecialties(e.target.value)}
                  placeholder="Ej: Fade & Degradé, Navaja Libre, Barba"
                  className="w-full px-3 py-2 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 text-[#141210] focus:border-[#B23A2E] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[#141210]/70 font-medium text-xs uppercase tracking-wider">
                  Sedes Autorizadas *
                </label>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {branches.map((b) => {
                    const checked = newBarberBranches.includes(b.id);
                    return (
                      <label
                        key={b.id}
                        className="flex items-center gap-2 text-xs font-medium text-[#141210] cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            if (checked) {
                              if (newBarberBranches.length > 1) {
                                setNewBarberBranches(newBarberBranches.filter((id) => id !== b.id));
                              }
                            } else {
                              setNewBarberBranches([...newBarberBranches, b.id]);
                            }
                          }}
                          className="w-4 h-4 rounded-[2px] border-[#141210]/30 text-[#141210] focus:ring-0"
                        />
                        <span>{b.name.replace('Sede ', '')}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[#141210]/70 font-medium text-xs uppercase tracking-wider mb-1">
                  URL de Foto / Avatar (Opcional)
                </label>
                <input
                  type="url"
                  value={newBarberAvatarUrl}
                  onChange={(e) => setNewBarberAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... (por defecto foto masculina sobria)"
                  className="w-full px-3 py-2 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 text-[#141210] text-xs focus:border-[#B23A2E] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#141210]/70 font-medium text-xs uppercase tracking-wider mb-1">
                    Horario Entrada
                  </label>
                  <input
                    type="time"
                    value={newBarberStartHour}
                    onChange={(e) => setNewBarberStartHour(e.target.value)}
                    className="w-full px-3 py-2 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 text-[#141210] font-sans tabular-nums focus:border-[#B23A2E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#141210]/70 font-medium text-xs uppercase tracking-wider mb-1">
                    Horario Salida
                  </label>
                  <input
                    type="time"
                    value={newBarberEndHour}
                    onChange={(e) => setNewBarberEndHour(e.target.value)}
                    className="w-full px-3 py-2 rounded-[2px] bg-[#ECE7DE] border border-[#141210]/25 text-[#141210] font-sans tabular-nums focus:border-[#B23A2E] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddBarberModal(false);
                    setBarberError('');
                  }}
                  className="px-4 py-2 min-h-[44px] rounded-[2px] border border-[#141210]/25 bg-[#ECE7DE] hover:bg-[#DDD6C8] text-[#141210] text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 min-h-[44px] rounded-[2px] bg-[#141210] hover:bg-[#141210]/90 text-[#ECE7DE] font-medium text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
                >
                  Dar de Alta Barbero
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* MODAL: CONFIRM DELETE BARBER */}
      {/* ================================================================ */}
      {barberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141210]/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md max-h-[90dvh] overflow-y-auto p-6 bg-[#ECE7DE] border border-[#141210]/25 rounded-[2px] shadow-2xl text-[#141210] space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#141210] flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-[#B23A2E] stroke-[1.75]" />
              <span>Eliminar Barbero del Staff</span>
            </h3>

            <p className="text-xs sm:text-sm text-[#141210]/80 leading-relaxed">
              ¿Seguro que deseas eliminar a <strong className="text-[#141210] font-bold">{barberToDelete.name}</strong>? Esta acción lo removerá del staff y del turnero de reservas. Sus citas pendientes pasarán a asignación unificada.
            </p>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setBarberToDelete(null)}
                className="px-4 py-2 min-h-[44px] rounded-[2px] border border-[#141210]/25 bg-[#ECE7DE] hover:bg-[#DDD6C8] text-[#141210] text-xs font-medium transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteBarber}
                className="px-5 py-2 min-h-[44px] rounded-[2px] bg-[#B23A2E] hover:bg-[#B23A2E]/90 text-white font-medium text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
