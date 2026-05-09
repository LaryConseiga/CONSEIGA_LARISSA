import { useCallback, useEffect, useMemo, useState } from 'react';
import { getCivilites } from '../../services/serviceCivilites';
import { createEtudiant, deleteEtudiant, getEtudiants, updateEtudiant } from '../../services/serviceEtudiants';
import { getPays } from '../../services/servicePays';
import { IconTable, IconCardGrid, IconPersonPlusFill } from '../Icons';
import EtudiantForm from './EtudiantForm';
import EtudiantSearch from './EtudiantSearch';
import EtudiantTable from './EtudiantTable';
import Trombinoscope from './Trombinoscope';

export default function Etudiant() {
  const [liste,     setListe]     = useState([]);
  const [pays,      setPays]      = useState([]);
  const [civilites, setCivilites] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [listError, setListError] = useState('');
  const [search,    setSearch]    = useState('');
  const [itemToEdit,setItemToEdit]= useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [busyId,    setBusyId]    = useState(null);
  const [vue,       setVue]       = useState('table'); // 'table' | 'trombi'

  const loadData = useCallback(async ({ showLoading = false } = {}) => {
    if (showLoading) setLoading(true);
    setListError('');
    try {
      const [rE, rP, rC] = await Promise.allSettled([getEtudiants(), getPays(), getCivilites()]);
      if (rE.status === 'fulfilled') {
        setListe(rE.value);
      } else {
        setListError(rE.reason?.message || 'Impossible de joindre le serveur.');
        setListe([]);
      }
      setPays(rP.status === 'fulfilled' ? rP.value : []);
      setCivilites(rC.status === 'fulfilled' ? rC.value : []);
    } catch {
      setListError('Impossible de joindre le serveur.');
      setListe([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => { loadData({ showLoading: true }); }, [loadData]);

  useEffect(() => {
    if (modalOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
    return undefined;
  }, [modalOpen]);

  const closeModal     = useCallback(() => { setModalOpen(false); setItemToEdit(null); }, []);
  const openCreateModal = () => { setItemToEdit(null); setModalOpen(true); };
  const openEditModal   = (row) => { setItemToEdit(row); setModalOpen(true); };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return liste;
    return liste.filter((e) => {
      const hay = [e.nom, e.prenoms, e.email, e.telephone, e.pays_libelle, e.civilite_libelle, e.dateNaissance]
        .map((x) => String(x ?? '').toLowerCase()).join(' ');
      return hay.includes(q);
    });
  }, [liste, search]);

  const emptyMessage = liste.length === 0
    ? 'Aucun étudiant enregistré pour le moment.'
    : 'Aucun étudiant ne correspond à la recherche.';

  const handleSubmitForm = async (payload) => {
    const { id, ...body } = payload;
    if (id) { await updateEtudiant(id, body); } else { await createEtudiant(body); }
    closeModal();
    await loadData();
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Supprimer l'étudiant « ${row.nom} ${row.prenoms} » ? Cette action est définitive.`)) return;
    setBusyId(row.id);
    try {
      await deleteEtudiant(row.id);
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
      {/* En-tête */}
      <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
        <h1 className="h3 mb-0">Gestion des étudiants</h1>

        <div className="d-flex align-items-center gap-2">
          {/* Toggle vue */}
          <div className="btn-group" role="group" aria-label="Mode d'affichage">
            <button
              type="button"
              className={`btn btn-sm ${vue === 'table' ? 'btn-danger' : 'btn-outline-danger'}`}
              onClick={() => setVue('table')}
              title="Vue tableau"
            >
              <IconTable size={15} />
            </button>
            <button
              type="button"
              className={`btn btn-sm ${vue === 'trombi' ? 'btn-danger' : 'btn-outline-danger'}`}
              onClick={() => setVue('trombi')}
              title="Trombinoscope"
            >
              <IconCardGrid size={15} />
            </button>
          </div>

          <button type="button" className="btn btn-danger d-flex align-items-center gap-2" onClick={openCreateModal}>
            <IconPersonPlusFill size={15} />
            Ajouter un étudiant
          </button>
        </div>
      </div>

      {listError ? (
        <div className="alert alert-warning" role="alert">{listError}</div>
      ) : null}

      <EtudiantSearch value={search} onChange={setSearch} disabled={loading} />

      {loading ? (
        <p className="text-muted">Chargement des étudiants…</p>
      ) : vue === 'trombi' ? (
        <Trombinoscope
          data={filtered}
          emptyMessage={emptyMessage}
          onEdit={openEditModal}
          onDelete={handleDelete}
          busyId={busyId}
        />
      ) : (
        <EtudiantTable
          data={filtered}
          emptyMessage={emptyMessage}
          onEdit={openEditModal}
          onDelete={handleDelete}
          busyId={busyId}
        />
      )}

      {/* Modal ajout/modification */}
      {modalOpen ? (
        <>
          <div className="modal-backdrop fade show" aria-hidden="true" onClick={closeModal} role="presentation" />
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true" aria-labelledby="etudiant-modal-title">
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h2 id="etudiant-modal-title" className="modal-title fs-5 mb-0">
                    {itemToEdit ? 'Modifier un étudiant' : 'Ajouter un étudiant'}
                  </h2>
                  <button type="button" className="btn-close" aria-label="Fermer" onClick={closeModal} />
                </div>
                <div className="modal-body">
                  <EtudiantForm
                    etudiantToEdit={itemToEdit}
                    pays={pays}
                    civilites={civilites}
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
