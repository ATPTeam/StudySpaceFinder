// frontend/src/pages/AnalyticsPage.jsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart3, TrendingUp, Sparkles, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

const AnalyticsPage = () => {
  const { spaces } = useApp();
  const [selectedSpaceId, setSelectedSpaceId] = useState(spaces[0]?._id || '');

  const activeSpace = spaces.find((s) => s._id === selectedSpaceId) || spaces[0];
  const currentHour = new Date().getHours();

  if (!spaces.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        Loading analytics engine...
      </div>
    );
  }

  const trends = activeSpace?.hourlyTrends || Array(24).fill(0);
  const currentOccupancyPrediction = trends[currentHour] || 0;
  const nextHourOccupancyPrediction = trends[(currentHour + 1) % 24] || 0;

  // AI Advice Generator
  let aiAdvice = {
    title: 'Ideal Study Window',
    message: `Occupancy is currently low (~${currentOccupancyPrediction}%). Great time to find a quiet desk with power outlets.`,
    badgeClass: 'bg-emerald-950/80 border-emerald-700 text-emerald-400',
    icon: CheckCircle2
  };

  if (currentOccupancyPrediction >= 80) {
    aiAdvice = {
      title: 'Peak Rush in Progress',
      message: `Crowd load is peaking around ${currentOccupancyPrediction}%. Expected to ease up after ${(currentHour + 2) % 12 || 12}:00.`,
      badgeClass: 'bg-rose-950/80 border-rose-700 text-rose-400',
      icon: AlertTriangle
    };
  } else if (nextHourOccupancyPrediction > 70) {
    aiAdvice = {
      title: 'Rush Approaching Soon',
      message: `Crowd levels will jump to ~${nextHourOccupancyPrediction}% within the next hour. Arrive now to secure a spot.`,
      badgeClass: 'bg-amber-950/80 border-amber-700 text-amber-400',
      icon: TrendingUp
    };
  }

  const AdviceIcon = aiAdvice.icon;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-indigo-400" />
            AI Occupancy Trends & Peak Hours
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Predictive hourly crowd patterns based on campus check-in logs.
          </p>
        </div>

        {/* Space Selector */}
        <div className="w-full md:w-72">
          <select
            value={selectedSpaceId}
            onChange={(e) => setSelectedSpaceId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {spaces.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* AI Recommendation Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-950/80 border border-indigo-800 rounded-xl text-indigo-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${aiAdvice.badgeClass}`}>
                  ● {aiAdvice.title}
                </span>
                <span className="text-xs text-slate-400">
                  Current Time: <strong className="text-slate-200">{currentHour % 12 || 12}:00 {currentHour >= 12 ? 'PM' : 'AM'}</strong>
                </span>
              </div>
              <p className="text-slate-200 text-sm font-medium">{aiAdvice.message}</p>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 px-4 py-3 rounded-xl text-center sm:text-right">
            <div className="text-xs text-slate-400 mb-0.5">Forecasted Occupancy</div>
            <div className="text-2xl font-black text-white font-mono">{currentOccupancyPrediction}%</div>
          </div>
        </div>
      </div>

      {/* 24-Hour Predictive Hourly Histogram */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            24-Hour Crowd Forecast ({activeSpace.name})
          </h3>
          <span className="text-xs text-slate-400">Highlighted = Current Hour</span>
        </div>

        <div className="grid grid-cols-12 sm:grid-cols-24 gap-1.5 pt-8 items-end h-48 border-b border-slate-800 pb-2">
          {trends.map((val, hour) => {
            const isCurrent = hour === currentHour;
            const heightPercent = Math.max(8, val);

            return (
              <div key={hour} className="flex flex-col items-center h-full justify-end group relative">
                {/* Tooltip on hover */}
                <div className="absolute -top-7 hidden group-hover:flex bg-slate-800 text-[10px] text-white px-2 py-0.5 rounded shadow whitespace-nowrap z-20 border border-slate-700">
                  {hour % 12 || 12}:00 {hour >= 12 ? 'PM' : 'AM'}: {val}%
                </div>

                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-t transition-all ${
                    isCurrent
                      ? 'bg-indigo-500 ring-2 ring-indigo-400 shadow-lg'
                      : val >= 80
                      ? 'bg-rose-500/70 hover:bg-rose-500'
                      : val >= 50
                      ? 'bg-amber-500/70 hover:bg-amber-500'
                      : 'bg-emerald-500/60 hover:bg-emerald-500'
                  }`}
                />
                <span className={`text-[9px] mt-1.5 font-mono ${isCurrent ? 'text-indigo-400 font-bold' : 'text-slate-500'}`}>
                  {hour % 4 === 0 ? hour : ''}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-1">
          <span>12 AM (Midnight)</span>
          <span>12 PM (Noon)</span>
          <span>11 PM</span>
        </div>
      </div>

      {/* Campus Summary List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-4">Live Campus Load Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {spaces.map((s) => {
            const pct = Math.round((s.occupiedSeats / s.totalSeats) * 100);
            return (
              <div key={s._id} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{s.name}</h4>
                  <p className="text-[11px] text-slate-400">{s.building} • {s.vibe}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-white">{s.occupiedSeats}/{s.totalSeats} seats</div>
                  <div className="text-[10px] text-slate-400">{pct}% full</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;