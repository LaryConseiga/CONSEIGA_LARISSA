const API_ROOT = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
const API_URL = API_ROOT ? `${API_ROOT}/api/annee-academiques` : "/api/annee-academiques";

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

// Récupérer toutes les années académiques
export const getAnneesAcademiques = () => {
    return fetchWithTimeout(API_URL, {}).then(handleResponse);
};

// Ajouter une année académique
export const createAnneeAcademique = (anneeAcademique) => {
    return fetchWithTimeout(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(anneeAcademique),
    }).then(handleResponse);
};

// Modifier une année académique
export const updateAnneeAcademique = (id, anneeAcademique) => {
    return fetchWithTimeout(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(anneeAcademique),
    }).then(handleResponse);
};

// Supprimer une année académique
export const deleteAnneeAcademique = (id) => {
    return fetchWithTimeout(`${API_URL}/${id}`, {
        method: "DELETE",
    }).then(handleResponse);
};
