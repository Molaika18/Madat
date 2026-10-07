import math

from sqlalchemy.orm import Session

from cluster import run_clustering
from coverage_score import get_coverage_at


def get_priority_alerts(db: Session):
    """Turn persisted SOS-report clusters into dashboard-ready priority alerts."""
    alerts = []
    for cluster in run_clustering(db):
        if cluster["credibility"] == "low":
            continue

        coverage = get_coverage_at(cluster["centroid_lat"], cluster["centroid_lon"])["coverage_score"]
        gap = 1 - coverage
        report_count = cluster["size"]
        population_weight = math.log1p(report_count) / math.log1p(20)
        priority_score = round(cluster["credibility_score"] * gap * population_weight, 4)
        level = "CRITICAL" if priority_score > 0.6 else "HIGH" if priority_score > 0.3 else "MEDIUM"

        alerts.append({
            "cluster_id": cluster["cluster_id"],
            "settlement": cluster["settlement"],
            "lat": cluster["centroid_lat"],
            "lon": cluster["centroid_lon"],
            "priority_score": priority_score,
            "alert_level": level,
            "dominant_need": cluster["dominant_need"],
            "people_affected": cluster["total_people"],
            "report_count": report_count,
            "credibility": cluster["credibility"],
            "coverage": round(coverage, 4),
            "gap": round(gap, 4),
        })

    return sorted(alerts, key=lambda alert: alert["priority_score"], reverse=True)
