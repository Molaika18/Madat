import rasterio
from rasterio.mask import mask
import geopandas as gpd

# Step 1: Load GADM and filter Assam
india = gpd.read_file("data/gadm41_IND_2.shp")
assam = india[india['NAME_1'] == 'Assam']
print(f"Assam loaded: {len(assam)} districts")
print(assam.head())

# Step 2: Clip WorldPop to Assam
assam_geom = assam.geometry.values
with rasterio.open("data/ind_pop_2020_CN_100m_R2025A_v1.tif") as src:
    assam_pop, transform = mask(src, assam_geom, crop=True)
    
print(f"Population raster shape: {assam_pop.shape}")
print(f"Max population value in a cell: {assam_pop.max()}")