"use client"
import { useState, useEffect } from "react";
import ScrollVelocity from "@/components/ScrollVelocity";
import SplitText from "@/components/SplitText";
import LinearProgress from "@/components/LinearProgress";

const volunteers = [
  { name: "Priya Sharma",  skill: "First Aid & Medical",   contact: "+91 98201 34567" },
  { name: "Arjun Mehta",   skill: "Search & Rescue",       contact: "+91 97301 22456" },
  { name: "Divya Nair",    skill: "Logistics & Supply",    contact: "+91 99201 87654" },
  { name: "Rahul Verma",   skill: "Communication Tech",    contact: "+91 98765 43210" },
  { name: "Sneha Iyer",    skill: "Counselling & Support", contact: "+91 96321 54789" },
  { name: "Karan Patel",   skill: "Heavy Equipment",       contact: "+91 98456 12345" },
  { name: "Ananya Reddy",  skill: "Water Sanitation",      contact: "+91 97890 67891" },
];

const handleAnimationComplete = () => console.log("All letters animated!");

export default function Home() {
  const [expanded, setExpanded] = useState(null);
  const [needs, setNeeds] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("requestedNeeds");
      setNeeds(JSON.parse(stored || "[]"));
    }
  }, []);

  const handleClick = (id) => setExpanded(expanded === id ? null : id);

  // ── PREVIEWS (condensed version of content) ──

  const resourcePreview = (
    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
      {[
        { label: "Medical Kits",  value: "124/200", progress: 62 },
        { label: "Water Cans",    value: "500/600", progress: 83 },
        { label: "Blankets",      value: "80/400",  progress: 20 },
      ].map((item) => (
        <div key={item.label} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#aaa" }}>
            <span>{item.label}</span>
            <span style={{ color: "#FFB343" }}>{item.value}</span>
          </div>
          <LinearProgress progress={item.progress} color="#FFB343" backgroundColor="rgba(255,255,255,0.06)" height={4} animated showPercentage={false} />
        </div>
      ))}
    </div>
  );

  const resourceFull = (
    <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
      {[
        { label: "Medical Kits",  value: "124 / 200", progress: 62 },
        { label: "Food Packages", value: "320 / 500", progress: 64 },
        { label: "Water Cans",    value: "500 / 600", progress: 83 },
        { label: "Tents",         value: "45 / 60",   progress: 75 },
        { label: "Blankets",      value: "80 / 400",  progress: 20 },
        { label: "Vehicles",      value: "8 / 12",    progress: 66 },
      ].map((item) => (
        <div key={item.label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#ccc" }}>
            <span>{item.label}</span>
            <span style={{ color: "#FFB343" }}>{item.value}</span>
          </div>
          <LinearProgress progress={item.progress} color="#FFB343" backgroundColor="rgba(255,255,255,0.08)" height={7} animated showPercentage={false} />
        </div>
      ))}
      <div style={{ marginTop: 4, padding: "8px 12px", background: "rgba(252,129,129,0.08)", border: "1px solid rgba(252,129,129,0.2)", borderRadius: 8, fontSize: 12, color: "#FC8181" }}>
        Blankets critically low — restock needed
      </div>
    </div>
  );

  const tasksPreview = (
    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 5 }}>
      {needs.length === 0 ? (
        <div style={{ fontSize: 11, color: "#555" }}>No requests yet</div>
      ) : (
        needs.slice(0, 2).map((need, i) => (
          <div key={i} style={{
            fontSize: 11, color: "#aaa",
            borderLeft: "2px solid #FFB343",
            paddingLeft: 8, paddingTop: 2, paddingBottom: 2,
          }}>
            {need}
          </div>
        ))
      )}
      {needs.length > 2 && (
        <div style={{ fontSize: 10, color: "rgba(255,179,67,0.4)" }}>+{needs.length - 2} more...</div>
      )}
    </div>
  );

  const tasksFull = (
    <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
      {needs.length === 0 && (
        <div style={{ textAlign: "center", color: "#555", fontSize: 13, padding: "20px 0" }}>
          No requests received yet
        </div>
      )}
      {needs.map((need, i) => (
        <div key={i} style={{
          background: "rgba(255,255,255,0.04)",
          borderRadius: 8, padding: "10px 12px",
          fontSize: 13, color: "#ccc",
          borderLeft: "3px solid #FFB343",
        }}>
          {need}
        </div>
      ))}
    </div>
  );

  const volunteersPreview = (
    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
      {volunteers.slice(0, 3).map((v, i) => (
        <div key={i} style={{
          display: "flex", justifyContent: "space-between",
          fontSize: 11, color: "#aaa",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          paddingBottom: 4,
        }}>
          <span style={{ color: "#FFB343" }}>{v.name}</span>
          <span>{v.skill}</span>
        </div>
      ))}
      <div style={{ fontSize: 10, color: "rgba(255,179,67,0.4)", marginTop: 2 }}>
        +{volunteers.length - 3} more volunteers
      </div>
    </div>
  );

  const volunteersFull = (
    <div style={{ marginTop: 16, overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {["Name", "Skill", "Contact"].map((h) => (
              <th key={h} style={{
                color: "#FFB343", fontWeight: 700,
                padding: "8px 12px", textAlign: "left",
                borderBottom: "1px solid rgba(255,179,67,0.3)",
                fontSize: 12, letterSpacing: "0.05em", textTransform: "uppercase",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {volunteers.map((v, i) => (
            <tr key={i}
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,179,67,0.05)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <td style={{ padding: "10px 12px", color: "#FFB343", fontWeight: 600 }}>{v.name}</td>
              <td style={{ padding: "10px 12px", color: "#ccc" }}>{v.skill}</td>
              <td style={{ padding: "10px 12px", color: "#ccc" }}>{v.contact}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const donationsPreview = (
    <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
      {[
        { label: "Active",   value: "8",  color: "#68D391" },
        { label: "Standby",  value: "3",  color: "#F6AD55" },
        { label: "SOS",      value: "2",  color: "#FC8181" },
      ].map((s) => (
        <div key={s.label} style={{
          flex: 1, background: "rgba(255,255,255,0.04)",
          borderRadius: 6, padding: "6px 4px",
          textAlign: "center", fontSize: 10, color: "#aaa",
        }}>
          <div style={{ color: s.color, fontWeight: 700, fontSize: 16 }}>{s.value}</div>
          {s.label}
        </div>
      ))}
    </div>
  );

  const ngoPreview = (
    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#aaa" }}>
        <span>Generators</span>
        <span style={{ color: "#68D391" }}>12 active</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#aaa" }}>
          <span>Fuel Level</span>
          <span style={{ color: "#F6AD55" }}>40%</span>
        </div>
        <LinearProgress progress={40} color="#F6AD55" backgroundColor="rgba(255,255,255,0.06)" height={4} animated showPercentage={false} />
      </div>
    </div>
  );

  const cards = [
    {
      id: 1, title: "Resources", icon: "", col: "1", row: "1",
      preview: resourcePreview,
      content: resourceFull,
    },
    {
      id: 2, title: "My Tasks", icon: "", col: "2", row: "1",
      preview: tasksPreview,
      content: tasksFull,
    },
    {
      id: 3, title: "Active Requests", icon: "", col: "3 / span 2", row: "1 / span 2",
      preview: (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 5 }}>
          {[
            { label: "24 open requests",    color: "#F6AD55" },
            { label: "3 urgent — Zone 4B",  color: "#FC8181" },
            { label: "12 in progress",      color: "#68D391" },
          ].map((r) => (
            <div key={r.label} style={{ fontSize: 11, color: r.color, borderLeft: `2px solid ${r.color}`, paddingLeft: 8 }}>
              {r.label}
            </div>
          ))}
        </div>
      ),
      content: <></>,
    },
    {
      id: 4, title: "Volunteers", icon: "", col: "1 / span 2", row: "2 / span 2",
      preview: volunteersPreview,
      content: volunteersFull,
    },
    {
      id: 5, title: "Donations", icon: "🚒", col: "3", row: "3",
      preview: donationsPreview,
      content: (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "10px 14px", fontSize: 14, color: "#ccc", display: "flex", justifyContent: "space-between" }}>
            <span>Teams Active</span><span style={{ color: "#68D391", fontWeight: 600 }}>8 teams</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "10px 14px", fontSize: 14, color: "#ccc", display: "flex", justifyContent: "space-between" }}>
            <span>On Standby</span><span style={{ color: "#F6AD55", fontWeight: 600 }}>3 teams</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "10px 14px", fontSize: 14, color: "#ccc", display: "flex", justifyContent: "space-between" }}>
            <span>SOS Pending</span><span style={{ color: "#FC8181", fontWeight: 600 }}>2 calls</span>
          </div>
        </div>
      ),
    },
    {
      id: 6, title: "NGO Units", icon: "🔋", col: "4", row: "3",
      preview: ngoPreview,
      content: (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "10px 14px", fontSize: 14, color: "#ccc", display: "flex", justifyContent: "space-between" }}>
            <span>Generators</span><span style={{ color: "#68D391", fontWeight: 600 }}>12 active</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "10px 14px", fontSize: 14, color: "#ccc" }}>
            <div style={{ marginBottom: 6 }}>Fuel Level</div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3 }}>
              <div style={{ width: "40%", height: "100%", background: "#F6AD55", borderRadius: 3 }} />
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "10px 14px", fontSize: 14, color: "#ccc", display: "flex", justifyContent: "space-between" }}>
            <span>Outage Zones</span><span style={{ color: "#FC8181", fontWeight: 600 }}>Zone 6B</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>

      <div style={{ position: "fixed", inset: 0, zIndex: 0, background: "#000" }} />

      <div style={{
        position: "relative", zIndex: 10,
        width: "100vw", left: "50%",
        transform: "translateX(-50%)",
        overflow: "hidden",
        background: "#880808",
        marginTop: "-10px",
        height: "60px",
      }}>
        <ScrollVelocity texts={["Active disaster Alert"]} velocity={100} className="custom-scroll-text" />
      </div>

      <div style={{
        position: "relative", zIndex: 10,
        display: "flex", justifyContent: "center", alignItems: "center",
        marginTop: "30px", color: "#FFB343",
      }}>
        <SplitText
          text="Madat"
          className="text-5xl font-semibold text-center"
          delay={50} duration={1.25} ease="power3.out"
          splitType="chars"
          from={{ opacity: 0, y: 40 }} to={{ opacity: 1, y: 0 }}
          threshold={0.1} rootMargin="-100px" textAlign="center"
          onLetterAnimationComplete={handleAnimationComplete}
          showCallback
        />
      </div>

      <div style={{
        position: "relative", zIndex: 10,
        display: "flex", flexDirection: "column",
        marginLeft: "100px", lineHeight: "1", marginTop: "100px",
      }}>
        <div style={{ color: "#FFB343", fontSize: "90px", fontWeight: "bolder", lineHeight: "1" }}>Disaster</div>
        <div style={{ color: "white",   fontSize: "90px", fontWeight: "bolder", lineHeight: "1" }}>Response</div>
      </div>

      <div style={{
        position: "relative", zIndex: 10,
        fontSize: "16px", color: "#bfc9c8",
        marginLeft: "100px", marginTop: "12px",
        maxWidth: "500px", lineHeight: "1.6",
      }}>
        A unified coordination platform connecting disaster victims with NGOs and volunteers in real time
      </div>

      {/* Bento Grid */}
      <div style={{
        position: "relative", zIndex: 10,
        width: "90%", margin: "40px auto 60px",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "10px", padding: "12px",
      }}>
        {cards.map((card) => {
          const isExpanded = expanded === card.id;
          return (
            <div
              key={card.id}
              onClick={() => handleClick(card.id)}
              style={{
                gridColumn: card.col,
                gridRow: card.row,
                minHeight: isExpanded ? 600 : 200,
                background: isExpanded ? "#2a2a2a" : "#1E1E1E",
                borderRadius: 12,
                color: "white",
                padding: isExpanded ? 28 : 20,
                fontSize: 18,
                fontWeight: 600,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                cursor: "pointer",
                border: isExpanded ? "1px solid rgba(255,100,100,0.4)" : "1px solid transparent",
                boxShadow: isExpanded ? "0 0 24px rgba(255,80,80,0.15)" : "none",
                transition: "all 0.35s ease",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* Icon */}
              <div style={{ fontSize: isExpanded ? 36 : 24, marginBottom: isExpanded ? 12 : 6, transition: "all 0.3s ease" }}>
                {card.icon}
              </div>

              {/* Title */}
              <div style={{ fontSize: isExpanded ? 22 : 18, transition: "all 0.3s ease" }}>
                {card.title}
              </div>

              {/* Preview — always visible when collapsed */}
              {!isExpanded && card.preview}

              {/* Full content — only when expanded */}
              {isExpanded && (
                <>
                  {card.content}
                  <div style={{ marginTop: 6, fontSize: 11, color: "#555", textAlign: "right" }}>
                    click to collapse ↑
                  </div>
                </>
              )}

              {/* Expand hint */}
              {!isExpanded && (
                <div style={{ position: "absolute", bottom: 10, right: 14, fontSize: 11, color: "#555" }}>
                  tap to expand ↓
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}