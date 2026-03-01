import folium
import requests

# Base map
m = folium.Map(location=[26.3377, 91.0036], zoom_start=6)

# Fetch clusters
response = requests.get("http://127.0.0.1:8000/clusters")
clusters = response.json()

print("Clusters received:", clusters)

# Add red markers for clusters
for c in clusters:
    folium.CircleMarker(
        location=[c["lat"], c["lon"]],
        radius=10,
        color="red",
        fill=True,
        fill_opacity=0.7,
        popup=f"{c['category']} - {c['cluster_size']} people"
    ).add_to(m)

m.save("heatmap_hotspots.html")
print("Map regenerated.")