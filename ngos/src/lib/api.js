const BASE_URL = "http://localhost:8000";

export async function submitReport(data) {
    const res = await fetch(`${BASE_URL}/report`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            need_type: data.need_type,
            latitude: data.latitude,
            longitude: data.longitude,
            people_count: data.people_count,
        }),
    });

    return res.json();
}

export async function fetchAlerts() {
    try {
        const res = await fetch("http://127.0.0.1:8000/alerts");
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
        // fallback seed data for demo
        return [
            { cluster_id: 0, settlement: "Barpeta", lat: 26.323, lon: 91.003, alert_level: "CRITICAL", dominant_need: "food", people_affected: 35, report_count: 7, priority_score: 0.683, coverage: 0.0, gap: 1.0 },
            { cluster_id: 1, settlement: "Dhubri", lat: 26.02, lon: 89.97, alert_level: "HIGH", dominant_need: "water", people_affected: 35, report_count: 5, priority_score: 0.45, coverage: 0.1, gap: 0.9 },
            { cluster_id: 2, settlement: "Morigaon", lat: 26.25, lon: 92.33, alert_level: "HIGH", dominant_need: "medical", people_affected: 15, report_count: 4, priority_score: 0.38, coverage: 0.15, gap: 0.85 },
            { cluster_id: 3, settlement: "Bongaigaon", lat: 26.48, lon: 90.56, alert_level: "MEDIUM", dominant_need: "rescue", people_affected: 30, report_count: 3, priority_score: 0.28, coverage: 0.3, gap: 0.7 },
            { cluster_id: 4, settlement: "South Salmara", lat: 25.98, lon: 89.88, alert_level: "MEDIUM", dominant_need: "shelter", people_affected: 37, report_count: 3, priority_score: 0.22, coverage: 0.35, gap: 0.65 },
        ];
    } catch { return []; }
}

export async function fetchCoverage() {
    try {
        const res = await fetch("http://127.0.0.1:8000/coverage");
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
        return [{ lat: 26.14, lon: 91.74, population: 50000, coverage_score: 0.8 },
        { lat: 26.32, lon: 91.0, population: 30000, coverage_score: 0.0 },
        { lat: 26.02, lon: 89.97, population: 25000, coverage_score: 0.05 }];
    } catch { return []; }
}

export async function fetchClusters() {
    const res = await fetch(`${BASE_URL}/clusters`);
    return res.json();
}
export async function fetchNGOs() {
    const res = await fetch("http://127.0.0.1:8000/ngos");
    return res.json();
}