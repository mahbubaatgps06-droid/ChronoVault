import React, { useState, useEffect } from 'react';
import { AppItem, VaultSettings, IntruderAttempt } from './types';
import { storage } from './utils/storage';
import { playSound, triggerHaptic } from './utils/sound';
import { HomeScreen } from './components/HomeScreen';
import { ClockApp } from './components/ClockApp';
import { VaultDashboard } from './components/VaultDashboard';
import { PinPadModal } from './components/PinPadModal';
import { DecoyScreen } from './components/DecoyScreen';
import { PhotoVaultApp } from './components/apps/PhotoVaultApp';
import { NotesVaultApp } from './components/apps/NotesVaultApp';
import { BrowserVaultApp } from './components/apps/BrowserVaultApp';
import { ChatVaultApp } from './components/apps/ChatVaultApp';
import { CustomAppViewer } from './components/apps/CustomAppViewer';
import {
  Clock as ClockIcon,
  Shield,
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  KeyRound,
  Smartphone,
  Maximize2,
  Minimize2,
  Sparkles,
  HelpCircle,
  AlertOctagon,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';

export default function App() {
  // Application Data States
  const [apps, setApps] = useState<AppItem[]>(() => storage.getApps());
  const [settings, setSettings] = useState<VaultSettings>(() => storage.getSettings());

  // Active View State:
  // 'launcher': Simulated phone home screen
  // 'clock': Camouflage Clock app
  // 'vault': Unlocked ChronoVault dashboard
  // 'decoy': Decoy settings screen
  // Active View State: defaults to 'launcher' (Phone Home Screen)
  const [viewMode, setViewMode] = useState<'launcher' | 'clock' | 'vault' | 'decoy' | 'app-detail'>('launcher');

  // Currently opened app inside the vault
  const [openedApp, setOpenedApp] = useState<AppItem | null>(null);

  // PIN Pad Modal State
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // Desktop view switch: 'split' (Simulator + Inspector) vs 'phone-only'
  const [deviceOnlyMode, setDeviceOnlyMode] = useState(false);

  // Panic lock shortcut with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (viewMode === 'vault' || viewMode === 'app-detail') {
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

  const handleToggleHideApp = (appId: string) => {
    const updated = apps.map(app => {
      if (app.id === appId) {
        return { ...app, isHidden: !app.isHidden };
      }
      return app;
    });
    setApps(updated);
    storage.setApps(updated);
    playSound.keyPress();
    triggerHaptic(15);
  };

  const hiddenCount = apps.filter(a => a.isHidden).length;
  const visibleCount = apps.filter(a => !a.isHidden).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Contract (Single-row, 3-zone, clean unboxed branding) */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 flex items-center justify-between gap-8 z-30 shrink-0">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 overflow-hidden">
            {settings.customIconUrl ? (
              <img
                src={settings.customIconUrl}
                alt="App Icon"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <ClockIcon className="w-4 h-4" />
            )}
          </div>
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0">
            ChronoVault
          </span>
          <span className="text-xs text-slate-400 hidden md:inline">
            Stealth Clock & App Hider
          </span>
        </div>

        {/* Zone 2: Informational Mode Indicators (Non-clickable to ensure only icon entry) */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-400">
          <span className={viewMode === 'launcher' ? 'text-white font-semibold' : 'text-slate-400'}>
            1. Phone Launcher
          </span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span className={viewMode === 'clock' ? 'text-amber-400 font-semibold' : 'text-slate-400'}>
            2. Clock Camouflage
          </span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span className={viewMode === 'vault' ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
            3. Encrypted Vault
          </span>
        </nav>

        {/* Zone 3: Primary Action / Mode Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          {(viewMode === 'vault' || viewMode === 'app-detail') && (
            <button
              onClick={handlePanicLock}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-500 text-white font-semibold text-xs transition-all shadow-sm active:scale-95"
              title="Panic button: instantly returns to running Clock"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Panic Lock</span>
            </button>
          )}

          <button
            onClick={() => setDeviceOnlyMode(!deviceOnlyMode)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/80 text-xs font-medium transition-colors"
            title="Toggle between Split Inspector and Phone Frame focus"
          >
            {deviceOnlyMode ? (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">Show Side Inspector</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Phone Only View</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto p-4 md:p-6 flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-8 overflow-hidden">
        {/* LEFT / CENTER: The Interactive Smartphone Device Frame */}
        <div className="w-full max-w-[400px] flex flex-col items-center shrink-0">
          {/* Static Device Status Header (Zero switch view buttons) */}
          <div className="w-full flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-medium text-slate-400">
              Interactive Smartphone
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {viewMode === 'launcher' ? 'Home Screen' : viewMode === 'clock' ? 'Clock Active' : 'Vault Active'}
            </span>
          </div>

          {/* Physical Phone Frame */}
          <div className="relative w-full aspect-[9/18.5] max-h-[780px] bg-black rounded-[48px] p-3 shadow-2xl border-4 border-slate-800 ring-1 ring-slate-700/50 flex flex-col overflow-hidden">
            {/* Dynamic Island / Camera Notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-50 flex items-center justify-center pointer-events-none">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800 mr-2" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-950" />
            </div>

            {/* Inner Screen Display */}
            <div className="relative w-full h-full rounded-[38px] overflow-hidden bg-slate-950 flex flex-col">
              {/* Screen Router */}
              {viewMode === 'launcher' && (
                <HomeScreen
                  apps={apps}
                  settings={settings}
                  onOpenClockApp={() => {
                    setViewMode('clock');
                  }}
                  onOpenAppDirectly={app => {
                    // Clicking an app on home screen
                    if (app.isBuiltInTool) {
                      handleLaunchAppInVault(app);
                    }
                  }}
                />
              )}

              {viewMode === 'clock' && (
                <ClockApp
                  settings={settings}
                  onOpenPinPad={() => setIsPinModalOpen(true)}
                  onExitToLauncher={() => setViewMode('launcher')}
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

              {viewMode === 'app-detail' && openedApp && (
                <div className="flex-1 h-full">
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
            </div>

            {/* Physical Home Indicator Bar (Exit-only, cannot be used to open app) */}
            <div
              onClick={() => {
                if (viewMode === 'vault' || viewMode === 'app-detail') {
                  playSound.lockClick();
                  handlePanicLock();
                } else if (viewMode === 'clock') {
                  playSound.keyPress();
                  setViewMode('launcher');
                }
                // When on launcher, clicking home bar does nothing! App can only be opened from icon.
              }}
              className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full transition-colors z-50 ${
                viewMode === 'launcher'
                  ? 'bg-slate-600/30'
                  : 'bg-slate-400/80 hover:bg-white cursor-pointer'
              }`}
              title={viewMode !== 'launcher' ? 'Exit to Home Screen' : undefined}
            />
          </div>

          <div className="mt-2 text-center text-[11px] text-slate-500">
            {viewMode === 'launcher' ? (
              <span>Tap the Clock icon on the phone screen to open the app</span>
            ) : (
              <span>Tap the home bar at the bottom of the phone to exit to Home Screen</span>
            )}
          </div>
        </div>

        {/* RIGHT: Security & Feature Inspector (Displays the mechanics & real-time sync) */}
        {!deviceOnlyMode && (
          <div className="flex-1 flex flex-col justify-between max-w-2xl overflow-y-auto space-y-6">
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 text-xs text-purple-400 font-semibold tracking-wide uppercase">
                <ShieldCheck className="w-4 h-4" />
                <span>Stealth System Architecture</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
                Clock Camouflage & App Hider Engine
              </h1>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                To any external observer or phone inspector, this application appears and functions
                as an authentic Clock with a live ticking face, alarms, stopwatch, and timer.
                Behind its secret trigger lies an encrypted vault that conceals target apps from the
                device home screen, rendering them accessible exclusively with your secure PIN.
              </p>
            </div>

            {/* Live App Visibility Matrix */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-bold text-white">
                    Live App Concealment Matrix
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-purple-400 font-medium">
                    {hiddenCount} Hidden in Vault
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-400">{visibleCount} On Phone</span>
                </div>
              </div>

              <div className="text-xs text-slate-400 mb-3">
                Toggle any switch below or in the simulator to see the app immediately vanish from
                or reappear on the Phone Home Screen:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                {apps.map(app => (
                  <div
                    key={app.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                      app.isHidden
                        ? 'bg-purple-950/25 border-purple-900/60'
                        : 'bg-slate-950/60 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                        style={{ backgroundColor: app.color }}
                      >
                        {app.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-white truncate">{app.name}</span>
                    </div>

                    <button
                      onClick={() => handleToggleHideApp(app.id)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                        app.isHidden
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                      title={app.isHidden ? 'Click to make visible on phone' : 'Click to hide in vault'}
                    >
                      {app.isHidden ? (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>Hidden</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>Visible</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* How It Works Explainer Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                  <ClockIcon className="w-4 h-4" />
                  <span>1. Ticking Disguise</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  The clock displays real world time, active alarms, and stopwatch to maintain
                  perfect operational camouflage.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400">
                  <KeyRound className="w-4 h-4" />
                  <span>2. Secret PIN Trigger</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Press down and hold the center pivot of the clock hands for ~1 second to prompt the secure PIN keypad. Default Master PIN is <strong className="text-white font-mono">1234</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-red-400">
                  <AlertOctagon className="w-4 h-4" />
                  <span>3. Panic & Decoy</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Emergency PIN <strong className="text-white font-mono">0000</strong> unlocks a
                  harmless audio equalizer. ESC key triggers instant lock.
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Info className="w-4 h-4 text-blue-400 shrink-0" />
                <span>
                  Camouflage active: Press down on the clock face center crown to unlock the PIN keypad.
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

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
