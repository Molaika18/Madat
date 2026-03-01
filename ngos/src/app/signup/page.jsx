'use client'
import { useState } from "react";
import bgImage from "@/components/background.jpg";

const tickerItems = [
 "2,847 SOS alerts resolved this month",
 "143 NGOs connected across 12 cities",
 "Flood relief: 600 families reached in Assam",
 "New partner: Udaan Foundation joins Madat",
 "Response time cut by 68% in Pune",
 "Madat crosses 50,000 successful aid connections",
];

const resourceOptions = [
 "Medical Kits", "Food Packs", "Water Cans",
 "Tents", "Blankets", "Vehicles",
 "Generators", "Medicines", "Rescue Gear",
];

const stateOptions = [
 "Maharashtra", "Gujarat", "Kerala", "Tamil Nadu",
 "Karnataka", "Assam", "Odisha", "West Bengal", "Rajasthan", "Other",
];

export default function NGOSignUp() {
 const [selectedResources, setSelectedResources] = useState([]);
 const [submitted, setSubmitted] = useState(false);
 const [orgName, setOrgName] = useState("");
 const [city, setCity] = useState("");
 const [state, setState] = useState("");
 const [contactName, setContactName] = useState("");
 const [phone, setPhone] = useState("");
 const [email, setEmail] = useState("");
 const [errors, setErrors] = useState({});

 const toggleResource = (res) => {
 setSelectedResources(prev =>
 prev.includes(res) ? prev.filter(r => r !== res) : [...prev, res]
 );
 };

 const handleSubmit = () => {
 const newErrors = {};
 if (!orgName.trim()) newErrors.orgName = true;
 if (!city.trim()) newErrors.city = true;
 if (Object.keys(newErrors).length > 0) {
 setErrors(newErrors);
 return;
 }
 setSubmitted(true);
 };

 return (
 <div style={{ background: "#000", color: "#fff", fontFamily: "'Syne', sans-serif", overflowX: "hidden", minHeight: "100vh" }}>
 <style>{`
 @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
 @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
 @keyframes slowZoom { 0% { transform: scale(1); } 100% { transform: scale(1.04); } }
 @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
 .ticker-track { display: flex; animation: ticker 42s linear infinite; white-space: nowrap; }
 .hero-bg {
 position: absolute; inset: 0;
 background: url(${bgImage.src}) center/cover no-repeat;
 background-size: cover; background-position: center;
 animation: slowZoom 20s ease-in-out infinite alternate;
 z-index: 0;
 }
 .hero-overlay {
 position: absolute; inset: 0;
 background:
 linear-gradient(to right, rgba(5,5,5,0.97) 0%, rgba(5,5,5,0.88) 36%, rgba(5,5,5,0.6) 65%, rgba(5,5,5,0.3) 100%),
 linear-gradient(to top, rgba(5,5,5,0.9) 0%, transparent 38%);
 z-index: 1;
 }
 .big-title { opacity: 0; animation: fadeUp 0.7s 0.1s forwards; }
 .left-sub { opacity: 0; animation: fadeUp 0.7s 0.3s forwards; }
 .form-card { opacity: 0; animation: fadeUp 0.7s 0.25s forwards; }
 .ngo-input { width: 100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 11px 13px; font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 500; color: #ffffff; outline: none; transition: border-color 0.2s, background 0.2s; box-sizing: border-box; }
 .ngo-input::placeholder { color: rgba(255,255,255,0.22); }
 .ngo-input:focus { border-color: rgba(245,197,24,0.5); background: rgba(255,255,255,0.09); }
 .ngo-select { width: 100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; padding: 11px 13px; font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 500; color: #ffffff; outline: none; transition: border-color 0.2s; appearance: none; -webkit-appearance: none; box-sizing: border-box; }
 .ngo-select:focus { border-color: rgba(245,197,24,0.5); background: rgba(255,255,255,0.09); }
 .ngo-select option { background: #111; color: #fff; }
 .res-tag { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 8px 6px; font-family: 'Space Mono', monospace; font-size: 9px; color: rgba(255,255,255,0.55); text-align: center; cursor: pointer; transition: all 0.18s; user-select: none; letter-spacing: 0.3px; }
 .res-tag:hover { border-color: rgba(245,197,24,0.35); color: rgba(245,197,24,0.8); }
 .res-tag.active { background: rgba(245,197,24,0.1); border-color: #F5C518; color: #F5C518; }
 .btn-submit { width: 100%; background: #880808; color: #fff; border: none; font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 5px; padding: 15px; border-radius: 8px; cursor: pointer; transition: background 0.2s, transform 0.15s; margin-top: 8px; }
 .btn-submit:hover { background: #6e0000; transform: scale(1.01); }
 `}</style>

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

 {/* Page */}
 <div style={{ position: "relative", minHeight: "calc(100vh - 36px)", overflow: "hidden" }}>
 <div className="hero-bg" />
 <div className="hero-overlay" />

 <div style={{
 position: "relative", zIndex: 10,
 display: "grid", gridTemplateColumns: "1fr 440px",
 minHeight: "calc(100vh - 36px)",
 alignItems: "center", gap: 60, padding: "60px 80px",
 }}>

 {/* Left */}
 <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
 <div className="big-title" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(64px, 8vw, 108px)", lineHeight: 0.9, letterSpacing: 3 }}>
 JOIN THE<br /><span style={{ color: "#F5C518" }}>NETWORK.</span>
 </div>
 <div className="left-sub" style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 360, marginTop: 18 }}>
 Register your NGO on Madat and connect with disaster victims, volunteers, and resources in real time.
 </div>
 </div>

 {/* Form Card */}
 <div className="form-card" style={{
 background: "rgba(14,14,14,0.82)",
 border: "1px solid rgba(245,197,24,0.18)",
 borderRadius: 16, padding: "34px 30px",
 backdropFilter: "blur(24px)",
 }}>

 {!submitted ? (
 <>
 <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, letterSpacing: 3, color: "#fff", marginBottom: 3 }}>NGO Registration</div>
 <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9.5, color: "#cfcfcf", letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 26 }}>Fill in your details to get started</div>

 {/* Organisation */}
 <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "#F5C518", marginBottom: 12, opacity: 0.8 }}>Organisation</div>
 <div style={{ marginBottom: 14 }}>
 <label style={{ display: "block", fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Name</label>
 <input
 className="ngo-input"
 type="text"
 placeholder="e.g. Udaan Foundation"
 value={orgName}
 onChange={e => { setOrgName(e.target.value); setErrors(prev => ({ ...prev, orgName: false })); }}
 style={{ borderColor: errors.orgName ? "rgba(252,129,129,0.6)" : undefined }}
 />
 </div>

 {/* Location */}
 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
 <div>
 <label style={{ display: "block", fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>City</label>
 <input
 className="ngo-input"
 type="text"
 placeholder="Mumbai"
 value={city}
 onChange={e => { setCity(e.target.value); setErrors(prev => ({ ...prev, city: false })); }}
 style={{ borderColor: errors.city ? "rgba(252,129,129,0.6)" : undefined }}
 />
 </div>
 <div>
 <label style={{ display: "block", fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>State</label>
 <select className="ngo-select" value={state} onChange={e => setState(e.target.value)}>
 <option value="" disabled>Select</option>
 {stateOptions.map(s => <option key={s} value={s}>{s}</option>)}
 </select>
 </div>
 </div>

 {/* Divider */}
 <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "20px 0" }} />

 {/* Resources */}
 <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "#F5C518", marginBottom: 12, opacity: 0.8 }}>Available Resources</div>
 <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 14 }}>
 {resourceOptions.map(res => (
 <div
 key={res}
 className={`res-tag ${selectedResources.includes(res) ? "active" : ""}`}
 onClick={() => toggleResource(res)}
 >
 {res}
 </div>
 ))}
 </div>

 {/* Divider */}
 <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "20px 0" }} />

 {/* Contact */}
 <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "#F5C518", marginBottom: 12, opacity: 0.8 }}>Contact Info</div>
 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
 <div>
 <label style={{ display: "block", fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Contact Person</label>
 <input className="ngo-input" type="text" placeholder="Full name" value={contactName} onChange={e => setContactName(e.target.value)} />
 </div>
 <div>
 <label style={{ display: "block", fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Phone</label>
 <input className="ngo-input" type="tel" placeholder="+91 XXXXX XXXXX" value={phone} onChange={e => setPhone(e.target.value)} />
 </div>
 </div>
 <div style={{ marginBottom: 14 }}>
 <label style={{ display: "block", fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Email</label>
 <input className="ngo-input" type="email" placeholder="org@example.com" value={email} onChange={e => setEmail(e.target.value)} />
 </div>

 <button className="btn-submit" onClick={handleSubmit}>REGISTER NGO →</button>
 </>
 ) : (
 <div style={{ textAlign: "center", padding: "30px 0" }}>
 <div style={{ fontSize: 44, marginBottom: 12 }}>✅</div>
 <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 3, color: "#68D391" }}>You're on the network.</div>
 <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#555", marginTop: 8, lineHeight: 1.8 }}>
 Your NGO has been registered.<br />Our team will verify and activate<br />your account within 24 hours.
 </p>
 <button onClick={() => window.location.href = "/ngo"} style={{
 marginTop: 20, padding: "12px 18px", fontSize: 14,color: "#F5C518",backgroundColor: "#3182ce",border: "none",borderRadius: 6,cursor: "pointer",transition: "background-color 0.2s"
 }}>
 View Dashboard
 </button>
 </div>
 )}

 </div>
 </div>
 </div>
 </div>
 );
}