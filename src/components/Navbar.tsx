import React, { useState, useEffect } from 'react';
import { Scissors, Lock, Calendar, LogOut, Menu, X, ShieldCheck, UserCheck } from 'lucide-react';
import type { UserRole } from '../types';
import { InstallAppButton } from './InstallAppButton';

interface NavbarProps {
  currentRole: UserRole;
  onOpenPinModal: () => void;
  onLogout: () => void;
  onNavigateToBooking: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onOpenPinModal,
  onLogout,
  onNavigateToBooking,
}) => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/80 shadow-xl shadow-zinc-950/60 py-3'
          : 'bg-gradient-to-b from-zinc-950/90 to-transparent py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <a
            href="#"
            className="flex items-center gap-2.5 group focus:outline-none"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-zinc-950 shadow-md group-hover:scale-105 transition-transform duration-200">
              <Scissors className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-wider text-zinc-100 uppercase flex items-center gap-1">
                Barber <span className="text-amber-500">&amp;</span> Co.
              </span>
              <span className="block text-[10px] tracking-[0.25em] text-zinc-400 font-semibold uppercase -mt-1">
                Grooming Studio
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('servicios')}
              className="text-sm font-medium text-zinc-300 hover:text-amber-400 transition-colors"
            >
              Servicios
            </button>
            <button
              onClick={() => scrollToSection('sucursales')}
              className="text-sm font-medium text-zinc-300 hover:text-amber-400 transition-colors"
            >
              Sucursales
            </button>
            <button
              onClick={() => scrollToSection('experiencia')}
              className="text-sm font-medium text-zinc-300 hover:text-amber-400 transition-colors"
            >
              Experiencia
            </button>
            <button
              onClick={() => scrollToSection('opiniones')}
              className="text-sm font-medium text-zinc-300 hover:text-amber-400 transition-colors"
            >
              Opiniones
            </button>
          </nav>

          {/* Actions: PWA Install + Booking CTA + Staff Gate */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Install App Component */}
            <InstallAppButton variant="nav" />

            {/* Quick Booking Button */}
            <button
              onClick={onNavigateToBooking}
              className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-sm font-bold shadow-lg shadow-amber-500/20 active:scale-98 transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Reservar Turno</span>
            </button>

            {/* Role Gate / Personal Access */}
            {currentRole === 'guest' ? (
              <button
                onClick={onOpenPinModal}
                className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[44px] rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs font-semibold transition-all duration-150"
                title="Acceso para Staff y Administradores"
              >
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>Acceso Personal</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${
                    currentRole === 'admin'
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                      : 'bg-amber-950/60 border-amber-500/40 text-amber-400'
                  }`}
                >
                  {currentRole === 'admin' ? (
                    <ShieldCheck className="w-3.5 h-3.5" />
                  ) : (
                    <UserCheck className="w-3.5 h-3.5" />
                  )}
                  <span>{currentRole === 'admin' ? 'Dueño / Admin' : 'Panel Staff'}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 min-h-[44px] min-w-[44px] rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-rose-400 flex items-center justify-center transition-colors"
                  title="Cerrar Turno / Bloquear"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-2 lg:hidden">
            {currentRole !== 'guest' && (
              <button
                onClick={onLogout}
                className="p-2.5 min-h-[44px] rounded-lg bg-zinc-900 border border-zinc-800 text-rose-400 text-xs flex items-center gap-1 font-semibold"
                title="Bloquear sesión"
              >
                <LogOut className="w-4 h-4" />
                <span>Bloquear</span>
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 min-h-[44px] rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 flex items-center justify-center"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl space-y-3 animate-fadeIn">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => scrollToSection('servicios')}
                className="p-3 text-left rounded-xl bg-zinc-950/60 text-zinc-200 font-medium text-sm hover:bg-zinc-800"
              >
                ✂️ Servicios
              </button>
              <button
                onClick={() => scrollToSection('sucursales')}
                className="p-3 text-left rounded-xl bg-zinc-950/60 text-zinc-200 font-medium text-sm hover:bg-zinc-800"
              >
                📍 Sucursales
              </button>
              <button
                onClick={() => scrollToSection('experiencia')}
                className="p-3 text-left rounded-xl bg-zinc-950/60 text-zinc-200 font-medium text-sm hover:bg-zinc-800"
              >
                🥃 Experiencia
              </button>
              <button
                onClick={() => scrollToSection('opiniones')}
                className="p-3 text-left rounded-xl bg-zinc-950/60 text-zinc-200 font-medium text-sm hover:bg-zinc-800"
              >
                ⭐ Opiniones
              </button>
            </div>

            <div className="pt-2 border-t border-zinc-800 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateToBooking();
                }}
                className="w-full py-3 min-h-[44px] rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/20"
              >
                <Calendar className="w-4 h-4" />
                <span>Reservar Turno Online</span>
              </button>

              <div className="flex gap-2">
                <InstallAppButton variant="nav" className="flex-1 justify-center" />
                {currentRole === 'guest' && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenPinModal();
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 min-h-[44px] rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-semibold"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Acceso Staff</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
