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
    const res = await fetch(`${BASE_URL}/alerts`);
    return res.json();
}

export async function fetchCoverage() {
    const res = await fetch(`${BASE_URL}/coverage`);
    return res.json();
}

export async function fetchClusters() {
    const res = await fetch(`${BASE_URL}/clusters`);
    return res.json();
}