import React, { useState } from 'react';
import { AppItem } from '../../types';
import { ArrowLeft, ShieldCheck, Key, Lock, ExternalLink, RefreshCw, Smartphone } from 'lucide-react';
import { playSound } from '../../utils/sound';

interface Props {
  app: AppItem;
  onBack: () => void;
}

export const CustomAppViewer: React.FC<Props> = ({ app, onBack }) => {
  const [balance, setBalance] = useState('2.4850 BTC');
  const [activeTab, setActiveTab] = useState<'overview' | 'actions'>('overview');

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: app.color }}
            >
              {app.name.charAt(0)}
            </div>
            <div>
              <div className="text-xs font-semibold text-white leading-tight">{app.name}</div>
              <div className="text-[10px] text-slate-400">Hidden App Container</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Isolated Sandbox</span>
        </div>
      </div>

      {/* App Body */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-sm bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-center shadow-xl">
          <div
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-4"
            style={{ backgroundColor: app.color }}
          >
            {app.name.charAt(0)}
          </div>

          <h3 className="text-lg font-bold text-white">{app.name}</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            {app.description || 'This application is completely hidden from the device launcher and runs exclusively in the Clock Vault.'}
          </p>

          <div className="my-4 p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl text-left space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Status</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <Lock className="w-3 h-3" /> Hidden & Protected
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Category</span>
              <span className="text-slate-200 capitalize">{app.category}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">PIN Access Level</span>
              <span className="font-mono text-purple-400">Level 4 Biometric/PIN</span>
            </div>
          </div>

          {app.id === 'app-crypto' && (
            <div className="p-3 bg-pink-950/30 border border-pink-800/40 rounded-xl text-left mb-4">
              <div className="text-[11px] text-pink-300 font-medium">Secured Cold Portfolio</div>
              <div className="text-xl font-bold font-mono text-white mt-1">{balance}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">≈ $168,920.00 USD</div>
            </div>
          )}

          {app.id === 'app-dating' && (
            <div className="p-3 bg-red-950/30 border border-red-800/40 rounded-xl text-left mb-4">
              <div className="text-[11px] text-red-300 font-medium">Secret Profile Active</div>
              <div className="text-xs text-slate-200 mt-1">Discreet notifications routed through Clock alerts only.</div>
            </div>
          )}

          {app.customUrl && (
            <button
              onClick={() => window.open(app.customUrl, '_blank', 'noopener,noreferrer')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all mb-2"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Launch External Web URL</span>
            </button>
          )}

          <button
            onClick={onBack}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 text-xs font-medium transition-colors"
          >
            Return to Clock Vault
          </button>
        </div>
      </div>
    </div>
  );
};
