import geopandas as gpd
import numpy as np
from shapely.geometry import Point

# --- LOAD GRID ---
print("Loading grid...")
grid = gpd.read_file("data/assam_grid.geojson")
grid['coverage_score'] = 0.0
print(f"Grid loaded: {len(grid)} cells")

# Build UTM version of grid points ONCE
print("Projecting grid to UTM...")
grid_points_utm = gpd.GeoDataFrame(
    grid[['grid_id']].copy(),
    geometry=gpd.points_from_xy(grid['centroid_lon'], grid['centroid_lat']),
    crs="EPSG:4326"
).to_crs("EPSG:32646")
print("Ready.")

# --- DISTRIBUTION STORE ---
distributions = []

def add_distribution(lat, lon, aid_type, beneficiary_count, radius_m=1500):
    distributions.append({
        "lat": lat, "lon": lon,
        "aid_type": aid_type,
        "beneficiary_count": beneficiary_count,
        "radius_m": radius_m
    })
    print(f"  + Distribution: {aid_type} at ({lat},{lon}) for {beneficiary_count} people")

def update_coverage():
    # Reset scores on the GLOBAL grid
    grid['coverage_score'] = 0.0

    for dist in distributions:
        dist_point = gpd.GeoDataFrame(
            [{'geometry': Point(dist['lon'], dist['lat'])}],
            crs="EPSG:4326"
        ).to_crs("EPSG:32646").geometry.iloc[0]

        distances = grid_points_utm.geometry.distance(dist_point)
        within_radius = distances <= dist['radius_m']

        pop = grid.loc[within_radius, 'population'].clip(lower=1)
        grid.loc[within_radius, 'coverage_score'] += dist['beneficiary_count'] / pop

    grid['coverage_score'] = grid['coverage_score'].clip(upper=1.0)
    covered = (grid['coverage_score'] > 0).sum()
    print(f"  Coverage updated: {covered} cells now covered")

def get_coverage_at(lat, lon):
    point_utm = gpd.GeoDataFrame(
        [{'geometry': Point(lon, lat)}],
        crs="EPSG:4326"
    ).to_crs("EPSG:32646").geometry.iloc[0]
    distances = grid_points_utm.geometry.distance(point_utm)
    nearest_idx = distances.idxmin()
    return {
        "grid_id": int(grid.loc[nearest_idx, 'grid_id']),
        "population": round(float(grid.loc[nearest_idx, 'population']), 0),
        "coverage_score": round(float(grid.loc[nearest_idx, 'coverage_score']), 4)
    }

def get_gap_zones(top_n=10, min_population=200):
    populated = grid[grid['population'] > min_population].copy()
    populated['gap_score'] = populated['population'] * (1 - populated['coverage_score'])
    top = populated.nlargest(top_n, 'gap_score')
    return top[[
        'grid_id','centroid_lat','centroid_lon',
        'population','coverage_score','gap_score'
    ]].round(4).to_dict('records')

# --- REALISTIC ASSAM SEED DATA ---
# Based on actual Assam flood response patterns:
# NGOs cluster near Guwahati and NH27 highway corridor
# Underserved: Dhubri, Barpeta rural, South Salmara, Bongaigaon

def seed_realistic_distributions():
    print("\nSeeding realistic NGO distributions (Assam flood pattern)...")

    # Well-served: Guwahati urban + highway corridor
    add_distribution(26.14, 91.74, "food", 2000)   # Guwahati central
    add_distribution(26.18, 91.75, "food", 1500)   # Guwahati north
    add_distribution(26.10, 91.70, "water", 1000)  # Guwahati south
    add_distribution(26.19, 91.88, "food", 800)    # Near highway NH27 east
    add_distribution(26.15, 91.60, "food", 900)    # NH27 west
    add_distribution(26.44, 91.44, "food", 600)    # Nalbari town
    add_distribution(26.46, 90.73, "food", 500)    # Bongaigaon town
    add_distribution(26.35, 92.69, "food", 700)    # Nagaon town
    add_distribution(26.75, 94.21, "food", 400)    # Jorhat

    update_coverage()

# --- TEST ---
if __name__ == "__main__":
    print("\n--- BEFORE distributions ---")
    print("Barpeta:", get_coverage_at(26.32, 91.0))
    print("Guwahati:", get_coverage_at(26.14, 91.74))
    print("Dhubri (remote):", get_coverage_at(26.02, 89.97))

    seed_realistic_distributions()

    print("\n--- AFTER distributions ---")
    print("Barpeta:", get_coverage_at(26.32, 91.0))
    print("Guwahati:", get_coverage_at(26.14, 91.74))
    print("Dhubri (remote):", get_coverage_at(26.02, 89.97))

    print("\nTop 10 gap zones (high population, low coverage):")
    gaps = get_gap_zones(10)
    for g in gaps:
        print(f"  ({g['centroid_lat']},{g['centroid_lon']}) "
              f"pop:{g['population']:.0f} "
              f"coverage:{g['coverage_score']:.3f} "
              f"gap:{g['gap_score']:.0f}")