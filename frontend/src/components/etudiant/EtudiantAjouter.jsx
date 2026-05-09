import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCivilites } from '../../services/serviceCivilites';
import { createEtudiant } from '../../services/serviceEtudiants';
import { getPays } from '../../services/servicePays';
import EtudiantForm from './EtudiantForm';

export default function EtudiantAjouter() {
  const [pays, setPays] = useState([]);
  const [civilites, setCivilites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [success, setSuccess] = useState('');

  const loadRefs = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [rP, rC] = await Promise.allSettled([getPays(), getCivilites()]);
      setPays(rP.status === 'fulfilled' ? rP.value : []);
      setCivilites(rC.status === 'fulfilled' ? rC.value : []);
      if (rP.status === 'rejected' || rC.status === 'rejected') {
        setLoadError(
          "Impossible de charger toutes les listes de référence (pays, civilités). Vérifiez l’API."
        );
      }
    } catch {
      setLoadError('Impossible de joindre le serveur.');
      setPays([]);
      setCivilites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRefs();
  }, [loadRefs]);

  const handleSubmit = async (payload) => {
    setSuccess('');
    const { id: _id, ...body } = payload;
    await createEtudiant(body);
    setSuccess('Étudiant enregistré avec succès. Vous pouvez en ajouter un autre ou consulter la liste.');
  };

  return (
    <div className="container-fluid py-4 px-3 px-lg-4 flex-grow-1 bg-white">
      <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
        <h1 className="h3 mb-0">Ajouter un étudiant</h1>
        <Link to="/etudiants/liste" className="btn btn-outline-secondary">
          Voir la liste
        </Link>
      </div>

      {loadError ? (
        <div className="alert alert-warning" role="alert">
          {loadError}
        </div>
      ) : null}

      {success ? (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      ) : null}

      {loading ? (
        <p className="text-muted">Chargement du formulaire…</p>
      ) : (
        <div className="card shadow-sm border-0" style={{ maxWidth: '960px' }}>
          <div className="card-body p-4">
            <EtudiantForm
              etudiantToEdit={null}
              pays={pays}
              civilites={civilites}
              onSubmit={handleSubmit}
              onClose={null}
            />
          </div>
        </div>
      )}
    </div>
  );
}
