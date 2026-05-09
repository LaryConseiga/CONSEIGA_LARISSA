import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createPays,
  deletePays,
  getPays,
  updatePays,
} from '../../services/servicePays';
import PaysForm from './PaysForm';
import PaysSearch from './PaysSearch';
import PaysTable from './PaysTable';

export default function Pays() {
  const [liste, setListe] = useState([]);
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
      setListe(await getPays());
    } catch (e) {
      setListError(e.message || 'Impossible de joindre le serveur.');
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
    return liste.filter((p) => {
      const hay = [p.libelle, p.nationalite, p.code, p.iso, p.id]
        .map((x) => String(x ?? '').toLowerCase())
        .join(' ');
      return hay.includes(q);
    });
  }, [liste, search]);

  const emptyMessage =
    liste.length === 0
      ? 'Aucun pays enregistré pour le moment.'
      : 'Aucun pays ne correspond à la recherche.';

  const handleSubmitForm = async (payload) => {
    const { id, ...body } = payload;
    if (id) {
      await updatePays(id, body);
    } else {
      await createPays(body);
    }
    closeModal();
    await loadData();
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Supprimer le pays « ${row.libelle} » ? Cette action est définitive.`)) {
      return;
    }
    setBusyId(row.id);
    try {
      await deletePays(row.id);
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
          <h1 className="h3 mb-2">Gestion des pays</h1>
          <p className="text-muted mb-0">
            Référentiel pays : libellé, nationalité, code téléphonique et code ISO pour les formulaires (ex. étudiants).
          </p>
        </div>
        <button type="button" className="btn btn-danger" onClick={openCreateModal}>
          Ajouter un pays
        </button>
      </div>

      {listError ? (
        <div className="alert alert-warning" role="alert">
          {listError}
        </div>
      ) : null}

      <PaysSearch value={search} onChange={setSearch} disabled={loading} />

      {loading ? (
        <p className="text-muted">Chargement des pays…</p>
      ) : (
        <PaysTable
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
            aria-labelledby="pays-modal-title"
          >
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h2 id="pays-modal-title" className="modal-title fs-5 mb-0">
                    {itemToEdit ? 'Modifier un pays' : 'Ajouter un pays'}
                  </h2>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Fermer"
                    onClick={closeModal}
                  />
                </div>
                <div className="modal-body">
                  <PaysForm paysToEdit={itemToEdit} onSubmit={handleSubmitForm} onClose={closeModal} />
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
