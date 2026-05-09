import { useEffect, useState } from 'react';
import FormInput from '../FormInput';

const EMPTY = {
  libelle: '',
  duree_annees: '',
};

export default function CycleForm({ cycleToEdit, onSubmit, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (cycleToEdit) {
      setForm({
        libelle: cycleToEdit.libelle ?? '',
        duree_annees:
          cycleToEdit.duree_annees != null ? String(cycleToEdit.duree_annees) : '',
      });
    } else {
      setForm(EMPTY);
    }
    setFormError('');
  }, [cycleToEdit]);

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
    const duree = parseInt(form.duree_annees, 10);
    if (!Number.isFinite(duree) || duree < 1) {
      setFormError('La durée en années doit être un entier ≥ 1.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        id: cycleToEdit?.id,
        libelle: form.libelle.trim(),
        duree_annees: duree,
      });
      if (!cycleToEdit) setForm(EMPTY);
    } catch (err) {
      setFormError(err?.message || 'Erreur lors de l’enregistrement.');
    } finally {
      setSubmitting(false);
    }
  };

  const isEdit = Boolean(cycleToEdit?.id);

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
            <FormInput
              name="libelle"
              label="Libellé"
              value={form.libelle}
              onChange={handleChange}
              required
              placeholder="Ex. Licence, Master"
            />
          </div>
          <div className="col-12 col-md-6">
            <FormInput
              name="duree_annees"
              label="Durée (années)"
              type="number"
              value={form.duree_annees}
              onChange={handleChange}
              required
              placeholder="3"
              min={1}
              step={1}
            />
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2 mt-4">
          <button type="submit" className="btn btn-danger" disabled={submitting}>
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
