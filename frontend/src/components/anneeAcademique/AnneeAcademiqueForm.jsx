import { useEffect, useState } from 'react';
import FormInput from '../FormInput';

const EMPTY = {
  libelle: '',
  date_debut: '',
  date_fin: '',
  est_active: false,
};

export default function AnneeAcademiqueForm({ anneeToEdit, onSubmit, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (anneeToEdit) {
      setForm({
        libelle: anneeToEdit.libelle ?? '',
        date_debut: anneeToEdit.date_debut ? String(anneeToEdit.date_debut).slice(0, 10) : '',
        date_fin: anneeToEdit.date_fin ? String(anneeToEdit.date_fin).slice(0, 10) : '',
        est_active: Boolean(Number(anneeToEdit.est_active)),
      });
    } else {
      setForm(EMPTY);
    }
    setFormError('');
  }, [anneeToEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.libelle.trim()) {
      setFormError('Le libellé est obligatoire.');
      return;
    }
    if (!form.date_debut || !form.date_fin) {
      setFormError('Les dates de début et de fin sont obligatoires.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        id: anneeToEdit?.id,
        libelle: form.libelle.trim(),
        date_debut: form.date_debut,
        date_fin: form.date_fin,
        est_active: form.est_active,
      });
      if (!anneeToEdit) setForm(EMPTY);
    } catch (err) {
      setFormError(err?.message || 'Erreur lors de l’enregistrement.');
    } finally {
      setSubmitting(false);
    }
  };

  const isEdit = Boolean(anneeToEdit?.id);
  const canSubmit = form.libelle.trim() && form.date_debut && form.date_fin;

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
              placeholder="ex. 2025-2026"
            />
          </div>
          <div className="col-12 col-md-6">
            <label htmlFor="aa-debut" className="form-label">
              Date de début
            </label>
            <input
              id="aa-debut"
              name="date_debut"
              type="date"
              className="form-control"
              value={form.date_debut}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-12 col-md-6">
            <label htmlFor="aa-fin" className="form-label">
              Date de fin
            </label>
            <input
              id="aa-fin"
              name="date_fin"
              type="date"
              className="form-control"
              value={form.date_fin}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-12">
            <div className="form-check">
              <input
                id="aa-active"
                name="est_active"
                type="checkbox"
                className="form-check-input"
                checked={form.est_active}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="aa-active">
                Année académique courante (les autres seront désactivées)
              </label>
            </div>
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
