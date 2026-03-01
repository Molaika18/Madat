import json
import time
from pathlib import Path

import geopandas as gpd
from geopy.geocoders import Nominatim

# --------------------------------------------------
# CONFIG 
# --------------------------------------------------
RAW_FILE = "clean_ngos.json"   # your raw file
SHAPEFILE = "data/gadm41_IND_2.shp"
OUT_FILE = "data/assam_ngos_geocoded.json"

GEOCODE_DELAY = 1.2   # seconds (Nominatim safe)
USER_AGENT = "assam-ngo-disaster-mapper"

# --------------------------------------------------
# STEP 1: LOAD ASSAM DISTRICT CENTROIDS
# --------------------------------------------------
print("Loading Assam district centroids...")

gdf = gpd.read_file(SHAPEFILE)
assam = gdf[gdf["NAME_1"] == "Assam"].to_crs("EPSG:4326")

district_centroids = {
    row["NAME_2"].upper().strip(): {
        "lat": row.geometry.centroid.y,
        "lon": row.geometry.centroid.x
    }
    for _, row in assam.iterrows()
}

print(f"Districts available: {list(district_centroids.keys())}")

# --------------------------------------------------
# STEP 2: LOAD RAW NGO DATA (BROKEN JSON SAFE)
# --------------------------------------------------
print("Loading raw NGO file safely...")

raw_text = Path(RAW_FILE).read_text(errors="ignore")
decoder = json.JSONDecoder()

pos = 0
ngos = []
blob_count = 0

while pos < len(raw_text):
    try:
        obj, idx = decoder.raw_decode(raw_text, pos)
        blob_count += 1

        if isinstance(obj, dict) and "ngos" in obj:
            ngos.extend(obj["ngos"])
            print(f"Loaded blob {blob_count}: {len(obj['ngos'])} NGOs")

        pos += idx
        while pos < len(raw_text) and raw_text[pos].isspace():
            pos += 1

    except json.JSONDecodeError:
        pos += 1

print(f"\nTotal NGOs loaded: {len(ngos)}")

# --------------------------------------------------
# STEP 3: GEOCODING SETUP
# --------------------------------------------------
geolocator = Nominatim(user_agent=USER_AGENT)

geocoded = []
failed = 0

# --------------------------------------------------
# STEP 4: GEOCODE WITH FALLBACK
# --------------------------------------------------
for i, ngo in enumerate(ngos, start=1):
    name = ngo.get("ngoName", "").strip()
    district = ngo.get("districtName", "").upper().strip()

    print(f"[{i}/{len(ngos)}] Geocoding: {name}")

    # 1️⃣ Use existing coordinates
    if ngo.get("latitude") and ngo.get("longitude"):
        ngo["location_source"] = "provided"
        geocoded.append(ngo)
        continue

    # 2️⃣ Try address geocoding
    query = f"{ngo.get('address','')}, {district}, Assam, India"

    try:
        location = geolocator.geocode(query, timeout=10)
        time.sleep(GEOCODE_DELAY)

        if location:
            ngo["latitude"] = location.latitude
            ngo["longitude"] = location.longitude
            ngo["location_source"] = "address"
            geocoded.append(ngo)
            continue

    except Exception:
        pass

    # 3️⃣ Fallback → district centroid
    if district in district_centroids:
        ngo["latitude"] = district_centroids[district]["lat"]
        ngo["longitude"] = district_centroids[district]["lon"]
        ngo["location_source"] = "district_centroid"
        geocoded.append(ngo)
        continue

    # 4️⃣ Absolute failure (very rare)
    ngo["location_source"] = "unknown"
    geocoded.append(ngo)
    failed += 1

# --------------------------------------------------
# STEP 5: SAVE CLEAN JSON
# --------------------------------------------------
output = {
    "total_ngos": len(geocoded),
    "failed_geocoding": failed,
    "ngos": geocoded
}

Path(OUT_FILE).write_text(json.dumps(output, indent=2))

# --------------------------------------------------
# SUMMARY
# --------------------------------------------------
print("\n--- SUMMARY ---")
print(f"Total NGOs: {len(geocoded)}")
print(f"Failed geocoding: {failed}")
print(f"Saved → {OUT_FILE}")