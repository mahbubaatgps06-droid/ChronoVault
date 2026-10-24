import React, { useState, useEffect, useRef } from 'react';
import { AlarmItem, WorldClockCity, VaultSettings } from '../types';
import { storage } from '../utils/storage';
import { playSound, triggerHaptic } from '../utils/sound';
import {
  Clock as ClockIcon,
  AlarmClock,
  Timer,
  Hourglass,
  Plus,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Flag,
  Globe,
  Lock,
  Volume2,
  Check,
  ChevronRight,
  Shield,
} from 'lucide-react';

interface Props {
  settings: VaultSettings;
  onOpenPinPad: () => void;
  onExitToLauncher?: () => void;
}

const WORLD_CITIES: WorldClockCity[] = [
  { id: 'nyc', city: 'New York', country: 'United States', timezone: 'America/New_York', offsetHours: -4 },
  { id: 'lon', city: 'London', country: 'United Kingdom', timezone: 'Europe/London', offsetHours: 1 },
  { id: 'tok', city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo', offsetHours: 9 },
  { id: 'syd', city: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney', offsetHours: 11 },
  { id: 'par', city: 'Paris', country: 'France', timezone: 'Europe/Paris', offsetHours: 2 },
];

export const ClockApp: React.FC<Props> = ({ settings, onOpenPinPad, onExitToLauncher }) => {
  const [activeTab, setActiveTab] = useState<'clock' | 'alarm' | 'stopwatch' | 'timer'>('clock');

  // Live Current Time
  const [currentTime, setCurrentTime] = useState(new Date());

  // Secret Hold State on clock center
  const [isHoldingCenter, setIsHoldingCenter] = useState(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Alarms
  const [alarms, setAlarms] = useState<AlarmItem[]>(() => storage.getAlarms());
  const [isAddingAlarm, setIsAddingAlarm] = useState(false);
  const [newAlarmTime, setNewAlarmTime] = useState('08:00');
  const [newAlarmLabel, setNewAlarmLabel] = useState('Alarm');

  // Stopwatch state
  const [stopwatchTime, setStopwatchTime] = useState(0); // milliseconds
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const stopwatchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer state
  const [timerDuration, setTimerDuration] = useState(300); // 5 mins in seconds
  const [timerRemaining, setTimerRemaining] = useState(300);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Tick current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Stopwatch ticking
  useEffect(() => {
    if (isStopwatchRunning) {
      const start = Date.now() - stopwatchTime;
      stopwatchIntervalRef.current = setInterval(() => {
        setStopwatchTime(Date.now() - start);
      }, 30);
    } else if (stopwatchIntervalRef.current) {
      clearInterval(stopwatchIntervalRef.current);
    }
    return () => {
      if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
    };
  }, [isStopwatchRunning]);

  // Timer ticking
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current!);
            setIsTimerRunning(false);
            playSound.alarmBeep();
            triggerHaptic([100, 200, 100, 200]);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning]);

  // Press-down handler on clock center to trigger secure PIN pad
  const handleCenterTouchStart = (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    setIsHoldingCenter(true);
    triggerHaptic(15);
    holdTimerRef.current = setTimeout(() => {
      setIsHoldingCenter(false);
      playSound.vaultUnlock();
      triggerHaptic([30, 60]);
      onOpenPinPad();
    }, 750); // 750ms press-down unlocks the secret PIN pad
  };

  const handleCenterTouchEnd = () => {
    setIsHoldingCenter(false);
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  // Toggle alarm
  const handleToggleAlarm = (id: string) => {
    const updated = alarms.map(a => (a.id === id ? { ...a, enabled: !a.enabled } : a));
    setAlarms(updated);
    storage.setAlarms(updated);
    playSound.keyPress();
    triggerHaptic(15);
  };

  // Add alarm
  const handleSaveAlarm = () => {
    if (!newAlarmTime) return;
    const newAlarm: AlarmItem = {
      id: `alarm-${Date.now()}`,
      time: newAlarmTime,
      label: newAlarmLabel || 'Alarm',
      enabled: true,
      repeatDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      sound: 'Radar',
    };
    const updated = [...alarms, newAlarm].sort((a, b) => a.time.localeCompare(b.time));
    setAlarms(updated);
    storage.setAlarms(updated);
    setIsAddingAlarm(false);
    playSound.keyPress();
  };

  const handleDeleteAlarm = (id: string) => {
    const updated = alarms.filter(a => a.id !== id);
    setAlarms(updated);
    storage.setAlarms(updated);
    playSound.lockClick();
  };

  // Format stopwatch
  const formatStopwatch = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centis = Math.floor((ms % 1000) / 10);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centis).padStart(2, '0')}`;
  };

  // Format timer
  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Calculate clock hands degrees
  const seconds = currentTime.getSeconds();
  const minutes = currentTime.getMinutes();
  const hours = currentTime.getHours();
  const secDeg = (seconds / 60) * 360;
  const minDeg = ((minutes + seconds / 60) / 60) * 360;
  const hourDeg = (((hours % 12) + minutes / 60) / 12) * 360;

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none">
      {/* Top Disguise Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/90 border-b border-slate-900/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          {onExitToLauncher && (
            <button
              onClick={onExitToLauncher}
              className="px-2 py-1 rounded-md text-[11px] font-medium text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            >
              ← Home
            </button>
          )}
          <span className="text-base font-semibold text-white tracking-tight">
            {settings.disguiseName || 'Clock'}
          </span>
        </div>

        {/* Right slot: quiet clock status */}
        <div className="w-8 flex items-center justify-end text-xs text-slate-500 font-mono">
          <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Main Content Area based on Tab */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'clock' && (
          <div className="p-4 flex flex-col items-center">
            {/* Analog Clock Disguise Face */}
            <div className="relative my-4 flex items-center justify-center">
              <div
                className={`relative w-64 h-64 rounded-full bg-radial from-slate-900 via-slate-950 to-black border-4 border-slate-800/80 shadow-2xl flex items-center justify-center transition-all ${
                  isHoldingCenter ? 'scale-[1.02] border-amber-500/70 shadow-amber-500/20' : ''
                }`}
              >
                {/* Clock Hour Markers */}
                {Array.from({ length: 12 }).map((_, i) => {
                  const deg = i * 30;
                  const isMain = i % 3 === 0;
                  return (
                    <div
                      key={i}
                      className="absolute inset-2 pointer-events-none flex justify-center"
                      style={{ transform: `rotate(${deg}deg)` }}
                    >
                      <div
                        className={`rounded-full ${
                          isMain ? 'w-1 h-3.5 bg-slate-300' : 'w-0.5 h-2 bg-slate-600'
                        }`}
                      />
                    </div>
                  );
                })}

                {/* Clock Numerals (12, 3, 6, 9) */}
                <span className="absolute top-6 font-mono text-xs font-semibold text-slate-400">12</span>
                <span className="absolute right-6 font-mono text-xs font-semibold text-slate-400">3</span>
                <span className="absolute bottom-6 font-mono text-xs font-semibold text-slate-400">6</span>
                <span className="absolute left-6 font-mono text-xs font-semibold text-slate-400">9</span>

                {/* Hour Hand */}
                <div
                  className="absolute w-1.5 h-16 bg-slate-200 rounded-full origin-bottom shadow-md pointer-events-none"
                  style={{
                    transform: `translateY(-50%) rotate(${hourDeg}deg)`,
                    bottom: '50%',
                  }}
                />

                {/* Minute Hand */}
                <div
                  className="absolute w-1 h-22 bg-slate-400 rounded-full origin-bottom shadow-md pointer-events-none"
                  style={{
                    transform: `translateY(-50%) rotate(${minDeg}deg)`,
                    bottom: '50%',
                  }}
                />

                {/* Second Hand (Continuous Orange) */}
                <div
                  className="absolute w-0.5 h-26 bg-amber-500 rounded-full origin-bottom shadow-md pointer-events-none"
                  style={{
                    transform: `translateY(-50%) rotate(${secDeg}deg)`,
                    bottom: '50%',
                  }}
                />

                {/* Center Crown / Secret Press-down Pivot */}
                <button
                  onPointerDown={handleCenterTouchStart}
                  onPointerUp={handleCenterTouchEnd}
                  onPointerLeave={handleCenterTouchEnd}
                  onMouseDown={handleCenterTouchStart}
                  onMouseUp={handleCenterTouchEnd}
                  onMouseLeave={handleCenterTouchEnd}
                  onTouchStart={handleCenterTouchStart}
                  onTouchEnd={handleCenterTouchEnd}
                  onContextMenu={e => e.preventDefault()}
                  className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isHoldingCenter
                      ? 'bg-amber-600 scale-110 ring-4 ring-amber-500/30'
                      : 'bg-amber-500 border-2 border-slate-900 shadow-md hover:scale-105 active:scale-95'
                  }`}
                  aria-label="Clock Center"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-950" />
                </button>
              </div>
            </div>

            {/* Normal Time & Date Display */}
            <div className="text-center mb-6">
              <div className="text-3xl font-mono font-bold tracking-tight text-white">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {currentTime.toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            </div>

            {/* World Clock Cities List */}
            <div className="w-full max-w-sm space-y-2 mt-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>World Clocks</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">UTC Based</span>
              </div>

              {WORLD_CITIES.map(c => {
                const cityTime = new Date(
                  currentTime.toLocaleString('en-US', { timeZone: c.timezone })
                );
                const isDay = cityTime.getHours() >= 6 && cityTime.getHours() < 19;
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white">{c.city}</div>
                      <div className="text-[11px] text-slate-400">
                        {c.country} · {isDay ? '☀️ Day' : '🌙 Night'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-mono font-semibold text-white">
                        {cityTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {c.offsetHours >= 0 ? `+${c.offsetHours}` : c.offsetHours} hrs
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Alarm Tab */}
        {activeTab === 'alarm' && (
          <div className="p-4 max-w-sm mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Alarms
              </h3>
              <button
                onClick={() => setIsAddingAlarm(true)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {isAddingAlarm && (
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-3">
                <div className="text-xs font-semibold text-amber-400">New Alarm Time</div>
                <input
                  type="time"
                  value={newAlarmTime}
                  onChange={e => setNewAlarmTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xl font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                />
                <input
                  type="text"
                  placeholder="Alarm label..."
                  value={newAlarmLabel}
                  onChange={e => setNewAlarmLabel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setIsAddingAlarm(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAlarm}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-semibold text-xs hover:bg-amber-400"
                  >
                    Save Alarm
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2.5">
              {alarms.map(alarm => (
                <div
                  key={alarm.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    alarm.enabled
                      ? 'bg-slate-900/90 border-slate-700/80 text-white'
                      : 'bg-slate-900/30 border-slate-800/40 text-slate-400'
                  }`}
                >
                  <div>
                    <div className="text-2xl font-mono font-bold tracking-tight">
                      {alarm.time}
                    </div>
                    <div className="text-xs mt-0.5 text-slate-400">
                      {alarm.label} · {alarm.repeatDays.join(', ')}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleDeleteAlarm(alarm.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete alarm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => handleToggleAlarm(alarm.id)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        alarm.enabled ? 'bg-amber-500' : 'bg-slate-750'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                          alarm.enabled ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stopwatch Tab */}
        {activeTab === 'stopwatch' && (
          <div className="p-4 max-w-sm mx-auto flex flex-col items-center">
            <div className="my-8 text-center">
              <div className="text-5xl font-mono font-extrabold tracking-tight text-white tabular-nums">
                {formatStopwatch(stopwatchTime)}
              </div>
              <div className="text-xs text-slate-400 mt-2">Precision Milliseconds</div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6 my-4 w-full">
              <button
                onClick={() => {
                  if (isStopwatchRunning) {
                    setLaps([stopwatchTime, ...laps]);
                    playSound.keyPress();
                  } else {
                    setStopwatchTime(0);
                    setLaps([]);
                    playSound.keyPress();
                  }
                }}
                disabled={stopwatchTime === 0}
                className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 flex items-center justify-center text-xs font-semibold active:scale-95 transition-all shadow-md"
              >
                {isStopwatchRunning ? 'Lap' : 'Reset'}
              </button>

              <button
                onClick={() => {
                  setIsStopwatchRunning(!isStopwatchRunning);
                  playSound.keyPress();
                  triggerHaptic(15);
                }}
                className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-base font-bold shadow-xl transition-all active:scale-95 ${
                  isStopwatchRunning
                    ? 'bg-red-600 hover:bg-red-500'
                    : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                {isStopwatchRunning ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
              </button>
            </div>

            {/* Lap list */}
            {laps.length > 0 && (
              <div className="w-full mt-6 border-t border-slate-800 pt-3 space-y-2 max-h-56 overflow-y-auto">
                {laps.map((lap, index) => {
                  const lapNumber = laps.length - index;
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-slate-900/50 border border-slate-800/60 font-mono"
                    >
                      <span className="text-slate-400">Lap {lapNumber}</span>
                      <span className="text-white font-semibold">{formatStopwatch(lap)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Timer Tab */}
        {activeTab === 'timer' && (
          <div className="p-4 max-w-sm mx-auto flex flex-col items-center">
            {/* Circular Timer Display */}
            <div className="relative my-8 w-56 h-56 rounded-full border-4 border-slate-800 flex items-center justify-center shadow-xl">
              <div className="text-center">
                <div className="text-4xl font-mono font-bold text-white tabular-nums">
                  {formatTimer(timerRemaining)}
                </div>
                <div className="text-xs text-slate-400 mt-1">Countdown Timer</div>
              </div>
            </div>

            {/* Presets */}
            {!isTimerRunning && timerRemaining === timerDuration && (
              <div className="grid grid-cols-4 gap-2 w-full mb-6">
                {[1, 5, 10, 15].map(m => (
                  <button
                    key={m}
                    onClick={() => {
                      setTimerDuration(m * 60);
                      setTimerRemaining(m * 60);
                      playSound.keyPress();
                    }}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      timerDuration === m * 60
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {m} min
                  </button>
                ))}
              </div>
            )}

            {/* Timer Controls */}
            <div className="flex items-center justify-center gap-6 w-full">
              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerRemaining(timerDuration);
                  playSound.keyPress();
                }}
                disabled={timerRemaining === timerDuration && !isTimerRunning}
                className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 flex items-center justify-center text-xs font-semibold active:scale-95 transition-all shadow-md"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setIsTimerRunning(!isTimerRunning);
                  playSound.keyPress();
                  triggerHaptic(15);
                }}
                className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-base font-bold shadow-xl transition-all active:scale-95 ${
                  isTimerRunning
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                {isTimerRunning ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Authentic Tab Bar */}
      <div className="grid grid-cols-4 h-16 border-t border-slate-900 bg-slate-950/95 backdrop-blur-md px-2">
        <button
          onClick={() => {
            setActiveTab('clock');
            playSound.keyPress();
          }}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            activeTab === 'clock' ? 'text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <ClockIcon className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Clock</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('alarm');
            playSound.keyPress();
          }}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            activeTab === 'alarm' ? 'text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <AlarmClock className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Alarm</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('stopwatch');
            playSound.keyPress();
          }}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            activeTab === 'stopwatch' ? 'text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <Timer className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Stopwatch</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('timer');
            playSound.keyPress();
          }}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            activeTab === 'timer' ? 'text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <Hourglass className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Timer</span>
        </button>
      </div>
    </div>
  );
};
