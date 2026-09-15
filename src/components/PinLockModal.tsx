import React, { useState, useEffect, useCallback } from 'react';
import { Lock, Delete, X, ShieldAlert, KeyRound, ArrowRight } from 'lucide-react';
import type { UserRole } from '../types';
import { storageService } from '../services/storageService';

interface PinLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role: UserRole) => void;
}

export const PinLockModal: React.FC<PinLockModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [pin, setPin] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const validatePin = useCallback(
    (inputPin: string) => {
      if (inputPin === '1111') {
        storageService.setSessionRole('staff');
        onSuccess('staff');
        setPin('');
        setHasError(false);
        setErrorMessage('');
        onClose();
      } else if (inputPin === '9999') {
        storageService.setSessionRole('admin');
        onSuccess('admin');
        setPin('');
        setHasError(false);
        setErrorMessage('');
        onClose();
      } else {
        setHasError(true);
        setErrorMessage('PIN inválido. Verifique sus credenciales.');
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]);
        }
        setTimeout(() => {
          setPin('');
        }, 700);
      }
    },
    [onSuccess, onClose]
  );

  const handleKeyPress = useCallback(
    (digit: string) => {
      if (pin.length >= 4) return;
      setHasError(false);
      setErrorMessage('');
      const newPin = pin + digit;
      setPin(newPin);

      if (newPin.length === 4) {
        validatePin(newPin);
      }
    },
    [pin, validatePin]
  );

  const handleDelete = useCallback(() => {
    setHasError(false);
    setErrorMessage('');
    setPin((prev) => prev.slice(0, -1));
  }, []);

  const handleClear = useCallback(() => {
    setHasError(false);
    setErrorMessage('');
    setPin('');
  }, []);

  const handleSubmit = useCallback(() => {
    if (pin.length === 4) {
      validatePin(pin);
    } else {
      setHasError(true);
      setErrorMessage('Ingrese los 4 dígitos del PIN.');
    }
  }, [pin, validatePin]);

  const handleClose = useCallback(() => {
    setPin('');
    setHasError(false);
    setErrorMessage('');
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Enter') {
        handleSubmit();
      } else if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyPress, handleDelete, handleSubmit, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#141210]/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div
        className={`relative w-full max-w-sm max-h-[94dvh] overflow-y-auto p-4 sm:p-6 bg-[#ECE7DE] border ${
          hasError ? 'border-rose-600 animate-shake' : 'border-[#141210]/20'
        } rounded-[2px] shadow-2xl text-[#141210] transition-all duration-150 my-auto`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 text-[#141210]/60 hover:text-[#141210] rounded-[2px] transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="Cerrar"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="flex flex-col items-center text-center mb-3 sm:mb-4 pt-1 sm:pt-0">
          <div className="w-10 h-10 rounded-[2px] border border-[#141210]/20 flex items-center justify-center text-[#141210] mb-2">
            <Lock className="w-5 h-5 stroke-[1.75]" />
          </div>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#141210] tracking-tight">Acceso Personal</h3>
          <p className="text-[11px] sm:text-xs text-[#141210]/60 mt-0.5">Terminal de seguridad Barber &amp; Co.</p>
        </div>

        {/* PIN Indicators */}
        <div className="flex justify-center items-center gap-3.5 mb-3 sm:mb-4">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = index < pin.length;
            return (
              <div
                key={index}
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[2px] transition-all duration-200 border ${
                  isFilled
                    ? 'bg-[#141210] border-[#141210]'
                    : 'bg-[#DDD6C8] border-[#141210]/20'
                } ${hasError ? '!bg-rose-600 !border-rose-600' : ''}`}
              />
            );
          })}
        </div>

        {/* Error Notification */}
        {hasError && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-rose-700 font-medium mb-2.5 animate-fadeIn">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Keypad Grid */}
        <div className="grid grid-cols-3 gap-2 my-2 sm:my-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(String(num))}
              className="min-h-[44px] sm:min-h-[48px] rounded-[2px] bg-[#DDD6C8]/60 hover:bg-[#DDD6C8] border border-[#141210]/25 text-lg sm:text-xl font-bold text-[#141210] active:scale-95 transition-all duration-100 flex items-center justify-center select-none cursor-pointer"
            >
              {num}
            </button>
          ))}

          {/* Clear Button */}
          <button
            type="button"
            onClick={handleClear}
            className="min-h-[44px] sm:min-h-[48px] rounded-[2px] bg-[#DDD6C8]/40 hover:bg-[#DDD6C8] border border-[#141210]/25 text-xs font-semibold text-[#141210]/70 hover:text-[#141210] active:scale-95 transition-all flex items-center justify-center select-none cursor-pointer"
          >
            Limpiar
          </button>

          {/* Zero */}
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="min-h-[44px] sm:min-h-[48px] rounded-[2px] bg-[#DDD6C8]/60 hover:bg-[#DDD6C8] border border-[#141210]/25 text-lg sm:text-xl font-bold text-[#141210] active:scale-95 transition-all duration-100 flex items-center justify-center select-none cursor-pointer"
          >
            0
          </button>

          {/* Delete Single */}
          <button
            type="button"
            onClick={handleDelete}
            className="min-h-[44px] sm:min-h-[48px] rounded-[2px] bg-[#DDD6C8]/40 hover:bg-[#DDD6C8] border border-[#141210]/25 text-[#141210]/70 hover:text-[#141210] active:scale-95 transition-all flex items-center justify-center select-none cursor-pointer"
            title="Borrar dígito"
            aria-label="Borrar dígito"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Enter Action */}
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full mt-1.5 py-2.5 min-h-[44px] rounded-[2px] bg-[#141210] hover:bg-[#141210]/90 text-[#ECE7DE] font-medium text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
        >
          <span>Ingresar al sistema</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Quick Demo Access Bar */}
        <div className="mt-3.5 pt-3 border-t border-[#141210]/25">
          <div className="flex items-center gap-1.5 text-[11px] text-[#141210]/70 mb-1.5">
            <KeyRound className="w-3.5 h-3.5" />
            <span className="font-semibold text-[#141210]">Accesos directos de demostración:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => validatePin('1111')}
              className="p-2 min-h-[44px] rounded-[2px] bg-[#DDD6C8]/40 border border-[#141210]/25 hover:bg-[#DDD6C8] text-left transition-colors cursor-pointer flex flex-col justify-center"
            >
              <div className="text-[10px] tracking-wider text-[#141210]/60 font-medium">Barbero</div>
              <div className="font-bold text-[#141210]">PIN 1111</div>
            </button>
            <button
              type="button"
              onClick={() => validatePin('9999')}
              className="p-2 min-h-[44px] rounded-[2px] bg-[#DDD6C8]/40 border border-[#141210]/25 hover:bg-[#DDD6C8] text-left transition-colors cursor-pointer flex flex-col justify-center"
            >
              <div className="text-[10px] tracking-wider text-[#141210]/60 font-medium">Dueño / Admin</div>
              <div className="font-bold text-[#141210]">PIN 9999</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
