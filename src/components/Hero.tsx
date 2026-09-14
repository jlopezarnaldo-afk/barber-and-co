import React from 'react';
import { Calendar, ShieldCheck, Sparkles, MapPin, Coffee, Star, ArrowRight } from 'lucide-react';
import { InstallAppButton } from './InstallAppButton';

interface HeroProps {
  onStartBooking: () => void;
  onExploreServices: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartBooking, onExploreServices }) => {
  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden border-b border-zinc-850">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-[300px] h-[300px] bg-amber-600/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs sm:text-sm font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Grooming Studio de Alta Gama • Buenos Aires</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-zinc-100 tracking-tight leading-[1.1]">
              El estándar supremo en{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600">
                barbería &amp; estilismo
              </span>{' '}
              masculino.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Degradés impecables, ritual tradicional de barba a navaja con toalla caliente y tratamientos capilares de vanguardia. Diseñado para hombres que valoran su imagen, su tiempo y su confort.
            </p>

            {/* Perks Badges Row */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1 text-xs text-zinc-300">
              <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-lg">
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Palermo • Belgrano • Recoleta</span>
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-lg">
                <Coffee className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Café &amp; Scotch de cortesía</span>
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-lg">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Turnos puntuales sin espera</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-4">
              <button
                onClick={onStartBooking}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 min-h-[48px] rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-extrabold text-base shadow-xl shadow-amber-500/25 active:scale-98 transition-all"
              >
                <Calendar className="w-5 h-5" />
                <span>Reservar Turno Online</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <InstallAppButton variant="hero" className="w-full sm:w-auto" />

              <button
                onClick={onExploreServices}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[44px] rounded-xl bg-zinc-950/60 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-semibold text-sm transition-all"
              >
                Ver Catálogo &amp; Precios
              </button>
            </div>
          </div>

          {/* Right Visual Image & Live Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer decorative border */}
              <div className="relative rounded-3xl overflow-hidden border border-zinc-800/90 bg-zinc-900 shadow-2xl group">
                <img
                  src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1000&q=80"
                  alt="Barber & Co. Estudio"
                  className="w-full h-[420px] sm:h-[480px] object-cover object-center group-hover:scale-105 transition-transform duration-700 brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />

                {/* Floating Testimonial Pill */}
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-zinc-900/90 backdrop-blur-md border border-zinc-700/60 shadow-xl">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Verificado
                    </span>
                  </div>
                  <p className="text-xs text-zinc-200 font-medium italic">
                    "La mejor atención de Palermo. La combinación de corte con navaja y el afeitado con toalla caliente es inigualable."
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-1 font-semibold">
                    — Santiago M., cliente regular en Sede Palermo
                  </p>
                </div>
              </div>

              {/* Floating Live Badge */}
              <div className="absolute -top-4 -right-4 sm:-right-6 bg-zinc-900 border border-amber-500/40 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <div>
                  <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Agenda Online</div>
                  <div className="text-xs font-bold text-zinc-100">Turnos disponibles hoy</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Commercial Stats Ribbon */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 backdrop-blur-sm">
          <div className="text-center p-3 border-r border-zinc-800 last:border-0">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-500 tracking-tight">+18.000</div>
            <div className="text-xs text-zinc-400 font-medium mt-0.5">Servicios Realizados</div>
          </div>
          <div className="text-center p-3 md:border-r border-zinc-800">
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">4.9 / 5.0</div>
            <div className="text-xs text-zinc-400 font-medium mt-0.5">Opiniones en Google</div>
          </div>
          <div className="text-center p-3 border-r border-zinc-800">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-500 tracking-tight">3 Sedes</div>
            <div className="text-xs text-zinc-400 font-medium mt-0.5">Palermo • Belgrano • Recoleta</div>
          </div>
          <div className="text-center p-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">100% Online</div>
            <div className="text-xs text-zinc-400 font-medium mt-0.5">Confirmación por WhatsApp</div>
          </div>
        </div>
      </div>
    </section>
  );
};
