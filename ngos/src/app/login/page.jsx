'use client'

import { useState } from "react";
import bgImage from "@/components/background.jpg";
import { Apple, Tent, Stethoscope, Droplets, Truck, Pill } from "lucide-react";
import { submitReport } from "../../lib/api.js";

const sosOptions = [
  { id: "food",     label: "Food",         icon: Apple       },
  { id: "shelter",  label: "Shelter",      icon: Tent        },
  { id: "medical",  label: "Medical Help", icon: Stethoscope },
  { id: "water",    label: "Clean Water",  icon: Droplets    },
  { id: "rescue",   label: "Rescue",       icon: Truck       },
  { id: "medicines",label: "Medicines",    icon: Pill        },
];

const tickerItems = [
  "2,847 SOS alerts resolved this month",
  "143 NGOs connected across 12 cities",
  "Flood relief: 600 families reached in Assam via Madad network",
  "New partner NGO: Udaan Foundation joins the platform",
  "Healthcare emergency response time cut by 68% in Pune",
  "Madat crosses 50,000 successful aid connections",
];

export default function RequestForm() {
  const [selected, setSelected] = useState([]);
  const [sent, setSent] = useState(false);

  const toggle = (id) =>
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleSend = () => {
    if (selected.length === 0) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      for (const need of selected) {
        await submitReport({
          need_type: need,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          people_count: 1,
        });
      }
      setSent(true);
      setTimeout(() => { setSent(false); setSelected([]); }, 3000);
    }, () => alert("Could not get location. Please enable GPS."));
  };

  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh", overflowX: "hidden", position: "relative", display: "flex", flexDirection: "column", fontFamily: "'Syne', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes slowZoom { 0% { transform: scale(1); } 100% { transform: scale(1.04); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .ticker-track { display: flex; animation: ticker 42s linear infinite; white-space: nowrap; }
        .hero-bg { position: fixed; inset: 0; background: url(${bgImage.src}) center/cover no-repeat; animation: slowZoom 20s ease-in-out infinite alternate; z-index: 0; }
        .hero-overlay { position: fixed; inset: 0; background: linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.6) 75%, rgba(0,0,0,0.35) 100%), linear-gradient(to top, rgba(0,0,0,0.95) 0%, transparent 40%); z-index: 1; }
        .form-card { opacity: 0; animation: fadeUp 0.7s 0.25s forwards; }
        .sos-chip { background: rgba(255,179,67,0.03); border: 2px solid rgba(255,179,67,0.12); border-radius: 12px; padding: 16px 8px; display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s ease; position: relative; }
        .sos-chip:hover { border-color: rgba(255,179,67,0.4); background: rgba(255,179,67,0.06); }
        .sos-chip.active { background: rgba(255,179,67,0.12); border-color: #FFB343; box-shadow: 0 0 16px rgba(255,179,67,0.15); }
        .sos-chip-label { font-size: 11px; font-weight: 600; font-family: 'Space Mono', monospace; color: rgba(255,179,67,0.35); text-align: center; transition: color 0.2s; }
        .sos-chip.active .sos-chip-label { color: #FFB343; }
      `}</style>

      <div className="hero-bg" />
      <div className="hero-overlay" />

      {/* Ticker */}
      <div style={{ position: "relative", zIndex: 100, background: "#880808", height: 36, display: "flex", alignItems: "center", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ overflow: "hidden", flex: 1 }}>
          <div className="ticker-track">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={i} style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#fff", padding: "0 56px" }}>● {item}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Centered form */}
      <div style={{ position: "relative", zIndex: 10, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div className="form-card" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255,179,67,0.2)", boxShadow: "0 0 80px rgba(255,179,67,0.06)", width: "100%", maxWidth: 480 }}>

          <div style={{ background: "rgba(30,30,30,0.6)", height: 5 }} />

          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Header */}
            <div>
              <div style={{ color: "#FFB343", fontSize: 18, fontWeight: 700 }}>মোক সহায় লাগে | Request Help</div>
              <div style={{ color: "rgba(255,179,67,0.4)", fontSize: 12, marginTop: 4, fontFamily: "'Space Mono', monospace" }}>Select what you need — choose multiple</div>
            </div>

            {/* Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {sosOptions.map(({ id, label, icon: Icon }) => {
                const on = selected.includes(id);
                return (
                  <div key={id} onClick={() => toggle(id)} className={`sos-chip ${on ? "active" : ""}`}>
                    {on && (
                      <div style={{ position: "absolute", top: 6, right: 6, width: 16, height: 16, borderRadius: "50%", background: "#FFB343", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#000", fontWeight: 700 }}>✓</div>
                    )}
                    <Icon size={30} color={on ? "#FFB343" : "rgba(255,179,67,0.3)"} strokeWidth={1.5} style={{ transition: "all 0.2s" }} />
                    <div className="sos-chip-label">{label}</div>
                  </div>
                );
              })}
            </div>

            {/* Summary tags */}
            {selected.length > 0 && (
              <div style={{ background: "rgba(255,179,67,0.05)", border: "1px solid rgba(255,179,67,0.2)", borderRadius: 8, padding: "10px 14px", display: "flex", flexWrap: "wrap", gap: 6 }}>
                {selected.map(id => {
                  const opt = sosOptions.find(o => o.id === id);
                  return (
                    <span key={id} style={{ background: "rgba(255,179,67,0.12)", border: "1px solid rgba(255,179,67,0.3)", padding: "3px 10px", borderRadius: 20, fontSize: 11, color: "#FFB343", display: "flex", alignItems: "center", gap: 5 }}>
                      <opt.icon size={11} color="#FFB343" />
                      {opt.label}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Button */}
            <button onClick={handleSend} disabled={selected.length === 0} style={{ background: selected.length > 0 ? "#FFB343" : "#0a0a0a", color: selected.length > 0 ? "#000" : "#FFB343", border: `1px solid ${selected.length > 0 ? "#FFB343" : "#ff000033"}`, borderRadius: 10, padding: "13px", fontSize: 14, fontWeight: 700, cursor: selected.length > 0 ? "pointer" : "not-allowed", transition: "all 0.2s", letterSpacing: "0.03em", fontFamily: "'Syne', sans-serif", width: "100%" }}>
              {sent
                ? "✓ সফলতাৰে দাখিল হৈছে ! Request Sent!"
                : selected.length > 0 ? `দাখিল কৰক · Send (${selected.length})` : "বাছি লোৱা · Please Select"}
            </button>

          </div>

          <div style={{ background: "#FFB343", height: 4 }} />
        </div>
      </div>
    </div>
  );
}