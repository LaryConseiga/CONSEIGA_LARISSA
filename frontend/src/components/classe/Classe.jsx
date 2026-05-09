import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAnneesAcademiques } from '../../services/serviceAnneesAcademiques';
import {
  createClasse,
  deleteClasse,
  getClasses,
  updateClasse,
} from '../../services/serviceClasses';
import { getFilieres } from '../../services/serviceFilieres';
import { getNiveaux } from '../../services/serviceNiveaux';
import ClasseForm from './ClasseForm';
import ClasseSearch from './ClasseSearch';
import ClasseTable from './ClasseTable';

export default function Classe() {
  const [liste, setListe] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [annees, setAnnees] = useState([]);
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
      const [rC, rF, rN, rA] = await Promise.allSettled([
        getClasses(),
        getFilieres(),
        getNiveaux(),
        getAnneesAcademiques(),
      ]);
      if (rC.status === 'fulfilled') {
        setListe(rC.value);
      } else {
        setListError(rC.reason?.message || 'Impossible de joindre le serveur.');
        setListe([]);
      }
      setFilieres(rF.status === 'fulfilled' ? rF.value : []);
      setNiveaux(rN.status === 'fulfilled' ? rN.value : []);
      setAnnees(rA.status === 'fulfilled' ? rA.value : []);
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
    return liste.filter((c) => {
      const hay = [
        c.libelle,
        c.filiere_libelle,
        c.niveau_libelle,
        c.annee_academique_libelle,
        c.filiere_id,
        c.niveau_id,
        c.annee_academique_id,
      ]
        .map((x) => String(x ?? '').toLowerCase())
        .join(' ');
      return hay.includes(q);
    });
  }, [liste, search]);

  const emptyMessage =
    liste.length === 0
      ? 'Aucune classe enregistrée pour le moment.'
      : 'Aucune classe ne correspond à la recherche.';

  const handleSubmitForm = async (payload) => {
    const { id, ...body } = payload;
    if (id) {
      await updateClasse(id, body);
    } else {
      await createClasse(body);
    }
    closeModal();
    await loadData();
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Supprimer la classe « ${row.libelle} » ? Cette action est définitive.`)) {
      return;
    }
    setBusyId(row.id);
    try {
      await deleteClasse(row.id);
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
          <h1 className="h3 mb-2">Gestion des classes</h1>
          <p className="text-muted mb-0">
            Libellé, filière, niveau et année académique. Les horodatages sont gérés par la base de données.
          </p>
        </div>
        <button type="button" className="btn btn-danger" onClick={openCreateModal}>
          Ajouter une classe
        </button>
      </div>

      {listError ? (
        <div className="alert alert-warning" role="alert">
          {listError}
        </div>
      ) : null}

      <ClasseSearch value={search} onChange={setSearch} disabled={loading} />

      {loading ? (
        <p className="text-muted">Chargement des classes…</p>
      ) : (
        <ClasseTable
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
            aria-labelledby="classe-modal-title"
          >
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h2 id="classe-modal-title" className="modal-title fs-5 mb-0">
                    {itemToEdit ? 'Modifier une classe' : 'Ajouter une classe'}
                  </h2>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Fermer"
                    onClick={closeModal}
                  />
                </div>
                <div className="modal-body">
                  <ClasseForm
                    classeToEdit={itemToEdit}
                    filieres={filieres}
                    niveaux={niveaux}
                    annees={annees}
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
