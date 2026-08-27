// frontend/src/context/AppContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  fetchSpaces, 
  fetchSpaceMeta, 
  fetchStudentSession, 
  checkInSpace, 
  checkOutSpace, 
  pingSpaceFreshness, 
  socket 
} from '../api/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [spaces, setSpaces] = useState([]);
  const [metadata, setMetadata] = useState({ buildings: ['All'], vibes: ['All'], facilities: ['All'] });
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [message, setMessage] = useState(null);

  // Flash message banner
  const notify = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  // 1. Initial Load: Fetch Metadata & Restore Student Session
  useEffect(() => {
    const init = async () => {
      try {
        const metaRes = await fetchSpaceMeta();
        if (metaRes.data.success) {
          setMetadata(metaRes.data.data);
        }

        const savedStudentId = localStorage.getItem('study_student_id');
        if (savedStudentId) {
          const sessionRes = await fetchStudentSession(savedStudentId);
          if (sessionRes.data.success) {
            setStudent(sessionRes.data.data);
          }
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // 2. Load Space Data
  const loadSpaces = async (filters = {}) => {
    try {
      const res = await fetchSpaces(filters);
      if (res.data.success) {
        setSpaces(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching spaces:', err);
    }
  };

  // 3. Socket.io Real-Time Event Listener
  useEffect(() => {
    socket.on('connect', () => setSocketConnected(true));
    socket.on('disconnect', () => setSocketConnected(false));

    // When any student checks in/out on campus, update local state instantly
    socket.on('spaceUpdated', (updatedSpace) => {
      setSpaces((prev) =>
        prev.map((s) => (s._id === updatedSpace._id ? updatedSpace : s))
      );
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('spaceUpdated');
    };
  }, []);

  // Check-In Action
  const handleCheckIn = async (spaceId) => {
    if (!student) {
      notify('Please enter your Student ID in the top bar before checking in!', 'error');
      return;
    }
    try {
      const res = await checkInSpace({ studentId: student.studentId, spaceId });
      if (res.data.success) {
        setStudent(res.data.data.student);
        notify(res.data.message, 'success');
      }
    } catch (err) {
      notify(err.response?.data?.message || 'Check-in failed', 'error');
    }
  };

  // Check-Out Action
  const handleCheckOut = async () => {
    if (!student) return;
    try {
      const res = await checkOutSpace({ studentId: student.studentId });
      if (res.data.success) {
        setStudent(res.data.data.student);
        notify(res.data.message, 'success');
      }
    } catch (err) {
      notify(err.response?.data?.message || 'Check-out failed', 'error');
    }
  };

  // 1-Tap Freshness Ping
  const handlePing = async (spaceId) => {
    try {
      const res = await pingSpaceFreshness(spaceId);
      if (res.data.success) {
        notify('Space status freshness verified!', 'success');
      }
    } catch (err) {
      notify('Verification failed', 'error');
    }
  };

  return (
    <AppContext.Provider
      value={{
        spaces,
        metadata,
        student,
        setStudent,
        loading,
        socketConnected,
        message,
        notify,
        loadSpaces,
        handleCheckIn,
        handleCheckOut,
        handlePing
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);