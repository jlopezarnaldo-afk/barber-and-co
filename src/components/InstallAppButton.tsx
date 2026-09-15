import React, { useEffect, useState } from 'react';
import { Share, PlusSquare, X, Smartphone, CheckCircle2 } from 'lucide-react';

// Global variable to capture beforeinstallprompt outside React cycle
let deferredPrompt: any = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
}

interface InstallAppButtonProps {
  variant?: 'nav' | 'hero' | 'floating' | 'text';
  className?: string;
}

export const InstallAppButton: React.FC<InstallAppButtonProps> = ({
  variant = 'text',
  className = '',
}) => {
  const [isStandalone, setIsStandalone] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  });
  const [showIOSModal, setShowIOSModal] = useState<boolean>(false);
  const [isIOS] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const userAgent = window.navigator.userAgent.toLowerCase();
    return (
      /iphone|ipad|ipod/.test(userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );
  });

  useEffect(() => {
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };

    window.addEventListener('resize', checkStandalone);
    return () => window.removeEventListener('resize', checkStandalone);
  }, []);

  // If already installed, hide or show subtle installed badge
  if (isStandalone) {
    if (variant === 'nav' || variant === 'text') {
      return (
        <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1 text-xs text-[#141210]/60">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          <span>App instalada</span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        deferredPrompt = null;
        setIsStandalone(true);
      }
    } else {
      // Fallback for browsers without beforeinstallprompt or desktop
      setShowIOSModal(true);
    }
  };

  const getButtonStyles = () => {
    switch (variant) {
      case 'text':
        return 'inline-flex items-center text-xs sm:text-sm font-medium text-[#141210]/70 hover:text-[#141210] underline-offset-4 hover:underline min-h-[44px] px-2 transition-colors';
      case 'hero':
        return 'inline-flex items-center justify-center min-h-[44px] px-5 py-3 border border-[#141210]/20 text-[#141210] rounded-[2px] text-xs sm:text-sm font-medium hover:bg-[#141210]/5 transition-colors';
      case 'floating':
        return 'fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-[2px] bg-[#141210] text-[#ECE7DE] font-medium text-xs shadow-lg transition-colors';
      case 'nav':
      default:
        return 'inline-flex items-center justify-center text-xs sm:text-sm font-medium text-[#141210]/70 hover:text-[#141210] underline-offset-4 hover:underline min-h-[44px] px-2 transition-colors';
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className={`${getButtonStyles()} cursor-pointer ${className}`}
        title="Bajar app"
      >
        <span>Bajar app</span>
      </button>

      {/* iOS & Manual Installation Instruction Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141210]/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md p-6 bg-[#ECE7DE] border border-[#141210]/20 rounded-[2px] shadow-2xl text-[#141210]">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-2 text-[#141210]/60 hover:text-[#141210] rounded-[2px] transition-colors cursor-pointer"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-[2px] border border-[#141210]/20 flex items-center justify-center text-[#141210]">
                <Smartphone className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-[#141210]">
                  {isIOS ? 'Instalar en tu iPhone' : 'Instalar Barber & Co.'}
                </h3>
                <p className="text-xs text-[#141210]/70">Acceso instantáneo sin pasar por la tienda de apps</p>
              </div>
            </div>

            <div className="space-y-3 my-6 text-sm">
              <div className="flex items-start gap-3.5 p-3.5 bg-[#DDD6C8]/50 border border-[#141210]/10 rounded-[2px]">
                <div className="w-6 h-6 rounded-[2px] bg-[#141210] text-[#ECE7DE] flex items-center justify-center shrink-0 font-bold text-xs">
                  1
                </div>
                <div>
                  <p className="font-semibold text-xs sm:text-sm text-[#141210]">Presiona Compartir</p>
                  <p className="text-xs text-[#141210]/70 mt-0.5">
                    En la barra inferior de Safari, toca el botón de Compartir{' '}
                    <Share className="w-3.5 h-3.5 inline-block text-[#141210] mx-0.5" />.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 bg-[#DDD6C8]/50 border border-[#141210]/10 rounded-[2px]">
                <div className="w-6 h-6 rounded-[2px] bg-[#141210] text-[#ECE7DE] flex items-center justify-center shrink-0 font-bold text-xs">
                  2
                </div>
                <div>
                  <p className="font-semibold text-xs sm:text-sm text-[#141210]">Agregar a inicio</p>
                  <p className="text-xs text-[#141210]/70 mt-0.5">
                    Baja en las opciones y selecciona{' '}
                    <span className="font-medium">"Agregar a pantalla de inicio"</span>{' '}
                    <PlusSquare className="w-3.5 h-3.5 inline-block text-[#141210] mx-0.5" />.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 bg-[#DDD6C8]/50 border border-[#141210]/10 rounded-[2px]">
                <div className="w-6 h-6 rounded-[2px] bg-[#141210] text-[#ECE7DE] flex items-center justify-center shrink-0 font-bold text-xs">
                  3
                </div>
                <div>
                  <p className="font-semibold text-xs sm:text-sm text-[#141210]">Confirmar</p>
                  <p className="text-xs text-[#141210]/70 mt-0.5">
                    El icono quedará agregado con acceso directo a tus turnos.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-3 min-h-[44px] rounded-[2px] bg-[#141210] hover:bg-[#141210]/90 text-[#ECE7DE] font-medium text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Entendido, volver
            </button>
          </div>
        </div>
      )}
    </>
  );
};

