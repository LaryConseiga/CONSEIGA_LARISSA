import { useEffect, useState } from 'react';
import FormInput from '../FormInput';

const EMPTY = {
  libelle: '',
  ordre: '',
};

export default function NiveauForm({ niveauToEdit, onSubmit, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (niveauToEdit) {
      setForm({
        libelle: niveauToEdit.libelle ?? '',
        ordre: niveauToEdit.ordre != null ? String(niveauToEdit.ordre) : '',
      });
    } else {
      setForm(EMPTY);
    }
    setFormError('');
  }, [niveauToEdit]);

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
    const ord = parseInt(form.ordre, 10);
    if (!Number.isFinite(ord)) {
      setFormError('L’ordre est obligatoire (nombre entier, ex. 1, 2, 3).');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        id: niveauToEdit?.id,
        libelle: form.libelle.trim(),
        ordre: ord,
      });
      if (!niveauToEdit) setForm(EMPTY);
    } catch (err) {
      setFormError(err?.message || 'Erreur lors de l’enregistrement.');
    } finally {
      setSubmitting(false);
    }
  };

  const isEdit = Boolean(niveauToEdit?.id);

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
              placeholder="Ex. L1, M2"
            />
          </div>
          <div className="col-12 col-md-6">
            <FormInput
              name="ordre"
              label="Ordre"
              type="number"
              value={form.ordre}
              onChange={handleChange}
              required
              placeholder="1"
              min={0}
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
