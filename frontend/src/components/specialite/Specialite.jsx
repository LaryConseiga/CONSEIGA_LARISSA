import { useCallback, useEffect, useMemo, useState } from 'react';
import { getFilieres } from '../../services/serviceFilieres';
import {
  createSpecialite,
  deleteSpecialite,
  getSpecialites,
  updateSpecialite,
} from '../../services/serviceSpecialites';
import SpecialiteForm from './SpecialiteForm';
import SpecialiteSearch from './SpecialiteSearch';
import SpecialiteTable from './SpecialiteTable';

export default function Specialite() {
  const [specialites, setSpecialites] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [search, setSearch] = useState('');
  const [specialiteToEdit, setSpecialiteToEdit] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const loadData = useCallback(async ({ showLoading = false } = {}) => {
    if (showLoading) setLoading(true);
    setListError('');
    try {
      const [specSettled, filSettled] = await Promise.allSettled([
        getSpecialites(),
        getFilieres(),
      ]);
      if (specSettled.status === 'fulfilled') {
        setSpecialites(specSettled.value);
      } else {
        setListError(specSettled.reason?.message || 'Impossible de joindre le serveur.');
        setSpecialites([]);
      }
      setFilieres(filSettled.status === 'fulfilled' ? filSettled.value : []);
    } catch {
      setListError('Impossible de joindre le serveur.');
      setSpecialites([]);
      setFilieres([]);
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
    setSpecialiteToEdit(null);
  }, []);

  const openCreateModal = () => {
    setSpecialiteToEdit(null);
    setModalOpen(true);
  };

  const openEditModal = (specialite) => {
    setSpecialiteToEdit(specialite);
    setModalOpen(true);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return specialites;
    return specialites.filter((s) => {
      const hay = `${s.libelle ?? ''} ${s.description ?? ''} ${s.filiere_libelle ?? ''} ${s.filieres_id ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [specialites, search]);

  const emptyMessage =
    specialites.length === 0
      ? 'Aucune spécialité enregistrée pour le moment.'
      : 'Aucune spécialité ne correspond à la recherche.';

  const handleSubmitForm = async (payload) => {
    const { id, ...body } = payload;
    if (id) {
      await updateSpecialite(id, body);
    } else {
      await createSpecialite(body);
    }
    closeModal();
    await loadData();
  };

  const handleDelete = async (specialite) => {
    if (
      !window.confirm(
        `Supprimer la spécialité « ${specialite.libelle} » ? Cette action est définitive.`
      )
    ) {
      return;
    }
    setBusyId(specialite.id);
    try {
      await deleteSpecialite(specialite.id);
      if (specialiteToEdit?.id === specialite.id) closeModal();
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
          <h1 className="h3 mb-2">Gestion des spécialités</h1>
          <p className="text-muted mb-0">
            Création, modification, suppression et consultation des spécialités par filière.
          </p>
        </div>
        <button type="button" className="btn btn-danger" onClick={openCreateModal}>
          Ajouter une spécialité
        </button>
      </div>

      {listError ? (
        <div className="alert alert-warning" role="alert">
          {listError}
        </div>
      ) : null}

      <SpecialiteSearch value={search} onChange={setSearch} disabled={loading} />

      {loading ? (
        <p className="text-muted">Chargement des spécialités…</p>
      ) : (
        <SpecialiteTable
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
            aria-labelledby="specialite-modal-title"
          >
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h2 id="specialite-modal-title" className="modal-title fs-5 mb-0">
                    {specialiteToEdit ? 'Modifier une spécialité' : 'Ajouter une spécialité'}
                  </h2>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Fermer"
                    onClick={closeModal}
                  />
                </div>
                <div className="modal-body">
                  <SpecialiteForm
                    specialiteToEdit={specialiteToEdit}
                    filieres={filieres}
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
