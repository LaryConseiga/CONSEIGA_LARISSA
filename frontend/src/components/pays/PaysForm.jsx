import { useEffect, useState } from 'react';
import FormInput from '../FormInput';

const EMPTY = {
  libelle: '',
  nationalite: '',
  code: '',
  iso: '',
};

export default function PaysForm({ paysToEdit, onSubmit, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (paysToEdit) {
      setForm({
        libelle: paysToEdit.libelle ?? '',
        nationalite: paysToEdit.nationalite ?? '',
        code: paysToEdit.code ?? '',
        iso: paysToEdit.iso ?? '',
      });
    } else {
      setForm(EMPTY);
    }
    setFormError('');
  }, [paysToEdit]);

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
        id: paysToEdit?.id,
        libelle: form.libelle.trim(),
        nationalite: form.nationalite.trim() || null,
        code: form.code.trim() || null,
        iso: form.iso.trim() || null,
      });
      if (!paysToEdit) setForm(EMPTY);
    } catch (err) {
      setFormError(err?.message || 'Erreur lors de l’enregistrement.');
    } finally {
      setSubmitting(false);
    }
  };

  const isEdit = Boolean(paysToEdit?.id);

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
            />
          </div>
          <div className="col-12 col-md-6">
            <FormInput
              name="nationalite"
              label="Nationalité"
              value={form.nationalite}
              onChange={handleChange}
              placeholder="ex. Burkinabè"
            />
          </div>
          <div className="col-12 col-md-6">
            <FormInput
              name="code"
              label="Code"
              value={form.code}
              onChange={handleChange}
              placeholder="ex. +226"
            />
          </div>
          <div className="col-12 col-md-6">
            <FormInput
              name="iso"
              label="ISO"
              value={form.iso}
              onChange={handleChange}
              placeholder="ex. BF"
              maxLength={8}
            />
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2 mt-4">
          <button type="submit" className="btn btn-danger" disabled={submitting || !form.libelle.trim()}>
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
