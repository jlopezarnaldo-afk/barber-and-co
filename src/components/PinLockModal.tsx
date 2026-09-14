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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-sm p-6 bg-zinc-900 border ${
          hasError ? 'border-rose-500 animate-shake' : 'border-zinc-800'
        } rounded-2xl shadow-2xl text-zinc-100 transition-all duration-150`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-zinc-100 tracking-tight">Acceso Personal</h3>
          <p className="text-xs text-zinc-400 mt-1">Terminal de Seguridad Barber &amp; Co.</p>
        </div>

        {/* PIN Indicators */}
        <div className="flex justify-center items-center gap-4 mb-5">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = index < pin.length;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-amber-500 scale-110 shadow-lg shadow-amber-500/50'
                    : 'bg-zinc-800 border border-zinc-700'
                } ${hasError ? '!bg-rose-500 !shadow-rose-500/50' : ''}`}
              />
            );
          })}
        </div>

        {/* Error Notification */}
        {hasError && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-rose-400 font-medium mb-3">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Keypad Grid */}
        <div className="grid grid-cols-3 gap-2.5 my-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(String(num))}
              className="min-h-[52px] rounded-xl bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-800/80 hover:border-amber-500/40 text-xl font-bold text-zinc-100 active:scale-95 transition-all duration-100 flex items-center justify-center select-none"
            >
              {num}
            </button>
          ))}

          {/* Clear Button */}
          <button
            onClick={handleClear}
            className="min-h-[52px] rounded-xl bg-zinc-950/40 hover:bg-zinc-800/80 border border-zinc-800/60 text-xs font-semibold text-zinc-400 hover:text-zinc-200 active:scale-95 transition-all flex items-center justify-center select-none"
          >
            Limpiar
          </button>

          {/* Zero */}
          <button
            onClick={() => handleKeyPress('0')}
            className="min-h-[52px] rounded-xl bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-800/80 hover:border-amber-500/40 text-xl font-bold text-zinc-100 active:scale-95 transition-all duration-100 flex items-center justify-center select-none"
          >
            0
          </button>

          {/* Delete Single */}
          <button
            onClick={handleDelete}
            className="min-h-[52px] rounded-xl bg-zinc-950/40 hover:bg-zinc-800/80 border border-zinc-800/60 text-zinc-400 hover:text-zinc-100 active:scale-95 transition-all flex items-center justify-center select-none"
            title="Borrar dígito"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Enter Action */}
        <button
          onClick={handleSubmit}
          className="w-full mt-2 py-3 min-h-[46px] rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all"
        >
          <span>Ingresar al Sistema</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Quick Demo Access Bar */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mb-2">
            <KeyRound className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-semibold text-zinc-300">Accesos directos de demostración:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => validatePin('1111')}
              className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-amber-500/40 text-left transition-colors"
            >
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Barbero</div>
              <div className="font-bold text-amber-400">PIN 1111</div>
            </button>
            <button
              onClick={() => validatePin('9999')}
              className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-amber-500/40 text-left transition-colors"
            >
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Dueño / Admin</div>
              <div className="font-bold text-emerald-400">PIN 9999</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
