import { useEffect, useState } from 'react';
import FormInput from '../FormInput';
import EntitySelect from '../EntitySelect';

const EMPTY = {
  libelle: '',
  specialites_id: '',
  niveaux_id: '',
  cycles_id: '',
};

export default function ParcoursForm({
  parcoursToEdit,
  specialites,
  niveaux,
  cycles,
  onSubmit,
  onClose,
}) {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (parcoursToEdit) {
      setForm({
        libelle: parcoursToEdit.libelle ?? '',
        specialites_id:
          parcoursToEdit.specialites_id != null ? String(parcoursToEdit.specialites_id) : '',
        niveaux_id: parcoursToEdit.niveaux_id != null ? String(parcoursToEdit.niveaux_id) : '',
        cycles_id:
          parcoursToEdit.cycles_id != null && parcoursToEdit.cycles_id !== ''
            ? String(parcoursToEdit.cycles_id)
            : '',
      });
    } else {
      setForm(EMPTY);
    }
    setFormError('');
  }, [parcoursToEdit]);

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
    if (!form.specialites_id) {
      setFormError('Veuillez choisir une spécialité.');
      return;
    }
    if (!form.niveaux_id) {
      setFormError('Veuillez choisir un niveau.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        id: parcoursToEdit?.id,
        libelle: form.libelle.trim(),
        specialites_id: Number(form.specialites_id),
        niveaux_id: Number(form.niveaux_id),
        cycles_id: form.cycles_id ? Number(form.cycles_id) : null,
      });
      if (!parcoursToEdit) setForm(EMPTY);
    } catch (err) {
      setFormError(err?.message || 'Erreur lors de l’enregistrement.');
    } finally {
      setSubmitting(false);
    }
  };

  const isEdit = Boolean(parcoursToEdit?.id);
  const specList = Array.isArray(specialites) ? specialites : [];
  const nivList = Array.isArray(niveaux) ? niveaux : [];
  const cycList = Array.isArray(cycles) ? cycles : [];
  const canSubmit =
    specList.length > 0 && nivList.length > 0 && form.libelle.trim() && form.specialites_id && form.niveaux_id;

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
              placeholder="Libellé du parcours"
            />
          </div>
          <div className="col-12 col-md-4">
            <EntitySelect
              id="parcours-specialite"
              name="specialites_id"
              label="Spécialité"
              items={specList}
              value={form.specialites_id}
              onChange={handleChange}
              required
              placeholder="Spécialité"
            />
          </div>
          <div className="col-12 col-md-4">
            <EntitySelect
              id="parcours-niveau"
              name="niveaux_id"
              label="Niveau"
              items={nivList}
              value={form.niveaux_id}
              onChange={handleChange}
              required
              placeholder="Niveau"
            />
          </div>
          <div className="col-12 col-md-4">
            <EntitySelect
              id="parcours-cycle"
              name="cycles_id"
              label="Cycle (facultatif)"
              items={cycList}
              value={form.cycles_id}
              onChange={handleChange}
              required={false}
              placeholder="Aucun cycle"
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
