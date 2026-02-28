import math
from cluster import get_clusters
from coverage_score import get_coverage_at


def get_priority_alerts():
    clusters = get_clusters()
    alerts = []

    for cluster in clusters:
        if cluster["credibility"] == "low":
            continue

        try:
            result = get_coverage_at(cluster["centroid_lat"], cluster["centroid_lon"])
            coverage = result["coverage_score"]
        except Exception as e:
            print(f"Coverage lookup failed for {cluster['settlement']}: {e}")
            coverage = 0.0

        gap = 1 - coverage
        report_count = cluster["size"]
        population_weight = math.log1p(report_count) / math.log1p(20)
        cred_score = cluster["credibility_score"]
        priority_score = round(cred_score * gap * population_weight, 4)

        if priority_score > 0.6:
            level = "CRITICAL"
        elif priority_score > 0.3:
            level = "HIGH"
        else:
            level = "MEDIUM"

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
            "gap": round(gap, 4)
        })

    alerts.sort(key=lambda x: x["priority_score"], reverse=True)
    return alerts


if __name__ == "__main__":
    from cluster import add_report

    for i in range(7):
        add_report(26.32 + (i * 0.001), 91.0 + (i * 0.001), "food", 5)

    add_report(26.15, 91.30, "water", 3)
    add_report(26.151, 91.301, "water", 2)
    add_report(26.152, 91.299, "food", 4)

    alerts = get_priority_alerts()
    print(f"\nPriority alerts: {len(alerts)}\n")
    for a in alerts:
        print(f"[{a['alert_level']}] {a['settlement']}")
        print(f"  Score: {a['priority_score']} | Need: {a['dominant_need']}")
        print(f"  People: {a['people_affected']}")
        print(f"  Coverage: {a['coverage']} | Gap: {a['gap']}")
        print()