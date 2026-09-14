import React, { useState } from 'react';
import type { Service } from '../types';
import { formatCurrency, formatDuration } from '../services/storageService';
import { Scissors, Clock, ArrowRight, Star } from 'lucide-react';

interface ServiceCatalogProps {
  services: Service[];
  onSelectService: (service: Service) => void;
}

export const ServiceCatalog: React.FC<ServiceCatalogProps> = ({
  services,
  onSelectService,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories: { key: string; label: string }[] = [
    { key: 'all', label: 'Todos los Servicios' },
    { key: 'Corte', label: 'Cortes & Fade' },
    { key: 'Barba', label: 'Barba & Afeitado' },
    { key: 'Combos', label: 'Combos Exclusivos' },
    { key: 'Tratamientos', label: 'Tratamientos' },
  ];

  const filteredServices =
    selectedCategory === 'all'
      ? services
      : services.filter((s) => s.category === selectedCategory);

  return (
    <section id="servicios" className="py-20 md:py-28 bg-zinc-950 border-b border-zinc-850">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Scissors className="w-3.5 h-3.5" />
            <span>Carta de Servicios</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
            Maestría en cada detalle y técnica
          </h2>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base">
            Cada servicio incluye consulta de visagismo personalizada, lavado con productos de alta gama y asesoramiento de peinado o cuidado de barba.
          </p>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-4 py-2 min-h-[40px] rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                  selectedCategory === cat.key
                    ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className={`relative flex flex-col justify-between p-6 rounded-2xl bg-zinc-900/90 border ${
                service.popular
                  ? 'border-amber-500/40 shadow-xl shadow-amber-500/5'
                  : 'border-zinc-800/80 hover:border-zinc-700'
              } hover:-translate-y-1 transition-all duration-200 group`}
            >
              {/* Popular Flag */}
              {service.popular && (
                <div className="absolute -top-3 right-5 inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-500 text-zinc-950 text-[11px] font-extrabold tracking-wide shadow-md">
                  <Star className="w-3 h-3 fill-zinc-950" />
                  <span>MÁS PEDIDO</span>
                </div>
              )}

              <div>
                {/* Header with Category & Duration Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    {service.category}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-950 border border-zinc-800 text-amber-400 font-bold text-xs tracking-tight">
                    <Clock className="w-3 h-3 text-amber-500" />
                    {formatDuration(service.durationMinutes)}
                  </span>
                </div>

                {/* Service Name */}
                <h3 className="text-lg sm:text-xl font-bold text-zinc-100 group-hover:text-amber-400 transition-colors">
                  {service.name}
                </h3>

                {/* Description */}
                <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  {service.description}
                </p>
              </div>

              {/* Price & Action Footer */}
              <div className="mt-6 pt-5 border-t border-zinc-800/80 flex items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
                    Inversión
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-zinc-100 tracking-tight">
                    {formatCurrency(service.price)}
                  </div>
                </div>

                <button
                  onClick={() => onSelectService(service)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-amber-500/10 hover:bg-amber-500 border border-amber-500/30 hover:border-amber-500 text-amber-400 hover:text-zinc-950 text-xs sm:text-sm font-bold transition-all duration-150 active:scale-95"
                >
                  <span>Reservar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
