const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

async function request(path, options) {
    const res = await fetch(`${BASE_URL}${path}`, options);
    if (!res.ok) {
        const detail = await res.text();
        throw new Error(detail || `Request failed with status ${res.status}`);
    }
    return res.json();
}

export function submitReport(data) {
    return request("/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            need_type: data.need_type,
            latitude: data.latitude,
            longitude: data.longitude,
            people_count: data.people_count,
        }),
    });
}

export async function fetchAlerts() {
    try {
        return await request("/alerts");
    } catch {
        return [];
    }
}

export async function fetchCoverage() {
    try {
        return await request("/coverage");
    } catch {
        return [];
    }
}

export function fetchClusters() {
    return request("/clusters");
}

export function fetchNGOs() {
    return request("/ngos");
}

export function registerNGO(data) {
    return request("/ngos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
}
