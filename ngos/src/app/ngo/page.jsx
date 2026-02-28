"use client";

import { useState, useEffect } from "react";
import ScrollVelocity from "@/components/ScrollVelocity";
import SplitText from "@/components/SplitText";
import LinearProgress from "@/components/LinearProgress";
import { fetchAlerts, fetchCoverage } from "../../lib/api";

const volunteers = [
  { name: "Priya Sharma", skill: "First Aid & Medical", contact: "+91 98201 34567" },
  { name: "Arjun Mehta", skill: "Search & Rescue", contact: "+91 97301 22456" },
  { name: "Divya Nair", skill: "Logistics & Supply", contact: "+91 99201 87654" },
  { name: "Rahul Verma", skill: "Communication Tech", contact: "+91 98765 43210" },
];

export default function NGOPage() {
  const [alerts, setAlerts] = useState([]);
  const [coverage, setCoverage] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    const alertData = await fetchAlerts();
    const coverageData = await fetchCoverage();
    setAlerts(alertData);
    setCoverage(coverageData);
  }

  const handleClick = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  // --- DERIVED METRICS ---
  const critical = alerts.filter(a => a.alert_level === "CRITICAL").length;
  const high = alerts.filter(a => a.alert_level === "HIGH").length;
  const medium = alerts.filter(a => a.alert_level === "MEDIUM").length;

  const avgCoverage =
    coverage.length > 0
      ? (
          coverage.reduce((acc, c) => acc + c.coverage_score, 0) /
          coverage.length
        ).toFixed(2)
      : 0;

  // --- CARDS ---
  const cards = [
    {
      id: 1,
      title: "Active Requests",
      col: "1 / span 2",
      row: "1",
      preview: (
        <div style={{ marginTop: 10 }}>
          <div style={{ color: "#FC8181" }}>{critical} critical</div>
          <div style={{ color: "#F6AD55" }}>{high} high priority</div>
          <div style={{ color: "#68D391" }}>{medium} medium</div>
        </div>
      ),
      content: (
        <div style={{ marginTop: 15 }}>
          {alerts.length === 0 && (
            <div style={{ color: "#555" }}>No active alerts</div>
          )}
          {alerts.map((a) => (
            <div
              key={a.cluster_id}
              style={{
                marginBottom: 12,
                padding: 10,
                background: "rgba(255,255,255,0.04)",
                borderLeft: `4px solid ${
                  a.alert_level === "CRITICAL"
                    ? "#FC8181"
                    : a.alert_level === "HIGH"
                    ? "#F6AD55"
                    : "#68D391"
                }`,
              }}
            >
              <div style={{ fontWeight: 600 }}>
                {a.dominant_need} — {a.alert_level}
              </div>
              <div style={{ fontSize: 12, color: "#aaa" }}>
                People affected: {a.people_affected}
              </div>
              <div style={{ fontSize: 12, color: "#aaa" }}>
                Gap score: {a.gap}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 2,
      title: "Coverage Overview",
      col: "3",
      row: "1",
      preview: (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 14 }}>
            Avg Coverage: <strong>{avgCoverage}</strong>
          </div>
        </div>
      ),
      content: (
        <div style={{ marginTop: 20 }}>
          <LinearProgress
            progress={avgCoverage * 100}
            color="#68D391"
            backgroundColor="rgba(255,255,255,0.08)"
            height={8}
          />
        </div>
      ),
    },
    {
      id: 3,
      title: "Volunteers",
      col: "1 / span 2",
      row: "2",
      preview: (
        <div style={{ marginTop: 10 }}>
          {volunteers.slice(0, 2).map((v) => (
            <div key={v.name} style={{ fontSize: 12, color: "#aaa" }}>
              {v.name}
            </div>
          ))}
        </div>
      ),
      content: (
        <div style={{ marginTop: 15 }}>
          {volunteers.map((v) => (
            <div key={v.name} style={{ marginBottom: 8 }}>
              <strong>{v.name}</strong> — {v.skill}
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div style={{ background: "#000", minHeight: "100vh", color: "white" }}>
      <div style={{ padding: 40 }}>
        <h1 style={{ color: "#FFB343" }}>NGO Dashboard</h1>

        <div
          style={{
            marginTop: 40,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
          }}
        >
          {cards.map((card) => {
            const isExpanded = expanded === card.id;
            return (
              <div
                key={card.id}
                onClick={() => handleClick(card.id)}
                style={{
                  background: "#1E1E1E",
                  padding: 20,
                  borderRadius: 12,
                  cursor: "pointer",
                  minHeight: isExpanded ? 350 : 160,
                  transition: "all 0.3s ease",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 600 }}>
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