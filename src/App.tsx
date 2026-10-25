import React, { useState, useEffect } from 'react';
import { AppItem, VaultSettings, IntruderAttempt } from './types';
import { storage } from './utils/storage';
import { playSound, triggerHaptic } from './utils/sound';
import { ClockApp } from './components/ClockApp';
import { VaultDashboard } from './components/VaultDashboard';
import { PinPadModal } from './components/PinPadModal';
import { DecoyScreen } from './components/DecoyScreen';
import { HomeScreen } from './components/HomeScreen';
import { PhotoVaultApp } from './components/apps/PhotoVaultApp';
import { NotesVaultApp } from './components/apps/NotesVaultApp';
import { BrowserVaultApp } from './components/apps/BrowserVaultApp';
import { ChatVaultApp } from './components/apps/ChatVaultApp';
import { CustomAppViewer } from './components/apps/CustomAppViewer';

export default function App() {
  // Application Data States
  const [apps, setApps] = useState<AppItem[]>(() => storage.getApps());
  const [settings, setSettings] = useState<VaultSettings>(() => storage.getSettings());

  // Active View State:
  // 'clock': Default disguise Clock app
  // 'vault': Unlocked ChronoVault dashboard
  // 'decoy': Harmless Decoy audio equalizer
  // 'app-detail': Working in-vault app
  // 'launcher': Launcher preview from vault
  const [viewMode, setViewMode] = useState<'clock' | 'vault' | 'decoy' | 'app-detail' | 'launcher'>('clock');

  // Currently opened app inside the vault
  const [openedApp, setOpenedApp] = useState<AppItem | null>(null);

  // PIN Pad Modal State
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // Panic lock shortcut with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (viewMode === 'vault' || viewMode === 'app-detail' || viewMode === 'launcher') {
          handlePanicLock();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode]);

  const handlePanicLock = () => {
    playSound.lockClick();
    triggerHaptic([30, 60]);
    setIsPinModalOpen(false);
    setOpenedApp(null);
    setViewMode('clock'); // Immediately snaps back to the innocent Clock app
  };

  const handlePinSuccess = () => {
    setIsPinModalOpen(false);
    setViewMode('vault');
  };

  const handleDecoySuccess = () => {
    setIsPinModalOpen(false);
    setViewMode('decoy');
  };

  const handleFailedPinAttempt = (enteredPin: string) => {
    const now = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];
    const newLog: IntruderAttempt = {
      id: `attempt-${Date.now()}`,
      timestamp: `Today, ${timeStr}`,
      date: dateStr,
      time: timeStr,
      hour: now.getHours(),
      dayName: days[now.getDay()],
      enteredPin,
      success: false,
    };
    const updated = {
      ...settings,
      intruderLogs: [newLog, ...settings.intruderLogs].slice(0, 30),
    };
    setSettings(updated);
    storage.setSettings(updated);
  };

  const handleLaunchAppInVault = (app: AppItem) => {
    setOpenedApp(app);
    setViewMode('app-detail');
    playSound.keyPress();
  };

  return (
    <div className="w-full h-screen min-h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden select-none font-sans">
      {/* Root App View Router */}
      {viewMode === 'clock' && (
        <ClockApp
          settings={settings}
          onOpenPinPad={() => setIsPinModalOpen(true)}
        />
      )}

      {viewMode === 'vault' && (
        <VaultDashboard
          apps={apps}
          onUpdateApps={setApps}
          settings={settings}
          onUpdateSettings={setSettings}
          onLockVault={handlePanicLock}
          onLaunchApp={handleLaunchAppInVault}
          onOpenPhoneView={() => setViewMode('launcher')}
        />
      )}

      {viewMode === 'decoy' && (
        <DecoyScreen onBackToClock={() => setViewMode('clock')} />
      )}

      {viewMode === 'launcher' && (
        <div className="relative w-full h-full flex flex-col bg-slate-950">
          <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between z-20 shrink-0">
            <span className="text-xs text-slate-300 font-medium">Phone Launcher Preview (Hidden Apps Excluded)</span>
            <button
              onClick={() => setViewMode('vault')}
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition-colors"
            >
              Back to Vault
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <HomeScreen
              apps={apps}
              settings={settings}
              onOpenClockApp={() => setViewMode('clock')}
              onOpenAppDirectly={app => {
                if (app.isBuiltInTool) {
                  handleLaunchAppInVault(app);
                }
              }}
            />
          </div>
        </div>
      )}

      {viewMode === 'app-detail' && openedApp && (
        <div className="w-full h-full flex flex-col">
          {openedApp.isBuiltInTool === 'photos' && (
            <PhotoVaultApp onBack={() => setViewMode('vault')} />
          )}
          {openedApp.isBuiltInTool === 'notes' && (
            <NotesVaultApp onBack={() => setViewMode('vault')} />
          )}
          {openedApp.isBuiltInTool === 'browser' && (
            <BrowserVaultApp onBack={() => setViewMode('vault')} />
          )}
          {openedApp.isBuiltInTool === 'chat' && (
            <ChatVaultApp onBack={() => setViewMode('vault')} />
          )}
          {(!openedApp.isBuiltInTool || openedApp.isBuiltInTool === 'custom') && (
            <CustomAppViewer app={openedApp} onBack={() => setViewMode('vault')} />
          )}
        </div>
      )}

      {/* Secret PIN Pad Modal */}
      <PinPadModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handlePinSuccess}
        onDecoySuccess={handleDecoySuccess}
        settings={settings}
        onFailedAttempt={handleFailedPinAttempt}
      />
    </div>
  );
}
