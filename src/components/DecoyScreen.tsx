import React from 'react';
import { ArrowLeft, Volume2, Music, Check, Shield } from 'lucide-react';
import { playSound } from '../utils/sound';

interface Props {
  onBackToClock: () => void;
}

export const DecoyScreen: React.FC<Props> = ({ onBackToClock }) => {
  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
        <button
          onClick={onBackToClock}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Clock</span>
        </button>
        <span className="text-xs font-semibold text-white">Alarm Audio Synthesizer</span>
        <div className="w-6" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-300 mx-auto mb-2">
            <Music className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">Equalizer & Ringtone Profiles</h3>
          <p className="text-xs text-slate-400 mt-1">
            Standard chime frequency presets for morning alarm schedules.
          </p>
        </div>

        <div className="space-y-2">
          {['Radial Pulse Tone', 'Harmonic Marimba', 'Zenith Awakening', 'Celestial Echo', 'Breeze Flow'].map(
            (tone, idx) => (
              <div
                key={tone}
                onClick={() => playSound.keyPress()}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700"
              >
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-200">{tone}</span>
                </div>
                {idx === 0 && <Check className="w-4 h-4 text-emerald-400" />}
              </div>
            )
          )}
        </div>

        <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800/60 text-[11px] text-slate-400">
          <span className="text-slate-300 font-semibold">Decoy Activated:</span> Real vault contents remain
          encrypted. Exit anytime to return to normal Clock.
        </div>

        <button
          onClick={onBackToClock}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-semibold"
        >
          Close Audio Settings
        </button>
      </div>
    </div>
  );
};
