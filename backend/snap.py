import geopandas as gpd
import pandas as pd
import numpy as np
from shapely.geometry import Point

# Load Assam from GADM
india = gpd.read_file("data/gadm41_IND_2.shp")
assam = india[india['NAME_1'] == 'Assam']

# Generate settlement points from district centroids
# Each district centroid = one "settlement" for snap purposes
settlements = assam.copy()
settlements['geometry'] = assam.geometry.centroid
settlements['name'] = assam['NAME_2']  # district name
settlements = settlements[['name', 'geometry']].reset_index(drop=True)

print(f"Settlements generated: {len(settlements)}")
print(settlements.head())

# --- SNAP FUNCTION ---
def snap_to_settlement(lat, lon, max_distance_m=2000):
    """
    Snaps a GPS coordinate to nearest known settlement.
    Returns settlement name, distance, and confidence.
    """
    # Reproject to UTM zone 46N (covers Assam) for meter-based distance
    user_point = gpd.GeoDataFrame(
        [{'geometry': Point(lon, lat)}], 
        crs="EPSG:4326"
    ).to_crs("EPSG:32646")

    settlements_utm = settlements.set_crs("EPSG:4326").to_crs("EPSG:32646")
    
    # Compute distances to all settlements
    distances = settlements_utm.geometry.distance(user_point.geometry.iloc[0])
    
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
        "distance_m": round(nearest_dist, 2),
        "confidence": confidence
    }

# --- TEST IT ---
# Barpeta district coordinates (Rekha's location)
test_result = snap_to_settlement(26.32, 91.0)
print("\nSnap test result:")
print(test_result)

# Test with a point in the middle of nowhere
test_far = snap_to_settlement(28.0, 95.0)
print("\nFar point test:")
print(test_far)