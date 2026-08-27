// frontend/src/components/FilterBar.jsx
import React from 'react';
import { useApp } from '../context/AppContext';
import { Search, Filter, Layers } from 'lucide-react';

const FilterBar = ({ 
  searchQuery, 
  setSearchQuery, 
  selectedBuilding, 
  setSelectedBuilding, 
  selectedVibe, 
  setSelectedVibe, 
  selectedFacility, 
  setSelectedFacility 
}) => {
  const { metadata } = useApp();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md mb-6 space-y-3">
      
      {/* Search Input & Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        
        {/* Search Box */}
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search room name or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Building Filter */}
        <div className="relative">
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
          >
            {metadata.buildings.map((b) => (
              <option key={b} value={b}>{b === 'All' ? '🏢 All Buildings' : b}</option>
            ))}
          </select>
        </div>

        {/* Vibe Filter */}
        <div className="relative">
          <select
            value={selectedVibe}
            onChange={(e) => setSelectedVibe(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
          >
            {metadata.vibes.map((v) => (
              <option key={v} value={v}>{v === 'All' ? '🤫 All Vibes' : `${v} Zone`}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Facility Quick Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
        <span className="text-xs text-slate-400 font-medium flex items-center gap-1 mr-1">
          <Filter className="w-3 h-3 text-slate-500" />
          Facility:
        </span>
        {metadata.facilities.map((fac) => (
          <button
            key={fac}
            onClick={() => setSelectedFacility(fac)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
              selectedFacility === fac
                ? 'bg-indigo-600 border-indigo-500 text-white font-semibold'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {fac}
          </button>
        ))}
      </div>

    </div>
  );
};

export default FilterBar;