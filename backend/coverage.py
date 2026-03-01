import geopandas as gpd
import numpy as np
import rasterio
from rasterio.mask import mask
from shapely.geometry import box, Point
import pandas as pd

# --- LOAD ASSAM ---
india = gpd.read_file("data/gadm41_IND_2.shp")
assam = india[india['NAME_1'] == 'Assam']

# --- CLIP WORLDPOP TO ASSAM ---
with rasterio.open("data/ind_pop_2020_CN_100m_R2025A_v1.tif") as src:
    assam_geom = assam.geometry.values
    pop_array, pop_transform = mask(src, assam_geom, crop=True)
    pop_crs = src.crs

pop_array = pop_array[0]  # single band
pop_array[pop_array < 0] = 0  # remove nodata negatives

print(f"Population raster loaded: {pop_array.shape}")
print(f"Total Assam population estimate: {pop_array.sum():,.0f}")

# --- BUILD 1KM GRID OVER ASSAM ---
def build_grid(assam_gdf, cell_size_deg=0.01):
    """
    Creates a 1km grid (approx 0.01 degrees) over Assam.
    Each cell gets a population estimate from WorldPop.
    """
    bounds = assam_gdf.total_bounds  # minx, miny, maxx, maxy
    minx, miny, maxx, maxy = bounds

    cols = np.arange(minx, maxx, cell_size_deg)
    rows = np.arange(miny, maxy, cell_size_deg)

    grid_cells = []
    cell_id = 0

    for x in cols:
        for y in rows:
            cell_box = box(x, y, x + cell_size_deg, y + cell_size_deg)
            # Only keep cells that intersect Assam
            if assam_gdf.geometry.intersects(cell_box).any():
                grid_cells.append({
                    "grid_id": cell_id,
                    "centroid_lon": round(x + cell_size_deg/2, 5),
                    "centroid_lat": round(y + cell_size_deg/2, 5),
                    "geometry": cell_box,
                    "population": 0,
                    "coverage_score": 0.0
                })
                cell_id += 1

    grid_gdf = gpd.GeoDataFrame(grid_cells, crs="EPSG:4326")
    return grid_gdf

print("Building grid... (takes 30-60 seconds)")
grid = build_grid(assam)
print(f"Grid cells covering Assam: {len(grid)}")

# --- ASSIGN POPULATION TO EACH GRID CELL ---
def assign_population(grid_gdf):
    """
    For each grid cell, sum WorldPop values falling inside it.
    """
    populations = []

    with rasterio.open("data/ind_pop_2020_CN_100m_R2025A_v1.tif") as src:
        for idx, row in grid_gdf.iterrows():
            try:
                cell_geom = [row.geometry]
                cell_pop, _ = mask(src, cell_geom, crop=True, nodata=0)
                cell_pop = cell_pop[0]
                cell_pop[cell_pop < 0] = 0
                populations.append(float(cell_pop.sum()))
            except:
                populations.append(0.0)

    grid_gdf['population'] = populations
    return grid_gdf

print("Assigning population to grid cells... (takes 1-2 min)")
grid = assign_population(grid)

print(f"\nGrid ready.")
print(f"Cells with population > 0: {(grid['population'] > 0).sum()}")
print(f"Max population in single cell: {grid['population'].max():,.0f}")
print(f"Sample cells:")
print(grid[grid['population'] > 100][['grid_id','centroid_lat','centroid_lon','population']].head(10))

# Save grid so we don't recompute
grid.to_file("data/assam_grid.geojson", driver="GeoJSON")
print("\nGrid saved to data/assam_grid.geojson")