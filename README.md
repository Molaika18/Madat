Madat
Ek click, ek umeed — connecting hands for hands in need.
Madat is a low-bandwidth, citizen-led disaster relief coordination platform that connects flood and disaster victims with nearby NGOs in real time, built for India's most vulnerable communities.

The Problem
During the 2023 Assam floods, people like Rekha — a 38-year-old daily wage earner from Barpeta — were stranded for 3 days with no aid, despite having a phone and signal.
Why aid did not reach her:

NGOs operate independently; aid often goes to easily accessible areas
Coordination happens via WhatsApp, which is delayed and chaotic
Relief systems assume literacy, English, or high-speed internet
No simple, low-bandwidth, citizen-led way exists to report urgent need

User Profile:
Age: 38, Barpeta, Assam. Occupation: Daily wage earner, Rs. 8,000/month. Device: Basic Android, 2G/weak 4G. Language: Assamese, limited literacy.
She had a phone, signal, and urgent need — but lacked visibility, a direct channel, and structured reporting.

Solution
Madat bridges the gap between citizens in distress and NGOs with resources, in real time and even on 2G.
From the User's Perspective:

Opens the website and sees one large SOS button
Selects their need via large icons — Food, Water, Medical, Shelter, etc.
Shares location — report is submitted instantly

What Happens Behind the Scenes:

Report appears on the NGO heatmap in real time
Nearby NGOs see verified clusters and coverage gaps
Nearest NGOs reach hotspots quickly, ensuring faster aid delivery

Pipeline: REPORT → GPS SNAP → CLUSTER → GAP DETECTION → NGO DASHBOARD → ASSIGN

Tech Stack
Frontend: Next.js + React (PWA with offline mode), Lucide React for icons, Service Worker for caching.
Backend: FastAPI, SQLite + SQLAlchemy (prototype, scalable to PostgreSQL/PostGIS), Firebase/Supabase optional for millions of concurrent users.
Intelligence: DBSCAN Clustering for grouping SOS reports into distress zones, GeoPandas for geospatial processing, Folium/Leaflet for real-time NGO heatmaps.
Connectivity: PWA Offline Mode, WebRTC P2P Fallback, DTN Queue (Delay-Tolerant Network) for auto-sending when internet returns, SMS Fallback via Twilio/MSG91.

Scalability
Lightweight UI: Progressive web app, minimal JS, works on 2G/weak phones. Efficient Backend: FastAPI + SQLite, scalable to Postgres/PostGIS. Smart Clustering: DBSCAN + GeoPandas, only new reports processed so updates are fast. Cached Heatmaps: Updated incrementally, reduces server load. Single Endpoint: Stable even with millions of submissions.

Growth Roadmap
Phase 1: Pilot with 10–100 users in select communities. Phase 2: Expand via local NGOs and district-level programs. Phase 3: Cover all disaster-prone regions across India. Phase 4: Multilingual support — Hindi, Tamil, Telugu, Bengali.
Citizens reach Madat via QR codes in disaster-prone areas, NGO broadcasts, community volunteers, and district-level government programs.

Unit Economics
Free for citizens always. Funding through NGO donations, government grants, and CSR contributions.

Team
Drowsy Devs — built for India's most vulnerable communities.

"Ek click, ek umeed — connecting hands for hands in need."
