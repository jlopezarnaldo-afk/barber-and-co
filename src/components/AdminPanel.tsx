import React, { useState } from 'react';
import type {
  Appointment,
  Barber,
  Branch,
  Service,
  ServiceCategory,
} from '../types';
import {
  storageService,
  formatCurrency,
  formatDuration,
  getDateString,
} from '../services/storageService';
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
  Sparkles,
  Check,
  X,
  Building2,
  BarChart3,
} from 'lucide-react';

interface AdminPanelProps {
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'services' | 'branches' | 'appointments'>('metrics');

  const [appointments, setAppointments] = useState<Appointment[]>(() => storageService.getAppointments());
  const [branches, setBranches] = useState<Branch[]>(() => storageService.getBranches());
  const [services, setServices] = useState<Service[]>(() => storageService.getServices());
  const [staff, setStaff] = useState<Barber[]>(() => storageService.getStaff());

  // Editing state for services
  const [showAddServiceModal, setShowAddServiceModal] = useState<boolean>(false);
  const [newServiceName, setNewServiceName] = useState<string>('');
  const [newServiceCategory, setNewServiceCategory] = useState<ServiceCategory>('Corte');
  const [newServiceDuration, setNewServiceDuration] = useState<number>(30);
  const [newServicePrice, setNewServicePrice] = useState<number>(12000);
  const [newServiceDesc, setNewServiceDesc] = useState<string>('');
  const [newServicePopular, setNewServicePopular] = useState<boolean>(false);

  // Quick edit service modal or inline state
  const [editingService, setEditingService] = useState<Service | null>(null);

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
    setStaff(storageService.getStaff());
  };

  // GLOBAL KPI CALCULATIONS
  const todayStr = getDateString(0);

  // Total attended
  const totalAttended = appointments.filter((a) => a.status === 'Atendido').length;

  // Revenue today & month
  const revenueToday = appointments
    .filter((a) => a.date === todayStr && a.status !== 'Cancelado')
    .reduce((sum, a) => sum + a.price, 0);

  const revenueMonth = appointments
    .filter((a) => a.status !== 'Cancelado')
    .reduce((sum, a) => sum + a.price, 0);

  // Most requested service
  const serviceDemandCount: Record<string, number> = {};
  appointments.forEach((a) => {
    if (a.status !== 'Cancelado') {
      serviceDemandCount[a.serviceId] = (serviceDemandCount[a.serviceId] || 0) + 1;
    }
  });

  let mostPopularServiceId = '';
  let highestBookings = 0;
  Object.entries(serviceDemandCount).forEach(([id, count]) => {
    if (count > highestBookings) {
      highestBookings = count;
      mostPopularServiceId = id;
    }
  });

  const topService = services.find((s) => s.id === mostPopularServiceId) || services[0];

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

  // HANDLERS
  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;

    storageService.addService({
      name: newServiceName.trim(),
      category: newServiceCategory,
      durationMinutes: Number(newServiceDuration),
      price: Number(newServicePrice),
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

    storageService.updateService(editingService);
    setEditingService(null);
    refreshData();
    flashMessage(`Servicio "${editingService.name}" actualizado.`);
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20 pt-20">
      {/* Top Admin Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-md sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-black shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-zinc-100">
                  Panel del Dueño / Gerencia
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                  PIN 9999
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Control General de Cadena • Palermo • Belgrano • Recoleta
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => storageService.exportAppointmentsToCSV()}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[44px] rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-rose-400 text-xs font-semibold border border-zinc-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
              <span className="sm:hidden">Salir</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-4 overflow-x-auto">
          {[
            { id: 'metrics', label: 'Finanzas & KPIs', icon: BarChart3 },
            { id: 'services', label: 'Gestión de Precios', icon: Scissors },
            { id: 'branches', label: 'Sedes & Horarios', icon: MapPin },
            { id: 'appointments', label: 'Historial de Turnos', icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon className="w-4 h-4" />
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
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              {actionSuccess}
            </span>
            <button onClick={() => setActionSuccess('')} className="p-1 text-zinc-400 hover:text-white">
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
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                    Facturación Hoy
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-zinc-100 mt-2">
                  {formatCurrency(revenueToday)}
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">Calculado sobre turnos del día</p>
              </div>

              {/* Revenue Total Month */}
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                    Facturación Acumulada
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-500 mt-2">
                  {formatCurrency(revenueMonth)}
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">Total de turnos no cancelados</p>
              </div>

              {/* Attended Count */}
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                    Turnos Atendidos
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-blue-400 mt-2">
                  {totalAttended}
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">Servicios completados con éxito</p>
              </div>

              {/* Top Service */}
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                    Servicio Más Demandado
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-base sm:text-lg font-black text-zinc-100 mt-2 line-clamp-1">
                  {topService?.name || 'Combo Corte + Barba'}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  {highestBookings} reservas activas ({formatCurrency(topService?.price || 0)})
                </p>
              </div>
            </div>

            {/* Occupancy Comparison per Branch */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-400" />
                    <span>Ocupación Comparativa por Sucursal</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Distribución porcentual de demanda sobre el total de turnos de la cadena
                  </p>
                </div>
                <span className="text-xs font-bold text-zinc-400">
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
                        <span className="font-bold text-zinc-200">{b.name}</span>
                        <span className="text-zinc-400 font-mono">
                          {count} turnos ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-zinc-950 border border-zinc-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            b.id === 'palermo'
                              ? 'bg-amber-500'
                              : b.id === 'belgrano'
                              ? 'bg-emerald-500'
                              : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.max(5, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <div className="text-xs text-zinc-400">
                <span>¿Deseas probar con el estado inicial?</span>
              </div>
              <button
                onClick={handleResetData}
                className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-amber-400 text-xs font-bold transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
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
                <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-amber-500" />
                  <span>Gestor de Servicios, Tiempos y Precios</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Los cambios en precios o duraciones se aplican en tiempo real en la web y el motor de intervalos.
                </p>
              </div>

              <button
                onClick={() => setShowAddServiceModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Nuevo Servicio</span>
              </button>
            </div>

            {/* Services Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-zinc-950/80 text-zinc-400 text-[11px] uppercase tracking-wider border-b border-zinc-800">
                    <tr>
                      <th className="py-3.5 px-4">Servicio</th>
                      <th className="py-3.5 px-4">Categoría</th>
                      <th className="py-3.5 px-4">Duración</th>
                      <th className="py-3.5 px-4">Precio (ARS)</th>
                      <th className="py-3.5 px-4">Popular</th>
                      <th className="py-3.5 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/80">
                    {services.map((service) => (
                      <tr key={service.id} className="hover:bg-zinc-850/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-zinc-100">
                          {service.name}
                          <span className="block text-[11px] font-normal text-zinc-400 line-clamp-1">
                            {service.description}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-medium">
                            {service.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                          {formatDuration(service.durationMinutes)}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-zinc-100 text-base">
                          {formatCurrency(service.price)}
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => {
                              storageService.updateService({
                                ...service,
                                popular: !service.popular,
                              });
                              refreshData();
                              flashMessage(`Estado popular actualizado para "${service.name}".`);
                            }}
                            className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                              service.popular
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            {service.popular ? '★ Destacado' : 'Estándar'}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => setEditingService(service)}
                              className="p-2 min-h-[36px] rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-amber-400 transition-colors"
                              title="Editar precio y duración"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteService(service.id, service.name)}
                              className="p-2 min-h-[36px] rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-rose-400 transition-colors"
                              title="Eliminar servicio"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 3: BRANCHES CONFIGURATION */}
        {/* ================================================================ */}
        {activeTab === 'branches' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-500" />
                <span>Configuración de Sedes y Horarios</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Edita los horarios de apertura, teléfonos de WhatsApp y cantidad de puestos/sillas para cada local.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {branches.map((b) => (
                <div
                  key={b.id}
                  className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-base text-zinc-100">{b.name}</h4>
                      <span className="text-xs text-amber-400 font-bold bg-zinc-950 px-2.5 py-0.5 rounded-full border border-zinc-800">
                        {b.chairsCount} Sillas
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs text-zinc-300 mt-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-zinc-200">{b.address}</div>
                          <div className="text-[11px] text-zinc-500">{b.neighborhood}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>{b.schedule}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>{b.phone}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setEditingBranch(b)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 min-h-[44px] rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors"
                  >
                    <Settings className="w-4 h-4 text-amber-500" />
                    <span>Modificar Horarios &amp; Teléfono</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB 4: APPOINTMENTS HISTORY & EXPORT */}
        {/* ================================================================ */}
        {activeTab === 'appointments' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  <span>Historial General de Reservas</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Visualiza y exporta a Excel/CSV todos los turnos registrados.
                </p>
              </div>

              <button
                onClick={() => storageService.exportAppointmentsToCSV()}
                className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Planilla CSV</span>
              </button>
            </div>

            {/* Appointments Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950/80 text-zinc-400 text-[11px] uppercase tracking-wider border-b border-zinc-800 sticky top-0">
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
                  <tbody className="divide-y divide-zinc-800/80">
                    {appointments.map((app) => {
                      const branch = branches.find((b) => b.id === app.branchId);
                      const service = services.find((s) => s.id === app.serviceId);
                      const barber = staff.find((st) => st.id === app.barberId);

                      return (
                        <tr key={app.id} className="hover:bg-zinc-850/50 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-zinc-400">
                            {app.id}
                          </td>
                          <td className="py-3 px-4 font-medium text-zinc-200">
                            {app.date}{' '}
                            <span className="text-amber-400 font-bold">({app.timeSlot} hs)</span>
                          </td>
                          <td className="py-3 px-4 text-zinc-300">{branch?.name}</td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-zinc-100">{app.clientName}</div>
                            <div className="text-[11px] text-zinc-500">{app.clientPhone}</div>
                          </td>
                          <td className="py-3 px-4 text-zinc-200">
                            {service?.name || app.serviceId}
                          </td>
                          <td className="py-3 px-4 text-zinc-400">
                            {barber ? barber.name : 'Cualquiera'}
                          </td>
                          <td className="py-3 px-4 font-bold text-amber-500 font-mono">
                            {formatCurrency(app.price)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                app.status === 'Atendido'
                                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                                  : app.status === 'Cancelado'
                                  ? 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                                  : 'bg-blue-950/80 text-blue-400 border border-blue-500/30'
                              }`}
                            >
                              {app.status}
                            </span>
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
      </div>

      {/* ================================================================ */}
      {/* MODAL: ADD NEW SERVICE */}
      {/* ================================================================ */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl text-zinc-100">
            <button
              onClick={() => setShowAddServiceModal(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2 mb-4">
              <Plus className="w-5 h-5 text-emerald-400" />
              <span>Agregar Nuevo Servicio</span>
            </h3>

            <form onSubmit={handleCreateService} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Nombre del Servicio *</label>
                <input
                  type="text"
                  required
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="Ej: Afeitado Head Shave Premium"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Categoría</label>
                  <select
                    value={newServiceCategory}
                    onChange={(e) => setNewServiceCategory(e.target.value as ServiceCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Corte">Corte</option>
                    <option value="Barba">Barba</option>
                    <option value="Combos">Combos</option>
                    <option value="Tratamientos">Tratamientos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Duración (min)</label>
                  <input
                    type="number"
                    required
                    min={15}
                    max={120}
                    step={5}
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Precio en ARS ($)</label>
                <input
                  type="number"
                  required
                  min={1000}
                  step={500}
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={newServiceDesc}
                  onChange={(e) => setNewServiceDesc(e.target.value)}
                  placeholder="Detalles del procedimiento..."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="popularCheck"
                  checked={newServicePopular}
                  onChange={(e) => setNewServicePopular(e.target.checked)}
                  className="w-4 h-4 rounded bg-zinc-950 border-zinc-700 text-amber-500 focus:ring-0"
                />
                <label htmlFor="popularCheck" className="text-xs text-zinc-300">
                  Marcar como servicio destacado / popular
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddServiceModal(false)}
                  className="px-4 py-2.5 rounded-xl text-zinc-400 hover:text-zinc-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl text-zinc-100">
            <button
              onClick={() => setEditingService(null)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2 mb-4">
              <Edit2 className="w-5 h-5 text-amber-400" />
              <span>Editar Precio y Duración</span>
            </h3>

            <form onSubmit={handleUpdateService} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={editingService.name}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Precio en ARS ($)</label>
                  <input
                    type="number"
                    required
                    min={500}
                    step={500}
                    value={editingService.price}
                    onChange={(e) =>
                      setEditingService({ ...editingService, price: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Duración (minutos)</label>
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={editingService.description}
                  onChange={(e) =>
                    setEditingService({ ...editingService, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2.5 rounded-xl text-zinc-400 hover:text-zinc-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 min-h-[44px] rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm shadow-md"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl text-zinc-100">
            <button
              onClick={() => setEditingBranch(null)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-amber-400" />
              <span>Configuración: {editingBranch.name}</span>
            </h3>

            <form onSubmit={handleUpdateBranch} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Horario Comercial</label>
                <input
                  type="text"
                  required
                  value={editingBranch.schedule}
                  onChange={(e) => setEditingBranch({ ...editingBranch, schedule: e.target.value })}
                  placeholder="Ej: Lun a Sáb de 10:00 a 20:00 hs"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Teléfono de Contacto / WhatsApp</label>
                <input
                  type="text"
                  required
                  value={editingBranch.phone}
                  onChange={(e) => setEditingBranch({ ...editingBranch, phone: e.target.value })}
                  placeholder="Ej: +54 9 11 4820-1122"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Cantidad de Sillas Operativas</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={20}
                  value={editingBranch.chairsCount}
                  onChange={(e) =>
                    setEditingBranch({ ...editingBranch, chairsCount: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBranch(null)}
                  className="px-4 py-2.5 rounded-xl text-zinc-400 hover:text-zinc-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md"
                >
                  Guardar Configuración
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
