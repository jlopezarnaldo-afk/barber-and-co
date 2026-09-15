import React from 'react';
import type { Branch, BranchId } from '../types';
import { MapPin, Phone, Clock, Armchair, Navigation } from 'lucide-react';

interface BranchesShowcaseProps {
  branches: Branch[];
  onSelectBranchForBooking: (branchId: BranchId) => void;
}

export const BranchesShowcase: React.FC<BranchesShowcaseProps> = ({
  branches,
  onSelectBranchForBooking,
}) => {
  return (
    <section id="sucursales" className="bg-[#ECE7DE] text-[#141210] py-16 lg:py-24 border-t border-[#141210]/25 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 lg:mb-14">
          <div className="text-xs font-medium tracking-wider text-[#141210]/60 mb-3">
            N.º 04 — Red de sucursales
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141210] tracking-tight">
            Nuestras sedes en Buenos Aires
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#141210]/70 max-w-lg">
            Ubicaciones en Palermo, Belgrano y Recoleta diseñadas con acústica relajante y sillones de precisión.
          </p>
        </div>

        {/* Asymmetric Editorial Branches Spread (7 cols flagship / 5 cols boutique studios) */}
        {(() => {
          const flagshipBranch = branches.find((b) => b.id === 'palermo') || branches[0];
          const otherBranches = branches.filter((b) => b.id !== flagshipBranch?.id);

          return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Flagship Studio (7/12 wide column) */}
              {flagshipBranch && (
                <div className="lg:col-span-7 bg-[#DDD6C8]/40 border border-[#141210]/25 rounded-[2px] overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#DDD6C8]">
                      <img
                        src={flagshipBranch.image}
                        alt={flagshipBranch.name}
                        className="w-full h-full object-cover object-[center_35%]"
                      />
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-[2px] bg-[#ECE7DE]/95 border border-[#141210]/25 text-[11px] font-medium text-[#141210] flex items-center gap-1.5">
                        <Armchair className="w-3.5 h-3.5 stroke-[1.75]" />
                        <span>{flagshipBranch.chairsCount} sillones</span>
                      </div>
                      <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-[2px] bg-[#141210] text-[#ECE7DE] text-[10px] font-medium tracking-wider">
                        Sede insignia
                      </div>
                    </div>

                    <div className="p-6 sm:p-8 space-y-4">
                      <div>
                        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#141210]">
                          {flagshipBranch.name}
                        </h3>
                        <p className="text-xs text-[#141210]/60 mt-1 font-medium">
                          {flagshipBranch.neighborhood.replace(', CABA', '')} • Estudio central
                        </p>
                      </div>

                      <div className="space-y-2.5 text-xs sm:text-sm text-[#141210]/75 pt-2">
                        <div className="flex items-center gap-2.5">
                          <MapPin className="w-4 h-4 text-[#141210]/60 shrink-0" />
                          <span>{flagshipBranch.address}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Clock className="w-4 h-4 text-[#141210]/60 shrink-0" />
                          <span>{flagshipBranch.schedule}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Phone className="w-4 h-4 text-[#141210]/60 shrink-0" />
                          <span>{flagshipBranch.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 pt-0 space-y-2 border-t border-[#141210]/10 pt-5">
                    <button
                      type="button"
                      onClick={() => onSelectBranchForBooking(flagshipBranch.id)}
                      className="w-full inline-flex items-center justify-center min-h-[44px] rounded-[2px] bg-[#141210] hover:bg-[#141210]/90 text-[#ECE7DE] font-medium text-xs sm:text-sm transition-colors cursor-pointer"
                    >
                      <span>Reservar en {flagshipBranch.name.replace('Sede ', '')}</span>
                    </button>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${flagshipBranch.address}, Buenos Aires, Argentina`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 min-h-[44px] text-[#141210]/70 hover:text-[#141210] hover:underline text-xs font-medium transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5 stroke-[1.75]" />
                      <span>Ver en Google Maps</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Boutique Studios (5/12 narrow column) */}
              <div className="lg:col-span-5 space-y-6">
                {otherBranches.map((branch) => (
                  <div
                    key={branch.id}
                    className="p-6 bg-[#DDD6C8]/40 border border-[#141210]/25 rounded-[2px] flex flex-col justify-between space-y-5"
                  >
                    <div className="flex gap-4 items-start">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[2px] overflow-hidden bg-[#DDD6C8] shrink-0">
                        <img
                          src={branch.image}
                          alt={branch.name}
                          className="w-full h-full object-cover object-[center_35%]"
                        />
                      </div>
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#141210] truncate">
                            {branch.name}
                          </h3>
                        </div>
                        <p className="text-xs text-[#141210]/60 font-medium">
                          {branch.neighborhood.replace(', CABA', '')}
                        </p>
                        <p className="text-xs text-[#141210]/75 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#141210]/60 shrink-0" />
                          <span className="truncate">{branch.address}</span>
                        </p>
                        <p className="text-xs text-[#141210]/75 flex items-center gap-1.5">
                          <Armchair className="w-3.5 h-3.5 text-[#141210]/60 shrink-0" />
                          <span>{branch.chairsCount} sillones de atención</span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#141210]/25 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          `${branch.address}, Buenos Aires, Argentina`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1 text-[#141210]/70 hover:text-[#141210] hover:underline text-xs font-medium min-h-[44px]"
                      >
                        <Navigation className="w-3.5 h-3.5 stroke-[1.75]" />
                        <span>Google Maps</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => onSelectBranchForBooking(branch.id)}
                        className="inline-flex items-center justify-center px-5 min-h-[44px] rounded-[2px] bg-[#141210] hover:bg-[#141210]/90 text-[#ECE7DE] font-medium text-xs transition-colors cursor-pointer"
                      >
                        <span>Reservar en {branch.name.replace('Sede ', '')}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </section>
  );
};

