import AvatarImg from '../AvatarImg';
import { IconPencil, IconTrash } from '../Icons';
import './Trombinoscope.css';

function fmtDate(d) {
  if (!d) return null;
  const s = String(d);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

function CarteEtudiant({ etudiant, onEdit, onDelete, busyId }) {
  const busy   = busyId === etudiant.id;
  const nom    = [etudiant.nom, etudiant.prenoms].filter(Boolean).join(' ');
  const ddn    = fmtDate(etudiant.dateNaissance);

  return (
    <div className="trombi-carte">
      {/* Avatar */}
      <div className="trombi-avatar-zone">
        <AvatarImg nom={nom || '?'} size={72} className="trombi-avatar" />
      </div>

      {/* Infos */}
      <div className="trombi-infos">
        <p className="trombi-nom">{etudiant.nom || '—'}</p>
        <p className="trombi-prenoms">{etudiant.prenoms || '—'}</p>

        {etudiant.civilite_libelle ? (
          <span className="trombi-badge">{etudiant.civilite_libelle}</span>
        ) : null}

        <ul className="trombi-details">
          {etudiant.email ? (
            <li title={etudiant.email}>
              <span className="trombi-detail-icon">@</span>
              <span className="trombi-detail-val text-truncate">{etudiant.email}</span>
            </li>
          ) : null}
          {etudiant.pays_libelle ? (
            <li>
              <span className="trombi-detail-icon">🌍</span>
              <span className="trombi-detail-val">{etudiant.pays_libelle}</span>
            </li>
          ) : null}
          {ddn ? (
            <li>
              <span className="trombi-detail-icon">🎂</span>
              <span className="trombi-detail-val">{ddn}</span>
            </li>
          ) : null}
        </ul>
      </div>

      {/* Actions */}
      <div className="trombi-actions">
        <button
          type="button"
          className="trombi-btn trombi-btn-edit"
          onClick={() => onEdit(etudiant)}
          disabled={busy}
          title="Modifier"
        >
          <IconPencil size={13} />
          Modifier
        </button>
        <button
          type="button"
          className="trombi-btn trombi-btn-delete"
          onClick={() => onDelete(etudiant)}
          disabled={busy}
          title="Supprimer"
        >
          {busy ? '…' : <><IconTrash size={13} /> Supprimer</>}
        </button>
      </div>
    </div>
  );
}

export default function Trombinoscope({ data, emptyMessage, onEdit, onDelete, busyId }) {
  const items = Array.isArray(data) ? data : [];

  if (items.length === 0) {
    return (
      <div className="trombi-vide">
        <p className="text-muted small">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="trombi-grille">
      {items.map((e, i) => (
        <CarteEtudiant
          key={e?.id ?? i}
          etudiant={e}
          onEdit={onEdit}
          onDelete={onDelete}
          busyId={busyId}
        />
      ))}
    </div>
  );
}
