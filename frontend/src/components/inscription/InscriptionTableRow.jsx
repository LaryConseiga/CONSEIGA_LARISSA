function fmtDate(d) {
  if (!d) return '—';
  const s = String(d);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

function fmtTs(t) {
  if (!t) return '—';
  try {
    return new Date(t).toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return String(t);
  }
}

export default function InscriptionTableRow({ inscription, index, onEdit, onDelete, busyId }) {
  const busy = busyId === inscription.id;

  return (
    <tr>
      <td className="text-center text-muted">{index + 1}</td>
      <td className="small">{inscription.etudiant_libelle?.trim() || '—'}</td>
      <td className="small">{inscription.parcours_libelle || '—'}</td>
      <td className="small">{inscription.annee_libelle || '—'}</td>
      <td className="small">{inscription.decision_libelle || '—'}</td>
      <td className="text-nowrap small">{fmtDate(inscription.dateInscription)}</td>
      <td className="text-nowrap small text-muted">{fmtTs(inscription.created_at)}</td>
      <td className="text-center text-nowrap">
        <button
          type="button"
          className="btn btn-sm btn-outline-primary me-1"
          onClick={() => onEdit(inscription)}
          disabled={busy}
        >
          Modifier
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-danger"
          onClick={() => onDelete(inscription)}
          disabled={busy}
        >
          {busy ? '…' : 'Supprimer'}
        </button>
      </td>
    </tr>
  );
}
