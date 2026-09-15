import React, { useState, useEffect } from 'react';
import { Scissors, Lock, LogOut, Menu, X, ShieldCheck, UserCheck } from 'lucide-react';
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
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#ECE7DE] border-b border-[#141210]/25">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo: Clean scissors icon + editorial typography */}
        <a
          href="#"
          className="flex items-center gap-2.5 group focus:outline-none shrink-0"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          aria-label="Barber & Co. — Inicio"
        >
          <div className="w-8 h-8 rounded-[2px] border border-[#141210]/20 flex items-center justify-center text-[#141210] group-hover:border-[#141210] transition-colors">
            <Scissors className="w-4 h-4 stroke-[1.75]" />
          </div>
          <span className="font-serif font-bold text-lg sm:text-xl tracking-tight text-[#141210]">
            Barber &amp; Co.
          </span>
        </a>

        {/* Minimal Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <button
            type="button"
            onClick={() => scrollToSection('servicios')}
            className="text-xs sm:text-sm font-medium text-[#141210]/70 hover:text-[#141210] min-h-[44px] px-1 flex items-center transition-colors focus:outline-none cursor-pointer"
          >
            Servicios
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('sucursales')}
            className="text-xs sm:text-sm font-medium text-[#141210]/70 hover:text-[#141210] min-h-[44px] px-1 flex items-center transition-colors focus:outline-none cursor-pointer"
          >
            Sucursales
          </button>
        </nav>

        {/* Desktop Actions: PWA plain text link + Staff lock */}
        <div className="hidden md:flex items-center gap-4">
          {/* Simple text link for PWA install without button styling */}
          <InstallAppButton variant="text" />

          {/* Discrete Staff Access (Lock Icon Only) */}
          {currentRole === 'guest' ? (
            <button
              type="button"
              onClick={onOpenPinModal}
              className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-[2px] text-[#141210]/60 hover:text-[#141210] border border-transparent hover:border-[#141210]/20 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
              title="Acceso staff"
              aria-label="Acceso staff"
            >
              <Lock className="w-4 h-4 stroke-[1.75]" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] border border-[#141210]/20 text-xs font-medium text-[#141210]">
                {currentRole === 'admin' ? (
                  <ShieldCheck className="w-3.5 h-3.5" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5" />
                )}
                <span>{currentRole === 'admin' ? 'Admin' : 'Staff'}</span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-[2px] border border-[#141210]/25 text-[#141210]/60 hover:text-[#141210] flex items-center justify-center transition-colors cursor-pointer"
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <LogOut className="w-4 h-4 stroke-[1.75]" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Right Controls: Discrete lock + Hamburger */}
        <div className="flex items-center gap-1 md:hidden">
          {currentRole === 'guest' ? (
            <button
              type="button"
              onClick={onOpenPinModal}
              className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-[2px] text-[#141210]/60 hover:text-[#141210] flex items-center justify-center shrink-0 cursor-pointer"
              title="Acceso staff"
              aria-label="Acceso staff"
            >
              <Lock className="w-4 h-4 stroke-[1.75]" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onLogout}
              className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-[2px] text-[#141210]/60 hover:text-[#141210] flex items-center justify-center shrink-0 cursor-pointer"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-4 h-4 stroke-[1.75]" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-[2px] text-[#141210] flex items-center justify-center shrink-0 cursor-pointer"
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5 stroke-[1.75]" /> : <Menu className="w-5 h-5 stroke-[1.75]" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#141210]/25 bg-[#ECE7DE] px-4 py-4 space-y-3">
          <div className="flex flex-col space-y-1">
            <button
              type="button"
              onClick={() => scrollToSection('servicios')}
              className="w-full text-left py-2.5 min-h-[44px] text-sm font-medium text-[#141210]/80 hover:text-[#141210] flex items-center cursor-pointer"
            >
              Servicios
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('sucursales')}
              className="w-full text-left py-2.5 min-h-[44px] text-sm font-medium text-[#141210]/80 hover:text-[#141210] flex items-center cursor-pointer"
            >
              Sucursales
            </button>
          </div>

          <div className="pt-2 border-t border-[#141210]/10 flex items-center justify-between">
            <InstallAppButton variant="text" />
            {currentRole === 'guest' && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenPinModal();
                }}
                className="text-xs font-medium text-[#141210]/70 hover:text-[#141210] min-h-[44px] px-2 flex items-center cursor-pointer"
              >
                Acceso staff
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

