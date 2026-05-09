function fmtTs(t) {
  if (!t) return '—';
  try {
    return new Date(t).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return String(t);
  }
}

export default function ClasseTableRow({ classe, index, onEdit, onDelete, busyId }) {
  const busy = busyId === classe.id;

  return (
    <tr>
      <td className="text-center text-muted">{index + 1}</td>
      <td className="fw-medium">{classe.libelle}</td>
      <td className="small">{classe.filiere_libelle || '—'}</td>
      <td className="small">{classe.niveau_libelle || '—'}</td>
      <td className="small">{classe.annee_academique_libelle || '—'}</td>
      <td className="small text-muted text-nowrap">{fmtTs(classe.created_at)}</td>
      <td className="small text-muted text-nowrap">{fmtTs(classe.updated_at)}</td>
      <td className="text-center text-nowrap">
        <button
          type="button"
          className="btn btn-sm btn-outline-primary me-1"
          onClick={() => onEdit(classe)}
          disabled={busy}
        >
          Modifier
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-danger"
          onClick={() => onDelete(classe)}
          disabled={busy}
        >
          {busy ? '…' : 'Supprimer'}
        </button>
      </td>
    </tr>
  );
}
