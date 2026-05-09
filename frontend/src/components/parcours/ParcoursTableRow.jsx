export default function ParcoursTableRow({ parcours, index, onEdit, onDelete, busyId }) {
  const busy = busyId === parcours.id;

  return (
    <tr>
      <td className="text-center text-muted">{index + 1}</td>
      <td className="fw-medium">{parcours.libelle}</td>
      <td className="small">{parcours.specialite_libelle || '—'}</td>
      <td className="small">{parcours.niveau_libelle || '—'}</td>
      <td className="small">{parcours.cycle_libelle || '—'}</td>
      <td className="text-center text-nowrap">
        <button
          type="button"
          className="btn btn-sm btn-outline-primary me-1"
          onClick={() => onEdit(parcours)}
          disabled={busy}
        >
          Modifier
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-danger"
          onClick={() => onDelete(parcours)}
          disabled={busy}
        >
          {busy ? '…' : 'Supprimer'}
        </button>
      </td>
    </tr>
  );
}
