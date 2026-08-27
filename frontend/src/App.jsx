// frontend/src/App.jsx
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Search,
  SlidersHorizontal,
  Wifi,
  Zap,
  Snowflake,
  ChevronRight,
  Clock3,
  CheckCircle2,
  LogOut,
  Sparkles,
} from "lucide-react";
import axios from "axios";
import { io } from "socket.io-client";

import "./index.css";
import CampusMap from "./components/CampusMap";

gsap.registerPlugin(ScrollTrigger);

const socket = io("http://localhost:5000");

const filters = [
  "All spaces",
  "Silent",
  "Discussion",
  "Power",
  "AC",
  "Wi-Fi",
];

function App() {
  const [spaces, setSpaces] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All spaces");
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [student, setStudent] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [studentIdInput, setStudentIdInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [activeTab, setActiveTab] = useState("explore");

  const cardsRef = useRef({});
  const lastActiveId = useRef(null);

  // 1. Fetch spaces from Express Backend
  const loadSpaces = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/spaces");
      if (res.data.success) {
        setSpaces(res.data.data);
        if (!selectedSpace && res.data.data.length > 0) {
          setSelectedSpace(res.data.data[0]);
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
      axios
        .get(`http://localhost:5000/api/students/me/${savedStudentId}`)
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

  // Filter logic
  const filteredSpaces = spaces.filter((space) => {
    const matchesSearch =
      space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      space.building.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeFilter === "All spaces") return true;
    if (activeFilter === "Silent") return space.vibe === "Silent";
    if (activeFilter === "Discussion") return space.vibe === "Discussion";
    return space.facilities.includes(activeFilter);
  });

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
      const res = await axios.post("http://localhost:5000/api/students/check-in", {
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
      const res = await axios.post("http://localhost:5000/api/students/check-out", {
        studentId: student.studentId,
      });
      if (res.data.success) {
        setStudent(res.data.data.student);
      }
    } catch (err) {
      alert("Check-out failed");
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/students/login", {
        studentId: studentIdInput,
        name: nameInput,
      });
      if (res.data.success) {
        setStudent(res.data.data);
        localStorage.setItem("study_student_id", res.data.data.studentId);
        setShowLogin(false);
      }
    } catch (err) {
      alert("Login failed");
    }
  };

  // Calculate dynamic verification relative time
  const getRelativeTime = (dateStr) => {
    const diff = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60));
    if (diff < 1) return "Just now";
    return `${diff} min ago`;
  };

  // GSAP Animations
  useEffect(() => {
    if (!filteredSpaces.length) return;

    const ctx = gsap.context(() => {
      gsap.from(".nav-item", {
        y: -12,
        opacity: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: "power2.out",
      });

      gsap.from(".hero-content > *", {
        y: 24,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
        delay: 0.15,
      });

      filteredSpaces.forEach((space) => {
        const card = cardsRef.current[space._id];
        if (!card) return;

        gsap.fromTo(
          card,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 82%",
              end: "bottom 30%",
              toggleActions: "play none none reverse",
              onEnter: () => {
                if (lastActiveId.current === space._id) return;
                lastActiveId.current = space._id;
                highlightPin(space, true);
              },
              onEnterBack: () => {
                if (lastActiveId.current === space._id) return;
                lastActiveId.current = space._id;
                highlightPin(space, true);
              },
            },
          }
        );
      });

      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, [activeFilter, spaces.length]);

  return (
    <div className="app">
      {/* Header */}
      <header className="navbar">
        <div className="brand nav-item">
          <span className="brand-mark">S</span>
          <span>StudySpace</span>
        </div>

        <div className="nav-links">
          <button
            className={`nav-link ${activeTab === "explore" ? "active" : ""} nav-item`}
            onClick={() => setActiveTab("explore")}
          >
            Explore
          </button>

          <button
            className={`nav-link ${activeTab === "myspaces" ? "active" : ""} nav-item`}
            onClick={() => {
              if (!student) setShowLogin(true);
              else setActiveTab("myspaces");
            }}
          >
            My spaces
          </button>
        </div>

        <div className="nav-actions">
          <button className="campus-selector nav-item">
            Anurag University
            <ChevronRight size={15} />
          </button>

          {student ? (
            <button
              onClick={() => {
                if (confirm(`Logged in as ${student.name}. Log out?`)) {
                  localStorage.removeItem("study_student_id");
                  setStudent(null);
                }
              }}
              title="Click to logout"
              className="profile-button nav-item"
              style={{ background: "#4f46e5", color: "white", fontWeight: "bold" }}
            >
              {student.name.charAt(0)}
            </button>
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

      {/* Active Seated Floating Pill */}
      {student?.currentCheckedInSpace && (
        <div
          style={{
            background: "#ecfdf5",
            borderBottom: "1px solid #a7f3d0",
            padding: "8px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "12px",
            color: "#065f46",
          }}
        >
          <span>
            🟢 <strong>Checked In:</strong> You have an active seat occupied right now.
          </span>
          <button
            onClick={handleCheckOut}
            style={{
              background: "#ef4444",
              color: "white",
              border: "none",
              padding: "4px 12px",
              borderRadius: "6px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Check Out
          </button>
        </div>
      )}

      <main>
        <section className="hero">
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
              <button className="filter-button">
                <SlidersHorizontal size={17} />
                Filters
              </button>
            </div>

            <div className="filters">
              {filters.map((filter) => (
                <button
                  key={filter}
                  className={`filter-chip ${activeFilter === filter ? "selected" : ""}`}
                  onClick={() => {
                    lastActiveId.current = null;
                    setActiveFilter(filter);
                  }}
                >
                  {filter}
                </button>
              ))}
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
                const free = Math.max(0, space.totalSeats - space.occupiedSeats);
                const percentage = (space.occupiedSeats / space.totalSeats) * 100;
                const isSelected = selectedSpace?._id === space._id;
                const isSeatedHere =
                  student?.currentCheckedInSpace === space._id ||
                  student?.currentCheckedInSpace?._id === space._id;

                const statusClass =
                  space.status === "Available"
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
                      <strong>{free}</strong>
                      <span>seats free</span>
                    </div>

                    <div className="occupancy-bar">
                      <span style={{ width: `${percentage}%` }} />
                    </div>

                    <div className="card-meta">
                      <span className="verification">
                        <Clock3 size={13} />
                        Verified {getRelativeTime(space.lastUpdated)}
                      </span>

                      <span className="prediction">
                        {percentage >= 80 ? "Nearly full" : percentage >= 50 ? "Likely to fill in 25 min" : "Good availability"}
                      </span>
                    </div>

                    <div className="facility-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
                          disabled={space.occupiedSeats >= space.totalSeats}
                          style={{
                            background: space.occupiedSeats >= space.totalSeats ? "#ccc" : "#4f46e5",
                            color: "white",
                            border: "none",
                            padding: "4px 10px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 600,
                            cursor: space.occupiedSeats >= space.totalSeats ? "not-allowed" : "pointer",
                          }}
                        >
                          {space.occupiedSeats >= space.totalSeats ? "Full" : "Check In"}
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
            background: "rgba(0,0,0,0.6)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              maxWidth: "360px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "4px", color: "#111" }}>
              Student Sign In
            </h3>
            <p style={{ fontSize: "12px", color: "#666", marginBottom: "16px" }}>
              Enter your Roll Number to check in to campus spots.
            </p>

            <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "bold", marginBottom: "4px", color: "#333" }}>
                  Roll Number / Student ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. STU101 or 21A91A..."
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    fontSize: "13px",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "bold", marginBottom: "4px", color: "#333" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Kumar"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    fontSize: "13px",
                  }}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setShowLogin(false)}
                  style={{
                    flex: 1,
                    padding: "8px",
                    border: "1px solid #ccc",
                    background: "#f3f4f6",
                    borderRadius: "6px",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "8px",
                    border: "none",
                    background: "#4f46e5",
                    color: "white",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;