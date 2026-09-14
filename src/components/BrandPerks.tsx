import React from 'react';
import { Flame, Wine, Sparkles, ShieldCheck, Music, Wifi } from 'lucide-react';

export const BrandPerks: React.FC = () => {
  const perks = [
    {
      icon: Flame,
      title: 'Ritual de Toalla Caliente',
      desc: 'Infusionada en vapor con esencias de menta y eucalipto para abrir los poros y brindar una relajación total.',
    },
    {
      icon: Wine,
      title: 'Whisky Bar & Espresso',
      desc: 'Degustación de café de especialidad recién molido o una copa de Scotch Whisky mientras disfrutas tu sesión.',
    },
    {
      icon: ShieldCheck,
      title: 'Bioseguridad Grado Médico',
      desc: 'Navajas descartables selladas y esterilización de instrumental con luz ultravioleta frente a cada cliente.',
    },
    {
      icon: Sparkles,
      title: 'Sillones Italianos Vintage',
      desc: 'Tapicería artesanal en cuero con reclinado ergonómico 180° para que tu espalda descanse plenamente.',
    },
    {
      icon: Music,
      title: 'Atmósfera Acústica Curada',
      desc: 'Selección sonora de jazz moderno, lo-fi y soul a volumen ideal para desconectar de la ciudad.',
    },
    {
      icon: Wifi,
      title: 'Conectividad & Confort',
      desc: 'Wi-Fi 6 de alta velocidad, puertos de carga rápida en cada estación y climatización inteligente.',
    },
  ];

  return (
    <section id="experiencia" className="py-20 bg-zinc-900/60 border-b border-zinc-850">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
            Nuestros Pilares
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight mt-2">
            La Experiencia Barber &amp; Co.
          </h2>
          <p className="mt-3 text-zinc-400 text-sm">
            Más que un corte de pelo, creamos un refugio donde el cuidado personal masculino se transforma en un ritual placentero.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {perks.map((perk, i) => {
            const Icon = perk.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 hover:border-amber-500/40 transition-all duration-200 group"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-zinc-100 group-hover:text-amber-400 transition-colors">
                  {perk.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
                  {perk.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
