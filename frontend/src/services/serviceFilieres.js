const API_ROOT = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
const API_URL = API_ROOT ? `${API_ROOT}/api/filieres` : "/api/filieres";

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

// Récupérer toutes les filières
export const getFilieres = () => {
    return fetchWithTimeout(API_URL, {}).then(handleResponse);
};

// Ajouter une filière
export const createFiliere = (filiere) => {
    return fetchWithTimeout(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filiere),
    }).then(handleResponse);
};

// Modifier une filière
export const updateFiliere = (id, filiere) => {
    return fetchWithTimeout(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filiere),
    }).then(handleResponse);
};

// Supprimer une filière
export const deleteFiliere = (id) => {
    return fetchWithTimeout(`${API_URL}/${id}`, {
        method: "DELETE",
    }).then(handleResponse);
};
