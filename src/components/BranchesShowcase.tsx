import React from 'react';
import type { Branch, BranchId } from '../types';
import { MapPin, Phone, Clock, Armchair, Navigation, Calendar } from 'lucide-react';

interface BranchesShowcaseProps {
  branches: Branch[];
  onSelectBranchForBooking: (branchId: BranchId) => void;
}

export const BranchesShowcase: React.FC<BranchesShowcaseProps> = ({
  branches,
  onSelectBranchForBooking,
}) => {
  return (
    <section id="sucursales" className="py-20 md:py-28 bg-zinc-950 border-b border-zinc-850">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <MapPin className="w-3.5 h-3.5" />
            <span>Red de Locales</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
            Nuestras 3 Sedes Exclusivas en CABA
          </h2>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base">
            Ubicaciones estratégicas en Palermo, Belgrano y Recoleta diseñadas con acústica relajante, climatización de precisión y los sillones hidráulicos más cómodos del país.
          </p>
        </div>

        {/* 3 Branches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className="flex flex-col justify-between bg-zinc-900 border border-zinc-800/80 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all duration-200 group shadow-xl"
            >
              <div>
                {/* Photo with Overlay */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={branch.image}
                    alt={branch.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                    <Armchair className="w-3.5 h-3.5" />
                    <span>{branch.chairsCount} Sillas Activas</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-100 group-hover:text-amber-400 transition-colors">
                      {branch.name}
                    </h3>
                    <p className="text-xs text-amber-500/90 font-semibold mt-0.5">
                      {branch.neighborhood}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-zinc-400">
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{branch.address}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{branch.schedule}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{branch.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 space-y-2.5">
                <button
                  onClick={() => onSelectBranchForBooking(branch.id)}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 min-h-[44px] rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm shadow-md active:scale-98 transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Reservar en {branch.name.replace('Sede ', '')}</span>
                </button>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${branch.address}, Buenos Aires, Argentina`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 min-h-[40px] rounded-xl bg-zinc-950/60 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-semibold transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Ver en Google Maps</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
