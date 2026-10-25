import React, { useState, useRef, useEffect } from 'react';
import { AppItem, VaultSettings, IntruderAttempt } from '../types';
import { storage, SEED_INTRUDER_LOGS } from '../utils/storage';
import { playSound, triggerHaptic } from '../utils/sound';
import { IntruderLogChart } from './IntruderLogChart';
import {
  Clock as ClockIcon,
  Shield,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Plus,
  Search,
  Settings,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Smartphone,
  ExternalLink,
  Sliders,
  Check,
  ShieldCheck,
  KeyRound,
  History,
  Info,
  Layers,
  Image,
  FileText,
  MessageSquare,
  Globe,
  Coins,
  Heart,
  Camera,
  MessageCircle,
  Headphones,
  Navigation,
  Landmark,
  Upload,
  RotateCcw,
  CheckCircle2,
  Download,
  Copy,
  Share2,
} from 'lucide-react';

interface Props {
  apps: AppItem[];
  onUpdateApps: (apps: AppItem[]) => void;
  settings: VaultSettings;
  onUpdateSettings: (settings: VaultSettings) => void;
  onLockVault: () => void;
  onLaunchApp: (app: AppItem) => void;
  onOpenPhoneView?: () => void;
}

export const VaultDashboard: React.FC<Props> = ({
  apps,
  onUpdateApps,
  settings,
  onUpdateSettings,
  onLockVault,
  onLaunchApp,
  onOpenPhoneView,
}) => {
  const [activeTab, setActiveTab] = useState<'apps' | 'security' | 'logs' | 'install'>('apps');
  const [filterMode, setFilterMode] = useState<'all' | 'hidden' | 'visible'>('all');
  const [search, setSearch] = useState('');

  // PWA & APK install state
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallPwa = async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredInstallPrompt(null);
      }
    }
  };

  const handleCopyAppUrl = () => {
    navigator.clipboard.writeText(window.location.origin);
    setIsCopied(true);
    playSound.keyPress();
    triggerHaptic(15);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Add App Modal
  const [isAddingApp, setIsAddingApp] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppCategory, setNewAppCategory] = useState<AppItem['category']>('social');
  const [newAppColor, setNewAppColor] = useState('#8B5CF6');
  const [newAppDesc, setNewAppDesc] = useState('');
  const [newAppUrl, setNewAppUrl] = useState('');

  // PIN Change State
  const [oldPinInput, setOldPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Disguise Name & Custom Icon from Gallery
  const [disguiseNameInput, setDisguiseNameInput] = useState(settings.disguiseName);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const vaultPhotos = storage.getPhotos();

  const handleIconImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const updated = { ...settings, customIconUrl: dataUrl };
      onUpdateSettings(updated);
      storage.setSettings(updated);
      playSound.keyPress();
      triggerHaptic(15);
      if (iconInputRef.current) iconInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleSelectFromVaultGallery = (photoUrl: string) => {
    const updated = { ...settings, customIconUrl: photoUrl };
    onUpdateSettings(updated);
    storage.setSettings(updated);
    playSound.keyPress();
    triggerHaptic(15);
  };

  const handleResetToDefaultIcon = () => {
    const updated = { ...settings, customIconUrl: undefined };
    onUpdateSettings(updated);
    storage.setSettings(updated);
    playSound.keyPress();
    triggerHaptic(10);
  };

  // Toggle app visibility (hide from home screen / reveal)
  const handleToggleHideApp = (appId: string) => {
    const updated = apps.map(app => {
      if (app.id === appId) {
        return { ...app, isHidden: !app.isHidden };
      }
      return app;
    });
    onUpdateApps(updated);
    storage.setApps(updated);
    playSound.keyPress();
    triggerHaptic(15);
  };

  // Add custom app
  const handleCreateCustomApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim()) return;

    const newApp: AppItem = {
      id: `app-custom-${Date.now()}`,
      name: newAppName.trim(),
      iconName: 'Sparkles',
      color: newAppColor,
      category: newAppCategory,
      isHidden: true, // Hidden by default in vault
      isBuiltInTool: 'custom',
      description: newAppDesc.trim() || 'Custom private app',
      customUrl: newAppUrl.trim() || undefined,
    };

    const updated = [newApp, ...apps];
    onUpdateApps(updated);
    storage.setApps(updated);
    setIsAddingApp(false);
    setNewAppName('');
    setNewAppDesc('');
    setNewAppUrl('');
    playSound.vaultUnlock();
    triggerHaptic([30, 50]);
  };

  // Simulate failed PIN attempt to test real-time chart frequency
  const handleSimulateAttempt = () => {
    const now = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const fakePins = ['4444', '1111', '8888', '7777', '9999'];
    const randomPin = fakePins[Math.floor(Math.random() * fakePins.length)];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newLog: IntruderAttempt = {
      id: `attempt-${Date.now()}`,
      timestamp: `Today, ${timeStr}`,
      date: now.toISOString().split('T')[0],
      time: timeStr,
      hour: now.getHours(),
      dayName: days[now.getDay()],
      enteredPin: randomPin,
      success: false,
    };
    const updated = {
      ...settings,
      intruderLogs: [newLog, ...settings.intruderLogs].slice(0, 30),
    };
    onUpdateSettings(updated);
    storage.setSettings(updated);
    playSound.error();
    triggerHaptic([30, 60]);
  };

  const handleResetSeedLogs = () => {
    const updated = {
      ...settings,
      intruderLogs: SEED_INTRUDER_LOGS,
    };
    onUpdateSettings(updated);
    storage.setSettings(updated);
    playSound.keyPress();
  };

  // Save new PIN
  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (oldPinInput !== settings.pin) {
      setPinChangeMsg({ text: 'Current PIN is incorrect', type: 'error' });
      playSound.error();
      return;
    }
    if (newPinInput.length < 4) {
      setPinChangeMsg({ text: 'PIN must be at least 4 digits', type: 'error' });
      playSound.error();
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setPinChangeMsg({ text: 'New PINs do not match', type: 'error' });
      playSound.error();
      return;
    }

    const updated = { ...settings, pin: newPinInput };
    onUpdateSettings(updated);
    storage.setSettings(updated);
    setPinChangeMsg({ text: 'Master PIN successfully updated!', type: 'success' });
    setOldPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
    playSound.vaultUnlock();
  };

  // Filter apps
  const filteredApps = apps.filter(app => {
    const matchesSearch =
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.category.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filterMode === 'hidden') return app.isHidden;
    if (filterMode === 'visible') return !app.isHidden;
    return true;
  });

  const hiddenCount = apps.filter(a => a.isHidden).length;
  const visibleCount = apps.filter(a => !a.isHidden).length;

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Image':
        return <Image className="w-5 h-5" />;
      case 'FileText':
        return <FileText className="w-5 h-5" />;
      case 'MessageSquare':
        return <MessageSquare className="w-5 h-5" />;
      case 'Globe':
        return <Globe className="w-5 h-5" />;
      case 'Coins':
        return <Coins className="w-5 h-5" />;
      case 'Heart':
        return <Heart className="w-5 h-5" />;
      case 'Camera':
        return <Camera className="w-5 h-5" />;
      case 'MessageCircle':
        return <MessageCircle className="w-5 h-5" />;
      case 'Headphones':
        return <Headphones className="w-5 h-5" />;
      case 'Navigation':
        return <Navigation className="w-5 h-5" />;
      case 'Landmark':
        return <Landmark className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none">
      {/* Top Vault Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
              <span>ChronoVault</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-300 font-mono">
                SECURE
              </span>
            </h2>
            <p className="text-[10px] text-slate-400">Hidden App Management Space</p>
          </div>
        </div>

        {/* Quick Actions: Lock / Panic */}
        <div className="flex items-center gap-2">
          {onOpenPhoneView && (
            <button
              onClick={onOpenPhoneView}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/60 transition-colors"
              title="Test Home Screen Launcher to see hidden icons vanish"
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">View Launcher</span>
            </button>
          )}

          <button
            onClick={onLockVault}
            className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-red-600/90 hover:bg-red-500 text-white shadow-sm transition-all active:scale-95"
            title="Instant Panic Lock: Return to Clock disguise"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center border-b border-slate-800/80 bg-slate-900/60 px-3">
        <button
          onClick={() => setActiveTab('apps')}
          className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'apps'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Hidden Apps ({hiddenCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'security'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>PIN & Disguise</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'logs'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Security Logs ({settings.intruderLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('install')}
          className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'install'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Android APK</span>
        </button>
      </div>

      {/* Tab 1: Apps Management */}
      {activeTab === 'apps' && (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {/* Explanation Banner */}
          <div className="p-3 bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-900/30 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <span className="font-semibold text-white">App Hider Active:</span>
                <span className="text-slate-300 ml-1">
                  Apps with <span className="text-purple-300 font-semibold">Hidden</span> switch are
                  removed from the device Home Screen and only accessible inside this Clock Vault.
                </span>
              </div>
            </div>
          </div>

          {/* Controls: Search, Filter Tabs, Add App */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search apps or categories..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Filter segmented buttons */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors ${
                  filterMode === 'all'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({apps.length})
              </button>
              <button
                onClick={() => setFilterMode('hidden')}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors ${
                  filterMode === 'hidden'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Hidden ({hiddenCount})
              </button>
              <button
                onClick={() => setFilterMode('visible')}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors ${
                  filterMode === 'visible'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                On Phone ({visibleCount})
              </button>
            </div>

            {/* Add Custom App button */}
            <button
              onClick={() => setIsAddingApp(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-sm active:scale-95 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Hide New App</span>
            </button>
          </div>

          {/* Add App Modal Dialog */}
          {isAddingApp && (
            <form
              onSubmit={handleCreateCustomApp}
              className="p-4 bg-slate-900 border border-purple-500/50 rounded-2xl space-y-3 animate-in fade-in"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Add Custom App to Hide
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingApp(false)}
                  className="text-slate-500 hover:text-slate-300 text-xs"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400">App Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Signal Secret, Trading, Diary"
                    value={newAppName}
                    onChange={e => setNewAppName(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400">Category</label>
                  <select
                    value={newAppCategory}
                    onChange={e => setNewAppCategory(e.target.value as AppItem['category'])}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="social">Social</option>
                    <option value="finance">Finance / Crypto</option>
                    <option value="dating">Dating</option>
                    <option value="messaging">Messaging</option>
                    <option value="tools">Tools / Utility</option>
                    <option value="entertainment">Entertainment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400">Optional Web App URL</label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={newAppUrl}
                  onChange={e => setNewAppUrl(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">App Tile Color:</span>
                  {['#8B5CF6', '#EC4899', '#EF4444', '#10B981', '#3B82F6', '#F59E0B'].map(
                    color => (
                      <button
                        type="button"
                        key={color}
                        onClick={() => setNewAppColor(color)}
                        className={`w-5 h-5 rounded-full transition-transform ${
                          newAppColor === color ? 'scale-125 ring-2 ring-white' : 'opacity-70'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    )
                  )}
                </div>

                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md transition-all active:scale-95"
                >
                  Create & Hide App
                </button>
              </div>
            </form>
          )}

          {/* Apps List */}
          <div className="space-y-2 mt-1">
            {filteredApps.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <p className="text-sm">No applications found matching your filter</p>
              </div>
            ) : (
              filteredApps.map(app => (
                <div
                  key={app.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    app.isHidden
                      ? 'bg-purple-950/20 border-purple-900/50 hover:border-purple-700/60'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Left: Icon & Title */}
                  <div
                    onClick={() => onLaunchApp(app)}
                    className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
                      style={{ backgroundColor: app.color }}
                    >
                      {renderIcon(app.iconName)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-white truncate">{app.name}</h4>
                        {app.isHidden ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                            <EyeOff className="w-3 h-3" />
                            <span>Hidden in Vault Only</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>Visible on Phone</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {app.description || `${app.category} application`}
                      </p>
                    </div>
                  </div>

                  {/* Right: Launch Button & Hide Toggle */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onLaunchApp(app)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1"
                      title="Open inside Vault"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {/* Toggle Switch */}
                    <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
                      <span className="text-[10px] text-slate-400 hidden sm:inline">
                        {app.isHidden ? 'Hidden' : 'Visible'}
                      </span>
                      <button
                        onClick={() => handleToggleHideApp(app.id)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          app.isHidden ? 'bg-purple-600' : 'bg-slate-700'
                        }`}
                        title={app.isHidden ? 'App is hidden from launcher' : 'App is visible on launcher'}
                      >
                        <div
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform flex items-center justify-center ${
                            app.isHidden ? 'translate-x-6 text-purple-600' : 'translate-x-0 text-slate-600'
                          }`}
                        >
                          {app.isHidden ? (
                            <EyeOff className="w-3 h-3" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Security & PIN Settings */}
      {activeTab === 'security' && (
        <div className="flex-1 overflow-y-auto p-4 max-w-md mx-auto w-full space-y-5">
          {/* Master PIN Change Form */}
          <form
            onSubmit={handleChangePin}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg"
          >
            <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-2">
              <KeyRound className="w-4 h-4 text-purple-400" />
              <span>Change Master PIN</span>
            </div>

            {pinChangeMsg && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  pinChangeMsg.type === 'success'
                    ? 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-300'
                    : 'bg-red-950/60 border border-red-800/60 text-red-300'
                }`}
              >
                {pinChangeMsg.type === 'success' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                <span>{pinChangeMsg.text}</span>
              </div>
            )}

            <div>
              <label className="text-xs text-slate-400">Current PIN</label>
              <input
                type="password"
                required
                maxLength={8}
                value={oldPinInput}
                onChange={e => setOldPinInput(e.target.value)}
                placeholder="Default: 1234"
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400">New PIN</label>
                <input
                  type="password"
                  required
                  maxLength={8}
                  value={newPinInput}
                  onChange={e => setNewPinInput(e.target.value)}
                  placeholder="e.g. 5678"
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400">Confirm PIN</label>
                <input
                  type="password"
                  required
                  maxLength={8}
                  value={confirmPinInput}
                  onChange={e => setConfirmPinInput(e.target.value)}
                  placeholder="Repeat new PIN"
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all active:scale-95 shadow-md mt-2"
            >
              Update Security PIN
            </button>
          </form>

          {/* Decoy Emergency PIN */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Decoy PIN (Coercion Protection)</span>
              </span>
              <span className="text-xs font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/40">
                {settings.decoyPin || '0000'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Entering this secondary PIN unlocks a harmless, dummy empty clock settings screen so
              onlookers never realize your true vault exists.
            </p>
          </div>

          {/* App Camouflage Icon & Gallery Customizer */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-purple-400" />
                <span>App Icon & Disguise Settings</span>
              </span>
              {settings.customIconUrl && (
                <button
                  type="button"
                  onClick={handleResetToDefaultIcon}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset to Default</span>
                </button>
              )}
            </div>

            {/* Current Icon Live Preview on Device */}
            <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl flex items-center gap-3">
              <div className="relative w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-md flex items-center justify-center text-amber-400 overflow-hidden shrink-0">
                {settings.customIconUrl ? (
                  <img
                    src={settings.customIconUrl}
                    alt="Active Icon"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <ClockIcon className="w-7 h-7" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white truncate">
                    {settings.disguiseName || 'Clock'}
                  </span>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40">
                    Live Icon
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {settings.customIconUrl
                    ? 'Using custom image from gallery'
                    : 'Using default vector clock icon'}
                </p>
              </div>
            </div>

            {/* Primary Action: Upload from Personal Gallery */}
            <div>
              <div className="text-xs font-semibold text-slate-300 mb-1.5">
                Change Icon from Gallery
              </div>
              <input
                type="file"
                ref={iconInputRef}
                onChange={handleIconImageUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => iconInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-md active:scale-98"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Image from Device Gallery</span>
              </button>
            </div>

            {/* Option 2: Pick from Vault Gallery Photos */}
            {vaultPhotos.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Pick from Vault Gallery</span>
                  <span className="text-[10px] text-slate-500 font-mono">{vaultPhotos.length} photos</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {vaultPhotos.slice(0, 4).map(photo => {
                    const isSelected = settings.customIconUrl === photo.dataUrl;
                    return (
                      <button
                        type="button"
                        key={photo.id}
                        onClick={() => handleSelectFromVaultGallery(photo.dataUrl)}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                          isSelected
                            ? 'border-purple-500 ring-2 ring-purple-500/30 scale-95'
                            : 'border-slate-800 hover:border-slate-600 opacity-80 hover:opacity-100'
                        }`}
                        title={photo.title}
                      >
                        <img
                          src={photo.dataUrl}
                          alt={photo.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-purple-600/30 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-white fill-purple-600" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Option 3: Curated Camouflage Icon Presets */}
            <div>
              <div className="text-xs font-semibold text-slate-300 mb-1.5">
                Or Choose Camouflage Preset
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[
                  {
                    name: 'Gold Chrono',
                    url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=150&auto=format&fit=crop&q=80',
                  },
                  {
                    name: 'Minimalist',
                    url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=150&auto=format&fit=crop&q=80',
                  },
                  {
                    name: 'Pocket Watch',
                    url: 'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=150&auto=format&fit=crop&q=80',
                  },
                  {
                    name: 'Calculator',
                    url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=150&auto=format&fit=crop&q=80',
                  },
                  {
                    name: 'Weather',
                    url: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=150&auto=format&fit=crop&q=80',
                  },
                ].map(preset => {
                  const isSelected = settings.customIconUrl === preset.url;
                  return (
                    <button
                      type="button"
                      key={preset.name}
                      onClick={() => handleSelectFromVaultGallery(preset.url)}
                      className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        isSelected
                          ? 'border-purple-500 ring-2 ring-purple-500/30 scale-95'
                          : 'border-slate-800 hover:border-slate-600 opacity-80 hover:opacity-100'
                      }`}
                      title={preset.name}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-purple-600/30 flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5 text-white fill-purple-600" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Disguise App Name / Label */}
            <div className="pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                App Label on Home Screen
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Clock', 'Time OS', 'World Time', 'Stopwatch', 'Calculator'].map(name => (
                  <button
                    type="button"
                    key={name}
                    onClick={() => {
                      const updated = { ...settings, disguiseName: name };
                      onUpdateSettings(updated);
                      storage.setSettings(updated);
                      playSound.keyPress();
                    }}
                    className={`py-1.5 px-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      settings.disguiseName === name
                        ? 'bg-purple-600 border-purple-400 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Security & Intruder Logs with Recharts Chart */}
      {activeTab === 'logs' && (
        <div className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-purple-400" />
                <span>Security & Intruder Intelligence</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Frequency analysis of unauthorized PIN unlock attempts
              </p>
            </div>
            <div className="flex items-center gap-2">
              {settings.intruderLogs.length === 0 ? (
                <button
                  onClick={handleResetSeedLogs}
                  className="text-[11px] text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  Load Sample Data
                </button>
              ) : (
                <button
                  onClick={() => {
                    const updated = { ...settings, intruderLogs: [] };
                    onUpdateSettings(updated);
                    storage.setSettings(updated);
                    playSound.keyPress();
                  }}
                  className="text-[11px] text-slate-400 hover:text-red-400 transition-colors"
                >
                  Clear History
                </button>
              )}
            </div>
          </div>

          {/* Recharts Timeline Visualization */}
          <IntruderLogChart
            logs={settings.intruderLogs}
            onSimulateAttempt={handleSimulateAttempt}
          />

          {/* Detailed Incident Event Log */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
              <span>Incident Event Log</span>
              <span className="font-mono text-[11px]">{settings.intruderLogs.length} events</span>
            </div>

            {settings.intruderLogs.length === 0 ? (
              <div className="py-8 text-center text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
                <ShieldCheck className="w-7 h-7 text-emerald-400 mx-auto mb-1.5 opacity-80" />
                <p className="text-xs font-medium text-slate-300">No Failed Unlock Attempts</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tap 'Simulate Failed PIN' above or enter an incorrect PIN on the clock.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {settings.intruderLogs.map(log => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-200">Failed PIN Entry</div>
                        <div className="text-[10px] text-slate-400">{log.timestamp}</div>
                      </div>
                    </div>
                    <div className="font-mono text-slate-400 text-right">
                      <span className="text-[10px] text-slate-500 block">Input code</span>
                      <span className="text-red-400 font-semibold tracking-wider">••••</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Android APK & Installation Center */}
      {activeTab === 'install' && (
        <div className="flex-1 overflow-y-auto p-4 max-w-xl mx-auto w-full space-y-4">
          {/* Header Card */}
          <div className="p-4 bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border border-purple-900/40 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Android Installation & APK Package
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Install ChronoVault directly onto your Android device as a standalone disguised Clock.
                </p>
              </div>
            </div>

            {/* Direct APK Download Button */}
            <div className="mt-4 pt-4 border-t border-purple-900/30 flex flex-col sm:flex-row items-center gap-3">
              <a
                href="/chronovault.apk"
                download="chronovault.apk"
                className="w-full flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold text-sm text-white shadow-lg shadow-purple-900/30 transition-all active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>Download ChronoVault.apk (7.2 MB)</span>
              </a>

              {deferredInstallPrompt && (
                <button
                  onClick={handleInstallPwa}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 font-medium text-xs text-slate-200 border border-slate-700 transition-all"
                >
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>1-Tap PWA Install</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Direct Download Ready
              </span>
              <span>·</span>
              <span>Android 8.0 - 15+</span>
              <span>·</span>
              <span>Offline Standalone</span>
            </div>
          </div>

          {/* Sideloading Instructions */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Download className="w-3.5 h-3.5 text-purple-400" />
              <span>How to Install the Standalone APK (.apk)</span>
            </h4>

            <ol className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-950 border border-purple-800 text-purple-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Tap <strong>Download ChronoVault.apk</strong> above to save the package to your Android device.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-950 border border-purple-800 text-purple-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Open the downloaded file from your browser notification bar or via the <strong>Files / Downloads</strong> app.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-950 border border-purple-800 text-purple-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  If prompted with <em>"For security, your phone is not allowed to install unknown apps"</em>, tap <strong>Settings</strong> and switch on <strong>Allow from this source</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-950 border border-purple-800 text-purple-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  4
                </span>
                <span>
                  Tap <strong>Install</strong>. ChronoVault will be installed onto your home screen and app drawer disguised as an authentic system Clock!
                </span>
              </li>
            </ol>
          </div>

          {/* WebAPK / Chrome 1-Tap Option */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Alternative: Android Chrome WebAPK (Zero Warnings)</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              You can also install this web app directly into your Android OS using Chrome's WebAPK minting service. This generates an official Android app package signed by Google on your device with no unknown-sources warning:
            </p>
            <ol className="space-y-1.5 text-xs text-slate-300 list-decimal list-inside pl-1">
              <li>Open this page in <strong>Google Chrome</strong> or <strong>Samsung Internet</strong> on your phone.</li>
              <li>Tap the three dots menu (<strong>⋮</strong>) in the top-right corner.</li>
              <li>Select <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>
              <li>Android will compile and install the Clock app into your native app list!</li>
            </ol>
          </div>

          {/* Quick Share Link */}
          <div className="p-3.5 bg-slate-900/40 border border-slate-800/80 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="min-w-0">
              <span className="text-[11px] text-slate-400 block">Open on Android Device</span>
              <span className="font-mono text-white text-xs truncate block">{window.location.origin}</span>
            </div>
            <button
              onClick={handleCopyAppUrl}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center gap-1.5 shrink-0 transition-colors"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy URL</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
