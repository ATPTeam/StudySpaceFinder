// frontend/src/pages/ProfilePage.jsx
import React from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { User, ShieldCheck, MapPin, CheckCircle, Clock, ArrowRight, LogOut, Award } from 'lucide-react';

const ProfilePage = () => {
  const { student, setStudent, handleCheckOut, spaces, notify } = useApp();

  const handleLogout = () => {
    localStorage.removeItem('study_student_id');
    setStudent(null);
    notify('Logged out successfully', 'info');
  };

  if (!student) {
    return (
      <div className="max-w-md mx-auto my-16 bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-xl">
        <div className="w-16 h-16 bg-indigo-950/80 border border-indigo-800 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Sign in to view your profile</h2>
        <p className="text-xs text-slate-400 mb-6">
          Check into campus study spots and view your session status in one place.
        </p>
        <Link
          to="/"
          className="inline-block w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all"
        >
          Return to Explore Spots
        </Link>
      </div>
    );
  }

  const activeSpace = spaces.find(
    (s) => s._id === student.currentCheckedInSpace || s._id === student.currentCheckedInSpace?._id
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Student Profile Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center text-xl font-black shadow-lg">
            {student.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{student.name}</h2>
              <span className="text-[10px] bg-indigo-950 border border-indigo-800 text-indigo-300 px-2 py-0.5 rounded-full font-mono font-semibold">
                {student.studentId}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{student.department} • Anurag University</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 self-start md:self-auto text-xs bg-slate-800 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-800/80 border border-slate-700 px-4 py-2 rounded-xl text-slate-300 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>

      {/* Active Check-In Session */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          Active Study Session
        </h3>

        {activeSpace ? (
          <div className="bg-gradient-to-r from-indigo-950/40 to-slate-950 border border-indigo-800/50 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Currently Seated
              </span>
              <h4 className="text-lg font-bold text-white">{activeSpace.name}</h4>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {activeSpace.building} • {activeSpace.floor} ({activeSpace.vibe} Zone)
              </p>
            </div>

            <button
              onClick={handleCheckOut}
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow transition-colors whitespace-nowrap"
            >
              End Session & Check Out
            </button>
          </div>
        ) : (
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-6 text-center">
            <p className="text-slate-300 text-sm font-medium">You are not currently checked in to any study spot.</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">Browse live spaces and check in to hold your seat.</p>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <span>Explore Study Spots</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            Student Status
          </div>
          <div className="text-lg font-bold text-white">Active Member</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-400" />
            Live Sync Role
          </div>
          <div className="text-lg font-bold text-white">Verified Peer</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-blue-400" />
            System State
          </div>
          <div className="text-lg font-bold text-white">Persistent DB Sync</div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;