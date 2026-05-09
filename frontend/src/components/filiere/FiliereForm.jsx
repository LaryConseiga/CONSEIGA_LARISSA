import { useEffect, useState } from 'react';
import FormInput from '../FormInput';

const EMPTY = {
  code: '',
  libelle: '',
  description: '',
};

export default function FiliereForm({ filiereToEdit, onSubmit, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (filiereToEdit) {
      setForm({
        code: filiereToEdit.code ?? '',
        libelle: filiereToEdit.libelle ?? '',
        description: filiereToEdit.description ?? '',
      });
    } else {
      setForm(EMPTY);
    }
    setFormError('');
  }, [filiereToEdit]);

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
    setSubmitting(true);
    try {
      await onSubmit({
        id: filiereToEdit?.id,
        code: form.code.trim() || null,
        libelle: form.libelle.trim(),
        description: form.description.trim() || null,
      });
      if (!filiereToEdit) setForm(EMPTY);
    } catch (err) {
      setFormError(err?.message || 'Erreur lors de l’enregistrement.');
    } finally {
      setSubmitting(false);
    }
  };

  const isEdit = Boolean(filiereToEdit?.id);

  return (
    <>
      {formError ? (
        <div className="alert alert-danger py-2 small" role="alert">
          {formError}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} noValidate>
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <FormInput
              name="code"
              label="Code"
              value={form.code}
              onChange={handleChange}
              placeholder="Ex. INFO"
              maxLength={20}
            />
          </div>
          <div className="col-12 col-md-8">
            <FormInput
              name="libelle"
              label="Libellé"
              value={form.libelle}
              onChange={handleChange}
              required
              placeholder="Nom de la filière"
            />
          </div>
          <div className="col-12">
            <label htmlFor="filiere-description" className="form-label">
              Description
            </label>
            <textarea
              id="filiere-description"
              name="description"
              className="form-control"
              rows={3}
              value={form.description}
              onChange={handleChange}
              placeholder="Description facultative"
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
