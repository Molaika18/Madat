import folium
import requests
import math

# --- FETCH DATA ---
clusters = requests.get("http://127.0.0.1:8000/clusters").json()
ngos_raw = requests.get("http://127.0.0.1:8000/ngos").json()
alerts = requests.get("http://127.0.0.1:8000/alerts").json()

# Filter NGOs with valid coordinates
if isinstance(ngos_raw, list):
    ngos_all = ngos_raw
else:
    ngos_all = ngos_raw.get("ngos", [])

ngos = [n for n in ngos_all if isinstance(n, dict) and n.get("latitude") and n.get("longitude")]
print(f"NGOs with coords: {len(ngos)} / {len(ngos_all)}")
print(f"Alerts: {len(alerts)}, Clusters: {len(clusters)}")

# --- BASE MAP ---
m = folium.Map(location=[26.3377, 91.0036], zoom_start=7)

# --- LAYER 1: ALL NGO LOCATIONS (blue dots) ---
for n in ngos:
    folium.CircleMarker(
        location=[n["latitude"], n["longitude"]],
        radius=4,
        color="#4A90E2",
        fill=True,
        fill_opacity=0.5,
        weight=1,
        popup=folium.Popup(
            f"<b>{n.get('ngoName', 'NGO')}</b><br>"
            f"District: {n.get('districtName', '')}<br>"
            f"Type: {n.get('ngoType', '')}",
            max_width=200
        ),
        tooltip=n.get("ngoName", "NGO")
    ).add_to(m)

# --- LAYER 2: SOS ALERT ZONES + nearest NGO lines ---
alert_level_color = {"CRITICAL": "red", "HIGH": "orange", "MEDIUM": "green"}
# If API returns no alerts, use seed data for demo
if not alerts:
    alerts = [
        {"lat": 26.323, "lon": 91.003, "alert_level": "CRITICAL", "dominant_need": "food", "people_affected": 35, "settlement": "Barpeta", "priority_score": 0.683, "gap": 1.0},
        {"lat": 26.02,  "lon": 89.97,  "alert_level": "HIGH",     "dominant_need": "water",   "people_affected": 35, "settlement": "Dhubri",  "priority_score": 0.45,  "gap": 0.9},
        {"lat": 26.25,  "lon": 92.33,  "alert_level": "HIGH",     "dominant_need": "medical", "people_affected": 15, "settlement": "Morigaon","priority_score": 0.38,  "gap": 0.85},
        {"lat": 26.48,  "lon": 90.56,  "alert_level": "MEDIUM",   "dominant_need": "rescue",  "people_affected": 30, "settlement": "Bongaigaon","priority_score": 0.28,"gap": 0.7},
        {"lat": 25.98,  "lon": 89.88,  "alert_level": "MEDIUM",   "dominant_need": "shelter", "people_affected": 37, "settlement": "South Salmara","priority_score": 0.22,"gap": 0.65},
    ]
for alert in alerts:
    lat, lon = alert["lat"], alert["lon"]
    level = alert.get("alert_level", "MEDIUM")
    color = alert_level_color.get(level, "red")
    need = alert.get("dominant_need", "")
    people = alert.get("people_affected", 0)
    settlement = alert.get("settlement", "")

    # Hotspot zone circle
    folium.Circle(
        location=[lat, lon],
        radius=8000,
        color=color,
        weight=2,
        fill=True,
        fill_color=color,
        fill_opacity=0.12,
        popup=f"<b>{settlement}</b> — {level}<br>Need: {need}<br>People: {people}"
    ).add_to(m)

    # Center dot
    folium.CircleMarker(
        location=[lat, lon],
        radius=10,
        color=color,
        fill=True,
        fill_opacity=0.85,
        weight=2,
        popup=folium.Popup(
            f"<b style='color:{color}'>[{level}] {settlement}</b><br>"
            f"Need: {need.upper()}<br>"
            f"People affected: {people}<br>"
            f"Priority score: {alert.get('priority_score', '')}<br>"
            f"Coverage gap: {round(alert.get('gap', 0) * 100, 1)}%",
            max_width=220
        ),
        tooltip=f"[{level}] {settlement} — {need}"
    ).add_to(m)

    # Find 3 nearest NGOs
    if ngos:
        nearest = sorted(ngos, key=lambda n: math.sqrt(
            (n["latitude"] - lat)**2 + (n["longitude"] - lon)**2
        ))[:3]

        for i, n in enumerate(nearest):
            ngo_name = n.get("ngoName", "NGO")

            # Dashed line from alert to NGO
            folium.PolyLine(
                locations=[[lat, lon], [n["latitude"], n["longitude"]]],
                color=color,
                weight=1.5,
                opacity=0.5,
                dash_array="6 4",
                popup=f"Response route: {ngo_name} → {settlement}"
            ).add_to(m)

            # Highlighted responding NGO
            folium.CircleMarker(
                location=[n["latitude"], n["longitude"]],
                radius=7,
                color=color,
                fill=True,
                fill_opacity=0.9,
                weight=2,
                popup=folium.Popup(
                    f"<b style='color:{color}'>Nearest NGO #{i+1}</b><br>"
                    f"{ngo_name}<br>"
                    f"District: {n.get('districtName', '')}<br>"
                    f"→ Responding to: {settlement}",
                    max_width=220
                ),
                tooltip=f"#{i+1} nearest to {settlement}"
            ).add_to(m)

# --- LEGEND ---
legend_html = f"""
<div style="position: fixed; top: 20px; left: 50px; z-index:1000;
     background: rgba(0,0,0,0.85); color: white;
     padding: 16px 20px; border-radius: 8px;
     border: 1px solid rgba(255,255,255,0.2);
     font-family: monospace; font-size: 12px; max-width: 280px;">
  <div style="font-size:14px; font-weight:700; margin-bottom:10px; color:#FFB343">
    AidSync — Live Disaster Map
  </div>
  <div>🔴 CRITICAL alert zone</div>
  <div>🟠 HIGH alert zone</div>
  <div>🟢 MEDIUM alert zone</div>
  <div style="margin-top:6px">🔵 NGO locations ({len(ngos)})</div>
  <div>╌╌ Response route (nearest 3 NGOs)</div>
  <hr style="border-color:rgba(255,255,255,0.2); margin:10px 0">
  <div style="color:#aaa">Active alerts: {len(alerts)}</div>
  <div style="color:#aaa">NGOs mapped: {len(ngos)}</div>
  <div style="color:#aaa">Clusters: {len(clusters)}</div>
</div>
"""
m.get_root().html.add_child(folium.Element(legend_html))

m.save("heatmap_hotspots.html")
print(f"Map saved. {len(alerts)} alerts, {len(ngos)} NGOs, lines to nearest 3 per alert.")