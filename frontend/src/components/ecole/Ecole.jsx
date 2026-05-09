import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createEcole,
  deleteEcole,
  getEcoles,
  updateEcole,
} from '../../services/serviceEcoles';
import EcoleForm from './EcoleForm';
import EcoleSearch from './EcoleSearch';
import EcoleTable from './EcoleTable';

export default function Ecole() {
  const [ecoles, setEcoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [search, setSearch] = useState('');
  const [ecoleToEdit, setEcoleToEdit] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const loadEcoles = useCallback(async ({ showLoading = false } = {}) => {
    if (showLoading) setLoading(true);
    setListError('');
    try {
      setEcoles(await getEcoles());
    } catch (e) {
      setListError(e.message || 'Impossible de joindre le serveur.');
      setEcoles([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEcoles({ showLoading: true });
  }, [loadEcoles]);

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
    setEcoleToEdit(null);
  }, []);

  const openCreateModal = () => {
    setEcoleToEdit(null);
    setModalOpen(true);
  };

  const openEditModal = (ecole) => {
    setEcoleToEdit(ecole);
    setModalOpen(true);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ecoles;
    return ecoles.filter((e) =>
      [e.libelle, e.adresse, e.telephone, e.email].some((v) =>
        String(v ?? '')
          .toLowerCase()
          .includes(q)
      )
    );
  }, [ecoles, search]);

  const emptyMessage =
    ecoles.length === 0
      ? 'Aucune école enregistrée pour le moment.'
      : 'Aucune école ne correspond à la recherche.';

  const handleSubmitForm = async (payload) => {
    const { id, ...body } = payload;
    if (id) {
      await updateEcole(id, body);
    } else {
      await createEcole(body);
    }
    closeModal();
    await loadEcoles();
  };

  const handleDelete = async (ecole) => {
    if (
      !window.confirm(
        `Supprimer l’école « ${ecole.libelle} » ? Cette action est définitive.`
      )
    ) {
      return;
    }
    setBusyId(ecole.id);
    try {
      await deleteEcole(ecole.id);
      if (ecoleToEdit?.id === ecole.id) closeModal();
      await loadEcoles();
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
          <h1 className="h3 mb-2">Gestion des écoles</h1>
          <p className="text-muted mb-0">
            Création, modification, suppression et consultation des établissements.
          </p>
        </div>
        <button type="button" className="btn btn-danger" onClick={openCreateModal}>
          Ajouter une école
        </button>
      </div>

      {listError ? (
        <div className="alert alert-warning" role="alert">
          {listError}
        </div>
      ) : null}

      <EcoleSearch value={search} onChange={setSearch} disabled={loading} />

      {loading ? (
        <p className="text-muted">Chargement des écoles…</p>
      ) : (
        <EcoleTable
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
            aria-labelledby="ecole-modal-title"
          >
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h2 id="ecole-modal-title" className="modal-title fs-5 mb-0">
                    {ecoleToEdit ? 'Modifier une école' : 'Ajouter une école'}
                  </h2>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Fermer"
                    onClick={closeModal}
                  />
                </div>
                <div className="modal-body">
                  <EcoleForm
                    ecoleToEdit={ecoleToEdit}
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
