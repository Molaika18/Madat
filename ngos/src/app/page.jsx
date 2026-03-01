"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import bgImage from "@/components/background.jpg";

const tickerItems = [
  "2,847 SOS alerts resolved this month",
  "143 NGOs connected across 12 cities",
  "Flood relief: 600 families reached in Assam via Madat network",
  "New partner NGO: Udaan Foundation joins the platform",
  "Healthcare emergency response time cut by 68% in Pune",
  "Madat crosses 50,000 successful aid connections",
];

export default function MadatLanding() {
  const router = useRouter();

  return (
    <div style={{ fontFamily: "'Syne', sans-serif", background: "#0d0d0f", color: "#f0ede6", minHeight: "100vh", overflowX: "hidden" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;700;800&family=Space+Mono:wght@400;700&display=swap');

        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes blink {
          0%,100% { opacity:1; transform:scale(1); }
          50%     { opacity:0.3; transform:scale(1.6); }
        }
        @keyframes slowZoom {
          0%   { transform: scale(1); }
          100% { transform: scale(1.04); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(28px); }
          to   { opacity:1; transform:translateY(0); }
        }

        .logo-dot {
          width: 7px; height: 7px;
          background: #8b0000;
          border-radius: 50%;
          animation: blink 1.5s ease-in-out infinite;
        }

        .hero-bg {
          position: absolute; inset: 0;
          background: url(${bgImage.src}) center/cover no-repeat;;
          animation: slowZoom 20s ease-in-out infinite alternate;
          z-index: 0;
        }

        .hero-eyebrow {
          font-family: 'Space Mono', monospace;
          font-size: 10.5px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #F5C518;
          margin-bottom: 22px;
          opacity: 0;
          animation: fadeUp 0.7s 0.1s forwards;
        }

        .hero-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(62px, 7.5vw, 108px);
          line-height: 0.9;
          letter-spacing: 2px;
          color: #f0ede6;
          margin-bottom: 18px;
          opacity: 0;
          animation: fadeUp 0.7s 0.25s forwards;
        }

        .hero-sub {
          font-size: 16px;
          font-weight: 400;
          color: rgba(240,237,230,0.5);
          line-height: 1.65;
          max-width: 400px;
          margin-bottom: 46px;
          opacity: 0;
          animation: fadeUp 0.7s 0.4s forwards;
        }

        .btn-row {
          display: flex;
          gap: 18px;
          align-items: center;
          flex-wrap: wrap;
          opacity: 0;
          animation: fadeUp 0.7s 0.55s forwards;
        }

        .btn-sos {
          background: #8b0000;
          color: #fff;
          border: none;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 21px;
          letter-spacing: 4px;
          padding: 17px 42px 17px 36px;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .btn-sos:hover { background: #6e0000; transform: scale(1.03); }

        .btn-ngo {
          background: transparent;
          color: #f0ede6;
          border: 1.5px solid #F5C518;
          font-family: 'Space Mono', monospace;
          font-weight: 800;
          font-size: 13px;
          letter-spacing: 4px;
          text-transform: uppercase;
          padding: 10px 25px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-ngo:hover { border-color: #F5C518; color: #F5C518; }

        .ticker-track {
          display: flex;
          animation: ticker 42s linear infinite;
          white-space: nowrap;
        }

        @media (max-width: 860px) {
          .hero-content { padding: 40px 28px !important; }
          nav { padding: 0 24px !important; }
        }
      `}</style>

      {/* ── TICKER ── */}
      <div style={{
        background: "#8b0000",
        height: 36,
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        position: "relative",
        zIndex: 100,
      }}>
        <div style={{ overflow: "hidden", flex: 1 }}>
          <div className="ticker-track">
            {/* doubled for seamless loop */}
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={i} style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 11,
                color: "#fff",
                padding: "0 56px 0 0",
              }}>
                ● {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── NAV ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 90,
        background: "rgba(8,8,8,0.88)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(245,197,24,0.12)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 52px", height: 62,
      }}>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 30, letterSpacing: 4,
          color: "#f0ede6",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          MADAT
          <span style={{ color: "#F5C518" }}>.</span>
          <div className="logo-dot" />
        </div>

        <button className="btn-ngo" onClick={() => router.push("/signup")}>
          NGO Login
        </button>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        position: "relative",
        minHeight: "calc(100vh - 98px)",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
      }}>
        {/* Background */}
        <div className="hero-bg" />

        {/* Overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: `
            linear-gradient(to right, rgba(5,5,5,0.97) 0%, rgba(5,5,5,0.88) 36%, rgba(5,5,5,0.6) 65%, rgba(5,5,5,0.3) 100%),
            linear-gradient(to top, rgba(5,5,5,0.9) 0%, transparent 38%)
          `,
          zIndex: 1,
        }} />

        {/* Content */}
        <div className="hero-content" style={{
          position: "relative", zIndex: 10,
          padding: "0 68px", maxWidth: 660,
        }}>
          <div className="hero-eyebrow">
            Emergency Aid Platform · India
          </div>

          <h1 className="hero-title">
            ONE TAP.<br />
            REAL <span style={{ color: "#F5C518" }}>HELP.</span>
          </h1>

          <p className="hero-sub">
            Instant aid when it matters most, wherever you are.
          </p>

          <div className="btn-row">
            <button
              className="btn-sos"
              onClick={() => router.push("/login")}
            >
              SOS — GET HELP NOW
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}