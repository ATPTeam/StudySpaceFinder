// frontend/src/components/CampusMap.jsx
import { useState } from "react";
import gsap from "gsap";
import { Navigation, ZoomIn, ZoomOut } from "lucide-react";

const buildings = [
  { id: "sports", label: "SPORTS ROOMS", sub: "", x: 25, y: 3, w: 18, h: 11, type: "sports" },
  { id: "d", label: "BLOCK D", sub: "Academic", x: 7, y: 19, w: 17, h: 14 },
  { id: "h", label: "BLOCK H", sub: "Seminar Halls", x: 27, y: 17, w: 19, h: 15 },
  { id: "e", label: "BLOCK E", sub: "Academic", x: 57, y: 19, w: 18, h: 14 },
  { id: "i", label: "BLOCK I", sub: "Academic", x: 78, y: 10, w: 15, h: 13 },
  { id: "c", label: "BLOCK C", sub: "Civil", x: 9, y: 36, w: 17, h: 14 },
  { id: "f", label: "BLOCK F", sub: "Examinations", x: 73, y: 34, w: 17, h: 14 },
  { id: "b", label: "BLOCK B", sub: "Pharmacy", x: 22, y: 49, w: 17, h: 14 },
  { id: "a", label: "BLOCK A", sub: "Academic", x: 40, y: 53, w: 21, h: 16 },
  { id: "g", label: "BLOCK G", sub: "Library", x: 75, y: 55, w: 16, h: 14 },
];

const buildingForSpace = (space) => {
  const building = (space.building || "").toLowerCase();
  const name = (space.name || "").toLowerCase();

  if (building.includes("block d") || name.includes("d block")) return "d";
  if (building.includes("block e") || name.includes("e block")) return "e";
  if (building.includes("block g") || name.includes("g block")) return "g";
  if (building.includes("block h") || name.includes("h seminar")) return "h";
  return null;
};

function CampusMap({ spaces = [], selectedSpace, onSelectSpace }) {
  const [zoom, setZoom] = useState(1);
  const [hoveredSpace, setHoveredSpace] = useState(null);

  const groupedSpaces = {};

  spaces.forEach((space) => {
    const building = buildingForSpace(space);
    if (!building) return;
    if (!groupedSpaces[building]) groupedSpaces[building] = [];
    groupedSpaces[building].push(space);
  });

  const getStatus = (space) => {
    const free = (space.totalSeats || 0) - (space.occupiedSeats || 0);
    if (free <= 0 || space.status === "Full") return { label: "Full", color: "#ad625a" };
    if (space.status === "Filling Up" || free <= 15) return { label: "Filling up", color: "#bd9550" };
    return { label: "Available", color: "#69875b" };
  };

  const handleSpaceClick = (space) => {
    onSelectSpace(space);

    const pin = document.querySelector(`[data-campus-pin="${space._id}"]`);
    if (pin) {
      gsap.fromTo(
        pin,
        { scale: 1 },
        {
          scale: 1.65,
          duration: 0.22,
          repeat: 1,
          yoyo: true,
          ease: "power2.out",
        }
      );
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: "620px",
        border: "1px solid #d8d9d1",
        borderRadius: "14px",
        overflow: "hidden",
        background: "#e9eae4",
        position: "relative",
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          height: "66px",
          background: "#fbfbf8",
          borderBottom: "1px solid #d9dad3",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          position: "relative",
          zIndex: 300,
        }}
      >
        <div>
          <div
            style={{
              fontSize: "9px",
              fontWeight: 700,
              letterSpacing: "1.25px",
              color: "#878b82",
              marginBottom: "4px",
            }}
          >
            ANURAG UNIVERSITY
          </div>
          <div style={{ fontSize: "17px", fontWeight: 600, color: "#181b18" }}>
            Campus map
          </div>
        </div>

        <button
          type="button"
          style={{
            height: "38px",
            padding: "0 14px",
            display: "flex",
            alignItems: "center",
            gap: "7px",
            border: "1px solid #d6d7cf",
            borderRadius: "8px",
            background: "#fff",
            color: "#4c5149",
            fontSize: "12px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          <Navigation size={15} />
          Locate
        </button>
      </div>

      {/* Map Content */}
      <div
        style={{
          position: "relative",
          height: "calc(100% - 66px)",
          minHeight: "554px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `scale(${zoom})`,
            transformOrigin: "center center",
            transition: "transform .25s ease",
          }}
        >
          {/* Grid */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `
                linear-gradient(rgba(190,193,185,.22) 1px, transparent 1px),
                linear-gradient(90deg, rgba(190,193,185,.22) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />

          {/* Roads */}
          <div style={roadStyle("14%", "29%", "72%", "9px", "-5deg")} />
          <div style={roadStyle("-8%", "52%", "48%", "9px", "70deg")} />
          <div
            style={{
              position: "absolute",
              width: "47%",
              height: "9px",
              right: "-8%",
              top: "52%",
              background: "#d0d2ca",
              borderRadius: "20px",
              transform: "rotate(-70deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "80%",
              height: "9px",
              left: "10%",
              bottom: "16%",
              background: "#d0d2ca",
              borderRadius: "20px",
            }}
          />

          {/* Green areas */}
          <div style={greenStyle("2%", "3%", "19%", "23%", "48% 42% 52% 45%")} />
          <div style={greenStyle("37%", "51%", "25%", "22%", "50%")} />
          <div style={greenStyle("80%", "3%", "18%", "24%", "45% 50% 45% 52%")} />

          {/* Buildings */}
          {buildings.map((building) => {
            const isSports = building.type === "sports";

            return (
              <div
                key={building.id}
                className="campus-building"
                style={{
                  position: "absolute",
                  left: `${building.x}%`,
                  top: `${building.y}%`,
                  width: `${building.w}%`,
                  height: `${building.h}%`,
                  background: isSports ? "#e0e5dd" : "#fafaf6",
                  border: isSports ? "1px dashed #b8beb4" : "1px solid #babdb5",
                  boxShadow: "0 4px 10px rgba(35,38,34,.07)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  zIndex: 10,
                }}
              >
                {isSports ? (
                  <>
                    <div
                      style={{
                        width: "23px",
                        height: "23px",
                        borderRadius: "50%",
                        border: "1px solid #b9beb5",
                        display: "grid",
                        placeItems: "center",
                        color: "#8b9187",
                        fontSize: "12px",
                        marginBottom: "5px",
                      }}
                    >
                      +
                    </div>
                    <span style={buildingSub}>SPORTS ROOMS</span>
                  </>
                ) : (
                  <>
                    <span
                      style={{
                        position: "absolute",
                        left: "9px",
                        top: "8px",
                        fontSize: "9px",
                        fontWeight: 700,
                        color: "#9ba097",
                      }}
                    >
                      {building.id.toUpperCase()}
                    </span>
                    <strong style={buildingTitle}>{building.label}</strong>
                    <span style={buildingSub}>{building.sub}</span>
                  </>
                )}
              </div>
            );
          })}

          {/* Space pins + hover tooltips */}
          {Object.entries(groupedSpaces).map(([buildingId, buildingSpaces]) => {
            const building = buildings.find((item) => item.id === buildingId);
            if (!building) return null;

            const spacing = building.w / (buildingSpaces.length + 1);

            return buildingSpaces.map((space, index) => {
              const pinX = building.x + spacing * (index + 1);
              const pinY = building.y + building.h + 1.7;
              const status = getStatus(space);
              const free = Math.max(0, (space.totalSeats || 0) - (space.occupiedSeats || 0));
              const isSelected = selectedSpace?._id === space._id;
              const isHovered = hoveredSpace?._id === space._id;

              return (
                <div
                  key={space._id}
                  style={{
                    position: "absolute",
                    left: `${pinX}%`,
                    top: `${pinY}%`,
                    zIndex: isHovered || isSelected ? 150 : 80,
                  }}
                  onMouseEnter={() => setHoveredSpace(space)}
                  onMouseLeave={() => setHoveredSpace(null)}
                >
                  <button
                    type="button"
                    data-campus-pin={space._id}
                    onClick={() => handleSpaceClick(space)}
                    aria-label={`${space.name}, ${free} seats free`}
                    style={{
                      width: isSelected ? "17px" : "13px",
                      height: isSelected ? "17px" : "13px",
                      padding: 0,
                      borderRadius: "50%",
                      border: "2px solid white",
                      background: status.color,
                      boxShadow: isSelected
                        ? "0 0 0 5px rgba(105,135,91,.14), 0 3px 10px rgba(0,0,0,.2)"
                        : "0 2px 7px rgba(0,0,0,.18)",
                      cursor: "pointer",
                      display: "block",
                      transition: "all .18s ease",
                    }}
                  />

                  {/* Hover Tooltip */}
                  {isHovered && (
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        bottom: "24px",
                        transform: "translateX(-50%)",
                        width: "190px",
                        padding: "12px 13px",
                        background: "#ffffff",
                        border: "1px solid #d8d9d2",
                        borderRadius: "10px",
                        boxShadow: "0 12px 28px rgba(28,31,27,.16)",
                        pointerEvents: "none",
                        color: "#252923",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          marginBottom: "3px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {space.name}
                      </div>

                      <div
                        style={{
                          fontSize: "9px",
                          color: "#8a8f86",
                          marginBottom: "9px",
                        }}
                      >
                        {space.building} · {space.floor}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: "5px",
                          marginBottom: "8px",
                        }}
                      >
                        <strong style={{ fontSize: "20px", lineHeight: 1 }}>
                          {free}
                        </strong>
                        <span style={{ fontSize: "9px", color: "#777c73" }}>
                          seats free
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            fontSize: "9px",
                            fontWeight: 600,
                            color: status.color,
                          }}
                        >
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background: status.color,
                            }}
                          />
                          {status.label}
                        </span>

                        <span style={{ fontSize: "8px", color: "#8b9087" }}>
                          Verified
                        </span>
                      </div>

                      <div
                        style={{
                          position: "absolute",
                          left: "50%",
                          bottom: "-5px",
                          width: "9px",
                          height: "9px",
                          background: "#fff",
                          borderRight: "1px solid #d8d9d2",
                          borderBottom: "1px solid #d8d9d2",
                          transform: "translateX(-50%) rotate(45deg)",
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            });
          })}
        </div>

        {/* Compass */}
        <div
          style={{
            position: "absolute",
            top: "18px",
            right: "18px",
            width: "36px",
            height: "40px",
            background: "#fafaf6",
            border: "1px solid #c9cbc3",
            borderRadius: "7px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 300,
            color: "#656a62",
          }}
        >
          <b style={{ fontSize: "9px" }}>N</b>
          <span style={{ fontSize: "12px" }}>↑</span>
        </div>

        {/* Legend */}
        <div
          style={{
            position: "absolute",
            left: "16px",
            bottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "9px 11px",
            background: "rgba(250,250,247,.96)",
            border: "1px solid #d0d1ca",
            borderRadius: "7px",
            color: "#686d64",
            fontSize: "9px",
            zIndex: 300,
          }}
        >
          <Legend color="#69875b" text="Available" />
          <Legend color="#bd9550" text="Filling up" />
          <Legend color="#ad625a" text="Busy" />
        </div>

        {/* Zoom */}
        <div
          style={{
            position: "absolute",
            right: "18px",
            bottom: "18px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: "#fafaf6",
            border: "1px solid #d0d1ca",
            borderRadius: "7px",
            zIndex: 300,
          }}
        >
          <button
            type="button"
            onClick={() => setZoom((v) => Math.min(v + 0.1, 1.35))}
            style={zoomButton}
          >
            <ZoomIn size={15} />
          </button>

          <button
            type="button"
            onClick={() => setZoom((v) => Math.max(v - 0.1, 0.85))}
            style={{ ...zoomButton, borderTop: "1px solid #ddd" }}
          >
            <ZoomOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Legend({ color, text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
      <span
        style={{
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          background: color,
        }}
      />
      {text}
    </div>
  );
}

const roadStyle = (left, top, width, height, rotate) => ({
  position: "absolute",
  width,
  height,
  left,
  top,
  background: "#d0d2ca",
  borderRadius: "20px",
  transform: `rotate(${rotate})`,
});

const greenStyle = (left, bottom, width, height, radius) => ({
  position: "absolute",
  left,
  bottom,
  width,
  height,
  background: "#dce3d8",
  border: "1px solid #ccd3c8",
  borderRadius: radius,
});

const buildingTitle = {
  fontSize: "10px",
  fontWeight: 600,
  letterSpacing: ".55px",
  color: "#41453e",
};

const buildingSub = {
  marginTop: "5px",
  fontSize: "8px",
  color: "#989c93",
};

const zoomButton = {
  width: "32px",
  height: "32px",
  padding: 0,
  border: 0,
  background: "transparent",
  display: "grid",
  placeItems: "center",
  color: "#666b62",
  cursor: "pointer",
};

export default CampusMap;