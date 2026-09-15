import React from 'react';
import { Flame, Wine, Sparkles, ShieldCheck, Music, Wifi } from 'lucide-react';

export const BrandPerks: React.FC = () => {
  const perks = [
    {
      icon: Flame,
      title: 'Ritual de Toalla Caliente',
      desc: 'Infusionada en vapor con esencias botánicas para abrir los poros y distender las facciones antes del afeitado.',
    },
    {
      icon: Wine,
      title: 'Café & Destilados',
      desc: 'Degustación de café de especialidad recién molido o una copa de single malt durante tu sesión.',
    },
    {
      icon: ShieldCheck,
      title: 'Bioseguridad Sanitaria',
      desc: 'Navajas descartables de un solo uso y esterilización ultravioleta de cada herramienta frente a vos.',
    },
    {
      icon: Sparkles,
      title: 'Sillones Clásicos',
      desc: 'Tapicería artesanal en cuero con reclinado ergonómico pensado para una postura de reposo natural.',
    },
    {
      icon: Music,
      title: 'Acústica Cuidada',
      desc: 'Selección musical sutil en vinilo y streaming con acústica diseñada para aislarte de la ciudad.',
    },
    {
      icon: Wifi,
      title: 'Espacio de Confort',
      desc: 'Conexión de alta velocidad, puertos de carga dedicados y climatización balanceada en cada estación.',
    },
  ];

  return (
    <section id="experiencia" className="bg-[#DDD6C8] text-[#141210] py-16 lg:py-24 border-t border-[#141210]/25 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Asymmetric Editorial Spread: 4 cols manifesto / 8 cols numbered rituals */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Editorial Introduction & Manifesto (4/12) */}
          <div className="lg:col-span-4 space-y-6">
            <div>
              <div className="text-xs font-medium tracking-wider text-[#141210]/60 mb-3">
                N.º 05 — La experiencia
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#141210] tracking-tight">
                Estándares y rituales
              </h2>
            </div>

            <p className="text-sm text-[#141210]/80 leading-relaxed">
              Un espacio donde el cuidado personal masculino se resuelve con calma, oficio y precisión técnica. Preservamos las técnicas clásicas de tijera y navaja en un entorno concebido para desconectar del ruido exterior.
            </p>

            <div className="pt-4 border-t border-[#141210]/25">
              <span className="font-serif italic text-sm text-[#141210]/70">
                "El valor de un corte no reside en la velocidad, sino en la exactitud del detalle."
              </span>
            </div>
          </div>

          {/* Right Column: Numbered Editorial Rituals (8/12) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            {perks.map((perk, i) => {
              const Icon = perk.icon;
              const numeral = String(i + 1).padStart(2, '0');

              return (
                <div
                  key={i}
                  className="pb-6 border-b border-[#141210]/25 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[#141210]/50 text-xs mb-3">
                      <span className="font-serif font-bold text-sm tracking-widest">{numeral}</span>
                      <Icon className="w-4 h-4 stroke-[1.75]" />
                    </div>

                    <h3 className="font-serif text-base sm:text-lg font-bold text-[#141210]">
                      {perk.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#141210]/75 mt-2 leading-relaxed">
                      {perk.desc}
                    </p>
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

