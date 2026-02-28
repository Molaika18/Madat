
# backend/app/models.py

from sqlalchemy import Column, Integer, Float, String, DateTime, Boolean
from datetime import datetime
from app.database import Base

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    need_type = Column(String, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    people_count = Column(Integer)
    timestamp = Column(DateTime, default=datetime.utcnow)

class Distribution(Base):
    __tablename__ = "distributions"

    id = Column(Integer, primary_key=True, index=True)
    aid_type = Column(String, index=True)
    ngo_name = Column(String, index=True)  
    latitude = Column(Float)
    longitude = Column(Float)
    radius_km = Column(Float, default=1.5) 
    timestamp = Column(DateTime, default=datetime.utcnow)

class Cluster(Base):
    __tablename__ = "clusters"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, index=True)
    centroid_lat = Column(Float)
    centroid_lon = Column(Float)
    cluster_size = Column(Integer)
    credibility = Column(Float)
    last_updated = Column(DateTime, default=datetime.utcnow)


class Gaps(Base):
    __tablename__ = "grid_cells"

    id = Column(Integer, primary_key=True, index=True)
    cell_lat = Column(Float)
    cell_lon = Column(Float)
    population = Column(Integer)
    coverage_score = Column(Float)
    is_gap = Column(Boolean)
