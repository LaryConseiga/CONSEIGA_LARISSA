import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createNiveau,
  deleteNiveau,
  getNiveaux,
  updateNiveau,
} from '../../services/serviceNiveaux';
import NiveauForm from './NiveauForm';
import NiveauSearch from './NiveauSearch';
import NiveauTable from './NiveauTable';

export default function Niveau() {
  const [niveaux, setNiveaux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [search, setSearch] = useState('');
  const [niveauToEdit, setNiveauToEdit] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const loadNiveaux = useCallback(async ({ showLoading = false } = {}) => {
    if (showLoading) setLoading(true);
    setListError('');
    try {
      setNiveaux(await getNiveaux());
    } catch (e) {
      setListError(e.message || 'Impossible de joindre le serveur.');
      setNiveaux([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNiveaux({ showLoading: true });
  }, [loadNiveaux]);

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
    setNiveauToEdit(null);
  }, []);

  const openCreateModal = () => {
    setNiveauToEdit(null);
    setModalOpen(true);
  };

  const openEditModal = (niveau) => {
    setNiveauToEdit(niveau);
    setModalOpen(true);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return niveaux;
    return niveaux.filter((n) => {
      const hay = `${n.libelle ?? ''} ${n.ordre != null ? String(n.ordre) : ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [niveaux, search]);

  const emptyMessage =
    niveaux.length === 0
      ? 'Aucun niveau enregistré pour le moment.'
      : 'Aucun niveau ne correspond à la recherche.';

  const handleSubmitForm = async (payload) => {
    const { id, ...body } = payload;
    if (id) {
      await updateNiveau(id, body);
    } else {
      await createNiveau(body);
    }
    closeModal();
    await loadNiveaux();
  };

  const handleDelete = async (niveau) => {
    if (
      !window.confirm(
        `Supprimer le niveau « ${niveau.libelle} » ? Cette action est définitive.`
      )
    ) {
      return;
    }
    setBusyId(niveau.id);
    try {
      await deleteNiveau(niveau.id);
      if (niveauToEdit?.id === niveau.id) closeModal();
      await loadNiveaux();
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
          <h1 className="h3 mb-2">Gestion des niveaux</h1>
          <p className="text-muted mb-0">
            Création, modification, suppression et consultation des niveaux (libellé et ordre d’affichage).
          </p>
        </div>
        <button type="button" className="btn btn-danger" onClick={openCreateModal}>
          Ajouter un niveau
        </button>
      </div>

      {listError ? (
        <div className="alert alert-warning" role="alert">
          {listError}
        </div>
      ) : null}

      <NiveauSearch value={search} onChange={setSearch} disabled={loading} />

      {loading ? (
        <p className="text-muted">Chargement des niveaux…</p>
      ) : (
        <NiveauTable
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
            aria-labelledby="niveau-modal-title"
          >
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h2 id="niveau-modal-title" className="modal-title fs-5 mb-0">
                    {niveauToEdit ? 'Modifier un niveau' : 'Ajouter un niveau'}
                  </h2>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Fermer"
                    onClick={closeModal}
                  />
                </div>
                <div className="modal-body">
                  <NiveauForm
                    niveauToEdit={niveauToEdit}
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
