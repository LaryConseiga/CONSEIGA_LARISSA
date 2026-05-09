export default function PaysTableRow({ pays, index, onEdit, onDelete, busyId }) {
  const busy = busyId === pays.id;

  return (
    <tr>
      <td className="text-center text-muted">{index + 1}</td>
      <td className="fw-medium">{pays.libelle}</td>
      <td className="small">{pays.nationalite || '—'}</td>
      <td className="small text-nowrap">{pays.code || '—'}</td>
      <td className="small text-nowrap">{pays.iso || '—'}</td>
      <td className="text-center text-nowrap">
        <button
          type="button"
          className="btn btn-sm btn-outline-primary me-1"
          onClick={() => onEdit(pays)}
          disabled={busy}
        >
          Modifier
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-danger"
          onClick={() => onDelete(pays)}
          disabled={busy}
        >
          {busy ? '…' : 'Supprimer'}
        </button>
      </td>
    </tr>
  );
}
