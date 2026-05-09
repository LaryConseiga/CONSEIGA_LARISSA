import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { getAnneesAcademiques } from '../../services/serviceAnneesAcademiques';
import { getClasses } from '../../services/serviceClasses';
import { getEcoles } from '../../services/serviceEcoles';
import { getEtudiants } from '../../services/serviceEtudiants';
import { getInscriptions } from '../../services/serviceInscriptions';
import { getParcoursById } from '../../services/serviceParcours';
import { getSpecialiteById } from '../../services/serviceSpecialites';
import EntitySelect from '../EntitySelect';
import FormInput from '../FormInput';


const CERT_TYPES = [
  { id: 'inscription', libelle: "Certificat d'inscription" },
  { id: 'scolarite',   libelle: 'Certificat de scolarité'  },
  { id: 'attestation', libelle: "Attestation d'inscription" },
];

function etudiantLabel(e) {
  return [e.nom, e.prenoms].filter(Boolean).join(' ').trim() || `Étudiant #${e.id}`;
}
function anneeLabel(a)  { return a.libelle  ?? `Année #${a.id}`;  }
function ecoleLabel(e)  { return e.libelle  ?? `École #${e.id}`;  }

function getCiviliteAbrev(etudiant) {
  if (!etudiant) return '';
  for (const v of [
    etudiant.civilite_abreviation,
    etudiant.abreviation,
    etudiant.civilite_libelle,
    etudiant.civilite,
    etudiant.civilites_libelle,
    etudiant.civilite_label,
  ]) {
    if (v) return String(v).trim();
  }
  return '';
}

function isFeminin(etudiant) {
  const abrev = getCiviliteAbrev(etudiant).toLowerCase();
  return (
    abrev.startsWith('mme') ||
    abrev.startsWith('mlle') ||
    abrev.startsWith('madame') ||
    abrev.startsWith('mademoiselle')
  );
}

function formatDateLong(isoDate) {
  if (!isoDate) return '_______________';
  return new Date(isoDate + 'T12:00:00').toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function buildCorpsDefaut({
  typeId, civilite, nom, prenom, numeroAffiche,
  ecoleNom, filiere, niveau, classe, parcours,
  annee, decision, dateInscription, feminin = false,
}) {
  const civ      = civilite || (feminin ? 'Mme' : 'M.');
  const inscrit  = feminin ? 'inscrite' : 'inscrit';
  const etab     = ecoleNom || "l'établissement";
  const anneeStr = annee || '_______________';
  const identite = `${civ} ${[nom, prenom].filter(Boolean).join(' ')}`.trim();

  const lignesAcad = [
    filiere          && `    - Filière             : ${filiere}`,
    niveau           && `    - Niveau              : ${niveau}`,
    classe           && `    - Classe              : ${classe}`,
    parcours         && `    - Parcours            : ${parcours}`,
    annee            && `    - Année académique    : ${annee}`,
    decision         && `    - Statut administratif: ${decision}`,
    dateInscription  && `    - Date d'inscription  : ${dateInscription}`,
  ].filter(Boolean).join('\n');

  const bloc = lignesAcad || '    À compléter selon le dossier.';

  if (typeId === 'scolarite') {
    return (
      `Nous, soussigné(e)s, certifions par la présente que :\n\n` +
      `    ${identite}\n` +
      `    Numéro de dossier : ${numeroAffiche}\n\n` +
      `est dûment ${inscrit} et suit régulièrement les cours dispensés au sein de ${etab}` +
      ` pour l'année académique ${anneeStr}.\n\n` +
      `Informations pédagogiques :\n${bloc}\n\n` +
      `Ce certificat de scolarité est établi sur demande de l'intéressé(e) afin de justifier` +
      ` sa situation académique auprès de tout organisme qui le requiert.\n\n` +
      `Fait pour servir et valoir ce que de droit.`
    );
  }

  if (typeId === 'attestation') {
    return (
      `Il est attesté par la présente que :\n\n` +
      `    ${identite}\n` +
      `    Numéro de dossier : ${numeroAffiche}\n\n` +
      `est régulièrement ${inscrit} au sein de ${etab} sous le numéro ${numeroAffiche},` +
      ` au titre de l'année académique ${anneeStr}.\n\n` +
      `Informations pédagogiques :\n${bloc}\n\n` +
      `La présente attestation est délivrée à la demande de l'intéressé(e)` +
      ` pour servir et valoir ce que de droit.`
    );
  }

  // certificat d'inscription (défaut)
  return (
    `Nous, soussigné(e)s, certifions par la présente que :\n\n` +
    `    ${identite}\n` +
    `    Numéro de dossier : ${numeroAffiche}\n\n` +
    `est régulièrement ${inscrit} au sein de ${etab} au titre de l'année académique ${anneeStr},` +
    ` conformément aux dossiers de l'administration.\n\n` +
    `Informations pédagogiques :\n${bloc}\n\n` +
    `Ce certificat est délivré à l'intéressé(e) pour servir et valoir ce que de droit.`
  );
}

export default function CertificatInscription() {
  const [etudiants,    setEtudiants]    = useState([]);
  const [annees,       setAnnees]       = useState([]);
  const [inscriptions, setInscriptions] = useState([]);
  const [classes,      setClasses]      = useState([]);
  const [ecoles,       setEcoles]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [loadError,    setLoadError]    = useState('');

  const [etudiantId,   setEtudiantId]   = useState('');
  const [anneeId,      setAnneeId]      = useState('');
  const [ecoleId,      setEcoleId]      = useState('');
  const [certTypeId,   setCertTypeId]   = useState('inscription');
  const [corps,        setCorps]        = useState('');
  const [dateEmission, setDateEmission] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const [lieu,         setLieu]         = useState('Ouagadougou');
  const [signNom,      setSignNom]      = useState('');
  const [signFonction, setSignFonction] = useState('Le Responsable pédagogique');

  const [parcoursDetail,   setParcoursDetail]   = useState(null);
  const [specialiteDetail, setSpecialiteDetail] = useState(null);
  const [detailError,      setDetailError]      = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [rE, rA, rI, rC, rEc] = await Promise.allSettled([
        getEtudiants(),
        getAnneesAcademiques(),
        getInscriptions(),
        getClasses(),
        getEcoles(),
      ]);
      setEtudiants(rE.status === 'fulfilled' ? rE.value : []);
      setAnnees(rA.status === 'fulfilled' ? rA.value : []);
      setInscriptions(rI.status === 'fulfilled' ? rI.value : []);
      setClasses(rC.status === 'fulfilled' ? rC.value : []);
      setEcoles(rEc.status === 'fulfilled' ? rEc.value : []);
      if (rE.status === 'rejected' || rA.status === 'rejected') {
        setLoadError('Impossible de charger les listes principales (étudiants ou années).');
      }
    } catch {
      setLoadError('Impossible de joindre le serveur.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const inscription = useMemo(() => {
    if (!etudiantId || !anneeId) return null;
    const e = Number(etudiantId);
    const a = Number(anneeId);
    return (
      inscriptions.find(
        (i) => Number(i.etudiants_id) === e && Number(i.annee_academique_id) === a
      ) || null
    );
  }, [etudiantId, anneeId, inscriptions]);

  const etudiant = useMemo(
    () => etudiants.find((x) => String(x.id) === String(etudiantId)) || null,
    [etudiantId, etudiants]
  );
  const annee = useMemo(
    () => annees.find((x) => String(x.id) === String(anneeId)) || null,
    [anneeId, annees]
  );
  const ecole    = useMemo(
    () => ecoles.find((x) => String(x.id) === String(ecoleId)) || null,
    [ecoleId, ecoles]
  );
  const ecoleNom = ecole?.libelle ?? '';

  useEffect(() => {
    setParcoursDetail(null);
    setSpecialiteDetail(null);
    setDetailError('');
    if (!inscription?.parcours_id) return;
    let cancelled = false;
    (async () => {
      try {
        const p = await getParcoursById(inscription.parcours_id);
        if (cancelled) return;
        setParcoursDetail(p);
        if (p.specialites_id) {
          try {
            const s = await getSpecialiteById(p.specialites_id);
            if (!cancelled) setSpecialiteDetail(s);
          } catch { /* spécialité facultative */ }
        }
      } catch (e) {
        if (!cancelled) setDetailError(e?.message || 'Erreur lors du chargement du parcours.');
      }
    })();
    return () => { cancelled = true; };
  }, [inscription]);

  const classeAffichee = useMemo(() => {
    if (!anneeId || !parcoursDetail || !specialiteDetail) return null;
    const fid = Number(specialiteDetail.filieres_id);
    const nid = Number(parcoursDetail.niveaux_id);
    const aid = Number(anneeId);
    return (
      classes.find(
        (c) =>
          Number(c.annee_academique_id) === aid &&
          Number(c.filiere_id) === fid &&
          Number(c.niveau_id) === nid
      ) || null
    );
  }, [anneeId, classes, parcoursDetail, specialiteDetail]);

  const numeroAffiche = useMemo(() => {
    if (inscription?.numero_inscription) return String(inscription.numero_inscription);
    if (inscription?.id) return `REF-${String(inscription.id).padStart(5, '0')}`;
    return 'Non renseigné';
  }, [inscription]);

  const certTypeLibelle = useMemo(
    () => CERT_TYPES.find((t) => t.id === certTypeId)?.libelle ?? "Certificat d'inscription",
    [certTypeId]
  );

  const genererTexte = () => {
    if (!etudiant) return;
    setCorps(
      buildCorpsDefaut({
        typeId:          certTypeId,
        civilite:        getCiviliteAbrev(etudiant),
        nom:             etudiant.nom     ?? '',
        prenom:          etudiant.prenoms ?? '',
        numeroAffiche,
        ecoleNom,
        filiere:         specialiteDetail?.filiere_libelle ?? '',
        niveau:          parcoursDetail?.niveau_libelle    ?? '',
        classe:          classeAffichee?.libelle           ?? '',
        parcours:        parcoursDetail?.libelle ?? inscription?.parcours_libelle ?? '',
        annee:           annee?.libelle ?? inscription?.annee_libelle ?? '',
        decision:        inscription?.decision_libelle ?? '',
        dateInscription: inscription?.dateInscription
          ? String(inscription.dateInscription).slice(0, 10)
          : '',
        feminin: isFeminin(etudiant),
      })
    );
  };

  const telechargerPdf = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const W   = doc.internal.pageSize.getWidth();
    const H   = doc.internal.pageSize.getHeight();
    const ml  = 22;
    const mr  = 22;
    const tw  = W - ml - mr;
    let y     = 18;

    // ── En-tête institutionnel ────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 15, 15);
    const nomEcole  = ecoleNom || 'ÉTABLISSEMENT';
    const etabLines = doc.splitTextToSize(nomEcole.toUpperCase(), tw);
    doc.text(etabLines, W / 2, y, { align: 'center' });
    y += etabLines.length * 5.5 + 4;

    // Filet simple noir
    doc.setDrawColor(30, 30, 30);
    doc.setLineWidth(0.8);
    doc.line(ml, y, W - mr, y);
    y += 1.5;
    doc.setLineWidth(0.2);
    doc.line(ml, y, W - mr, y);
    y += 12;

    // ── Titre du document ─────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    const titrePdf = certTypeLibelle.toUpperCase();
    doc.text(titrePdf, W / 2, y, { align: 'center' });
    const titreW = doc.getTextWidth(titrePdf);
    y += 2;
    doc.setDrawColor(30, 30, 30);
    doc.setLineWidth(0.5);
    doc.line(W / 2 - titreW / 2, y + 0.5, W / 2 + titreW / 2, y + 0.5);
    y += 12;

    // ── Numéro de référence ───────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(90, 90, 90);
    doc.text(`Réf. : ${numeroAffiche}`, W - mr, y, { align: 'right' });
    y += 10;

    // ── Corps du texte ────────────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    const bodyText = corps.trim() || '(Aucun texte — utilisez « Générer le modèle ».)';
    const lines    = doc.splitTextToSize(bodyText, tw);
    const lineH    = 5.5;

    for (const line of lines) {
      if (y > H - 65) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, ml, y);
      y += lineH;
    }

    // ── Lieu et date ──────────────────────────────────────────────────
    y += 12;
    if (y > H - 52) { doc.addPage(); y = 20; }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(
      `${lieu || 'Ouagadougou'}, le ${formatDateLong(dateEmission)}`,
      W - mr, y, { align: 'right' }
    );
    y += 18;

    // ── Bloc signataire ───────────────────────────────────────────────
    if (signFonction.trim()) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(signFonction.trim(), W - mr, y, { align: 'right' });
      y += 6;
    }
    if (signNom.trim()) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(signNom.trim(), W - mr, y, { align: 'right' });
      y += 4;
    }
    doc.setDrawColor(80, 80, 80);
    doc.setLineWidth(0.3);
    doc.line(W - mr - 55, y + 10, W - mr, y + 10);

    // ── Pied de page ──────────────────────────────────────────────────
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.5);
    doc.setTextColor(130, 130, 130);
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.2);
    doc.line(ml, H - 14, W - mr, H - 14);
    doc.text(
      'Document officiel — à conserver et à présenter sur demande',
      W / 2, H - 9, { align: 'center' }
    );

    const slug =
      [etudiant?.nom, etudiant?.prenoms].filter(Boolean).join('_').replace(/\s+/g, '_') ||
      'etudiant';
    doc.save(`${certTypeId}_${slug}_${dateEmission || 'date'}.pdf`);
  };

  const eList  = Array.isArray(etudiants) ? etudiants : [];
  const aList  = Array.isArray(annees)    ? annees    : [];
  const ecList = Array.isArray(ecoles)    ? ecoles    : [];

  return (
    <div className="container-fluid py-4 px-3 px-lg-4 flex-grow-1 bg-white">
      <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
        <h1 className="h3 mb-0">Éditer un certificat</h1>
        <Link to="/etudiants/liste" className="btn btn-outline-secondary btn-sm">
          Liste des étudiants
        </Link>
      </div>

      {loadError ? (
        <div className="alert alert-warning" role="alert">{loadError}</div>
      ) : null}

      {loading ? (
        <p className="text-muted">Chargement…</p>
      ) : (
        <div className="row g-4">

          {/* ── Colonne formulaire ──────────────────────────────────── */}
          <div className="col-12 col-xl-6">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-dark text-white fw-semibold">
                Paramètres du document
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <EntitySelect
                      id="cert-etudiant"
                      name="etudiantId"
                      label="Étudiant"
                      items={eList}
                      value={etudiantId}
                      onChange={(e) => setEtudiantId(e.target.value)}
                      required
                      placeholder="Choisir un étudiant"
                      getOptionLabel={etudiantLabel}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <EntitySelect
                      id="cert-annee"
                      name="anneeId"
                      label="Année académique"
                      items={aList}
                      value={anneeId}
                      onChange={(e) => setAnneeId(e.target.value)}
                      required
                      placeholder="Choisir une année"
                      getOptionLabel={anneeLabel}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label htmlFor="cert-type" className="form-label">
                      Type de document
                    </label>
                    <select
                      id="cert-type"
                      className="form-select"
                      value={certTypeId}
                      onChange={(e) => setCertTypeId(e.target.value)}
                    >
                      {CERT_TYPES.map((t) => (
                        <option key={t.id} value={t.id}>{t.libelle}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12 col-md-6">
                    <EntitySelect
                      id="cert-ecole"
                      name="ecoleId"
                      label="École délivrant le document"
                      items={ecList}
                      value={ecoleId}
                      onChange={(e) => setEcoleId(e.target.value)}
                      required
                      placeholder="Choisir une école"
                      getOptionLabel={ecoleLabel}
                    />
                  </div>
                </div>

                <hr className="my-4" />

                <h2 className="h6 text-uppercase text-muted mb-3">Informations de l'étudiant</h2>
                {etudiant ? (
                  <ul className="list-unstyled small mb-0">
                    <li>
                      <strong>Civilité :</strong>{' '}
                      {getCiviliteAbrev(etudiant) || 'Non renseigné'}
                    </li>
                    <li><strong>Nom :</strong> {etudiant.nom     || 'Non renseigné'}</li>
                    <li><strong>Prénom(s) :</strong> {etudiant.prenoms || 'Non renseigné'}</li>
                    <li><strong>Référence dossier :</strong> {numeroAffiche}</li>
                  </ul>
                ) : (
                  <p className="text-muted small mb-0">Sélectionnez un étudiant.</p>
                )}

                <h2 className="h6 text-uppercase text-muted mt-4 mb-3">Informations académiques</h2>
                {detailError ? (
                  <div className="alert alert-warning py-2 small">{detailError}</div>
                ) : null}
                {etudiantId && anneeId && !inscription ? (
                  <div className="alert alert-info py-2 small mb-0">
                    Aucune inscription trouvée pour cet étudiant et cette année.
                    Créez d'abord une inscription via le menu correspondant.
                  </div>
                ) : (
                  <ul className="list-unstyled small mb-0">
                    <li>
                      <strong>Filière :</strong>{' '}
                      {specialiteDetail?.filiere_libelle || 'Non renseigné'}
                    </li>
                    <li>
                      <strong>Niveau :</strong>{' '}
                      {parcoursDetail?.niveau_libelle || 'Non renseigné'}
                    </li>
                    <li>
                      <strong>Classe :</strong>{' '}
                      {classeAffichee?.libelle || 'Non renseigné'}
                    </li>
                    <li>
                      <strong>Parcours :</strong>{' '}
                      {parcoursDetail?.libelle || inscription?.parcours_libelle || 'Non renseigné'}
                    </li>
                    <li>
                      <strong>Statut :</strong>{' '}
                      {inscription?.decision_libelle || 'Non renseigné'}
                    </li>
                  </ul>
                )}

                <hr className="my-4" />

                <label htmlFor="cert-corps" className="form-label">
                  Texte du document
                </label>
                <textarea
                  id="cert-corps"
                  className="form-control font-monospace"
                  rows={13}
                  value={corps}
                  onChange={(e) => setCorps(e.target.value)}
                  placeholder="Utilisez « Générer le modèle » pour insérer le texte type, puis adaptez si nécessaire."
                  style={{ fontSize: '0.82rem', lineHeight: 1.55 }}
                />

                <div className="row g-3 mt-1">
                  <div className="col-12 col-md-6">
                    <label htmlFor="cert-date-emission" className="form-label">
                      Date d'émission
                    </label>
                    <input
                      id="cert-date-emission"
                      type="date"
                      className="form-control"
                      value={dateEmission}
                      onChange={(e) => setDateEmission(e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <FormInput
                      name="lieu"
                      label="Lieu d'émission"
                      value={lieu}
                      onChange={(e) => setLieu(e.target.value)}
                      placeholder="Ville"
                    />
                  </div>
                </div>

                <h2 className="h6 text-uppercase text-muted mt-4 mb-3">Signataire</h2>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <FormInput
                      name="signFonction"
                      label="Fonction"
                      value={signFonction}
                      onChange={(e) => setSignFonction(e.target.value)}
                      placeholder="Ex. Secrétaire général"
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <FormInput
                      name="signNom"
                      label="Nom et prénom"
                      value={signNom}
                      onChange={(e) => setSignNom(e.target.value)}
                      placeholder="Nom Prénom"
                    />
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={genererTexte}
                    disabled={!etudiant || !anneeId || !inscription}
                  >
                    Générer le modèle
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={telechargerPdf}
                  >
                    Télécharger en PDF
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Colonne aperçu ──────────────────────────────────────── */}
          <div className="col-12 col-xl-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-secondary text-white fw-semibold">
                Aperçu du document
              </div>
              <div
                className="card-body bg-light p-3"
                style={{ overflowY: 'auto' }}
              >
                {/* Feuille A4 simulée */}
                <div
                  className="mx-auto"
                  style={{
                    maxWidth: '210mm',
                    minHeight: '285mm',
                    background: '#fff',
                    padding: '20mm 20mm 18mm',
                    boxShadow: '0 4px 18px rgba(0,0,0,0.13)',
                    display: 'flex',
                    flexDirection: 'column',
                    fontFamily: "'Times New Roman', Times, serif",
                    fontSize: '11pt',
                    lineHeight: 1.55,
                    color: '#111',
                  }}
                >
                  {/* En-tête */}
                  <div style={{ textAlign: 'center', marginBottom: '5mm' }}>
                    <div style={{
                      fontWeight: 700,
                      fontSize: '12pt',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}>
                      {ecoleNom || <span style={{ color: '#bbb', fontStyle: 'italic' }}>Nom de l'école</span>}
                    </div>
                  </div>

                  {/* Filet double noir */}
                  <div style={{ borderTop: '1.5px solid #1a1a1a', marginBottom: '2px' }} />
                  <div style={{ borderTop: '0.5px solid #444', marginBottom: '8mm' }} />

                  {/* Titre */}
                  <div style={{ textAlign: 'center', marginBottom: '2mm' }}>
                    <span style={{
                      fontWeight: 700,
                      fontSize: '14pt',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}>
                      {certTypeLibelle}
                    </span>
                  </div>
                  <div style={{
                    width: '58%',
                    borderBottom: '1px solid #333',
                    margin: '0 auto 8mm',
                  }} />

                  {/* Référence */}
                  <div style={{
                    textAlign: 'right',
                    fontSize: '8pt',
                    color: '#777',
                    marginBottom: '6mm',
                  }}>
                    Réf. : {numeroAffiche}
                  </div>

                  {/* Corps */}
                  <div style={{ flex: 1, whiteSpace: 'pre-wrap', textAlign: 'justify' }}>
                    {corps.trim() ? (
                      corps.trim()
                    ) : (
                      <span style={{ color: '#bbb', fontStyle: 'italic' }}>
                        Le texte apparaîtra ici après génération ou saisie manuelle.
                      </span>
                    )}
                  </div>

                  {/* Lieu et date */}
                  <div style={{
                    textAlign: 'right',
                    marginTop: '10mm',
                    fontSize: '10pt',
                  }}>
                    {lieu || 'Ouagadougou'}, le{' '}
                    {dateEmission
                      ? new Date(dateEmission + 'T12:00:00').toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })
                      : '_______________'}
                  </div>

                  {/* Signataire */}
                  <div style={{ textAlign: 'right', marginTop: '12mm' }}>
                    {signFonction.trim() && (
                      <div style={{ fontSize: '10pt' }}>{signFonction.trim()}</div>
                    )}
                    {signNom.trim() && (
                      <div style={{ fontWeight: 700, marginTop: '2mm', fontSize: '10pt' }}>
                        {signNom.trim()}
                      </div>
                    )}
                    <div style={{
                      borderBottom: '0.5px solid #555',
                      width: '55mm',
                      marginLeft: 'auto',
                      marginTop: '8mm',
                    }} />
                  </div>

                  {/* Pied de page */}
                  <div style={{
                    borderTop: '0.5px solid #ccc',
                    marginTop: '10mm',
                    paddingTop: '3mm',
                    textAlign: 'center',
                    fontSize: '7pt',
                    color: '#aaa',
                    fontStyle: 'italic',
                  }}>
                    Document officiel — à conserver et à présenter sur demande
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
