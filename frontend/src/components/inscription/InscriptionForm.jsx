import { useEffect, useState } from 'react';
import EntitySelect from '../EntitySelect';

const EMPTY = {
  etudiants_id: '',
  parcours_id: '',
  annee_academique_id: '',
  decisions_id: '',
  dateInscription: '',
};

function etudiantLabel(e) {
  const n = [e.nom, e.prenoms].filter(Boolean).join(' ').trim();
  return n || 'Étudiant';
}

export default function InscriptionForm({
  inscriptionToEdit,
  etudiants,
  parcours,
  annees,
  decisions,
  onSubmit,
  onClose,
}) {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (inscriptionToEdit) {
      const d = inscriptionToEdit.dateInscription;
      setForm({
        etudiants_id: String(inscriptionToEdit.etudiants_id ?? ''),
        parcours_id: String(inscriptionToEdit.parcours_id ?? ''),
        annee_academique_id: String(inscriptionToEdit.annee_academique_id ?? ''),
        decisions_id: String(inscriptionToEdit.decisions_id ?? ''),
        dateInscription: d ? String(d).slice(0, 10) : '',
      });
    } else {
      setForm({
        ...EMPTY,
        dateInscription: new Date().toISOString().slice(0, 10),
      });
    }
    setFormError('');
  }, [inscriptionToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.etudiants_id) {
      setFormError('Veuillez choisir un étudiant.');
      return;
    }
    if (!form.parcours_id) {
      setFormError('Veuillez choisir un parcours.');
      return;
    }
    if (!form.annee_academique_id) {
      setFormError('Veuillez choisir une année académique.');
      return;
    }
    if (!form.decisions_id) {
      setFormError('Veuillez choisir une décision.');
      return;
    }
    if (!form.dateInscription) {
      setFormError('La date d’inscription est obligatoire.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        id: inscriptionToEdit?.id,
        etudiants_id: Number(form.etudiants_id),
        parcours_id: Number(form.parcours_id),
        annee_academique_id: Number(form.annee_academique_id),
        decisions_id: Number(form.decisions_id),
        dateInscription: form.dateInscription,
      });
      if (!inscriptionToEdit) {
        setForm({
          ...EMPTY,
          dateInscription: new Date().toISOString().slice(0, 10),
        });
      }
    } catch (err) {
      setFormError(err?.message || 'Erreur lors de l’enregistrement.');
    } finally {
      setSubmitting(false);
    }
  };

  const isEdit = Boolean(inscriptionToEdit?.id);
  const eList = Array.isArray(etudiants) ? etudiants : [];
  const pList = Array.isArray(parcours) ? parcours : [];
  const aList = Array.isArray(annees) ? annees : [];
  const dList = Array.isArray(decisions) ? decisions : [];
  const canSubmit =
    eList.length > 0 &&
    pList.length > 0 &&
    aList.length > 0 &&
    dList.length > 0 &&
    form.etudiants_id &&
    form.parcours_id &&
    form.annee_academique_id &&
    form.decisions_id &&
    form.dateInscription;

  return (
    <>
      {formError ? (
        <div className="alert alert-danger py-2 small" role="alert">
          {formError}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} noValidate>
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <EntitySelect
              id="inscription-etudiant"
              name="etudiants_id"
              label="Étudiant"
              items={eList}
              value={form.etudiants_id}
              onChange={handleChange}
              required
              placeholder="Étudiant"
              getOptionLabel={etudiantLabel}
            />
          </div>
          <div className="col-12 col-md-6">
            <EntitySelect
              id="inscription-parcours"
              name="parcours_id"
              label="Parcours"
              items={pList}
              value={form.parcours_id}
              onChange={handleChange}
              required
              placeholder="Parcours"
            />
          </div>
          <div className="col-12 col-md-6">
            <EntitySelect
              id="inscription-annee"
              name="annee_academique_id"
              label="Année académique"
              items={aList}
              value={form.annee_academique_id}
              onChange={handleChange}
              required
              placeholder="Année"
            />
          </div>
          <div className="col-12 col-md-6">
            <EntitySelect
              id="inscription-decision"
              name="decisions_id"
              label="Décision"
              items={dList}
              value={form.decisions_id}
              onChange={handleChange}
              required
              placeholder="Décision"
            />
          </div>
          <div className="col-12 col-md-6">
            <label htmlFor="inscription-date" className="form-label">
              Date d’inscription
            </label>
            <input
              id="inscription-date"
              name="dateInscription"
              type="date"
              className="form-control"
              value={form.dateInscription}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2 mt-4">
          <button type="submit" className="btn btn-danger" disabled={submitting || !canSubmit}>
            {submitting ? 'Enregistrement…' : isEdit ? 'Mettre à jour' : 'Enregistrer'}
          </button>
          {onClose ? (
            <button
              type="button"
              className="btn btn-outline-secondary"
              disabled={submitting}
              onClick={onClose}
            >
              {isEdit ? 'Annuler' : 'Fermer'}
            </button>
          ) : null}
        </div>
      </form>
    </>
  );
}
