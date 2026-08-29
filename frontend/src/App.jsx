import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  Search,
  SlidersHorizontal,
  Wifi,
  Zap,
  Snowflake,
  ChevronRight,
  Clock3,
  Users,
  VolumeX,
  Sparkles,
  BookOpen,
} from "lucide-react";

import {
  socket,
  fetchSpaces,
  fetchStudentSession,
  loginStudent,
  checkInSpace,
  checkOutSpace,
} from "./api/api";



import "./index.css";
import CampusMap from "./components/CampusMap";



// Operating Hours Helper (9:00 AM to 4:00 PM)
const getOperatingStatus = () => {
  const now = new Date();
  const currentHour = now.getHours(); // 0-23
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  const openTime = 9 * 60;   // 9:00 AM
  const closeTime = 16 * 60; // 4:00 PM

  const isOpen = currentTimeInMinutes >= openTime && currentTimeInMinutes < closeTime;
  return {
    isOpen : true,
    closedMessage: "Closed · Opens at 9:00 AM",
  };
};

function App() {
  const [spaces, setSpaces] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [student, setStudent] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [studentIdInput, setStudentIdInput] = useState("");

  // Profile & Logout States (Inside Component)
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Filter State: Mutually Exclusive Vibe + Multi-Select Facilities
  const [selectedVibe, setSelectedVibe] = useState("All"); // "All" | "Silent" | "Discussion"
  const [selectedFacilities, setSelectedFacilities] = useState([]); // Array of ["Power", "AC", "Wi-Fi"]

  const cardsRef = useRef({});
  const lastActiveId = useRef(null);

  // 1. Fetch spaces from Express Backend
  const loadSpaces = async () => {
    try {
     const res = await fetchSpaces();
      if (res.data.success) {
        setSpaces(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedSpace((prev) => prev || res.data.data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load spaces from backend", err);
    }
  };

  // 2. Initialize student session and socket listeners
  useEffect(() => {
    loadSpaces();

    const savedStudentId = localStorage.getItem("study_student_id");

if (savedStudentId) {
  fetchStudentSession(savedStudentId)
    .then((res) => {
      if (res.data.success) setStudent(res.data.data);
    })
    .catch(() => localStorage.removeItem("study_student_id"));
}

    socket.on("spaceUpdated", (updatedSpace) => {
      setSpaces((prev) =>
        prev.map((s) => (s._id === updatedSpace._id ? updatedSpace : s))
      );
      setSelectedSpace((prev) =>
        prev?._id === updatedSpace._id ? updatedSpace : prev
      );
    });

    return () => {
      socket.off("spaceUpdated");
    };
  }, []);

  // Multi-Filter Logic
  const filteredSpaces = spaces.filter((space) => {
    const matchesSearch =
      space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      space.building.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Vibe Filter Check (Mutually Exclusive)
    if (selectedVibe !== "All" && space.vibe !== selectedVibe) {
      return false;
    }

    // Facilities Multi-Select Check (Must contain all selected facilities)
    if (selectedFacilities.length > 0) {
      const hasAllFacilities = selectedFacilities.every((fac) =>
        space.facilities?.includes(fac)
      );
      if (!hasAllFacilities) return false;
    }

    return true;
  });

  // Vibe Toggle Handler
  const handleVibeClick = (vibe) => {
    lastActiveId.current = null;
    setSelectedVibe((prev) => (prev === vibe ? "All" : vibe));
  };

  // Facility Multi-Select Toggle Handler
  const handleFacilityClick = (facility) => {
    lastActiveId.current = null;
    setSelectedFacilities((prev) =>
      prev.includes(facility)
        ? prev.filter((f) => f !== facility)
        : [...prev, facility]
    );
  };

  // Highlight and Pin logic
  const highlightPin = (space, pulse = true) => {
    setSelectedSpace(space);

    const pin = document.querySelector(`[data-campus-pin="${space._id}"]`);
    if (!pin) return;

    if (pulse) {
      gsap.fromTo(
        pin,
        { scale: 1 },
        {
          scale: 1.55,
          duration: 0.22,
          repeat: 1,
          yoyo: true,
          ease: "power2.out",
        }
      );
    }
  };

  const selectSpace = (space) => {
    highlightPin(space);
    const card = cardsRef.current[space._id];
    if (card) {
      card.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  // Check-In / Check-Out Actions
  const handleCheckIn = async (spaceId, e) => {
    e.stopPropagation();
    if (!student) {
      setShowLogin(true);
      return;
    }
try {
  const res = await checkInSpace({
    studentId: student.studentId,
    spaceId,
  });
  if (res.data.success) {
    setStudent(res.data.data.student);
  }
} catch (err) {
      alert(err.response?.data?.message || "Check-in failed");
    }
  };

const handleCheckOut = async (e) => {
  if (e) e.stopPropagation();
  if (!student) return;
  try {
    const res = await checkOutSpace({
      studentId: student.studentId,
    });
    if (res.data.success) {
      setStudent(res.data.data.student);
    }
  } catch (err) {
    alert("Check-out failed");
  }
};

const handleLogout = async () => {
  if (student?.currentCheckedInSpace) {
    try {
      await checkOutSpace({
        studentId: student.studentId,
      });
    } catch (err) {
      console.error("Auto check-out on logout failed", err);
    }
  }

  localStorage.removeItem("study_student_id");
  setStudent(null);
  setShowLogoutConfirm(false);
  setShowProfileMenu(false);
};


const handleLoginSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await loginStudent({
      studentId: studentIdInput.trim().toUpperCase(),
      name: studentIdInput.trim().toUpperCase(),
    });
    if (res.data.success) {
      setStudent(res.data.data);
      localStorage.setItem("study_student_id", res.data.data.studentId);
      setShowLogin(false);
      setStudentIdInput("");
    }
  } catch (err) {
    alert("Login failed. Please check your backend connection.");
  }
};

  const getRelativeTime = (dateStr) => {
    if (!dateStr) return "Just now";
    const diff = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60));
    if (diff < 1) return "Just now";
    if (diff >= 30) return "Status Unverified";
    return `${diff} min ago`;
  };

  // Safe entrance animation that leaves cards completely visible
  useEffect(() => {
    if (!spaces.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".space-card",
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          stagger: 0.03,
          ease: "power2.out",
          clearProps: "all",
        }
      );
    });

    return () => ctx.revert();
  }, [spaces.length, selectedVibe, selectedFacilities.length, searchQuery]);

  const { isOpen, closedMessage } = getOperatingStatus();

  return (
    <div className="app">
      {/* Header */}
      <header className="navbar">
        <div className="brand nav-item">
  <span className="brand-mark">
    <BookOpen size={16} />
  </span>
  <span>StudySpace</span>
</div>

        {/* Explore Only */}
        <div className="nav-links">
          <button className="nav-link active nav-item">
            Explore
          </button>
        </div>

        <div className="nav-actions">
          <button className="campus-selector nav-item">
            Anurag University
            <ChevronRight size={15} />
          </button>

          {student ? (
            <div
              style={{ position: "relative" }}
              onMouseEnter={() => setShowProfileMenu(true)}
              onMouseLeave={() => setShowProfileMenu(false)}
            >
              <button
                className="profile-button nav-item"
                style={{
                  background: "#20231f",
                  color: "#ffffff",
                  fontWeight: 700,
                  border: "1px solid #20231f",
                }}
              >
                {student.studentId ? student.studentId.slice(-2) : "S"}
              </button>

              {/* Hover Dropdown Menu */}
              {showProfileMenu && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    paddingTop: "8px",
                    zIndex: 100,
                  }}
                >
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1px solid #d8d9d1",
                      borderRadius: "10px",
                      boxShadow: "0 10px 25px rgba(32, 35, 31, 0.08)",
                      padding: "10px 14px",
                      minWidth: "160px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#8b8e85", letterSpacing: "0.5px" }}>
                      {student.studentId}
                    </div>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowLogoutConfirm(true);
                      }}
                      style={{
                        background: "#fee2e2",
                        color: "#dc2626",
                        border: "none",
                        borderRadius: "6px",
                        padding: "7px 10px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="profile-button nav-item"
            >
              S
            </button>
          )}
        </div>
      </header>

      

      <main>
       <section className="hero">
  <div className="hero-container">
    {/* Left Column: Heading, Search & Filters */}
    <div className="hero-content">
      <p className="eyebrow">ANURAG UNIVERSITY · LIVE AVAILABILITY</p>

      <h1>
        Find your
        <br />
        <span>space.</span>
      </h1>

      <p className="hero-description">
        See what's available now, find the right atmosphere, and know when a space is likely to fill up.
      </p>

      <div className="search-box">
        <Search size={19} />
        <input
          type="text"
          placeholder="Search rooms, buildings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
      </div>

      <div className="filters">
        <button
          className={`filter-chip ${selectedVibe === "All" && selectedFacilities.length === 0 ? "selected" : ""}`}
          onClick={() => {
            setSelectedVibe("All");
            setSelectedFacilities([]);
          }}
        >
          All spaces
        </button>

        <button
          className={`filter-chip ${selectedVibe === "Silent" ? "selected" : ""}`}
          onClick={() => handleVibeClick("Silent")}
        >
          Silent
        </button>

        <button
          className={`filter-chip ${selectedVibe === "Discussion" ? "selected" : ""}`}
          onClick={() => handleVibeClick("Discussion")}
        >
          Discussion
        </button>

        <button
          className={`filter-chip ${selectedFacilities.includes("Power") ? "selected" : ""}`}
          onClick={() => handleFacilityClick("Power")}
        >
          Power {selectedFacilities.includes("Power") ? "✓" : ""}
        </button>

        <button
          className={`filter-chip ${selectedFacilities.includes("AC") ? "selected" : ""}`}
          onClick={() => handleFacilityClick("AC")}
        >
          AC {selectedFacilities.includes("AC") ? "✓" : ""}
        </button>

        <button
          className={`filter-chip ${selectedFacilities.includes("Wi-Fi") ? "selected" : ""}`}
          onClick={() => handleFacilityClick("Wi-Fi")}
        >
          Wi-Fi {selectedFacilities.includes("Wi-Fi") ? "✓" : ""}
        </button>
      </div>
    </div>

    {/* Right Column: Live Campus Overview Widget */}
    {/* Right Column: Wide Horizontal Campus Pulse Widget */}
<div className="hero-stats-card">
  <div className="stats-top-bar">
    <div className="stats-title-group">
      <span className="stats-badge">LIVE CAMPUS PULSE</span>
      <h3>Anurag Campus Overview</h3>
    </div>

    <div className={`status-pill ${isOpen ? "open" : "closed"}`}>
      <span className="status-dot-indicator" />
      <span>{isOpen ? "Open (9:00 AM – 4:00 PM)" : "Closed · Opens at 9:00 AM"}</span>
    </div>
  </div>

  <div className="stats-grid">
    <div className="stat-item">
      <div className="stat-icon-wrapper">
        <Users size={16} />
      </div>
      <div>
        <span className="stat-label">Available Seats</span>
        <strong className="stat-value">
          {!isOpen
            ? 0
            : spaces.reduce(
                (acc, s) => acc + Math.max(0, (s.totalSeats || 40) - (s.occupiedSeats || 0)),
                0
              )}
        </strong>
        <small className="stat-sub">Across 13 campus spaces</small>
      </div>
    </div>

    <div className="stat-item">
      <div className="stat-icon-wrapper">
        <VolumeX size={16} />
      </div>
      <div>
        <span className="stat-label">Silent Zone Seats</span>
        <strong className="stat-value">
          {!isOpen
            ? 0
            : spaces
                .filter((s) => s.vibe === "Silent")
                .reduce(
                  (acc, s) => acc + Math.max(0, (s.totalSeats || 40) - (s.occupiedSeats || 0)),
                  0
                )}
        </strong>
        <small className="stat-sub">D, E & G Libraries</small>
      </div>
    </div>
  </div>

  <div className="stats-footer">
    <div className="stats-tip">
      <Sparkles size={14} className="tip-icon" />
      <span>
        <strong>Smart Recommendation:</strong>{" "}
        {!isOpen
          ? "Campus spots are closed for the day. Re-opens tomorrow at 9:00 AM."
          : "Block H Seminar Halls currently offer the highest free capacity."}
      </span>
    </div>
  </div>
</div>
  </div>
</section>

        <section className="explorer">
          <div className="spaces-panel">
            <div className="panel-header">
              <div>
                <span className="result-count">{filteredSpaces.length} spaces</span>
                <h2>Available nearby</h2>
              </div>

              <button className="sort-button">
                Recommended
                <ChevronRight size={15} />
              </button>
            </div>

            <div className="space-list">
              {filteredSpaces.map((space) => {
                const total = space.totalSeats || 40;
                const occupied = space.occupiedSeats || 0;
                const free = Math.max(0, total - occupied);
                const percentage = Math.min(100, Math.round((occupied / total) * 100));
                const isSelected = selectedSpace?._id === space._id;
                const isSeatedHere =
                  student?.currentCheckedInSpace === space._id ||
                  student?.currentCheckedInSpace?._id === space._id;

                const statusClass = !isOpen
                  ? "busy"
                  : space.status === "Available"
                  ? "available"
                  : space.status === "Filling Up"
                  ? "filling"
                  : "busy";

                return (
                  <article
                    key={space._id}
                    ref={(el) => {
                      cardsRef.current[space._id] = el;
                    }}
                    data-space-id={space._id}
                    className={`space-card ${isSelected ? "selected-card" : ""}`}
                    onClick={() => selectSpace(space)}
                  >
                    <div className="card-top">
                      <div>
                        <p className="space-building">
                          {space.building} · {space.floor}
                        </p>
                        <h3>{space.name}</h3>
                      </div>

                      <div className={`status-dot ${statusClass}`} />
                    </div>

                    <div className="availability">
                      <strong>{!isOpen ? 0 : free}</strong>
                      <span>{!isOpen ? "seats (Closed)" : "seats free"}</span>
                    </div>

                    <div className="occupancy-bar">
                      <span style={{ width: !isOpen ? "0%" : `${percentage}%` }} />
                    </div>

                    <div className="card-meta">
                      <span className="verification">
                        <Clock3 size={13} />
                        Verified {getRelativeTime(space.lastUpdated)}
                      </span>

                      {/* 9:00 AM - 4:00 PM Operating Hours Badge */}
                      <span
                        className="prediction"
                        style={{ color: !isOpen ? "#dc2626" : undefined }}
                      >
                        {!isOpen
                          ? closedMessage
                          : percentage >= 80
                          ? "Nearly full"
                          : percentage >= 50
                          ? "Likely to fill in 25 min"
                          : "Good availability"}
                      </span>
                    </div>

                    <div
                      className="facility-row"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        <span className="vibe">{space.vibe}</span>

                        {space.facilities.map((facility) => (
                          <span key={facility} className="facility">
                            {facility === "Wi-Fi" && <Wifi size={12} />}
                            {facility === "Power" && <Zap size={12} />}
                            {facility === "AC" && <Snowflake size={12} />}
                            {facility}
                          </span>
                        ))}
                      </div>

                      {/* 1-Tap Check-In / Out Button */}
                      {isSeatedHere ? (
                        <button
                          onClick={handleCheckOut}
                          style={{
                            background: "#ef4444",
                            color: "white",
                            border: "none",
                            padding: "4px 10px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Check Out
                        </button>
                      ) : (
                        <button
  onClick={(e) => handleCheckIn(space._id, e)}
  disabled={!isOpen || occupied >= total}
  className="theme-checkin-btn"
  style={{
    background: !isOpen || occupied >= total ? "#d0d2ca" : "#20231f",
    color: !isOpen || occupied >= total ? "#8b8e85" : "#ffffff",
    border: "none",
    padding: "6px 14px",
    borderRadius: "7px",
    fontSize: "11px",
    fontWeight: 700,
    cursor: !isOpen || occupied >= total ? "not-allowed" : "pointer",
    transition: "background 180ms ease, transform 180ms ease",
  }}
>
  {!isOpen ? "Closed" : occupied >= total ? "Full" : "Check In"}
</button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="map-panel">
            <CampusMap
              spaces={spaces}
              selectedSpace={selectedSpace}
              onSelectSpace={selectSpace}
            />
          </div>
        </section>
      </main>

      {/* Student Sign-in Modal */}
      {showLogin && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(32, 35, 31, 0.45)",
            backdropFilter: "blur(6px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#fbfbf8",
              borderRadius: "14px",
              maxWidth: "380px",
              width: "100%",
              padding: "28px 26px",
              border: "1px solid #d8d9d1",
              boxShadow: "0 20px 40px rgba(32, 35, 31, 0.12)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "6px" }}>
              <span
                style={{
                  width: "22px",
                  height: "22px",
                  display: "grid",
                  placeItems: "center",
                  background: "#20231f",
                  color: "white",
                  borderRadius: "5px",
                  fontSize: "11px",
                  fontWeight: 800,
                }}
              >
                S
              </span>
              <h3
                style={{
                  margin: 0,
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "#20231f",
                  letterSpacing: "-0.4px",
                }}
              >
                Student Sign In
              </h3>
            </div>

            <p style={{ margin: "0 0 20px", fontSize: "12px", color: "#696c64", lineHeight: 1.5 }}>
              Enter your Anurag University Roll Number to check in to campus study spaces.
            </p>

            <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.6px",
                    color: "#55584f",
                    marginBottom: "6px",
                  }}
                >
                  Roll Number
                </label>
                <input
                  type="text"
                  placeholder="Enter roll number"
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value.toUpperCase())}
                  style={{
                    width: "100%",
                    height: "46px",
                    padding: "0 14px",
                    border: "1px solid #d8d9d1",
                    background: "#ffffff",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                    color: "#20231f",
                    outline: "none",
                    boxShadow: "0 2px 6px rgba(32, 35, 31, 0.03)",
                  }}
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                <button
                  type="button"
                  onClick={() => setShowLogin(false)}
                  style={{
                    flex: 1,
                    height: "42px",
                    border: "1px solid #deded7",
                    background: "#f6f6f1",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#55584f",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1.2,
                    height: "42px",
                    border: "none",
                    background: "#20231f",
                    color: "#ffffff",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(32, 35, 31, 0.15)",
                  }}
                >
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(32, 35, 31, 0.45)",
            backdropFilter: "blur(6px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#fbfbf8",
              borderRadius: "14px",
              maxWidth: "360px",
              width: "100%",
              padding: "24px",
              border: "1px solid #d8d9d1",
              boxShadow: "0 20px 40px rgba(32, 35, 31, 0.12)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <h3
              style={{
                margin: "0 0 8px",
                fontFamily: "'Manrope', sans-serif",
                fontSize: "17px",
                fontWeight: 800,
                color: "#20231f",
                letterSpacing: "-0.3px",
              }}
            >
              Confirm Sign Out
            </h3>

            <p style={{ margin: "0 0 20px", fontSize: "12px", color: "#696c64", lineHeight: 1.5 }}>
              Logging out will automatically check you out of any active study space. Are you sure you want to continue?
            </p>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  flex: 1,
                  height: "40px",
                  border: "1px solid #deded7",
                  background: "#f6f6f1",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#55584f",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  flex: 1,
                  height: "40px",
                  border: "none",
                  background: "#dc2626",
                  color: "#ffffff",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(220, 38, 38, 0.2)",
                }}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Active Check-In Toast Pill */}
{student?.currentCheckedInSpace && (
  <div
    style={{
      position: "fixed",
      bottom: "24px",
      right: "24px",
      zIndex: 999,
      background: "#20231f",
      color: "#ffffff",
      padding: "12px 18px",
      borderRadius: "12px",
      boxShadow: "0 12px 30px rgba(32, 35, 31, 0.22)",
      display: "flex",
      alignItems: "center",
      gap: "14px",
      fontFamily: "'DM Sans', sans-serif",
      border: "1px solid #383c34",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: "#10b981",
          boxShadow: "0 0 8px #10b981",
        }}
      />
      <span style={{ fontSize: "12px", fontWeight: 600 }}>
        Active Seat Occupied
      </span>
    </div>

    <button
      onClick={handleCheckOut}
      style={{
        background: "#dc2626",
        color: "#ffffff",
        border: "none",
        padding: "6px 12px",
        borderRadius: "7px",
        fontSize: "11px",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      Check Out
    </button>
  </div>
)}
    </div>
  );
}

export default App;