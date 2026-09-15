import React from 'react';
import { Scissors, Lock } from 'lucide-react';
import { InstallAppButton } from './InstallAppButton';

interface FooterProps {
  onOpenPinModal: () => void;
  onNavigateToBooking: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPinModal, onNavigateToBooking }) => {
  return (
    <footer className="bg-[#DDD6C8] text-[#141210] border-t border-[#141210]/25 pt-16 pb-12 text-xs sm:text-sm overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#141210]/25">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[2px] border border-[#141210]/20 flex items-center justify-center text-[#141210]">
                <Scissors className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div>
                <span className="font-serif font-bold text-lg tracking-tight text-[#141210]">
                  Barber &amp; Co.
                </span>
                <span className="block text-[10px] tracking-wider text-[#141210]/60 font-medium -mt-0.5">
                  Estudio de barbería
                </span>
              </div>
            </div>

            <p className="text-xs text-[#141210]/75 leading-relaxed max-w-sm">
              Espacio boutique de cuidado masculino tradicional. Turnos online con puntualidad estricta y atención personalizada en Buenos Aires.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-medium text-xs text-[#141210]">Navegación</h4>
            <ul className="space-y-2 text-xs text-[#141210]/70">
              <li>
                <a href="#servicios" className="hover:text-[#141210] hover:underline transition-colors">
                  Carta de servicios
                </a>
              </li>
              <li>
                <a href="#sucursales" className="hover:text-[#141210] hover:underline transition-colors">
                  Nuestras sedes
                </a>
              </li>
              <li>
                <a href="#experiencia" className="hover:text-[#141210] hover:underline transition-colors">
                  La experiencia
                </a>
              </li>
              <li>
                <a href="#opiniones" className="hover:text-[#141210] hover:underline transition-colors">
                  Testimonios
                </a>
              </li>
              <li>
                <button
                  onClick={onNavigateToBooking}
                  className="hover:text-[#141210] hover:underline transition-colors cursor-pointer text-left"
                >
                  Reservar turno
                </button>
              </li>
            </ul>
          </div>

          {/* Sedes Info */}
          <div className="space-y-3">
            <h4 className="font-medium text-xs text-[#141210]">Sedes en Buenos Aires</h4>
            <div className="space-y-2.5 text-xs text-[#141210]/70">
              <div>
                <p className="font-medium text-[#141210]">Palermo Soho</p>
                <p className="text-[#141210]/60">Honduras 4820</p>
              </div>
              <div>
                <p className="font-medium text-[#141210]">Belgrano R</p>
                <p className="text-[#141210]/60">Av. Cramer 1850</p>
              </div>
              <div>
                <p className="font-medium text-[#141210]">Recoleta</p>
                <p className="text-[#141210]/60">Av. Alvear 1740</p>
              </div>
            </div>
          </div>

          {/* Security & App */}
          <div className="space-y-3">
            <h4 className="font-medium text-xs text-[#141210]">
              Aplicación &amp; Staff
            </h4>
            <div className="space-y-2.5">
              <InstallAppButton variant="text" />
              <div>
                <button
                  onClick={onOpenPinModal}
                  className="inline-flex items-center gap-2 px-3 py-2 min-h-[44px] rounded-[2px] border border-[#141210]/25 text-[#141210]/80 hover:text-[#141210] text-xs font-medium transition-colors cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 stroke-[1.75]" />
                  <span>Acceso staff</span>
                </button>
              </div>
              <p className="text-[11px] text-[#141210]/60">
                Horario: Lun a Sáb de 10:00 a 20:00 hs.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#141210]/60">
          <p>© 2026 Barber &amp; Co. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <span>Términos de servicio</span>
            <span>•</span>
            <span>Privacidad</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

