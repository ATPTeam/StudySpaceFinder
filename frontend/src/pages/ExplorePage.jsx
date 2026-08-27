// frontend/src/pages/ExplorePage.jsx
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import SpaceCard from '../components/SpaceCard';
import FilterBar from '../components/FilterBar';
import { Compass, Sparkles } from 'lucide-react';

const ExplorePage = () => {
  const { spaces, loadSpaces, loading } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('All');
  const [selectedVibe, setSelectedVibe] = useState('All');
  const [selectedFacility, setSelectedFacility] = useState('All');

  // Reload spaces on filter change
  useEffect(() => {
    loadSpaces({
      search: searchQuery || undefined,
      building: selectedBuilding !== 'All' ? selectedBuilding : undefined,
      vibe: selectedVibe !== 'All' ? selectedVibe : undefined,
      facility: selectedFacility !== 'All' ? selectedFacility : undefined
    });
  }, [searchQuery, selectedBuilding, selectedVibe, selectedFacility]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header Banner */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <Compass className="w-7 h-7 text-indigo-400" />
            Live Campus Study Spaces
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time occupancy and verified crowd levels across campus blocks.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-indigo-950/40 border border-indigo-800/50 px-3 py-1.5 rounded-lg text-xs text-indigo-300">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Updates automatically via live WebSockets</span>
        </div>
      </div>

      {/* Filter Component */}
      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedBuilding={selectedBuilding}
        setSelectedBuilding={setSelectedBuilding}
        selectedVibe={selectedVibe}
        setSelectedVibe={setSelectedVibe}
        selectedFacility={selectedFacility}
        setSelectedFacility={setSelectedFacility}
      />

      {/* Spaces Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">
          Loading campus spaces...
        </div>
      ) : spaces.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <p className="text-slate-300 font-medium">No study spaces found matching your filters.</p>
          <p className="text-xs text-slate-500 mt-1">Try resetting the filter pills or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {spaces.map((space) => (
            <SpaceCard key={space._id} space={space} />
          ))}
        </div>
      )}

    </div>
  );
};

export default ExplorePage;