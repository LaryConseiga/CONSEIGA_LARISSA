import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAnneesAcademiques } from '../../services/serviceAnneesAcademiques';
import { getDecisions } from '../../services/serviceDecisions';
import { getEtudiants } from '../../services/serviceEtudiants';
import {
  createInscription,
  deleteInscription,
  getInscriptions,
  updateInscription,
} from '../../services/serviceInscriptions';
import { getParcours } from '../../services/serviceParcours';
import InscriptionForm from './InscriptionForm';
import InscriptionSearch from './InscriptionSearch';
import InscriptionTable from './InscriptionTable';

export default function Inscription() {
  const [liste, setListe] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [parcours, setParcours] = useState([]);
  const [annees, setAnnees] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [search, setSearch] = useState('');
  const [itemToEdit, setItemToEdit] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const loadData = useCallback(async ({ showLoading = false } = {}) => {
    if (showLoading) setLoading(true);
    setListError('');
    try {
      const [rI, rE, rP, rA, rD] = await Promise.allSettled([
        getInscriptions(),
        getEtudiants(),
        getParcours(),
        getAnneesAcademiques(),
        getDecisions(),
      ]);
      if (rI.status === 'fulfilled') {
        setListe(rI.value);
      } else {
        setListError(rI.reason?.message || 'Impossible de joindre le serveur.');
        setListe([]);
      }
      setEtudiants(rE.status === 'fulfilled' ? rE.value : []);
      setParcours(rP.status === 'fulfilled' ? rP.value : []);
      setAnnees(rA.status === 'fulfilled' ? rA.value : []);
      setDecisions(rD.status === 'fulfilled' ? rD.value : []);
    } catch {
      setListError('Impossible de joindre le serveur.');
      setListe([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData({ showLoading: true });
  }, [loadData]);

  useEffect(() => {
    if (modalOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
    return undefined;
  }, [modalOpen]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setItemToEdit(null);
  }, []);

  const openCreateModal = () => {
    setItemToEdit(null);
    setModalOpen(true);
  };

  const openEditModal = (row) => {
    setItemToEdit(row);
    setModalOpen(true);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return liste;
    return liste.filter((row) => {
      const hay = [
        row.etudiant_libelle,
        row.parcours_libelle,
        row.annee_libelle,
        row.decision_libelle,
        row.dateInscription,
        row.etudiants_id,
        row.parcours_id,
      ]
        .map((x) => String(x ?? '').toLowerCase())
        .join(' ');
      return hay.includes(q);
    });
  }, [liste, search]);

  const emptyMessage =
    liste.length === 0
      ? 'Aucune inscription enregistrée pour le moment.'
      : 'Aucune inscription ne correspond à la recherche.';

  const handleSubmitForm = async (payload) => {
    const { id, ...body } = payload;
    if (id) {
      await updateInscription(id, body);
    } else {
      await createInscription(body);
    }
    closeModal();
    await loadData();
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Supprimer cette inscription (n° ${row.id}) ? Cette action est définitive.`)) {
      return;
    }
    setBusyId(row.id);
    try {
      await deleteInscription(row.id);
      if (itemToEdit?.id === row.id) closeModal();
      await loadData();
    } catch (e) {
      window.alert(e.message || 'Suppression impossible.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="container-fluid py-4 px-3 px-lg-4 flex-grow-1 bg-white">
      <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h3 mb-2">Gestion des inscriptions</h1>
          <p className="text-muted mb-0">
            Étudiant, parcours, année académique, décision et date d’inscription. La date de création est gérée par la
            base.
          </p>
        </div>
        <button type="button" className="btn btn-danger" onClick={openCreateModal}>
          Ajouter une inscription
        </button>
      </div>

      {listError ? (
        <div className="alert alert-warning" role="alert">
          {listError}
        </div>
      ) : null}

      <InscriptionSearch value={search} onChange={setSearch} disabled={loading} />

      {loading ? (
        <p className="text-muted">Chargement des inscriptions…</p>
      ) : (
        <InscriptionTable
          data={filtered}
          emptyMessage={emptyMessage}
          onEdit={openEditModal}
          onDelete={handleDelete}
          busyId={busyId}
        />
      )}

      {modalOpen ? (
        <>
          <div
            className="modal-backdrop fade show"
            aria-hidden="true"
            onClick={closeModal}
            role="presentation"
          />
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inscription-modal-title"
          >
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h2 id="inscription-modal-title" className="modal-title fs-5 mb-0">
                    {itemToEdit ? 'Modifier une inscription' : 'Ajouter une inscription'}
                  </h2>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Fermer"
                    onClick={closeModal}
                  />
                </div>
                <div className="modal-body">
                  <InscriptionForm
                    inscriptionToEdit={itemToEdit}
                    etudiants={etudiants}
                    parcours={parcours}
                    annees={annees}
                    decisions={decisions}
                    onSubmit={handleSubmitForm}
                    onClose={closeModal}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
