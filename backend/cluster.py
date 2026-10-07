"""Cluster persisted SOS reports into nearby distress zones."""

from collections import Counter

import numpy as np
from sklearn.cluster import DBSCAN
from sqlalchemy.orm import Session

from app.models import Report


def run_clustering(db: Session, eps_km: float = 5, min_samples: int = 2):
    """Return verified clusters based on the reports saved in the database."""
    reports = db.query(Report).order_by(Report.timestamp.asc()).all()
    if len(reports) < min_samples:
        return []

    coords = np.array([[report.latitude, report.longitude] for report in reports])
    labels = DBSCAN(
        eps=eps_km / 6371,
        min_samples=min_samples,
        metric="haversine",
    ).fit(np.radians(coords)).labels_

    clusters = []
    for label in sorted(set(labels)):
        if label == -1:
            continue

        members = [report for report, report_label in zip(reports, labels) if report_label == label]
        member_coords = np.array([[report.latitude, report.longitude] for report in members])
        size = len(members)
        credibility, credibility_score = (
            ("high", 1.0) if size >= 6 else ("medium", 0.6) if size >= 3 else ("low", 0.3)
        )
        need_counts = Counter(report.need_type for report in members)

        clusters.append({
            "cluster_id": int(label),
            "centroid_lat": round(float(member_coords[:, 0].mean()), 5),
            "centroid_lon": round(float(member_coords[:, 1].mean()), 5),
            "size": size,
            "credibility": credibility,
            "credibility_score": credibility_score,
            "dominant_need": need_counts.most_common(1)[0][0],
            "total_people": sum(report.people_count for report in members),
            "settlement": "Reported location",
        })

    return sorted(clusters, key=lambda cluster: cluster["credibility_score"], reverse=True)
