export default function FiliereTableRow({ filiere, index, onEdit, onDelete, busyId }) {
  const busy = busyId === filiere.id;

  return (
    <tr>
      <td className="text-center text-muted">{index + 1}</td>
      <td className="text-nowrap">{filiere.code || '—'}</td>
      <td className="fw-medium">{filiere.libelle}</td>
      <td className="small">{filiere.description || '—'}</td>
      <td className="text-center text-nowrap">
        <button
          type="button"
          className="btn btn-sm btn-outline-primary me-1"
          onClick={() => onEdit(filiere)}
          disabled={busy}
        >
          Modifier
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-danger"
          onClick={() => onDelete(filiere)}
          disabled={busy}
        >
          {busy ? '…' : 'Supprimer'}
        </button>
      </td>
    </tr>
  );
}
