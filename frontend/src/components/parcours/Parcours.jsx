import { useCallback, useEffect, useMemo, useState } from 'react';
import { getCycles } from '../../services/serviceCycles';
import { getNiveaux } from '../../services/serviceNiveaux';
import {
  createParcours,
  deleteParcours,
  getParcours,
  updateParcours,
} from '../../services/serviceParcours';
import { getSpecialites } from '../../services/serviceSpecialites';
import ParcoursForm from './ParcoursForm';
import ParcoursSearch from './ParcoursSearch';
import ParcoursTable from './ParcoursTable';

export default function Parcours() {
  const [liste, setListe] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [cycles, setCycles] = useState([]);
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
      const [rP, rS, rN, rC] = await Promise.allSettled([
        getParcours(),
        getSpecialites(),
        getNiveaux(),
        getCycles(),
      ]);
      if (rP.status === 'fulfilled') {
        setListe(rP.value);
      } else {
        setListError(rP.reason?.message || 'Impossible de joindre le serveur.');
        setListe([]);
      }
      setSpecialites(rS.status === 'fulfilled' ? rS.value : []);
      setNiveaux(rN.status === 'fulfilled' ? rN.value : []);
      setCycles(rC.status === 'fulfilled' ? rC.value : []);
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
    return liste.filter((p) => {
      const hay = [
        p.libelle,
        p.specialite_libelle,
        p.niveau_libelle,
        p.cycle_libelle,
        p.specialites_id,
        p.niveaux_id,
        p.cycles_id,
      ]
        .map((x) => String(x ?? '').toLowerCase())
        .join(' ');
      return hay.includes(q);
    });
  }, [liste, search]);

  const emptyMessage =
    liste.length === 0
      ? 'Aucun parcours enregistré pour le moment.'
      : 'Aucun parcours ne correspond à la recherche.';

  const handleSubmitForm = async (payload) => {
    const { id, ...body } = payload;
    if (id) {
      await updateParcours(id, body);
    } else {
      await createParcours(body);
    }
    closeModal();
    await loadData();
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Supprimer le parcours « ${row.libelle} » ? Cette action est définitive.`)) {
      return;
    }
    setBusyId(row.id);
    try {
      await deleteParcours(row.id);
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
          <h1 className="h3 mb-2">Gestion des parcours</h1>
          <p className="text-muted mb-0">
            Libellé, spécialité, niveau et cycle (optionnel). Les listes proviennent de la base de données.
          </p>
        </div>
        <button type="button" className="btn btn-danger" onClick={openCreateModal}>
          Ajouter un parcours
        </button>
      </div>

      {listError ? (
        <div className="alert alert-warning" role="alert">
          {listError}
        </div>
      ) : null}

      <ParcoursSearch value={search} onChange={setSearch} disabled={loading} />

      {loading ? (
        <p className="text-muted">Chargement des parcours…</p>
      ) : (
        <ParcoursTable
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
            aria-labelledby="parcours-modal-title"
          >
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h2 id="parcours-modal-title" className="modal-title fs-5 mb-0">
                    {itemToEdit ? 'Modifier un parcours' : 'Ajouter un parcours'}
                  </h2>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Fermer"
                    onClick={closeModal}
                  />
                </div>
                <div className="modal-body">
                  <ParcoursForm
                    parcoursToEdit={itemToEdit}
                    specialites={specialites}
                    niveaux={niveaux}
                    cycles={cycles}
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
