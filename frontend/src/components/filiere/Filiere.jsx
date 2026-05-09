import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createFiliere,
  deleteFiliere,
  getFilieres,
  updateFiliere,
} from '../../services/serviceFilieres';
import FiliereForm from './FiliereForm';
import FiliereSearch from './FiliereSearch';
import FiliereTable from './FiliereTable';

export default function Filiere() {
  const [filieres, setFilieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [search, setSearch] = useState('');
  const [filiereToEdit, setFiliereToEdit] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const loadFilieres = useCallback(async ({ showLoading = false } = {}) => {
    if (showLoading) setLoading(true);
    setListError('');
    try {
      setFilieres(await getFilieres());
    } catch (e) {
      setListError(e.message || 'Impossible de joindre le serveur.');
      setFilieres([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFilieres({ showLoading: true });
  }, [loadFilieres]);

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
    setFiliereToEdit(null);
  }, []);

  const openCreateModal = () => {
    setFiliereToEdit(null);
    setModalOpen(true);
  };

  const openEditModal = (filiere) => {
    setFiliereToEdit(filiere);
    setModalOpen(true);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return filieres;
    return filieres.filter((f) =>
      [f.code, f.libelle, f.description].some((v) =>
        String(v ?? '')
          .toLowerCase()
          .includes(q)
      )
    );
  }, [filieres, search]);

  const emptyMessage =
    filieres.length === 0
      ? 'Aucune filière enregistrée pour le moment.'
      : 'Aucune filière ne correspond à la recherche.';

  const handleSubmitForm = async (payload) => {
    const { id, ...body } = payload;
    if (id) {
      await updateFiliere(id, body);
    } else {
      await createFiliere(body);
    }
    closeModal();
    await loadFilieres();
  };

  const handleDelete = async (filiere) => {
    if (
      !window.confirm(
        `Supprimer la filière « ${filiere.libelle} » ? Cette action est définitive.`
      )
    ) {
      return;
    }
    setBusyId(filiere.id);
    try {
      await deleteFiliere(filiere.id);
      if (filiereToEdit?.id === filiere.id) closeModal();
      await loadFilieres();
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
          <h1 className="h3 mb-2">Gestion des filières</h1>
          <p className="text-muted mb-0">
            Création, modification, suppression et consultation des filières.
          </p>
        </div>
        <button type="button" className="btn btn-danger" onClick={openCreateModal}>
          Ajouter une filière
        </button>
      </div>

      {listError ? (
        <div className="alert alert-warning" role="alert">
          {listError}
        </div>
      ) : null}

      <FiliereSearch value={search} onChange={setSearch} disabled={loading} />

      {loading ? (
        <p className="text-muted">Chargement des filières…</p>
      ) : (
        <FiliereTable
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
            aria-labelledby="filiere-modal-title"
          >
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h2 id="filiere-modal-title" className="modal-title fs-5 mb-0">
                    {filiereToEdit ? 'Modifier une filière' : 'Ajouter une filière'}
                  </h2>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Fermer"
                    onClick={closeModal}
                  />
                </div>
                <div className="modal-body">
                  <FiliereForm
                    filiereToEdit={filiereToEdit}
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
