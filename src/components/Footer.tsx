import React from 'react';
import { Scissors, Lock } from 'lucide-react';
import { InstallAppButton } from './InstallAppButton';

interface FooterProps {
  onOpenPinModal: () => void;
  onNavigateToBooking: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPinModal, onNavigateToBooking }) => {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-850 pt-16 pb-12 text-zinc-400 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-zinc-850">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-zinc-950 shadow-md">
                <Scissors className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-wider text-zinc-100 uppercase flex items-center gap-1">
                  Barber <span className="text-amber-500">&amp;</span> Co.
                </span>
                <span className="block text-[10px] tracking-[0.25em] text-zinc-400 font-semibold uppercase -mt-1">
                  Grooming Studio
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Cadena boutique de barberías masculinas y grooming de autor. Innovación en agenda digital, confort premium y productos de nivel internacional.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="#"
                className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-amber-400 hover:border-amber-500/40 transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-amber-400 hover:border-amber-500/40 transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-100">Navegación</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#servicios" className="hover:text-amber-400 transition-colors">
                  Catálogo de Servicios
                </a>
              </li>
              <li>
                <a href="#sucursales" className="hover:text-amber-400 transition-colors">
                  Nuestras 3 Sedes
                </a>
              </li>
              <li>
                <a href="#experiencia" className="hover:text-amber-400 transition-colors">
                  Experiencia &amp; Confort
                </a>
              </li>
              <li>
                <a href="#opiniones" className="hover:text-amber-400 transition-colors">
                  Opiniones de Clientes
                </a>
              </li>
              <li>
                <button
                  onClick={onNavigateToBooking}
                  className="text-amber-400 font-semibold hover:underline"
                >
                  Reservar Turno
                </button>
              </li>
            </ul>
          </div>

          {/* Sedes Info */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-100">Sedes en CABA</h4>
            <div className="space-y-2.5 text-xs">
              <div>
                <p className="font-bold text-zinc-200">Palermo Soho</p>
                <p className="text-zinc-500">Honduras 4820</p>
              </div>
              <div>
                <p className="font-bold text-zinc-200">Belgrano R</p>
                <p className="text-zinc-500">Av. Juramento 2150</p>
              </div>
              <div>
                <p className="font-bold text-zinc-200">Recoleta</p>
                <p className="text-zinc-500">Av. Santa Fe 1420</p>
              </div>
            </div>
          </div>

          {/* Security & App */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-100">
              Aplicación &amp; Staff
            </h4>
            <div className="space-y-2.5">
              <InstallAppButton variant="nav" className="w-full justify-center" />
              <button
                onClick={onOpenPinModal}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 min-h-[44px] rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 text-xs font-semibold transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>Acceso Personal</span>
              </button>
              <p className="text-[11px] text-zinc-500">
                Horario: Lun a Sáb de 10:00 a 20:00 hs.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© 2026 Barber &amp; Co. Grooming Studio. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <span>Privacidad</span>
            <span>•</span>
            <span>Términos de Servicio</span>
            <span>•</span>
            <span className="text-amber-500 font-medium">Desplegado para Vercel</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
