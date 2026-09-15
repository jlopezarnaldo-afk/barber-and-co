import React from 'react';
import type { BranchId, Service } from '../types';
import { formatCurrency, formatDuration, getServicePrice } from '../services/storageService';

interface ServiceCatalogProps {
  services: Service[];
  activeBranchId?: BranchId;
  onSelectService: (service: Service) => void;
  onSelectBranch?: (branchId: BranchId) => void;
}

export const ServiceCatalog: React.FC<ServiceCatalogProps> = ({
  services,
  activeBranchId = 'palermo',
  onSelectService,
}) => {
  if (!services || services.length === 0) {
    return (
      <section id="servicios" className="bg-[#ECE7DE] text-[#141210] py-16 lg:py-24 border-t border-[#141210]/25 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 lg:mb-14">
            <div className="text-xs font-medium tracking-wider text-[#141210]/60 mb-3">
              N.º 02 — Carta de servicios
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141210] tracking-tight">
              Servicios y tarifas
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#141210]/70 max-w-lg">
              Tarifas según la sede seleccionada. Cada servicio incluye asesoramiento previo y finalización de autor.
            </p>
          </div>
          <div className="p-12 text-center bg-[#DDD6C8]/40 border border-[#141210]/25 rounded-[2px]">
            <p className="font-serif text-lg font-bold text-[#141210] mb-1">
              No hay servicios disponibles temporalmente
            </p>
            <p className="text-xs text-[#141210]/70">
              Estamos actualizando nuestra carta para ofrecerle la mejor experiencia.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Identify the most popular / signature service (Corte Clásico & Fade)
  const featuredService = services.find((s) => s.id === 'serv-1') || services[0];
  const otherServices = featuredService ? services.filter((s) => s.id !== featuredService.id) : [];

  const featuredPrice = featuredService
    ? getServicePrice(featuredService, activeBranchId)
    : 0;

  return (
    <section id="servicios" className="bg-[#ECE7DE] text-[#141210] py-16 lg:py-24 border-t border-[#141210]/25 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 lg:mb-14">
          <div className="text-xs font-medium tracking-wider text-[#141210]/60 mb-3">
            N.º 02 — Carta de servicios
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141210] tracking-tight">
            Servicios y tarifas
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#141210]/70 max-w-lg">
            Tarifas según la sede seleccionada. Cada servicio incluye asesoramiento previo y finalización de autor.
          </p>
        </div>

        {/* Asymmetric Editor's Picks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Columna ancha (7/12): Servicio Destacado */}
          {featuredService && (
            <div className="lg:col-span-7 bg-[#DDD6C8]/40 border border-[#141210]/25 p-6 sm:p-8 rounded-[2px]">
              <div className="relative aspect-[16/10] bg-[#DDD6C8] overflow-hidden rounded-[2px] mb-6">
                <img
                  src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1200&q=80"
                  alt={featuredService.name}
                  className="w-full h-full object-cover object-[center_35%]"
                />
              </div>

              <div className="text-xs font-medium text-[#141210]/60 mb-1">
                Corte más popular
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#141210] tracking-tight mb-2">
                {featuredService.name}
              </h3>

              <p className="text-xs sm:text-sm text-[#141210]/75 leading-relaxed mb-4 max-w-lg">
                {featuredService.description}
              </p>

              <div className="text-xs text-[#141210]/60 mb-6">
                {formatDuration(featuredService.durationMinutes)}
              </div>

              {/* Price & Text CTA: #B23A2E is ONLY on this featured price (Place 2 of 2) */}
              <div className="flex items-baseline justify-between border-t border-[#141210]/25 pt-5">
                <div>
                  <span
                    key={`featured-${featuredService.id}-${activeBranchId}`}
                    className="font-serif text-3xl sm:text-4xl font-bold text-[#B23A2E] animate-price-fade"
                  >
                    {formatCurrency(featuredPrice)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectService(featuredService)}
                  className="text-xs sm:text-sm font-medium text-[#141210] hover:underline focus:underline min-h-[44px] inline-flex items-center transition-all cursor-pointer"
                >
                  Reservar turno &rarr;
                </button>
              </div>
            </div>
          )}

          {/* Columna angosta (5/12): Resto de los servicios en lista compacta */}
          <div className="lg:col-span-5 divide-y divide-[#141210]/25 border-y border-[#141210]/25 lg:border-t-0">
            {otherServices.map((service) => {
              const price = getServicePrice(service, activeBranchId);

              return (
                <div
                  key={service.id}
                  className="py-4 sm:py-5 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm sm:text-base text-[#141210]">
                      {service.name}
                    </h4>
                    <p className="text-xs text-[#141210]/70 line-clamp-1">
                      {service.description}
                    </p>
                    <div className="text-xs text-[#141210]/60">
                      {formatDuration(service.durationMinutes)}
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 pl-2">
                    <span
                      key={`price-${service.id}-${activeBranchId}`}
                      className="font-serif text-lg sm:text-xl font-bold text-[#141210] animate-price-fade"
                    >
                      {formatCurrency(price)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectService(service)}
                      className="text-xs font-medium text-[#141210] hover:underline focus:underline min-h-[44px] inline-flex items-center transition-all cursor-pointer mt-1"
                    >
                      Reservar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

