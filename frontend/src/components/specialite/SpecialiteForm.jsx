import { useEffect, useState } from 'react';
import FormInput from '../FormInput';
import FiliereSelect from '../FiliereSelect';


const EMPTY = {
  libelle: '',
  filieres_id: '',
  description: '',
};

export default function SpecialiteForm({
  specialiteToEdit,
  filieres,
  onSubmit,
  onClose,
}) {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (specialiteToEdit) {
      setForm({
        libelle: specialiteToEdit.libelle ?? '',
        filieres_id:
          specialiteToEdit.filieres_id != null ? String(specialiteToEdit.filieres_id) : '',
        description: specialiteToEdit.description ?? '',
      });
    } else {
      setForm(EMPTY);
    }
    setFormError('');
  }, [specialiteToEdit]);

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
    if (!form.filieres_id) {
      setFormError('Veuillez choisir une filière.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        id: specialiteToEdit?.id,
        libelle: form.libelle.trim(),
        filieres_id: Number(form.filieres_id),
        description: form.description.trim() || null,
      });
      if (!specialiteToEdit) setForm(EMPTY);
    } catch (err) {
      setFormError(err?.message || 'Erreur lors de l’enregistrement.');
    } finally {
      setSubmitting(false);
    }
  };

  const isEdit = Boolean(specialiteToEdit?.id);
  const hasFilieres = Array.isArray(filieres) && filieres.length > 0;

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
              placeholder="Nom de la spécialité"
            />
          </div>
          <div className="col-12 col-md-6">
            <FiliereSelect
              id="specialite-filiere"
              name="filieres_id"
              label="Filière"
              filieres={filieres}
              value={form.filieres_id}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-12">
            <label htmlFor="specialite-description" className="form-label">
              Description
            </label>
            <textarea
              id="specialite-description"
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
          <button
            type="submit"
            className="btn btn-danger"
            disabled={submitting || !hasFilieres}
          >
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
