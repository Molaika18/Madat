from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
import json
import math

from app import models
from app.database import SessionLocal, engine, Base
from cluster import add_report as ml_add_report, run_clustering
from coverage_score import grid, update_coverage
from priority import get_priority_alerts

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AidSync API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load NGOs once at startup
with open("data/assam_ngos_geocoded.json") as f:
    NGO_DATA = json.load(f)


# --- DB Session ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- Pydantic Models ---
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


# --- Endpoints ---

@app.get("/")
def root():
    return {"message": "AidSync API running"}


@app.get("/health")
def health(db: Session = Depends(get_db)):
    report_count = db.query(models.Report).count()
    cluster_count = db.query(models.Cluster).count()
    return {
        "status": "ok",
        "reports": report_count,
        "clusters": cluster_count,
        "ngos_loaded": len(NGO_DATA)
    }


@app.post("/report")
def create_report(report: ReportCreate, db: Session = Depends(get_db)):
    # Save to DB
    db_report = models.Report(
        need_type=report.need_type,
        latitude=report.latitude,
        longitude=report.longitude,
        people_count=report.people_count
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)

    # Feed into ML pipeline
    ml_add_report(report.latitude, report.longitude, report.need_type, report.people_count)

    # Re-run clustering and persist results
    clusters = run_clustering()
    db.query(models.Cluster).delete()
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

    # Update ML coverage grid
    update_coverage(d.latitude, d.longitude, d.beneficiaries, d.radius_km * 1000)

    return {"status": "distribution_logged", "distribution_id": dist.id}


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


@app.get("/alerts")
def get_alerts():
    return get_priority_alerts()


@app.get("/coverage")
def get_coverage():
    return [
        {
            "lat": c["lat"],
            "lon": c["lon"],
            "population": c["population"],
            "coverage_score": c["coverage_score"]
        }
        for c in grid if c["population"] > 0
    ]


@app.get("/ngos")
def get_ngos():
    return NGO_DATA


@app.get("/ngos/nearby")
def ngos_nearby(lat: float, lon: float, limit: int = 5):
    sorted_ngos = sorted(
        NGO_DATA,
        key=lambda n: math.sqrt((n["lat"] - lat)**2 + (n["lon"] - lon)**2)
    )
    return sorted_ngos[:limit]


@app.post("/assign")
def assign_cluster(cluster_id: int, ngo_name: str, db: Session = Depends(get_db)):
    cluster = db.query(models.Cluster).filter(models.Cluster.id == cluster_id).first()
    if not cluster:
        return {"status": "error", "message": "Cluster not found"}

    dist = models.Distribution(
        ngo_name=ngo_name,
        latitude=cluster.centroid_lat,
        longitude=cluster.centroid_lon,
        radius_km=1.5
    )
    db.add(dist)
    db.commit()
    db.refresh(dist)

    return {
        "status": "assigned",
        "distribution_id": dist.id,
        "cluster_id": cluster_id
    }