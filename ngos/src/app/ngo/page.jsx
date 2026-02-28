"use client";

import { useState, useEffect } from "react";
import { fetchAlerts, fetchCoverage, fetchNGOs } from "../../lib/api";

const volunteers = [
  { name: "Priya Sharma", skill: "First Aid & Medical", contact: "+91 98201 34567" },
  { name: "Arjun Mehta", skill: "Search & Rescue", contact: "+91 97301 22456" },
  { name: "Divya Nair", skill: "Logistics & Supply", contact: "+91 99201 87654" },
  { name: "Rahul Verma", skill: "Communication Tech", contact: "+91 98765 43210" },
];

const levelColor = (level) => {
  if (level === "CRITICAL") return "#FC8181";
  if (level === "HIGH") return "#F6AD55";
  return "#68D391";
};

export default function NGOPage() {
  const [alerts, setAlerts] = useState([]);
  const [coverage, setCoverage] = useState([]);
  const [ngos, setNGOs] = useState([]);
  const [expanded, setExpanded] = useState(null);

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

  const handleClick = (id) => setExpanded(expanded === id ? null : id);

  const critical = alerts.filter(a => a.alert_level === "CRITICAL").length;
  const high = alerts.filter(a => a.alert_level === "HIGH").length;
  const medium = alerts.filter(a => a.alert_level === "MEDIUM").length;

  const avgCoverage =
    coverage.length > 0
      ? (coverage.reduce((acc, c) => acc + (c.coverage_score || 0), 0) / coverage.length).toFixed(3)
      : "0.000";

  const cards = [
    {
      id: 1,
      title: "Active Alerts",
      col: "1 / span 2",
      preview: (
        <div style={{ marginTop: 10 }}>
          <div style={{ color: "#FC8181", fontSize: 13 }}>{critical} CRITICAL</div>
          <div style={{ color: "#F6AD55", fontSize: 13 }}>{high} HIGH</div>
          <div style={{ color: "#68D391", fontSize: 13 }}>{medium} MEDIUM</div>
        </div>
      ),
      content: (
        <div style={{ marginTop: 15 }}>
          {alerts.length === 0 && <div style={{ color: "#555" }}>No active alerts</div>}
          {alerts.map((a) => (
            <div key={a.cluster_id} style={{
              marginBottom: 12,
              padding: 10,
              background: "rgba(255,255,255,0.04)",
              borderLeft: `4px solid ${levelColor(a.alert_level)}`,
              borderRadius: 4,
            }}>
              <div style={{ fontWeight: 600, color: levelColor(a.alert_level) }}>
                [{a.alert_level}] {a.dominant_need?.toUpperCase()} — {a.settlement}
              </div>
              <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>
                People affected: {a.people_affected} · Reports: {a.report_count}
              </div>
              <div style={{ fontSize: 12, color: "#aaa" }}>
                Coverage: {(a.coverage * 100).toFixed(1)}% · Gap: {(a.gap * 100).toFixed(1)}% · Score: {a.priority_score}
              </div>
              <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>
                {a.lat?.toFixed(4)}, {a.lon?.toFixed(4)}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 2,
      title: "Coverage",
      col: "3",
      preview: (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 13 }}>Avg: <strong>{avgCoverage}</strong></div>
          <div style={{ fontSize: 12, color: "#aaa" }}>{coverage.length} cells tracked</div>
        </div>
      ),
      content: (
        <div style={{ marginTop: 15 }}>
          <div style={{ fontSize: 13, marginBottom: 8 }}>Average coverage score: <strong>{avgCoverage}</strong></div>
          <div style={{
            height: 8, borderRadius: 4,
            background: "rgba(255,255,255,0.08)",
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${Math.min(parseFloat(avgCoverage) * 100, 100)}%`,
              background: "#68D391",
              borderRadius: 4,
              transition: "width 0.5s ease",
            }} />
          </div>
          <div style={{ fontSize: 12, color: "#aaa", marginTop: 8 }}>
            {coverage.filter(c => c.coverage_score > 0).length} cells with active coverage
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: "NGOs",
      col: "1 / span 2",
      preview: (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 13 }}>{ngos.length} NGOs loaded</div>
          {ngos.slice(0, 2).map((n) => (
            <div key={n.ngo_id} style={{ fontSize: 12, color: "#aaa" }}>{n.name}</div>
          ))}
        </div>
      ),
      content: (
        <div style={{ marginTop: 15, maxHeight: 300, overflowY: "auto" }}>
          {ngos.slice(0, 20).map((n) => (
            <div key={n.ngo_id} style={{
              marginBottom: 8, padding: "8px 10px",
              background: "rgba(255,255,255,0.03)",
              borderRadius: 6,
            }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{n.name}</div>
              <div style={{ fontSize: 11, color: "#aaa" }}>{n.district} · {n.ngo_type}</div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 4,
      title: "Volunteers",
      col: "3",
      preview: (
        <div style={{ marginTop: 10 }}>
          {volunteers.slice(0, 2).map((v) => (
            <div key={v.name} style={{ fontSize: 12, color: "#aaa" }}>{v.name}</div>
          ))}
        </div>
      ),
      content: (
        <div style={{ marginTop: 15 }}>
          {volunteers.map((v) => (
            <div key={v.name} style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 600 }}>{v.name}</div>
              <div style={{ fontSize: 12, color: "#aaa" }}>{v.skill} · {v.contact}</div>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div style={{ background: "#000", minHeight: "100vh", color: "white" }}>
      <div style={{ padding: 40 }}>
        <h1 style={{ color: "#FFB343", marginBottom: 8 }}>NGO Dashboard</h1>
        <div style={{ color: "#aaa", fontSize: 13, marginBottom: 40 }}>
          {alerts.length} active alerts · {ngos.length} NGOs · auto-refreshes every 5s
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
        }}>
          {cards.map((card) => {
            const isExpanded = expanded === card.id;
            return (
              <div
                key={card.id}
                onClick={() => handleClick(card.id)}
                style={{
                  gridColumn: card.col,
                  background: "#1E1E1E",
                  padding: 20,
                  borderRadius: 12,
                  cursor: "pointer",
                  minHeight: isExpanded ? 350 : 160,
                  transition: "all 0.3s ease",
                  border: isExpanded ? "1px solid rgba(255,179,67,0.3)" : "1px solid transparent",
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 600, color: "#FFB343" }}>
                  {card.title}
                </div>
                {!isExpanded && card.preview}
                {isExpanded && card.content}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}