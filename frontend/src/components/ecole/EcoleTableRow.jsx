export default function EcoleTableRow({ ecole, index, onEdit, onDelete, busyId }) {
  const busy = busyId === ecole.id;

  return (
    <tr>
      <td className="text-center text-muted">{index + 1}</td>
      <td className="fw-medium">{ecole.libelle}</td>
      <td className="small">{ecole.adresse || '—'}</td>
      <td className="text-nowrap">{ecole.telephone || '—'}</td>
      <td className="small">{ecole.email || '—'}</td>
      <td className="text-center text-nowrap">
        <button
          type="button"
          className="btn btn-sm btn-outline-primary me-1"
          onClick={() => onEdit(ecole)}
          disabled={busy}
        >
          Modifier
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-danger"
          onClick={() => onDelete(ecole)}
          disabled={busy}
        >
          {busy ? '…' : 'Supprimer'}
        </button>
      </td>
    </tr>
  );
}
