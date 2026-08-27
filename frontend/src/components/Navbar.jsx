// frontend/src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { loginStudent } from '../api/api';
import { Compass, Map, BarChart3, User, Radio, LogOut, CheckCircle2 } from 'lucide-react';

const Navbar = () => {
  const { student, setStudent, socketConnected, handleCheckOut, message, notify } = useApp();
  const [showLogin, setShowLogin] = useState(false);
  const [studentIdInput, setStudentIdInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const location = useLocation();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!studentIdInput || !nameInput) return;
    try {
      const res = await loginStudent({ studentId: studentIdInput, name: nameInput });
      if (res.data.success) {
        setStudent(res.data.data);
        localStorage.setItem('study_student_id', res.data.data.studentId);
        setShowLogin(false);
        notify(`Welcome, ${res.data.data.name}!`, 'success');
      }
    } catch (err) {
      notify('Login failed', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('study_student_id');
    setStudent(null);
    notify('Logged out successfully', 'info');
  };

  const navLinks = [
    { name: 'Explore Spots', path: '/', icon: Compass },
    { name: 'Campus Map', path: '/map', icon: Map },
    { name: 'AI Trends & Peak', path: '/analytics', icon: BarChart3 },
    { name: 'My Profile', path: '/profile', icon: User }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      {/* Toast Notification Banner */}
      {message && (
        <div className={`text-center text-xs py-1.5 px-4 font-semibold transition-all ${
          message.type === 'error' ? 'bg-red-500 text-white' : 
          message.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
        }`}>
          {message.text}
        </div>
      )}

      {/* Active Check-In Floating Reminder */}
      {student?.currentCheckedInSpace && (
        <div className="bg-amber-500/20 border-b border-amber-500/40 text-amber-300 text-xs px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>You currently have a seat occupied on campus.</span>
          </div>
          <button 
            onClick={handleCheckOut}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-2.5 py-0.5 rounded text-xs transition-colors"
          >
            Check Out Now
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Live Sync Indicator */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-indigo-400 font-extrabold text-lg tracking-tight hover:text-indigo-300">
              <span className="text-2xl">🏛️</span>
              <span>StudySpace<span className="text-white font-light">Finder</span></span>
            </Link>

            <div className={`hidden sm:flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border ${
              socketConnected 
                ? 'bg-emerald-950/60 border-emerald-700 text-emerald-400' 
                : 'bg-rose-950/60 border-rose-700 text-rose-400'
            }`}>
              <Radio className={`w-3 h-3 ${socketConnected ? 'animate-pulse' : ''}`} />
              <span>{socketConnected ? 'Live Sync' : 'Reconnecting'}</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((tab) => {
              const Icon = tab.icon;
              const isActive = location.pathname === tab.path;
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Student Profile / Login Button */}
          <div className="flex items-center gap-3">
            {student ? (
              <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg">
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-semibold text-slate-200 leading-tight">{student.name}</p>
                  <p className="text-[10px] text-indigo-400 font-mono">{student.studentId}</p>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-1 hover:text-rose-400 text-slate-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-all"
              >
                Student Sign In
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden flex justify-around border-t border-slate-800 bg-slate-900/95 py-2 px-1">
        {navLinks.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-md text-[10px] font-medium ${
                isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Student Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Student Identification</h3>
            <p className="text-xs text-slate-400 mb-4">Enter your details to check into campus study spots.</p>
            
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Roll Number / Student ID</label>
                <input
                  type="text"
                  placeholder="e.g. STU101 or 21A91A..."
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alex Kumar"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogin(false)}
                  className="w-1/2 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg"
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;