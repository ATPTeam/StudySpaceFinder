// frontend/src/components/SpaceCard.jsx
import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  MapPin, 
  Users, 
  Zap, 
  Wifi, 
  Snowflake, 
  Edit3, 
  Volume2, 
  VolumeX, 
  Users2, 
  Clock, 
  RefreshCw 
} from 'lucide-react';

const facilityIcons = {
  'Power Outlets': Zap,
  'High-Speed WiFi': Wifi,
  'AC': Snowflake,
  'Whiteboard': Edit3,
};

const vibeIcons = {
  'Silent': VolumeX,
  'Discussion': Volume2,
  'Group Work': Users2,
};

const SpaceCard = ({ space }) => {
  const { student, handleCheckIn, handleCheckOut, handlePing } = useApp();

  const isCurrentStudentHere = student?.currentCheckedInSpace === space._id || 
                               student?.currentCheckedInSpace?._id === space._id;

  // Calculate Time Decay
  const getDecayInfo = (lastUpdated) => {
    const diffMins = Math.floor((new Date() - new Date(lastUpdated)) / (1000 * 60));
    if (diffMins < 1) return { text: 'Just verified', isStale: false };
    if (diffMins < 30) return { text: `Verified ${diffMins}m ago`, isStale: false };
    return { text: `Unverified (${diffMins}m ago)`, isStale: true };
  };

  const decay = getDecayInfo(space.lastUpdated);
  const occupancyPercent = Math.min(100, Math.round((space.occupiedSeats / space.totalSeats) * 100));

  const VibeIcon = vibeIcons[space.vibe] || Volume2;

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all rounded-xl p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group">
      
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 bg-indigo-950/70 border border-indigo-800/60 px-2 py-0.5 rounded-md mb-1.5">
              <VibeIcon className="w-3 h-3" />
              {space.vibe} Zone
            </span>
            <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
              {space.name}
            </h3>
          </div>

          {/* Status Color Badge */}
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${
            space.status === 'Available'
              ? 'bg-emerald-950/80 border-emerald-700 text-emerald-400'
              : space.status === 'Filling Up'
              ? 'bg-amber-950/80 border-amber-700 text-amber-400'
              : 'bg-rose-950/80 border-rose-700 text-rose-400'
          }`}>
            ● {space.status}
          </span>
        </div>

        {/* Location & Floor */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
          <MapPin className="w-3.5 h-3.5 text-slate-500" />
          <span>{space.building} • {space.floor}</span>
        </div>

        {/* Capacity Meter */}
        <div className="mb-4 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
          <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              Occupancy
            </span>
            <span className="text-slate-200 font-mono">
              <strong className="text-white">{space.occupiedSeats}</strong> / {space.totalSeats} seats
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                occupancyPercent >= 90
                  ? 'bg-rose-500'
                  : occupancyPercent >= 50
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>
        </div>

        {/* Facility Badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {space.facilities.map((fac) => {
            const Icon = facilityIcons[fac] || Zap;
            return (
              <span
                key={fac}
                className="inline-flex items-center gap-1 text-[11px] bg-slate-800 text-slate-300 px-2 py-1 rounded-md border border-slate-700/60"
              >
                <Icon className="w-3 h-3 text-indigo-400" />
                {fac}
              </span>
            );
          })}
        </div>
      </div>

      {/* Footer / Interactive Actions */}
      <div className="pt-3 border-t border-slate-800/80">
        
        {/* Verification Status Decay Indicator */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3">
          <span className={`inline-flex items-center gap-1 ${decay.isStale ? 'text-amber-400/90 font-medium' : 'text-slate-400'}`}>
            <Clock className="w-3 h-3" />
            {decay.text}
          </span>

          <button
            onClick={() => handlePing(space._id)}
            title="Confirm status freshness"
            className="flex items-center gap-1 text-slate-400 hover:text-indigo-300 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Verify</span>
          </button>
        </div>

        {/* Check-In / Check-Out Primary Button */}
        {isCurrentStudentHere ? (
          <button
            onClick={handleCheckOut}
            className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Leave Space (Check Out)</span>
          </button>
        ) : (
          <button
            onClick={() => handleCheckIn(space._id)}
            disabled={space.occupiedSeats >= space.totalSeats}
            className={`w-full py-2 text-xs font-bold rounded-lg shadow transition-colors flex items-center justify-center gap-1.5 ${
              space.occupiedSeats >= space.totalSeats
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            <span>{space.occupiedSeats >= space.totalSeats ? 'Room Full' : 'Check In Here'}</span>
          </button>
        )}
      </div>

    </div>
  );
};

export default SpaceCard;