import numpy as np
from sklearn.cluster import DBSCAN
import geopandas as gpd
from shapely.geometry import Point
import uuid
from datetime import datetime

# --- LOAD SETTLEMENTS ---
india = gpd.read_file("data/gadm41_IND_2.shp")
assam = india[india['NAME_1'] == 'Assam']
assam_utm = assam.to_crs("EPSG:32646")
settlements = assam_utm.copy()
settlements['geometry'] = assam_utm.geometry.centroid
settlements['name'] = assam['NAME_2'].values
settlements = settlements[['name', 'geometry']].reset_index(drop=True)

def snap_to_settlement(lat, lon, max_distance_m=50000):
    user_point = gpd.GeoDataFrame(
        [{'geometry': Point(lon, lat)}], crs="EPSG:4326"
    ).to_crs("EPSG:32646")
    distances = settlements.geometry.distance(user_point.geometry.iloc[0])
    nearest_idx = distances.idxmin()
    nearest_dist = distances[nearest_idx]
    nearest_name = settlements.loc[nearest_idx, 'name']
    if nearest_dist <= max_distance_m:
        confidence = "high" if nearest_dist < 5000 else "medium"
    else:
        confidence = "low"
        nearest_name = "unknown"
    return {"snapped_settlement": nearest_name, "distance_m": round(float(nearest_dist), 2), "confidence": confidence}

# --- IN-MEMORY STORE ---
reports = []

def add_report(lat, lon, need_type, people_count=1):
    snap = snap_to_settlement(lat, lon)
    report = {
        "id": str(uuid.uuid4()),
        "lat": lat, "lon": lon,
        "need_type": need_type,
        "people_count": people_count,
        "snapped_settlement": snap["snapped_settlement"],
        "timestamp": datetime.utcnow().isoformat()
    }
    reports.append(report)
    return report

def get_all_reports():
    return reports

def run_clustering(eps_km=5, min_samples=2):
    if len(reports) < min_samples:
        return []

    coords = np.array([[r["lat"], r["lon"]] for r in reports])
    coords_rad = np.radians(coords)

    labels = DBSCAN(
        eps=eps_km / 6371,
        min_samples=min_samples,
        metric="haversine"
    ).fit(coords_rad).labels_

    clusters = []
    for label in set(labels):
        if label == -1:
            continue
        idxs = np.where(labels == label)[0]
        cluster_reports = [reports[i] for i in idxs]
        cluster_coords = coords[idxs]
        centroid_lat = float(np.mean(cluster_coords[:, 0]))
        centroid_lon = float(np.mean(cluster_coords[:, 1]))
        size = len(cluster_reports)

        if size >= 6:
            credibility, credibility_score = "high", 1.0
        elif size >= 3:
            credibility, credibility_score = "medium", 0.6
        else:
            credibility, credibility_score = "low", 0.3

        need_types = [r["need_type"] for r in cluster_reports]
        dominant_need = max(set(need_types), key=need_types.count)
        total_people = sum(r["people_count"] for r in cluster_reports)
        settlement = cluster_reports[0]["snapped_settlement"]

        clusters.append({
            "cluster_id": int(label),
            "centroid_lat": round(centroid_lat, 5),
            "centroid_lon": round(centroid_lon, 5),
            "size": size,
            "credibility": credibility,
            "credibility_score": credibility_score,
            "dominant_need": dominant_need,
            "total_people": total_people,
            "settlement": settlement,
        })

    clusters.sort(key=lambda x: x["credibility_score"], reverse=True)
    return clusters

def get_clusters():
    return run_clustering()