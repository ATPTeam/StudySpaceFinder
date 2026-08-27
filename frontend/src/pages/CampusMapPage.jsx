// frontend/src/pages/CampusMapPage.jsx
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  MapPin, 
  Users, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  ArrowUpRight,
  Info
} from 'lucide-react';

const CampusMapPage = () => {
  const { spaces, handleCheckIn, student } = useApp();

  // Group spaces by building
  const buildingsMap = spaces.reduce((acc, space) => {
    if (!acc[space.building]) {
      acc[space.building] = [];
    }
    acc[space.building].push(space);
    return acc;
  }, {});

  const buildingKeys = Object.keys(buildingsMap);
  const [selectedBuilding, setSelectedBuilding] = useState(buildingKeys[0] || '');

  // Helper to determine occupancy color scheme
  const getOccupancyColor = (occupied, total) => {
    const percent = total > 0 ? (occupied / total) * 100 : 0;
    if (percent >= 90) {
      return {
        name: 'Full',
        color: 'red',
        bg: 'bg-rose-500/20',
        border: 'border-rose-500/60',
        text: 'text-rose-400',
        badge: 'bg-rose-500 text-white',
        ring: 'ring-rose-500/30',
        bar: 'bg-rose-500'
      };
    } else if (percent >= 50) {
      return {
        name: 'Filling Up',
        color: 'orange',
        bg: 'bg-amber-500/20',
        border: 'border-amber-500/60',
        text: 'text-amber-400',
        badge: 'bg-amber-500 text-slate-950 font-bold',
        ring: 'ring-amber-500/30',
        bar: 'bg-amber-500'
      };
    } else {
      return {
        name: 'Available',
        color: 'green',
        bg: 'bg-emerald-500/20',
        border: 'border-emerald-500/60',
        text: 'text-emerald-400',
        badge: 'bg-emerald-500 text-slate-950 font-bold',
        ring: 'ring-emerald-500/30',
        bar: 'bg-emerald-500'
      };
    }
  };

  // Calculate building-level summary
  const getBuildingSummary = (buildingName) => {
    const buildingSpaces = buildingsMap[buildingName] || [];
    const totalCapacity = buildingSpaces.reduce((sum, s) => sum + s.totalSeats, 0);
    const totalOccupied = buildingSpaces.reduce((sum, s) => sum + s.occupiedSeats, 0);
    const colorScheme = getOccupancyColor(totalOccupied, totalCapacity);
    const percent = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

    return { totalCapacity, totalOccupied, colorScheme, percent, zonesCount: buildingSpaces.length };
  };

  const currentBuildingData = getBuildingSummary(selectedBuilding);
  const activeSpaces = buildingsMap[selectedBuilding] || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Map Legend */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <Building2 className="w-7 h-7 text-indigo-400" />
            2D Campus Layout & Occupancy Heatmap
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Visual top-down map of campus blocks with live color-coded density zones.
          </p>
        </div>

        {/* Real-Time Color Legend */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-xl text-xs">
          <span className="text-slate-400 font-semibold px-1">Live Status:</span>
          <span className="flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> &lt;50% Empty (Green)
          </span>
          <span className="flex items-center gap-1 text-amber-400 font-semibold bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded-md">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> 50-89% Moderate (Orange)
          </span>
          <span className="flex items-center gap-1 text-rose-400 font-semibold bg-rose-950/60 border border-rose-800 px-2 py-0.5 rounded-md">
            <span className="w-2 h-2 rounded-full bg-rose-400" /> 90%+ Full (Red)
          </span>
        </div>
      </div>

      {/* 2D BIRD'S-EYE CAMPUS MAP SCHEMATIC */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-indigo-400" />
            Interactive Campus Grounds (Click any building to inspect floors)
          </div>
          <span className="text-[11px] text-indigo-300 bg-indigo-950 border border-indigo-800 px-2.5 py-0.5 rounded-full">
            ● Live Synchronized
          </span>
        </div>

        {/* Blueprint Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl relative">
          {buildingKeys.map((buildingName) => {
            const info = getBuildingSummary(buildingName);
            const isSelected = selectedBuilding === buildingName;

            return (
              <div
                key={buildingName}
                onClick={() => setSelectedBuilding(buildingName)}
                className={`cursor-pointer transition-all duration-300 rounded-2xl p-5 border-2 relative flex flex-col justify-between ${
                  isSelected
                    ? `${info.colorScheme.border} ${info.colorScheme.bg} ring-4 ${info.colorScheme.ring} scale-[1.02] shadow-2xl`
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                {/* Status Indicator Dot */}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-base text-white">
                    🏢
                  </div>
                  <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-md ${info.colorScheme.badge}`}>
                    {info.colorScheme.name}
                  </span>
                </div>

                {/* Building Title & Live Stats */}
                <div>
                  <h3 className="text-base font-extrabold text-white mb-1">{buildingName}</h3>
                  <p className="text-xs text-slate-400 mb-3">
                    {info.zonesCount} Study Zones • {info.totalOccupied}/{info.totalCapacity} Seats
                  </p>

                  {/* Density Bar */}
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800 mb-1">
                    <div
                      className={`h-full ${info.colorScheme.bar} transition-all duration-500`}
                      style={{ width: `${info.percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Crowd Density</span>
                    <strong className={info.colorScheme.text}>{info.percent}%</strong>
                  </div>
                </div>

                {/* Active Selection Tag */}
                <div className="mt-4 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                  <span className={isSelected ? 'text-white font-bold' : 'text-slate-500'}>
                    {isSelected ? 'Viewing Floors' : 'Click to View'}
                  </span>
                  <ArrowUpRight className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DETAILED FLOOR-BY-FLOOR BREAKDOWN FOR SELECTED BUILDING */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Floor-by-Floor Heatmap: <span className="text-indigo-300">{selectedBuilding}</span>
          </h2>
          <span className="text-xs text-slate-400">
            Average Occupancy: <strong className={currentBuildingData.colorScheme.text}>{currentBuildingData.percent}%</strong>
          </span>
        </div>

        {/* Floor Zones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeSpaces.map((space) => {
            const spaceColor = getOccupancyColor(space.occupiedSeats, space.totalSeats);
            const occupancyPct = Math.round((space.occupiedSeats / space.totalSeats) * 100);
            const isStudentHere = student?.currentCheckedInSpace === space._id || student?.currentCheckedInSpace?._id === space._id;

            return (
              <div
                key={space._id}
                className={`border-2 rounded-2xl p-5 transition-all bg-slate-900/90 ${spaceColor.border} ${spaceColor.bg}`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold bg-slate-950 border border-slate-800 text-indigo-300 px-2 py-0.5 rounded">
                      {space.floor}
                    </span>
                    <h3 className="text-base font-extrabold text-white mt-1.5">{space.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{space.vibe} Zone • {space.facilities.join(', ')}</p>
                  </div>

                  <span className={`text-xs font-black px-2.5 py-1 rounded-full uppercase ${spaceColor.badge}`}>
                    ● {spaceColor.name}
                  </span>
                </div>

                {/* Progress Bar & Seat Breakdown */}
                <div className="my-4 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-xs mb-1 font-mono">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      Live Capacity
                    </span>
                    <span className="text-slate-200">
                      <strong className="text-white">{space.occupiedSeats}</strong> / {space.totalSeats} seats ({occupancyPct}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${spaceColor.bar} transition-all duration-500`}
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>
                </div>

                {/* Action Strip */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">
                    {space.occupiedSeats >= space.totalSeats ? 'No seats available' : `${space.totalSeats - space.occupiedSeats} seats left`}
                  </span>

                  {isStudentHere ? (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/80 border border-emerald-700 px-3 py-1 rounded-lg">
                      <CheckCircle2 className="w-4 h-4" /> Seated Here
                    </span>
                  ) : (
                    <button
                      onClick={() => handleCheckIn(space._id)}
                      disabled={space.occupiedSeats >= space.totalSeats}
                      className="text-xs bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold px-4 py-1.5 rounded-lg transition-colors shadow"
                    >
                      {space.occupiedSeats >= space.totalSeats ? 'Full' : 'Check In'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default CampusMapPage;