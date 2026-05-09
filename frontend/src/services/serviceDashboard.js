const API_ROOT = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
const API_URL = API_ROOT ? `${API_ROOT}/api/dashboard` : "/api/dashboard";

// 30 s : démarrage lent / première requête MySQL ; évite un faux « timeout » à 5 s
const FETCH_MS = Number(import.meta.env.VITE_API_FETCH_MS) || 30000;

const fetchWithTimeout = (url, options = {}, timeout = FETCH_MS) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    return fetch(url, { ...options, signal: controller.signal })
        .finally(() => clearTimeout(id));
};

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Erreur réseau");
    }
    return response.json();
};

// Statistiques du tableau de bord
export const getDashboardStats = (token) => {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    return fetchWithTimeout(`${API_URL}/stats`, { headers }).then(handleResponse);
};

// Activités récentes (déduites de la base)
export const getDashboardActivitesRecentes = (token, { limit = 6 } = {}) => {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const q = new URLSearchParams({ limit: String(limit) });
    return fetchWithTimeout(`${API_URL}/activites-recentes?${q}`, { headers }).then(handleResponse);
};

