import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getClasses } from '../../services/serviceClasses';
import { getDecisions } from '../../services/serviceDecisions';
import { getEtudiants } from '../../services/serviceEtudiants';
import { createInscriptionParClasse } from '../../services/serviceInscriptions';
import { getParcoursMatch } from '../../services/serviceParcours';
import EntitySelect from '../EntitySelect';
import FormInput from '../FormInput';

function etudiantLabel(e) {
  const n = [e.nom, e.prenoms].filter(Boolean).join(' ').trim();
  return n || 'Étudiant';
}

function classeLabel(c) {
  const parts = [c.libelle, c.filiere_libelle, c.niveau_libelle].filter(Boolean).join(' · ');
  const an = c.annee_academique_libelle ? ` (${c.annee_academique_libelle})` : '';
  return `${parts}${an}`;
}

const PAIEMENT_OPTIONS = [
  { value: '', label: '(facultatif)' },
  { value: 'Non payé', label: 'Non payé' },
  { value: 'Partiel', label: 'Partiel' },
  { value: 'Payé', label: 'Payé' },
  { value: 'Exonéré', label: 'Exonéré' },
];

export default function EtudiantInscrire() {
  const [etudiants, setEtudiants] = useState([]);
  const [classes, setClasses] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [form, setForm] = useState({
    etudiants_id: '',
    classes_id: '',
    decisions_id: '',
    dateInscription: new Date().toISOString().slice(0, 10),
    numero_inscription: '',
    statut_paiement: '',
  });
  const [parcoursMatch, setParcoursMatch] = useState(null);
  const [matchError, setMatchError] = useState('');
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadRefs = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [rE, rC, rD] = await Promise.allSettled([
        getEtudiants(),
        getClasses(),
        getDecisions(),
      ]);
      setEtudiants(rE.status === 'fulfilled' ? rE.value : []);
      setClasses(rC.status === 'fulfilled' ? rC.value : []);
      setDecisions(rD.status === 'fulfilled' ? rD.value : []);
      if (rE.status === 'rejected' || rD.status === 'rejected') {
        setLoadError(
          "Certaines listes n’ont pas pu être chargées (étudiants, décisions). Vérifiez l’API et la base."
        );
      }
    } catch {
      setLoadError('Impossible de joindre le serveur.');
      setEtudiants([]);
      setClasses([]);
      setDecisions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRefs();
  }, [loadRefs]);

  const classeSelectionnee = useMemo(() => {
    if (!form.classes_id) return null;
    const id = Number(form.classes_id);
    return classes.find((c) => Number(c.id) === id) || null;
  }, [form.classes_id, classes]);

  useEffect(() => {
    setParcoursMatch(null);
    setMatchError('');
    const c = classeSelectionnee;
    if (!c || c.filiere_id == null || c.niveau_id == null) {
      return undefined;
    }
    const fid = c.filiere_id;
    const nid = c.niveau_id;
    let cancelled = false;
    (async () => {
      try {
        const body = await getParcoursMatch(fid, nid);
        if (cancelled) return;
        setParcoursMatch(body);
      } catch (e) {
        if (!cancelled) {
          setMatchError(e?.message || 'Impossible de vérifier le parcours.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [classeSelectionnee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSuccess('');
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccess('');
    if (!form.etudiants_id) {
      setFormError('Veuillez choisir un étudiant.');
      return;
    }
    if (!form.classes_id) {
      setFormError('Veuillez choisir une classe.');
      return;
    }
    if (!form.decisions_id) {
      setFormError('Veuillez indiquer le statut académique (décision).');
      return;
    }
    if (!form.dateInscription) {
      setFormError('La date d’inscription est obligatoire.');
      return;
    }
    if (matchError || !parcoursMatch) {
      setFormError(
        'Aucun parcours valide pour cette classe : corrigez la classe ou complétez les parcours avant d’inscrire.'
      );
      return;
    }
    setSubmitting(true);
    try {
      await createInscriptionParClasse({
        etudiants_id: Number(form.etudiants_id),
        classes_id: Number(form.classes_id),
        decisions_id: Number(form.decisions_id),
        dateInscription: form.dateInscription,
        numero_inscription: form.numero_inscription.trim() || null,
        statut_paiement: form.statut_paiement.trim() || null,
      });
      setSuccess('Inscription enregistrée. Vous pouvez inscrire un autre étudiant ou consulter les inscriptions.');
      setForm((prev) => ({
        ...prev,
        etudiants_id: '',
        classes_id: '',
        decisions_id: '',
        dateInscription: new Date().toISOString().slice(0, 10),
        numero_inscription: '',
        statut_paiement: '',
      }));
      setParcoursMatch(null);
      setMatchError('');
    } catch (err) {
      setFormError(err?.message || 'Erreur lors de l’enregistrement.');
    } finally {
      setSubmitting(false);
    }
  };

  const eList = Array.isArray(etudiants) ? etudiants : [];
  const cList = Array.isArray(classes) ? classes : [];
  const dList = Array.isArray(decisions) ? decisions : [];
  const canSubmit =
    eList.length > 0 &&
    cList.length > 0 &&
    dList.length > 0 &&
    form.etudiants_id &&
    form.classes_id &&
    form.decisions_id &&
    form.dateInscription &&
    parcoursMatch &&
    !matchError;

  return (
    <div className="container-fluid py-4 px-3 px-lg-4 flex-grow-1 bg-white">
      <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h3 mb-0">Inscrire un étudiant</h1>
        </div>
        <Link to="/ressources/inscriptions" className="btn btn-danger">
          Voir les inscriptions
        </Link>
      </div>

      {loadError ? (
        <div className="alert alert-warning" role="alert">
          {loadError}
        </div>
      ) : null}

      {success ? (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      ) : null}

      {loading ? (
        <p className="text-muted">Chargement du formulaire…</p>
      ) : (
        <div className="card shadow-sm border-0" style={{ maxWidth: '960px' }}>
          <div className="card-body p-4">
            {formError ? (
              <div className="alert alert-danger py-2 small" role="alert">
                {formError}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} noValidate>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <EntitySelect
                    id="inscrire-etudiant"
                    name="etudiants_id"
                    label="Étudiant"
                    items={eList}
                    value={form.etudiants_id}
                    onChange={handleChange}
                    required
                    placeholder="Choisir un étudiant"
                    getOptionLabel={etudiantLabel}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <EntitySelect
                    id="inscrire-classe"
                    name="classes_id"
                    label="Classe"
                    items={cList}
                    value={form.classes_id}
                    onChange={handleChange}
                    required
                    placeholder="Choisir une classe"
                    getOptionLabel={classeLabel}
                  />
                </div>

                {form.classes_id ? (
                  <div className="col-12">
                    {matchError ? (
                      <div className="alert alert-warning py-2 small mb-0" role="status">
                        {matchError}
                      </div>
                    ) : parcoursMatch ? (
                      <div className="alert alert-light border py-2 small mb-0" role="status">
                        <strong>Parcours retenu :</strong> {parcoursMatch.libelle}
                        {parcoursMatch.specialite_libelle ? (
                          <span className="text-muted"> · {parcoursMatch.specialite_libelle}</span>
                        ) : null}
                      </div>
                    ) : (
                      <p className="text-muted small mb-0">Vérification du parcours…</p>
                    )}
                  </div>
                ) : null}

                <div className="col-12 col-md-6">
                  <EntitySelect
                    id="inscrire-decision"
                    name="decisions_id"
                    label="Statut académique (décision)"
                    items={dList}
                    value={form.decisions_id}
                    onChange={handleChange}
                    required
                    placeholder="Décision"
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label htmlFor="inscrire-date" className="form-label">
                    Date d’inscription
                  </label>
                  <input
                    id="inscrire-date"
                    name="dateInscription"
                    type="date"
                    className="form-control"
                    value={form.dateInscription}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FormInput
                    name="numero_inscription"
                    label="Numéro d’inscription"
                    value={form.numero_inscription}
                    onChange={handleChange}
                    placeholder="ex. INS-2025-00042"
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label htmlFor="inscrire-paiement" className="form-label">
                    Statut de paiement
                  </label>
                  <select
                    id="inscrire-paiement"
                    name="statut_paiement"
                    className="form-select"
                    value={form.statut_paiement}
                    onChange={handleChange}
                  >
                    {PAIEMENT_OPTIONS.map((o) => (
                      <option key={o.label} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2 mt-4">
                <button type="submit" className="btn btn-danger" disabled={submitting || !canSubmit}>
                  {submitting ? 'Enregistrement…' : 'Enregistrer l’inscription'}
                </button>
                <Link to="/etudiants/liste" className="btn btn-outline-secondary">
                  Liste des étudiants
                </Link>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
