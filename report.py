import geopandas as gpd
import pandas as pd
import numpy as np
from shapely.geometry import Point
import uuid
from datetime import datetime

# --- LOAD SETTLEMENTS (fixed centroid warning) ---
india = gpd.read_file("data/gadm41_IND_2.shp")
assam = india[india['NAME_1'] == 'Assam']
assam_utm = assam.to_crs("EPSG:32646")
settlements = assam_utm.copy()
settlements['geometry'] = assam_utm.geometry.centroid
settlements['name'] = assam['NAME_2'].values
settlements = settlements[['name', 'geometry']].reset_index(drop=True)

# --- SNAP FUNCTION ---
def snap_to_settlement(lat, lon, max_distance_m=2000):
    user_point = gpd.GeoDataFrame(
        [{'geometry': Point(lon, lat)}],
        crs="EPSG:4326"
    ).to_crs("EPSG:32646")

    distances = settlements.geometry.distance(user_point.geometry.iloc[0])
    nearest_idx = distances.idxmin()
    nearest_dist = distances[nearest_idx]
    nearest_name = settlements.loc[nearest_idx, 'name']

    if nearest_dist <= max_distance_m:
        confidence = "high" if nearest_dist < 500 else "medium"
    else:
        confidence = "low"
        nearest_name = "unknown"

    return {
        "snapped_settlement": nearest_name,
        "distance_m": round(float(nearest_dist), 2),
        "confidence": confidence
    }

# --- IN-MEMORY REPORT STORE ---
# Simple list acting as our database for now
reports = []

def add_report(lat, lon, need_type, people_count=1):
    snap = snap_to_settlement(lat, lon)
    report = {
        "id": str(uuid.uuid4()),
        "lat": lat,
        "lon": lon,
        "need_type": need_type,
        "people_count": people_count,
        "snapped_settlement": snap["snapped_settlement"],
        "distance_m": snap["distance_m"],
        "confidence": snap["confidence"],
        "timestamp": datetime.utcnow().isoformat()
    }
    reports.append(report)
    return report

def get_all_reports():
    return reports

# --- TEST ---
if __name__ == "__main__":
    # Simulate Rekha and neighbors reporting
    add_report(26.32, 91.0, "food", people_count=6)
    add_report(26.321, 91.001, "water", people_count=4)
    add_report(26.319, 90.999, "food", people_count=3)
    add_report(26.50, 91.5, "medical", people_count=2)  # different area
    
    all_reports = get_all_reports()
    print(f"Total reports: {len(all_reports)}")
    for r in all_reports:
        print(f"  [{r['need_type']}] {r['snapped_settlement']} | confidence: {r['confidence']} | people: {r['people_count']}")