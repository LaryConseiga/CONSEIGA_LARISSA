function fmtDate(d) {
  if (!d) return '—';
  const s = String(d);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

function fmtTs(t) {
  if (!t) return '—';
  try {
    return new Date(t).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return String(t);
  }
}

export default function EtudiantTableRow({ etudiant, index, onEdit, onDelete, busyId }) {
  const busy = busyId === etudiant.id;

  return (
    <tr>
      <td className="text-center text-muted">{index + 1}</td>
      <td className="fw-medium text-nowrap">{etudiant.nom}</td>
      <td className="text-nowrap">{etudiant.prenoms}</td>
      <td className="small">{etudiant.pays_libelle || '—'}</td>
      <td className="small">{etudiant.civilite_libelle || '—'}</td>
      <td className="small text-nowrap">{fmtDate(etudiant.dateNaissance)}</td>
      <td className="small">{etudiant.email || '—'}</td>
      <td className="small">{etudiant.telephone || '—'}</td>
      <td className="small text-muted text-nowrap">{fmtTs(etudiant.created_at)}</td>
      <td className="small text-muted text-nowrap">{fmtTs(etudiant.updated_at)}</td>
      <td className="text-center text-nowrap">
        <button
          type="button"
          className="btn btn-sm btn-outline-primary me-1"
          onClick={() => onEdit(etudiant)}
          disabled={busy}
        >
          Modifier
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-danger"
          onClick={() => onDelete(etudiant)}
          disabled={busy}
        >
          {busy ? '…' : 'Supprimer'}
        </button>
      </td>
    </tr>
  );
}
