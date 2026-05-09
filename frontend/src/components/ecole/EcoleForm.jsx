import { useEffect, useState } from 'react';
import FormInput from '../FormInput';

const EMPTY = {
  libelle: '',
  adresse: '',
  telephone: '',
  email: '',
};

/**
 * @param {object | null} ecoleToEdit - null = création, sinon édition
 * @param {(payload: object) => Promise<void>} onSubmit
 * @param {() => void} [onClose] - fermer la modale (annuler édition / abandon)
 */
export default function EcoleForm({ ecoleToEdit, onSubmit, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (ecoleToEdit) {
      setForm({
        libelle: ecoleToEdit.libelle ?? '',
        adresse: ecoleToEdit.adresse ?? '',
        telephone: ecoleToEdit.telephone ?? '',
        email: ecoleToEdit.email ?? '',
      });
    } else {
      setForm(EMPTY);
    }
    setFormError('');
  }, [ecoleToEdit]);

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
        id: ecoleToEdit?.id,
        libelle: form.libelle.trim(),
        adresse: form.adresse.trim() || null,
        telephone: form.telephone.trim() || null,
        email: form.email.trim() || null,
      });
      if (!ecoleToEdit) setForm(EMPTY);
    } catch (err) {
      setFormError(err?.message || 'Erreur lors de l’enregistrement.');
    } finally {
      setSubmitting(false);
    }
  };

  const isEdit = Boolean(ecoleToEdit?.id);

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
              placeholder="Nom de l’établissement"
            />
          </div>
          <div className="col-12 col-md-6">
            <FormInput
              name="telephone"
              label="Téléphone"
              type="tel"
              value={form.telephone}
              onChange={handleChange}
              placeholder="+226"
            />
          </div>
          <div className="col-12">
            <label htmlFor="ecole-adresse" className="form-label">
              Adresse
            </label>
            <textarea
              id="ecole-adresse"
              name="adresse"
              className="form-control"
              rows={3}
              value={form.adresse}
              onChange={handleChange}
              placeholder="Adresse complète"
            />
          </div>
          <div className="col-12 col-md-6">
            <FormInput
              name="email"
              label="Email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="contact@ecole.org"
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
