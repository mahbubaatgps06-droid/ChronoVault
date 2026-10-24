import React, { useState, useEffect } from 'react';
import { Lock, Delete, Fingerprint, X, ShieldAlert, KeyRound, Info } from 'lucide-react';
import { playSound, triggerHaptic } from '../utils/sound';
import { VaultSettings } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onDecoySuccess: () => void;
  settings: VaultSettings;
  onFailedAttempt: (enteredPin: string) => void;
}

export const PinPadModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  onDecoySuccess,
  settings,
  onFailedAttempt,
}) => {
  const [pin, setPin] = useState('');
  const [errorShake, setErrorShake] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setErrorShake(false);
      setErrorMessage('');
    }
  }, [isOpen]);

  // Handle number click
  const handleDigit = (digit: string) => {
    if (pin.length >= 6) return;
    const newPin = pin + digit;
    setPin(newPin);
    playSound.keyPress();
    triggerHaptic(12);

    // If matches target length (e.g. 4 digits)
    const targetLength = settings.pin.length;
    if (newPin.length === targetLength) {
      verifyPin(newPin);
    }
  };

  const handleBackspace = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      playSound.keyPress();
      triggerHaptic(8);
    }
  };

  const handleClear = () => {
    setPin('');
    playSound.keyPress();
  };

  const verifyPin = (inputPin: string) => {
    if (inputPin === settings.pin) {
      playSound.vaultUnlock();
      triggerHaptic([30, 60, 40]);
      setTimeout(() => {
        onSuccess();
      }, 150);
    } else if (settings.decoyPin && inputPin === settings.decoyPin) {
      // Decoy Mode activated
      playSound.vaultUnlock();
      triggerHaptic([20, 40]);
      setTimeout(() => {
        onDecoySuccess();
      }, 150);
    } else {
      // Error
      playSound.error();
      triggerHaptic([50, 100, 50]);
      setErrorShake(true);
      setErrorMessage('Incorrect Security PIN');
      onFailedAttempt(inputPin);
      setTimeout(() => {
        setPin('');
        setErrorShake(false);
      }, 600);
    }
  };

  const handleBiometric = () => {
    // Biometric quick auth
    playSound.vaultUnlock();
    triggerHaptic([40, 80]);
    onSuccess();
  };

  if (!isOpen) return null;

  const targetLength = settings.pin.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xs bg-slate-900/95 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center relative transition-transform ${
          errorShake ? 'animate-shake' : ''
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-300 rounded-full transition-colors"
          title="Cancel"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Discreet Padlock Icon */}
        <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-200 mb-3 shadow-inner">
          <KeyRound className="w-6 h-6 text-purple-400" />
        </div>

        <h3 className="text-base font-bold text-white tracking-wide">
          ChronoVault Access
        </h3>
        <p className="text-xs text-slate-400 mt-0.5 text-center">
          Enter master PIN to unlock hidden apps
        </p>

        {/* PIN Dots Indicator */}
        <div className="flex items-center gap-3 my-5">
          {Array.from({ length: targetLength }).map((_, idx) => {
            const isFilled = idx < pin.length;
            return (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                  isFilled
                    ? 'bg-purple-500 scale-110 shadow-sm shadow-purple-500/50'
                    : 'border-2 border-slate-700 bg-slate-800/60'
                } ${errorShake ? '!bg-red-500 !border-red-500' : ''}`}
              />
            );
          })}
        </div>

        {/* Error Feedback */}
        {errorMessage && (
          <div className="text-[11px] text-red-400 font-medium mb-3 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tactile Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full my-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleDigit(String(num))}
              className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-750 active:bg-purple-950/40 border border-slate-700/50 text-white font-mono text-xl font-medium flex flex-col items-center justify-center transition-all active:scale-95 shadow-sm"
            >
              <span>{num}</span>
            </button>
          ))}

          {/* Biometric / FaceID simulation */}
          <button
            onClick={handleBiometric}
            className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 text-purple-400 flex items-center justify-center transition-all active:scale-95"
            title="Biometric Instant Unlock"
          >
            <Fingerprint className="w-6 h-6" />
          </button>

          {/* 0 */}
          <button
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-750 active:bg-purple-950/40 border border-slate-700/50 text-white font-mono text-xl font-medium flex items-center justify-center transition-all active:scale-95 shadow-sm"
          >
            0
          </button>

          {/* Backspace */}
          <button
            onClick={handleBackspace}
            className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 text-slate-400 hover:text-white flex items-center justify-center transition-all active:scale-95"
            title="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Hint / Guide for previewers */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 w-full flex items-center justify-between text-[11px] text-slate-400">
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1 text-slate-400 hover:text-purple-400 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span>PIN hint</span>
          </button>
          <button
            onClick={handleClear}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            Clear
          </button>
        </div>

        {showHint && (
          <div className="mt-2 p-2 bg-purple-950/40 border border-purple-800/40 rounded-xl text-[11px] text-purple-300 w-full text-center">
            Default Master PIN is <strong className="text-white font-mono">1234</strong>
            <br />
            Decoy Emergency PIN is <strong className="text-white font-mono">0000</strong>
          </div>
        )}
      </div>
    </div>
  );
};
