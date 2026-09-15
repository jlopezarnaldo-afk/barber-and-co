import React from 'react';
import type { BranchId } from '../types';

interface HeroProps {
  activeBranchId: BranchId;
  onSelectBranch: (branchId: BranchId) => void;
  onStartBooking: () => void;
  onExploreServices?: () => void;
}

const BRANCHES: {
  id: BranchId;
  name: string;
  shortName: string;
  address: string;
  schedule: string;
  chairs: number;
  image: string;
}[] = [
  {
    id: 'palermo',
    name: 'Sede Palermo Soho',
    shortName: 'Palermo Soho',
    address: 'Honduras 4820, Palermo',
    schedule: 'Lun a Sáb • 10:00 a 20:00 hs',
    chairs: 4,
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'belgrano',
    name: 'Sede Belgrano R',
    shortName: 'Belgrano R',
    address: 'Av. Cramer 1850, Belgrano',
    schedule: 'Lun a Sáb • 10:00 a 20:00 hs',
    chairs: 3,
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'recoleta',
    name: 'Sede Recoleta',
    shortName: 'Recoleta',
    address: 'Av. Alvear 1740, Recoleta',
    schedule: 'Lun a Sáb • 10:00 a 20:00 hs',
    chairs: 3,
    image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=1200&q=80',
  },
];

export const Hero: React.FC<HeroProps> = ({
  activeBranchId,
  onSelectBranch,
  onStartBooking,
}) => {
  const activeBranch = BRANCHES.find((b) => b.id === activeBranchId) || BRANCHES[0];

  return (
    <section className="bg-[#ECE7DE] text-[#141210] pt-8 sm:pt-12 pb-16 lg:pb-24 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Asymmetric Magazine Grid: 5 cols text / 7 cols editorial photograph */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-stretch">
          {/* Left Text & Sede Tabs Column */}
          <div className="lg:col-span-5 flex flex-col justify-between py-2 lg:py-8">
            <div>
              {/* Editorial Kicker */}
              <div className="text-xs font-medium tracking-wider text-[#141210]/60 mb-6">
                N.º 01 — Estudio de barbería
              </div>

              {/* High-Contrast Serif Masthead Headline */}
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-[#141210] leading-[1.04]">
                Cortes y cuidado<br />masculino sin esperas.
              </h1>

              {/* Brief Grotesk Subtitle */}
              <p className="mt-5 text-sm sm:text-base text-[#141210]/75 font-normal leading-relaxed max-w-md">
                Seleccioná tu sucursal, elegí tu servicio y confirmá tu turno al instante con puntualidad garantizada.
              </p>

              {/* Underline Tabs Sede Selector */}
              <div className="pt-8 space-y-3">
                <div className="border-b border-[#141210]/25 flex items-center gap-6 sm:gap-8 relative">
                  {BRANCHES.map((branch) => {
                    const isActive = activeBranchId === branch.id;
                    return (
                      <button
                        key={branch.id}
                        type="button"
                        onClick={() => onSelectBranch(branch.id)}
                        className={`pb-3 text-xs sm:text-sm font-medium transition-colors cursor-pointer relative min-h-[44px] flex items-center ${
                          isActive
                            ? 'text-[#141210]'
                            : 'text-[#141210]/50 hover:text-[#141210]'
                        }`}
                      >
                        <span>{branch.shortName}</span>
                        {isActive && (
                          <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#B23A2E]" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Quiet Sede Details */}
                <div className="text-xs text-[#141210]/70 flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
                  <span>{activeBranch.address}</span>
                  <span className="text-[#141210]/30">•</span>
                  <span>{activeBranch.schedule}</span>
                  <span className="text-[#141210]/30">•</span>
                  <span>{activeBranch.chairs} sillones</span>
                </div>
              </div>
            </div>

            {/* Single CTA in Hero Section */}
            <div className="pt-8 lg:pt-10">
              <button
                type="button"
                onClick={onStartBooking}
                className="inline-flex items-center justify-center min-h-[44px] px-8 py-3.5 bg-[#141210] text-[#ECE7DE] text-xs sm:text-sm font-medium rounded-[2px] hover:bg-[#141210]/90 transition-colors cursor-pointer"
              >
                Reservar turno
              </button>
            </div>
          </div>

          {/* Right Editorial Photograph Column (Bleeding to viewport right edge on desktop) */}
          <div className="lg:col-span-7 relative min-h-[360px] sm:min-h-[460px] lg:min-h-[580px] bg-[#DDD6C8] overflow-hidden rounded-[2px] lg:rounded-r-none lg:-mr-8 xl:-mr-[calc((100vw-80rem)/2+2rem)]">
            {BRANCHES.map((branch) => (
              <img
                key={branch.id}
                src={branch.image}
                alt={branch.name}
                className={`absolute inset-0 w-full h-full object-cover object-[center_35%] transition-opacity duration-500 ease-in-out ${
                  activeBranch.id === branch.id
                    ? 'opacity-100 z-10'
                    : 'opacity-0 z-0 pointer-events-none'
                }`}
              />
            ))}
            <div className="absolute bottom-4 left-4 z-20 bg-[#ECE7DE]/95 border border-[#141210]/25 px-3 py-1.5 text-xs text-[#141210] font-sans rounded-[2px]">
              <span>{activeBranch.name}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

