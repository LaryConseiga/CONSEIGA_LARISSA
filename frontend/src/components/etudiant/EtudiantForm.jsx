import { useEffect, useState } from 'react';
import FormInput from '../FormInput';
import EntitySelect from '../EntitySelect';

const EMPTY = {
  nom: '',
  prenoms: '',
  pays_id: '',
  civilites_id: '',
  dateNaissance: '',
  email: '',
  telephone: '',
};

function civiliteLabel(c) {
  return c.abreviation ? `${c.libelle} (${c.abreviation})` : c.libelle;
}

export default function EtudiantForm({ etudiantToEdit, pays, civilites, onSubmit, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (etudiantToEdit) {
      const d = etudiantToEdit.dateNaissance;
      setForm({
        nom: etudiantToEdit.nom ?? '',
        prenoms: etudiantToEdit.prenoms ?? '',
        pays_id: etudiantToEdit.pays_id != null ? String(etudiantToEdit.pays_id) : '',
        civilites_id: etudiantToEdit.civilites_id != null ? String(etudiantToEdit.civilites_id) : '',
        dateNaissance: d ? String(d).slice(0, 10) : '',
        email: etudiantToEdit.email ?? '',
        telephone: etudiantToEdit.telephone ?? '',
      });
    } else {
      setForm(EMPTY);
    }
    setFormError('');
  }, [etudiantToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.nom.trim() || !form.prenoms.trim()) {
      setFormError('Le nom et les prénoms sont obligatoires.');
      return;
    }
    if (!form.pays_id) {
      setFormError('Veuillez choisir un pays.');
      return;
    }
    if (!form.civilites_id) {
      setFormError('Veuillez choisir une civilité.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        id: etudiantToEdit?.id,
        nom: form.nom.trim(),
        prenoms: form.prenoms.trim(),
        pays_id: Number(form.pays_id),
        civilites_id: Number(form.civilites_id),
        dateNaissance: form.dateNaissance.trim() || null,
        email: form.email.trim() || null,
        telephone: form.telephone.trim() || null,
      });
      if (!etudiantToEdit) setForm(EMPTY);
    } catch (err) {
      setFormError(err?.message || 'Erreur lors de l’enregistrement.');
    } finally {
      setSubmitting(false);
    }
  };

  const isEdit = Boolean(etudiantToEdit?.id);
  const pList = Array.isArray(pays) ? pays : [];
  const cList = Array.isArray(civilites) ? civilites : [];
  const canSubmit =
    form.nom.trim() &&
    form.prenoms.trim() &&
    form.pays_id &&
    form.civilites_id &&
    pList.length > 0 &&
    cList.length > 0;

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
            <FormInput name="nom" label="Nom" value={form.nom} onChange={handleChange} required />
          </div>
          <div className="col-12 col-md-6">
            <FormInput
              name="prenoms"
              label="Prénoms"
              value={form.prenoms}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-12 col-md-6">
            <EntitySelect
              id="etudiant-pays"
              name="pays_id"
              label="Pays"
              items={pList}
              value={form.pays_id}
              onChange={handleChange}
              required
              placeholder="Pays"
            />
          </div>
          <div className="col-12 col-md-6">
            <EntitySelect
              id="etudiant-civilite"
              name="civilites_id"
              label="Civilité"
              items={cList}
              value={form.civilites_id}
              onChange={handleChange}
              required
              placeholder="Civilité"
              getOptionLabel={civiliteLabel}
            />
          </div>
          <div className="col-12 col-md-6">
            <label htmlFor="etudiant-naissance" className="form-label">
              Date de naissance
            </label>
            <input
              id="etudiant-naissance"
              name="dateNaissance"
              type="date"
              className="form-control"
              value={form.dateNaissance}
              onChange={handleChange}
            />
          </div>
          <div className="col-12 col-md-6">
            <FormInput
              name="email"
              label="Email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="email@exemple.org"
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
