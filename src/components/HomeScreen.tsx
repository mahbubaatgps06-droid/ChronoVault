import React from 'react';
import { AppItem, VaultSettings } from '../types';
import {
  Clock as ClockIcon,
  Wifi,
  Battery,
  Signal,
  Search,
  MessageCircle,
  Phone,
  Camera,
  Globe,
  Sliders,
  Image,
  FileText,
  MessageSquare,
  Coins,
  Heart,
  Headphones,
  Navigation,
  Landmark,
  Sparkles,
} from 'lucide-react';
import { playSound, triggerHaptic } from '../utils/sound';

interface Props {
  apps: AppItem[];
  settings: VaultSettings;
  onOpenClockApp: () => void;
  onOpenAppDirectly: (app: AppItem) => void;
}

export const HomeScreen: React.FC<Props> = ({
  apps,
  settings,
  onOpenClockApp,
  onOpenAppDirectly,
}) => {
  // Only apps where isHidden is false are visible on the Home Screen!
  const visibleApps = apps.filter(app => !app.isHidden);

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Image':
        return <Image className="w-6 h-6" />;
      case 'FileText':
        return <FileText className="w-6 h-6" />;
      case 'MessageSquare':
        return <MessageSquare className="w-6 h-6" />;
      case 'Globe':
        return <Globe className="w-6 h-6" />;
      case 'Coins':
        return <Coins className="w-6 h-6" />;
      case 'Heart':
        return <Heart className="w-6 h-6" />;
      case 'Camera':
        return <Camera className="w-6 h-6" />;
      case 'MessageCircle':
        return <MessageCircle className="w-6 h-6" />;
      case 'Headphones':
        return <Headphones className="w-6 h-6" />;
      case 'Navigation':
        return <Navigation className="w-6 h-6" />;
      case 'Landmark':
        return <Landmark className="w-6 h-6" />;
      default:
        return <Sparkles className="w-6 h-6" />;
    }
  };

  const handleAppClick = (app: AppItem) => {
    playSound.keyPress();
    triggerHaptic(15);
    onOpenAppDirectly(app);
  };

  return (
    <div className="relative flex flex-col h-full bg-slate-950 text-white select-none overflow-hidden">
      {/* Dynamic Device Wallpaper Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),rgba(255,255,255,0))] pointer-events-none" />

      {/* Status Bar */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-3 pb-2 text-xs font-semibold text-slate-300">
        <span className="font-mono">09:41</span>
        <div className="flex items-center gap-2">
          <Signal className="w-3.5 h-3.5" />
          <Wifi className="w-3.5 h-3.5" />
          <div className="flex items-center gap-1 font-mono text-[10px]">
            <span>98%</span>
            <Battery className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Time & Weather Widget */}
      <div className="relative z-10 my-5 text-center">
        <div className="text-5xl font-mono font-light tracking-tight text-white drop-shadow-md">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="text-xs text-slate-300 mt-1 font-medium drop-shadow">
          {new Date().toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      {/* App Grid on Home Screen */}
      <div className="relative z-10 flex-1 px-5 overflow-y-auto">
        <div className="grid grid-cols-4 gap-y-6 gap-x-3 text-center py-2">
          {/* THE CLOCK DISGUISE APP (Always on home screen) */}
          <div
            onClick={() => {
              playSound.keyPress();
              triggerHaptic(15);
              onOpenClockApp();
            }}
            className="group flex flex-col items-center cursor-pointer transition-transform active:scale-90"
          >
            <div className="relative w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-xl flex items-center justify-center text-amber-400 group-hover:border-amber-400/60 transition-all overflow-hidden">
              {settings.customIconUrl ? (
                <img
                  src={settings.customIconUrl}
                  alt={settings.disguiseName || 'App'}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <ClockIcon className="w-7 h-7" />
              )}
            </div>
            <span className="text-[11px] font-medium text-slate-200 mt-1.5 truncate max-w-full drop-shadow">
              {settings.disguiseName || 'Clock'}
            </span>
          </div>

          {/* Visible apps on the Home Screen */}
          {visibleApps.map(app => (
            <div
              key={app.id}
              onClick={() => handleAppClick(app)}
              className="group flex flex-col items-center cursor-pointer transition-transform active:scale-90"
            >
              <div
                className="w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center text-white border border-white/10 group-hover:scale-105 transition-all"
                style={{ backgroundColor: app.color }}
              >
                {renderIcon(app.iconName)}
              </div>
              <span className="text-[11px] font-medium text-slate-200 mt-1.5 truncate max-w-full drop-shadow">
                {app.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Dock Bar at bottom of screen */}
      <div className="relative z-10 px-4 pb-6 pt-2">
        <div className="h-20 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/15 px-4 flex items-center justify-around shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg cursor-pointer hover:scale-105 transition-transform">
            <Phone className="w-6 h-6" />
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg cursor-pointer hover:scale-105 transition-transform">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-white shadow-lg cursor-pointer hover:scale-105 transition-transform">
            <Globe className="w-6 h-6" />
          </div>
          <div
            onClick={onOpenClockApp}
            className="w-12 h-12 rounded-2xl bg-amber-500/90 flex items-center justify-center text-white shadow-lg cursor-pointer hover:scale-105 transition-transform overflow-hidden"
          >
            {settings.customIconUrl ? (
              <img
                src={settings.customIconUrl}
                alt={settings.disguiseName || 'App'}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <ClockIcon className="w-6 h-6" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
