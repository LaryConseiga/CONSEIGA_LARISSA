import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createCycle,
  deleteCycle,
  getCycles,
  updateCycle,
} from '../../services/serviceCycles';
import CycleForm from './CycleForm';
import CycleSearch from './CycleSearch';
import CycleTable from './CycleTable';

export default function Cycle() {
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [search, setSearch] = useState('');
  const [cycleToEdit, setCycleToEdit] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const loadCycles = useCallback(async ({ showLoading = false } = {}) => {
    if (showLoading) setLoading(true);
    setListError('');
    try {
      setCycles(await getCycles());
    } catch (e) {
      setListError(e.message || 'Impossible de joindre le serveur.');
      setCycles([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCycles({ showLoading: true });
  }, [loadCycles]);

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
    setCycleToEdit(null);
  }, []);

  const openCreateModal = () => {
    setCycleToEdit(null);
    setModalOpen(true);
  };

  const openEditModal = (cycle) => {
    setCycleToEdit(cycle);
    setModalOpen(true);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return cycles;
    return cycles.filter((c) => {
      const hay = `${c.libelle ?? ''} ${c.duree_annees != null ? String(c.duree_annees) : ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [cycles, search]);

  const emptyMessage =
    cycles.length === 0
      ? 'Aucun cycle enregistré pour le moment.'
      : 'Aucun cycle ne correspond à la recherche.';

  const handleSubmitForm = async (payload) => {
    const { id, ...body } = payload;
    if (id) {
      await updateCycle(id, body);
    } else {
      await createCycle(body);
    }
    closeModal();
    await loadCycles();
  };

  const handleDelete = async (cycle) => {
    if (
      !window.confirm(
        `Supprimer le cycle « ${cycle.libelle} » ? Cette action est définitive.`
      )
    ) {
      return;
    }
    setBusyId(cycle.id);
    try {
      await deleteCycle(cycle.id);
      if (cycleToEdit?.id === cycle.id) closeModal();
      await loadCycles();
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
          <h1 className="h3 mb-2">Gestion des cycles</h1>
          <p className="text-muted mb-0">
            Création, modification, suppression et consultation des cycles (libellé et durée en années).
          </p>
        </div>
        <button type="button" className="btn btn-danger" onClick={openCreateModal}>
          Ajouter un cycle
        </button>
      </div>

      {listError ? (
        <div className="alert alert-warning" role="alert">
          {listError}
        </div>
      ) : null}

      <CycleSearch value={search} onChange={setSearch} disabled={loading} />

      {loading ? (
        <p className="text-muted">Chargement des cycles…</p>
      ) : (
        <CycleTable
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
            aria-labelledby="cycle-modal-title"
          >
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h2 id="cycle-modal-title" className="modal-title fs-5 mb-0">
                    {cycleToEdit ? 'Modifier un cycle' : 'Ajouter un cycle'}
                  </h2>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Fermer"
                    onClick={closeModal}
                  />
                </div>
                <div className="modal-body">
                  <CycleForm
                    cycleToEdit={cycleToEdit}
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
