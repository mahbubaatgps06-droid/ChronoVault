import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { IntruderAttempt } from '../types';
import { ShieldAlert, TrendingUp, Calendar, Clock, AlertTriangle, PlusCircle } from 'lucide-react';
import { playSound } from '../utils/sound';

interface Props {
  logs: IntruderAttempt[];
  onSimulateAttempt?: () => void;
}

interface ChartPoint {
  timeKey: string;
  dateLabel: string;
  attempts: number;
}

export const IntruderLogChart: React.FC<Props> = ({ logs, onSimulateAttempt }) => {
  const [chartMode, setChartMode] = useState<'hourly' | 'daily'>('daily');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  // Compute 7-day aggregation
  const dailyData = useMemo<ChartPoint[]>(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const result: ChartPoint[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dayName = days[d.getDay()];
      const dateStr = d.toISOString().split('T')[0];

      // Count logs matching this day/date
      const count = logs.filter(log => {
        if (log.date === dateStr) return true;
        if (log.dayName === dayName) return true;
        if (i === 0 && log.timestamp.toLowerCase().includes('today')) return true;
        if (i === 1 && log.timestamp.toLowerCase().includes('yesterday')) return true;
        return false;
      }).length;

      result.push({
        timeKey: i === 0 ? 'Today' : dayName,
        dateLabel: `${d.getMonth() + 1}/${d.getDate()}`,
        attempts: count,
      });
    }
    return result;
  }, [logs]);

  // Compute 24-hour interval aggregation (6 intervals of 4 hours)
  const hourlyData = useMemo<ChartPoint[]>(() => {
    const intervalDefinitions = [
      { label: '00-04h', start: 0, end: 3, sub: 'Late Night' },
      { label: '04-08h', start: 4, end: 7, sub: 'Early Morning' },
      { label: '08-12h', start: 8, end: 11, sub: 'Morning' },
      { label: '12-16h', start: 12, end: 15, sub: 'Afternoon' },
      { label: '16-20h', start: 16, end: 19, sub: 'Evening' },
      { label: '20-24h', start: 20, end: 23, sub: 'Night' },
    ];

    const counts = [0, 0, 0, 0, 0, 0];

    logs.forEach(log => {
      let hour = log.hour;
      if (hour === undefined) {
        // Parse from time string or timestamp
        const match = log.timestamp.match(/(\d{1,2}):(\d{2})/);
        if (match) {
          hour = parseInt(match[1], 10);
        } else {
          hour = 12; // default middle
        }
      }

      intervalDefinitions.forEach((int, idx) => {
        if (hour !== undefined && hour >= int.start && hour <= int.end) {
          counts[idx] += 1;
        }
      });
    });

    return intervalDefinitions.map((int, idx) => ({
      timeKey: int.label,
      dateLabel: int.sub,
      attempts: counts[idx],
    }));
  }, [logs]);

  // Key stats
  const totalAttempts = logs.length;
  const recent24hAttempts = logs.filter(
    l => l.timestamp.toLowerCase().includes('today') || l.timestamp.toLowerCase().includes('yesterday')
  ).length;

  const peakPeriod = useMemo(() => {
    if (chartMode === 'daily') {
      const maxDay = [...dailyData].sort((a, b) => b.attempts - a.attempts)[0];
      return maxDay && maxDay.attempts > 0 ? `${maxDay.timeKey} (${maxDay.attempts} attempts)` : 'None';
    } else {
      const maxInt = [...hourlyData].sort((a, b) => b.attempts - a.attempts)[0];
      return maxInt && maxInt.attempts > 0 ? `${maxInt.timeKey} (${maxInt.attempts} attempts)` : 'None';
    }
  }, [chartMode, dailyData, hourlyData]);

  const threatStatus =
    recent24hAttempts >= 5
      ? { text: 'Elevated Threat', color: 'text-red-400', bg: 'bg-red-950/40 border-red-800/50' }
      : recent24hAttempts >= 2
      ? { text: 'Guarded', color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-800/50' }
      : { text: 'Normal', color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-800/50' };

  // Custom sleek tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-slate-700/80 px-3 py-2 rounded-xl shadow-xl text-xs backdrop-blur-md">
          <div className="text-slate-400 font-medium">{label}</div>
          <div className="flex items-center gap-1.5 mt-0.5 text-white font-semibold font-mono">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>{payload[0].value} Failed Attempt{payload[0].value === 1 ? '' : 's'}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const chartData: ChartPoint[] = chartMode === 'daily' ? dailyData : hourlyData;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col gap-3">
      {/* Top Header & Chart Mode Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-red-950/50 border border-red-800/60 flex items-center justify-center text-red-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
              <span>Failed PIN Attempts Timeline</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${threatStatus.bg} ${threatStatus.color}`}>
                {threatStatus.text}
              </span>
            </h4>
            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
              <span>{totalAttempts} Total Logged</span>
              <span aria-hidden="true">·</span>
              <span>Peak: {peakPeriod}</span>
            </div>
          </div>
        </div>

        {/* View Mode Segmented Switcher & Type Toggle */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <div className="flex items-center p-0.5 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => {
                setChartMode('daily');
                playSound.keyPress();
              }}
              className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-colors ${
                chartMode === 'daily'
                  ? 'bg-slate-800 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => {
                setChartMode('hourly');
                playSound.keyPress();
              }}
              className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-colors ${
                chartMode === 'hourly'
                  ? 'bg-slate-800 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              24h By Hour
            </button>
          </div>

          <div className="flex items-center p-0.5 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => {
                setChartType('area');
                playSound.keyPress();
              }}
              className={`px-2 py-1 text-[10px] font-medium rounded-md transition-colors ${
                chartType === 'area'
                  ? 'bg-red-900/60 text-red-300 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Area Curve"
            >
              Area
            </button>
            <button
              onClick={() => {
                setChartType('bar');
                playSound.keyPress();
              }}
              className={`px-2 py-1 text-[10px] font-medium rounded-md transition-colors ${
                chartType === 'bar'
                  ? 'bg-red-900/60 text-red-300 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Bar Chart"
            >
              Bars
            </button>
          </div>
        </div>
      </div>

      {/* The Recharts Canvas */}
      <div className="w-full h-48 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 12, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="intruderGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
              <XAxis
                dataKey="timeKey"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="attempts"
                name="Attempts"
                stroke="#EF4444"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#intruderGradient)"
                activeDot={{ r: 5, fill: '#EF4444', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </AreaChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 10, right: 12, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
              <XAxis
                dataKey="timeKey"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="attempts"
                name="Attempts"
                fill="#EF4444"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Bottom Action / Tester Helper */}
      {onSimulateAttempt && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
          <span>Test real-time chart frequency updates:</span>
          <button
            onClick={onSimulateAttempt}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/40 font-medium transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Simulate Failed PIN</span>
          </button>
        </div>
      )}
    </div>
  );
};
