import React, { useEffect, useState } from 'react';
import { Download, Share, PlusSquare, X, Smartphone, CheckCircle2 } from 'lucide-react';

// Global variable to capture beforeinstallprompt outside React cycle
let deferredPrompt: any = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
}

interface InstallAppButtonProps {
  variant?: 'nav' | 'hero' | 'floating';
  className?: string;
}

export const InstallAppButton: React.FC<InstallAppButtonProps> = ({
  variant = 'nav',
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
    if (variant === 'nav') {
      return (
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-emerald-800/40 text-emerald-400 text-xs font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>App Instalada</span>
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
      case 'hero':
        return 'inline-flex items-center justify-center gap-2.5 px-6 py-3.5 min-h-[44px] rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-amber-500/50 text-zinc-100 font-semibold shadow-lg shadow-zinc-950/50 transition-all duration-200 active:scale-98';
      case 'floating':
        return 'fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 px-4 py-3 min-h-[44px] rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold shadow-2xl shadow-amber-500/30 transition-all duration-200 active:scale-95';
      case 'nav':
      default:
        return 'inline-flex items-center gap-2 px-3.5 py-2 min-h-[44px] rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-amber-500/60 text-zinc-200 hover:text-amber-400 text-xs sm:text-sm font-semibold transition-all duration-150';
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`${getButtonStyles()} ${className}`}
        title="Instalar App Móvil"
      >
        <Download className="w-4 h-4 text-amber-500 shrink-0" />
        <span>Bajar App</span>
      </button>

      {/* iOS & Manual Installation Instruction Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md p-6 bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl text-zinc-100">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-zinc-950 shadow-md">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-zinc-100">
                  {isIOS ? 'Instalar en tu iPhone' : 'Instalar Barber & Co.'}
                </h3>
                <p className="text-xs text-zinc-400">Acceso instantáneo con 1 toque sin App Store</p>
              </div>
            </div>

            <div className="space-y-4 my-6 text-sm">
              <div className="flex items-start gap-3.5 p-3.5 bg-zinc-950/70 border border-zinc-800 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-amber-400 shrink-0 font-bold text-sm">
                  1
                </div>
                <div>
                  <p className="font-semibold text-zinc-200">Presiona Compartir</p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    En la barra inferior de Safari, toca el botón de Compartir{' '}
                    <Share className="w-3.5 h-3.5 inline-block text-amber-400 mx-0.5" />.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 bg-zinc-950/70 border border-zinc-800 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-amber-400 shrink-0 font-bold text-sm">
                  2
                </div>
                <div>
                  <p className="font-semibold text-zinc-200">Agregar a inicio</p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Baja en las opciones y selecciona{' '}
                    <span className="text-zinc-200 font-medium">"Agregar a pantalla de inicio"</span>{' '}
                    <PlusSquare className="w-3.5 h-3.5 inline-block text-amber-400 mx-0.5" />.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 bg-zinc-950/70 border border-zinc-800 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-amber-400 shrink-0 font-bold text-sm">
                  3
                </div>
                <div>
                  <p className="font-semibold text-zinc-200">¡Listo!</p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Tendrás el icono de Barber & Co. junto a tus apps nativas, con recordatorios y acceso directo.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-3 min-h-[44px] rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm transition-all"
            >
              Entendido, volver
            </button>
          </div>
        </div>
      )}
    </>
  );
};
