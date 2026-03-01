from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
import json
import math

from app import models
from app.database import SessionLocal, engine, Base
from cluster import run_clustering
from coverage_score import update_coverage
from priority import get_priority_alerts


Base.metadata.create_all(bind=engine)

app = FastAPI(title="AidSync API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load NGOs at startup
with open("data/assam_ngos_geocoded.json") as f:
    NGO_DATA = json.load(f)


# -------------------------
# DB SESSION
# -------------------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -------------------------
# SCHEMAS
# -------------------------

class ReportCreate(BaseModel):
    need_type: str
    latitude: float
    longitude: float
    people_count: int


class DistributionCreate(BaseModel):
    aid_type: str
    latitude: float
    longitude: float
    beneficiaries: int = 500
    radius_km: float = 1.5


# -------------------------
# BASIC ROUTES
# -------------------------

@app.get("/")
def root():
    return {"message": "AidSync API running"}


@app.get("/health")
def health(db: Session = Depends(get_db)):
    return {
        "status": "ok",
        "reports": db.query(models.Report).count(),
        "clusters": db.query(models.Cluster).count(),
        "ngos_loaded": len(NGO_DATA)
    }


# -------------------------
# REPORT ENDPOINT
# -------------------------

@app.post("/report")
def create_report(report: ReportCreate, db: Session = Depends(get_db)):

    # Save report to DB
    db_report = models.Report(
        need_type=report.need_type,
        latitude=report.latitude,
        longitude=report.longitude,
        people_count=report.people_count
    )

    db.add(db_report)
    db.commit()
    db.refresh(db_report)

    # Recompute clusters
    clusters = run_clustering(db)

    # Clear old clusters
    db.query(models.Cluster).delete()

    # Save new clusters
    for c in clusters:
        db.add(models.Cluster(
            category=c["dominant_need"],
            centroid_lat=c["centroid_lat"],
            centroid_lon=c["centroid_lon"],
            cluster_size=c["size"],
            credibility=c["credibility_score"]
        ))

    db.commit()

    return {"status": "received", "report_id": db_report.id}


# -------------------------
# CLUSTERS
# -------------------------

@app.get("/clusters")
def get_clusters(db: Session = Depends(get_db)):
    clusters = db.query(models.Cluster).all()

    return [
        {
            "cluster_id": c.id,
            "category": c.category,
            "lat": c.centroid_lat,
            "lon": c.centroid_lon,
            "cluster_size": c.cluster_size,
            "credibility": c.credibility,
            "last_updated": c.last_updated
        }
        for c in clusters
    ]


# -------------------------
# ALERTS
# -------------------------

@app.get("/alerts")
def get_alerts(db: Session = Depends(get_db)):
    return get_priority_alerts()


# -------------------------
# COVERAGE
# -------------------------

@app.get("/coverage")
def get_coverage():
    from coverage_score import grid
    populated = grid[grid["population"] > 0]

    return populated[["centroid_lat", "centroid_lon", "population", "coverage_score"]]\
        .rename(columns={"centroid_lat": "lat", "centroid_lon": "lon"})\
        .round(4)\
        .to_dict("records")


# -------------------------
# NGO ROUTES
# -------------------------

@app.get("/ngos")
def get_ngos():
    return NGO_DATA.get("ngos", NGO_DATA)

@app.get("/ngos/nearby")
def ngos_nearby(lat: float, lon: float, limit: int = 5):
    all_ngos = NGO_DATA.get("ngos", NGO_DATA)
    valid = [n for n in all_ngos if isinstance(n, dict) and n.get("lat") and n.get("lon")]
    sorted_ngos = sorted(valid, key=lambda n: math.sqrt((n["lat"] - lat)**2 + (n["lon"] - lon)**2))
    return sorted_ngos[:limit]

# -------------------------
# DISTRIBUTION
# -------------------------

@app.post("/distribution")
def create_distribution(d: DistributionCreate, db: Session = Depends(get_db)):

    dist = models.Distribution(
        aid_type=d.aid_type,
        latitude=d.latitude,
        longitude=d.longitude,
        radius_km=d.radius_km
    )

    db.add(dist)
    db.commit()
    db.refresh(dist)

    update_coverage(d.latitude, d.longitude, d.beneficiaries, d.radius_km * 1000)

    return {"status": "distribution_logged", "distribution_id": dist.id}


# -------------------------
# DEBUG
# -------------------------

@app.get("/debug")
def debug(db: Session = Depends(get_db)):
    clusters = run_clustering(db)
    return {
        "report_count": db.query(models.Report).count(),
        "clusters": clusters
    }