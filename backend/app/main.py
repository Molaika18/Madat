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
from coverage_score import get_coverage_at
from priority import get_priority_alerts

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
def get_alerts(db: Session = Depends(get_db)):
    clusters = db.query(models.Cluster).all()
    alerts = []

    for c in clusters:
        coverage = get_coverage_at(c.centroid_lat, c.centroid_lon)
        gap = 1 - coverage
        cred_score = c.credibility

        priority_score = round(cred_score * gap, 4)

        if priority_score > 0.6:
            level = "CRITICAL"
        elif priority_score > 0.3:
            level = "HIGH"
        else:
            level = "MEDIUM"

        alerts.append({
            "cluster_id": c.id,
            "lat": c.centroid_lat,
            "lon": c.centroid_lon,
            "priority_score": priority_score,
            "alert_level": level,
            "dominant_need": c.category,
            "cluster_size": c.cluster_size,
            "coverage": round(coverage, 4),
            "gap": round(gap, 4)
        })

    alerts.sort(key=lambda x: x["priority_score"], reverse=True)
    return alerts

@app.get("/coverage")
def get_coverage():
    from coverage_score import grid
    populated = grid[grid['population'] > 0]
    return populated[['centroid_lat', 'centroid_lon', 'population', 'coverage_score']].rename(
        columns={'centroid_lat': 'lat', 'centroid_lon': 'lon'}
    ).round(4).to_dict('records')

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