const API_ROOT = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
const API_URL = API_ROOT ? `${API_ROOT}/api/parcours` : "/api/parcours";

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

// Récupérer tous les parcours
export const getParcours = () => {
    return fetchWithTimeout(API_URL, {}).then(handleResponse);
};

// Ajouter un parcours
export const createParcours = (parcours) => {
    return fetchWithTimeout(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parcours),
    }).then(handleResponse);
};

// Modifier un parcours
export const updateParcours = (id, parcours) => {
    return fetchWithTimeout(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parcours),
    }).then(handleResponse);
};

// Supprimer un parcours
export const deleteParcours = (id) => {
    return fetchWithTimeout(`${API_URL}/${id}`, {
        method: "DELETE",
    }).then(handleResponse);
};

// Détail d’un parcours
export const getParcoursById = (id) => {
    return fetchWithTimeout(`${API_URL}/${id}`, {}).then(handleResponse);
};

// Parcours correspondant à une filière et un niveau
export const getParcoursMatch = (filiereId, niveauId) => {
    const q = new URLSearchParams({
        filiere_id: String(filiereId),
        niveau_id: String(niveauId),
    });
    return fetchWithTimeout(`${API_URL}/match?${q}`, {}).then(handleResponse);
};
