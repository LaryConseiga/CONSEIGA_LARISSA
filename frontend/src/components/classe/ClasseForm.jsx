import { useEffect, useState } from 'react';
import FormInput from '../FormInput';
import EntitySelect from '../EntitySelect';

const EMPTY = {
  libelle: '',
  filiere_id: '',
  niveau_id: '',
  annee_academique_id: '',
};

export default function ClasseForm({ classeToEdit, filieres, niveaux, annees, onSubmit, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (classeToEdit) {
      setForm({
        libelle: classeToEdit.libelle ?? '',
        filiere_id: classeToEdit.filiere_id != null ? String(classeToEdit.filiere_id) : '',
        niveau_id: classeToEdit.niveau_id != null ? String(classeToEdit.niveau_id) : '',
        annee_academique_id:
          classeToEdit.annee_academique_id != null ? String(classeToEdit.annee_academique_id) : '',
      });
    } else {
      setForm(EMPTY);
    }
    setFormError('');
  }, [classeToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.libelle.trim()) {
      setFormError('Le libellé est obligatoire.');
      return;
    }
    if (!form.filiere_id || !form.niveau_id || !form.annee_academique_id) {
      setFormError('Veuillez choisir une filière, un niveau et une année académique.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        id: classeToEdit?.id,
        libelle: form.libelle.trim(),
        filiere_id: Number(form.filiere_id),
        niveau_id: Number(form.niveau_id),
        annee_academique_id: Number(form.annee_academique_id),
      });
      if (!classeToEdit) setForm(EMPTY);
    } catch (err) {
      setFormError(err?.message || 'Erreur lors de l’enregistrement.');
    } finally {
      setSubmitting(false);
    }
  };

  const isEdit = Boolean(classeToEdit?.id);
  const fList = Array.isArray(filieres) ? filieres : [];
  const nList = Array.isArray(niveaux) ? niveaux : [];
  const aList = Array.isArray(annees) ? annees : [];
  const canSubmit =
    form.libelle.trim() &&
    form.filiere_id &&
    form.niveau_id &&
    form.annee_academique_id &&
    fList.length > 0 &&
    nList.length > 0 &&
    aList.length > 0;

  const anneeLabel = (a) => a.libelle ?? String(a.id);

  return (
    <>
      {formError ? (
        <div className="alert alert-danger py-2 small" role="alert">
          {formError}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} noValidate>
        <div className="row g-3">
          <div className="col-12">
            <FormInput
              name="libelle"
              label="Libellé"
              value={form.libelle}
              onChange={handleChange}
              required
              placeholder="ex. L3 Info, groupe A"
            />
          </div>
          <div className="col-12 col-md-4">
            <EntitySelect
              id="classe-filiere"
              name="filiere_id"
              label="Filière"
              items={fList}
              value={form.filiere_id}
              onChange={handleChange}
              required
              placeholder="Filière"
            />
          </div>
          <div className="col-12 col-md-4">
            <EntitySelect
              id="classe-niveau"
              name="niveau_id"
              label="Niveau"
              items={nList}
              value={form.niveau_id}
              onChange={handleChange}
              required
              placeholder="Niveau"
            />
          </div>
          <div className="col-12 col-md-4">
            <EntitySelect
              id="classe-annee"
              name="annee_academique_id"
              label="Année académique"
              items={aList}
              value={form.annee_academique_id}
              onChange={handleChange}
              required
              placeholder="Année"
              getOptionLabel={anneeLabel}
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
