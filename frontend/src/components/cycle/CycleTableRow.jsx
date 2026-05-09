export default function CycleTableRow({ cycle, index, onEdit, onDelete, busyId }) {
  const busy = busyId === cycle.id;

  return (
    <tr>
      <td className="text-center text-muted">{index + 1}</td>
      <td className="fw-medium">{cycle.libelle}</td>
      <td className="text-center text-nowrap">{cycle.duree_annees}</td>
      <td className="text-center text-nowrap">
        <button
          type="button"
          className="btn btn-sm btn-outline-primary me-1"
          onClick={() => onEdit(cycle)}
          disabled={busy}
        >
          Modifier
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-danger"
          onClick={() => onDelete(cycle)}
          disabled={busy}
        >
          {busy ? '…' : 'Supprimer'}
        </button>
      </td>
    </tr>
  );
}
