# Madat

## *Ek click, ek umeed — connecting hands for hands in need.*
---

# Project Title

# **Madat**

*A low-bandwidth, citizen-led disaster relief coordination platform for India's most vulnerable communities.*

---

# Introduction

During the **2023 floods in Assam**, thousands of families were stranded despite having mobile phones and network access.

Rekha, a 38-year-old daily wage earner from Barpeta, survived 3 days without aid — not because help didn’t exist, but because **visibility and coordination did not**.

Madat bridges this gap.

It connects citizens in distress directly with nearby NGOs in real time — even on **2G networks**, even with **limited literacy**, and even during infrastructure breakdowns.

---

# The Problem

During disasters:

* NGOs operate independently
* Aid often goes to easily accessible areas
* Coordination happens via WhatsApp — delayed and chaotic
* Systems assume literacy, English, or high-speed internet
* No structured, low-bandwidth citizen-led SOS channel exists

People have phones.
People have signal.
But they don’t have **visibility**.

---

# 👤 User Profile

**Age:** 38
**Location:** Barpeta, Assam
**Occupation:** Daily wage earner (₹8,000/month)
**Device:** Basic Android (2G / weak 4G)
**Language:** Assamese (limited literacy)

She had:

* A phone
* A signal
* Urgent need

She lacked:

* Direct channel
* Structured reporting
* Real-time visibility

Madat is built for *her*.

---

# The Solution

Madat connects citizens in distress with NGOs that have resources — in real time.

## From the Citizen’s Perspective

1. Open website
2. See one large **SOS button**
3. Select need via large icons:

   * Food
   * Water
   * Medical
   * Shelter
   * Rescue
4. Share location
5. Report submitted instantly

No forms.
No English required.
No heavy data usage.

---

# What Happens Behind the Scenes

```
REPORT → GPS SNAP → CLUSTER → GAP DETECTION → NGO DASHBOARD → ASSIGN
```

1. Location is captured
2. Reports are clustered into distress zones
3. Coverage gaps are detected
4. NGOs see live hotspots
5. Nearest NGO responds

---

# Core Features

## One-Tap SOS Reporting

* Icon-based interface
* Works on 2G
* PWA installable on basic Android phones
* Offline support

## Intelligent Clustering

* DBSCAN groups nearby SOS reports
* Detects distress zones
* Prevents duplicate aid deployment

## Real-Time NGO Heatmap

* Visual cluster density
* Coverage scoring
* Nearby NGO discovery
* Resource assignment tracking

## Connectivity Resilience

* Offline PWA mode
* Service Worker caching
* Delay-Tolerant Network (DTN) queue
* WebRTC peer-to-peer fallback
* SMS fallback (Twilio / MSG91)

---

# Architecture

```
Citizen → Report → Backend
Backend → DBSCAN → Distress Zones
Distress Zones → Coverage Analysis
Coverage Gaps → NGO Dashboard
NGO Assignment → Aid Delivery
```

**Single source of truth:** Central database

---

# Tech Stack

## Frontend

* Next.js
* React (PWA with offline mode)
* Lucide React (icon system)
* Service Worker caching

## Backend

* FastAPI
* SQLite + SQLAlchemy (prototype)
* Scalable to PostgreSQL / PostGIS
* Optional Firebase / Supabase for large-scale concurrency

## Intelligence Layer

* DBSCAN clustering
* GeoPandas
* Folium / Leaflet heatmaps

## Connectivity Layer

* PWA Offline Mode
* WebRTC P2P fallback
* DTN Queue (auto-send when internet returns)
* SMS fallback (Twilio / MSG91)

---

# Scalability

### Lightweight UI

* Minimal JavaScript
* Progressive Web App
* Works on weak phones and 2G

### Efficient Backend

* SQLite prototype → Postgres/PostGIS scale
* Only new reports processed during clustering
* Incremental heatmap updates
* Single stable endpoint

Built to handle **millions of submissions**.

---

# Growth Roadmap

## Phase 1

Pilot with 10–100 users in select communities.

## Phase 2

Expand through local NGOs and district programs.

## Phase 3

Cover disaster-prone regions across India.

## Phase 4

Multilingual support:

* Hindi
* Tamil
* Telugu
* Bengali
* Assamese

Distribution channels:

* QR codes in flood-prone zones
* NGO broadcasts
* Community volunteers
* District-level government programs

---

# Unit Economics

* Free for citizens — always
* Funded by:

  * NGO partnerships
  * Government grants
  * CSR contributions

---

# Unique Value

Madat is not just a reporting tool.

It:

* Gives visibility to invisible citizens
* Clusters need in real time
* Prevents overlapping aid
* Detects underserved zones
* Works on 2G networks
* Requires minimal literacy
* Enables data-driven NGO coordination

It is **citizen-led crisis intelligence**.

---

# Team

**Drowsy Devs**

Built for India's most vulnerable communities.

---
---

## 🇮🇳 Vision

In disasters, speed saves lives.
Visibility prevents neglect.
Coordination reduces suffering.

**Madat — Ek click, ek umeed.**
