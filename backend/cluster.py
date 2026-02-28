# cluster.py

import geopandas as gpd
import numpy as np
from shapely.geometry import Point
from sklearn.cluster import DBSCAN
import uuid
from datetime import datetime
import os

# -------------------------------
# GLOBAL STORE
# -------------------------------

reports = []
settlements = None


# -------------------------------
# INITIALIZE SETTLEMENT DATA
# -------------------------------

def initialize():
    global settlements

    shp_path = os.path.join("data", "gadm41_IND_2.shp")

    if not os.path.exists(shp_path):
        raise FileNotFoundError(f"Shapefile not found at {shp_path}")

    india = gpd.read_file(shp_path)
    assam = india[india["NAME_1"] == "Assam"]

    assam_utm = assam.to_crs("EPSG:32646")
    temp = assam_utm.copy()
    temp["geometry"] = assam_utm.geometry.centroid
    temp["name"] = assam["NAME_2"].values

    settlements = temp[["name", "geometry"]].reset_index(drop=True)


# -------------------------------
# SNAP TO NEAREST SETTLEMENT
# -------------------------------

def snap_to_settlement(lat, lon, max_distance_m=2000):
    global settlements

    user_point = gpd.GeoDataFrame(
        [{"geometry": Point(lon, lat)}],
        crs="EPSG:4326"
    ).to_crs("EPSG:32646")

    distances = settlements.geometry.distance(user_point.geometry.iloc[0])
    nearest_idx = distances.idxmin()
    nearest_dist = distances[nearest_idx]
    nearest_name = settlements.loc[nearest_idx, "name"]

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


# -------------------------------
# ADD REPORT
# -------------------------------

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


# -------------------------------
# RUN DBSCAN CLUSTERING
# -------------------------------

def run_clustering():
    if len(reports) < 2:
        return []

    points_utm = []

    for r in reports:
        pt = gpd.GeoDataFrame(
            [{"geometry": Point(r["lon"], r["lat"])}],
            crs="EPSG:4326"
        ).to_crs("EPSG:32646")

        x = pt.geometry.iloc[0].x
        y = pt.geometry.iloc[0].y
        points_utm.append([x, y])

    coords = np.array(points_utm)

    db = DBSCAN(eps=500, min_samples=2).fit(coords)
    labels = db.labels_

    clusters = []
    unique_labels = set(labels)

    for label in unique_labels:
        if label == -1:
            continue

        cluster_reports = [r for r, l in zip(reports, labels) if l == label]
        cluster_coords = [c for c, l in zip(coords, labels) if l == label]

        size = len(cluster_reports)

        centroid_x = np.mean([c[0] for c in cluster_coords])
        centroid_y = np.mean([c[1] for c in cluster_coords])

        centroid_gdf = gpd.GeoDataFrame(
            [{"geometry": Point(centroid_x, centroid_y)}],
            crs="EPSG:32646"
        ).to_crs("EPSG:4326")

        centroid_lon = centroid_gdf.geometry.iloc[0].x
        centroid_lat = centroid_gdf.geometry.iloc[0].y

        # Credibility scoring
        if size >= 6:
            credibility = "high"
            credibility_score = 1.0
        elif size >= 3:
            credibility = "medium"
            credibility_score = 0.6
        else:
            credibility = "low"
            credibility_score = 0.3

        need_types = [r["need_type"] for r in cluster_reports]
        dominant_need = max(set(need_types), key=need_types.count)

        total_people = sum(r["people_count"] for r in cluster_reports)

        clusters.append({
            "cluster_id": int(label),
            "centroid_lat": round(centroid_lat, 5),
            "centroid_lon": round(centroid_lon, 5),
            "size": size,
            "credibility": credibility,
            "credibility_score": credibility_score,
            "dominant_need": dominant_need,
            "total_people": total_people,
            "settlement": cluster_reports[0]["snapped_settlement"]
        })

    clusters.sort(key=lambda x: x["credibility_score"], reverse=True)
    return clusters


def get_clusters():
    return run_clustering()


# -------------------------------
# MAIN TEST
# -------------------------------

if __name__ == "__main__":
    initialize()

    print("Simulating reports...\n")

    for i in range(7):
        add_report(26.32 + (i * 0.001), 91.0 + (i * 0.001), "food", 5)

    add_report(26.15, 91.30, "water", 3)
    add_report(26.151, 91.301, "water", 2)
    add_report(26.152, 91.299, "food", 4)

    clusters = get_clusters()

    print(f"Clusters detected: {len(clusters)}\n")

    for c in clusters:
        print(c)