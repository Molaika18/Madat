"use client";
import { useState, useEffect } from "react";
import LinearProgress from "@/components/LinearProgress";
import { fetchAlerts, fetchCoverage, fetchNGOs } from "../../lib/api";

const tickerItems = [
  "2,847 SOS alerts resolved this month",
  "143 NGOs connected across 12 cities",
  "Flood relief: 600 families reached in Assam via Madat network",
  "New partner NGO: Udaan Foundation joins the platform",
  "Healthcare emergency response time cut by 68% in Pune",
  "Madat crosses 50,000 successful aid connections",
];

const volunteers = [
  { name: "Priya Sharma", skill: "First Aid & Medical", contact: "+91 98201 34567" },
  { name: "Arjun Mehta", skill: "Search & Rescue", contact: "+91 97301 22456" },
  { name: "Divya Nair", skill: "Logistics & Supply", contact: "+91 99201 87654" },
  { name: "Rahul Verma", skill: "Communication Tech", contact: "+91 98765 43210" },
  { name: "Sneha Iyer", skill: "Counselling & Support", contact: "+91 96321 54789" },
  { name: "Karan Patel", skill: "Heavy Equipment", contact: "+91 98456 12345" },
  { name: "Ananya Reddy", skill: "Water Sanitation", contact: "+91 97890 67891" },
];

const resources = [
  { label: "Medical Kits", value: "124 / 200", progress: 62 },
  { label: "Food Packages", value: "320 / 500", progress: 64 },
  { label: "Water Cans", value: "500 / 600", progress: 83 },
  { label: "Tents", value: "45 / 60", progress: 75 },
  { label: "Blankets", value: "80 / 400", progress: 20 },
  { label: "Vehicles", value: "8 / 12", progress: 66 },
];

function getProgressColor(p) {
  if (p <= 40) return "#e74c3c";
  if (p <= 70) return "#f39c12";
  return "#27ae60";
}

const levelColor = (level) => {
  if (level === "CRITICAL") return "#FC8181";
  if (level === "HIGH") return "#F6AD55";
  return "#68D391";
};

export default function NGODashboard() {
  const [expanded, setExpanded] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [coverage, setCoverage] = useState([]);
  const [ngos, setNGOs] = useState([]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const [alertData, coverageData, ngoData] = await Promise.all([
        fetchAlerts(),
        fetchCoverage(),
        fetchNGOs(),
      ]);
      setAlerts(Array.isArray(alertData) ? alertData : []);
      setCoverage(Array.isArray(coverageData) ? coverageData : []);
      setNGOs(Array.isArray(ngoData) ? ngoData : []);
    } catch (e) {
      console.error("Failed to load data", e);
    }
  }

  const toggle = (id) => setExpanded(expanded === id ? null : id);

  const critical = alerts.filter(a => a.alert_level === "CRITICAL").length;
  const high = alerts.filter(a => a.alert_level === "HIGH").length;
  const medium = alerts.filter(a => a.alert_level === "MEDIUM").length;

  const avgCoverage =
    coverage.length > 0
      ? (coverage.reduce((acc, c) => acc + (c.coverage_score || 0), 0) / coverage.length).toFixed(3)
      : "0.000";

  // ── PREVIEWS & CONTENT ────────────────────────────────────

  const resourcePreview = (
    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
      {resources.slice(0, 3).map((item) => (
        <div key={item.label} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#aaa", fontFamily: "monospace" }}>
            <span>{item.label}</span>
            <span style={{ color: "#F5C518" }}>{item.value}</span>
          </div>
          <LinearProgress progress={item.progress} color={getProgressColor(item.progress)} backgroundColor="rgba(255,255,255,0.06)" height={4} animated showPercentage={false} />
        </div>
      ))}
    </div>
  );

  const resourceFull = (
    <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
      {resources.map((item) => (
        <div key={item.label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#ccc", fontFamily: "monospace" }}>
            <span>{item.label}</span>
            <span style={{ color: "#F5C518" }}>{item.value}</span>
          </div>
          <LinearProgress progress={item.progress} color={getProgressColor(item.progress)} backgroundColor="rgba(255,255,255,0.08)" height={7} animated showPercentage={false} />
        </div>
      ))}
      <div style={{ marginTop: 4, padding: "8px 12px", background: "rgba(252,129,129,0.08)", border: "1px solid rgba(252,129,129,0.2)", borderRadius: 8, fontSize: 12, color: "#FC8181", fontFamily: "monospace" }}>
        ⚠ Blankets critically low — restock needed
      </div>
    </div>
  );

  const alertsPreview = (
    <div style={{ marginTop: 10, fontFamily: "monospace" }}>
      <div style={{ color: "#FC8181", fontSize: 11 }}>{critical} CRITICAL</div>
      <div style={{ color: "#F6AD55", fontSize: 11 }}>{high} HIGH</div>
      <div style={{ color: "#68D391", fontSize: 11 }}>{medium} MEDIUM</div>
      <div style={{ fontSize: 10, color: "#555", marginTop: 4 }}>auto-refresh 5s</div>
    </div>
  );

  const alertsFull = (
    <div style={{ marginTop: 15 }}>
      {alerts.length === 0 && <div style={{ color: "#555", fontFamily: "monospace", fontSize: 13 }}>No active alerts</div>}
      {alerts.map((a) => (
        <div key={a.cluster_id} style={{
          marginBottom: 12, padding: 10,
          background: "rgba(255,255,255,0.04)",
          borderLeft: `4px solid ${levelColor(a.alert_level)}`,
          borderRadius: 4,
        }}>
          <div style={{ fontWeight: 600, color: levelColor(a.alert_level), fontFamily: "monospace", fontSize: 13 }}>
            [{a.alert_level}] {a.dominant_need?.toUpperCase()} — {a.settlement}
          </div>
          <div style={{ fontSize: 11, color: "#aaa", marginTop: 4, fontFamily: "monospace" }}>
            People: {a.people_affected} · Reports: {a.report_count} · Score: {a.priority_score}
          </div>
          <div style={{ fontSize: 11, color: "#aaa", fontFamily: "monospace" }}>
            Coverage: {(a.coverage * 100).toFixed(1)}% · Gap: {(a.gap * 100).toFixed(1)}%
          </div>
          <div style={{ fontSize: 10, color: "#666", marginTop: 2, fontFamily: "monospace" }}>
            {a.lat?.toFixed(4)}, {a.lon?.toFixed(4)}
          </div>
        </div>
      ))}
    </div>
  );

  const coveragePreview = (
    <div style={{ marginTop: 10, fontFamily: "monospace" }}>
      <div style={{ fontSize: 11, color: "#aaa" }}>Avg Score: <span style={{ color: "#F5C518" }}>{avgCoverage}</span></div>
      <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>{coverage.length} cells tracked</div>
      <div style={{ marginTop: 8 }}>
        <LinearProgress progress={Math.min(parseFloat(avgCoverage) * 100, 100)} color="#68D391" backgroundColor="rgba(255,255,255,0.06)" height={4} animated showPercentage={false} />
      </div>
    </div>
  );

  const coverageFull = (
    <div style={{ marginTop: 16, fontFamily: "monospace" }}>
      <div style={{ fontSize: 13, color: "#ccc", marginBottom: 10 }}>
        Average coverage score: <span style={{ color: "#F5C518" }}>{avgCoverage}</span>
      </div>
      <LinearProgress progress={Math.min(parseFloat(avgCoverage) * 100, 100)} color="#68D391" backgroundColor="rgba(255,255,255,0.08)" height={7} animated showPercentage={false} />
      <div style={{ fontSize: 12, color: "#aaa", marginTop: 12 }}>
        {coverage.filter(c => c.coverage_score > 0).length} cells with active coverage
      </div>
      <div style={{ fontSize: 12, color: "#aaa", marginTop: 6 }}>
        {ngos.length} NGOs loaded across Assam
      </div>
      {ngos.slice(0, 5).map((n, index) => (
        <div key={n.ngo_id ?? n.id ?? `${n.ngoName ?? n.name ?? "ngo"}-${n.districtName ?? n.district ?? index}`} style={{
          marginTop: 8, padding: "6px 10px",
          background: "rgba(255,255,255,0.03)",
          borderRadius: 6, fontSize: 11, color: "#bbb",
        }}>
          <span style={{ color: "#F5C518" }}>{n.ngoName || n.name}</span>
          <span style={{ color: "#555", marginLeft: 8 }}>{n.districtName || n.district}</span>
        </div>
      ))}
    </div>
  );

  const mapPreview = (
    <div style={{ marginTop: 10, height: 120, borderRadius: 8, overflow: "hidden", opacity: 0.8 }}>
      <iframe src="/maps/heatmap_hotspots.html" width="100%" height="200px"
        style={{ border: "none", marginTop: -40, pointerEvents: "none" }} />
    </div>
  );

  const mapFull = (
    <div style={{ marginTop: 12, borderRadius: 8, overflow: "hidden" }}>
      <iframe src="/maps/heatmap_hotspots.html" width="100%" height="600px"
        style={{ border: "none" }} />
    </div>
  );

  const volunteersPreview = (
    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4, fontFamily: "monospace" }}>
      {volunteers.slice(0, 3).map((v, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#aaa", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: 4 }}>
          <span style={{ color: "#F5C518" }}>{v.name}</span>
          <span>{v.skill}</span>
        </div>
      ))}
      <div style={{ fontSize: 10, color: "rgba(245,197,24,0.4)", marginTop: 2 }}>
        +{volunteers.length - 3} more volunteers
      </div>
    </div>
  );

  const volunteersFull = (
    <div style={{ marginTop: 16, overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "monospace" }}>
        <thead>
          <tr>
            {["Name", "Skill", "Contact"].map((h) => (
              <th key={h} style={{ color: "#F5C518", fontWeight: 700, padding: "8px 12px", textAlign: "left", borderBottom: "1px solid rgba(245,197,24,0.3)", fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {volunteers.map((v, i) => (
            <tr key={i}
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(245,197,24,0.05)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <td style={{ padding: "10px 12px", color: "#F5C518", fontWeight: 600 }}>{v.name}</td>
              <td style={{ padding: "10px 12px", color: "#ccc" }}>{v.skill}</td>
              <td style={{ padding: "10px 12px", color: "#ccc" }}>{v.contact}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // ── CARDS ─────────────────────────────────────────────────

  const cards = [
    { id: 1, title: "Resources",       col: "1",        row: "1",          preview: resourcePreview,  content: resourceFull },
    { id: 2, title: "Active Alerts",   col: "2",        row: "1",          preview: alertsPreview,    content: alertsFull },
    { id: 3, title: "NGO Map",         col: "3 / span 2", row: "1 / span 3", preview: mapPreview,     content: mapFull },
    { id: 4, title: "Coverage",        col: "1",        row: "2",          preview: coveragePreview,  content: coverageFull },
    { id: 5, title: "Volunteers",      col: "1 / span 2", row: "3",        preview: volunteersPreview, content: volunteersFull },
  ];

  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh", overflowX: "hidden" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;700;800&family=Space+Mono:wght@400;700&display=swap');
        @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes slowZoom { 0% { transform: scale(1); } 100% { transform: scale(1.04); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .ticker-track { display: flex; animation: ticker 42s linear infinite; white-space: nowrap; }
        .hero-bg { position: absolute; inset: 0; background-image: url('/bg-landing.jpeg'); background-size: cover; background-position: center; animation: slowZoom 20s ease-in-out infinite alternate; z-index: 0; }
        .hero-line1 { font-family: 'Bebas Neue', sans-serif; font-size: clamp(60px, 8vw, 90px); color: #F5C518; line-height: 1; letter-spacing: 3px; opacity: 0; animation: fadeUp 0.9s 0.3s ease forwards; }
        .hero-line2 { font-family: 'Bebas Neue', sans-serif; font-size: clamp(60px, 8vw, 90px); color: #f0ede6; line-height: 1; letter-spacing: 3px; opacity: 0; animation: fadeUp 0.9s 0.5s ease forwards; }
        .hero-sub { font-family: 'Syne', sans-serif; font-size: 16px; color: #bfc9c8; line-height: 1.6; max-width: 500px; opacity: 0; animation: fadeUp 0.9s 0.7s ease forwards; }
      `}</style>

      <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>

        {/* Background */}
        <div className="hero-bg" />

        {/* Overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.6) 75%, rgba(0,0,0,0.35) 100%), linear-gradient(to top, rgba(0,0,0,0.95) 0%, transparent 40%)`,
          zIndex: 1,
        }} />

        {/* Ticker */}
        <div style={{ background: "#880808", height: 36, display: "flex", alignItems: "center", overflow: "hidden", position: "relative", zIndex: 100 }}>
          <div style={{ overflow: "hidden", flex: 1 }}>
            <div className="ticker-track">
              {[...tickerItems, ...tickerItems].map((item, i) => (
                <span key={i} style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#fff", padding: "0 56px 0 0" }}>
                  ● {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Hero title */}
        <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", marginLeft: 100, marginTop: 80, lineHeight: 1 }}>
          <div className="hero-line1">NGO</div>
          <div className="hero-line2">Dashboard</div>
        </div>

        {/* Subtitle with live stats */}
        <div className="hero-sub" style={{ position: "relative", zIndex: 10, marginLeft: 100, marginTop: 12 }}>
          {alerts.length} active alerts · {ngos.length} NGOs · auto-refreshes every 5s
        </div>

        {/* Bento Grid */}
        <div style={{
          position: "relative", zIndex: 10,
          width: "90%", margin: "40px auto 60px",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 10, padding: 12,
        }}>
          {cards.map((card) => {
            const isExpanded = expanded === card.id;
            return (
              <div
                key={card.id}
                onClick={() => toggle(card.id)}
                style={{
                  gridColumn: card.col,
                  gridRow: card.row,
                  background: isExpanded ? "rgba(42,42,42,0.8)" : "rgba(30,30,30,0.6)",
                  borderRadius: 20,
                  padding: isExpanded ? 20 : 16,
                  minHeight: isExpanded ? 500 : 180,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  position: "relative",
                  border: isExpanded ? "1px solid rgba(245,197,24,0.3)" : "1px solid transparent",
                  display: "flex",
                  flexDirection: "column",
                }}
                onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = "rgba(40,40,40,0.7)"; }}
                onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = "rgba(30,30,30,0.6)"; }}
              >
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: isExpanded ? 28 : 22, letterSpacing: 2, color: "#fff", transition: "all 0.3s" }}>
                  {card.title}
                </div>
                {!isExpanded && card.preview}
                {isExpanded && card.content}
                {!isExpanded && (
                  <div style={{ position: "absolute", bottom: 14, right: 24, fontSize: 11, color: "#555", fontFamily: "monospace" }}>
                    tap to expand ↓
                  </div>
                )}
                {isExpanded && (
                  <div style={{ marginTop: 6, fontSize: 11, color: "#555", textAlign: "right", fontFamily: "monospace" }}>
                    click to collapse ↑
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
