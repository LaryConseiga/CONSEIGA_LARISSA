export default function SpecialiteTableRow({ specialite, index, onEdit, onDelete, busyId }) {
  const busy = busyId === specialite.id;

  return (
    <tr>
      <td className="text-center text-muted">{index + 1}</td>
      <td className="fw-medium">{specialite.libelle}</td>
      <td className="small">{specialite.filiere_libelle || '—'}</td>
      <td className="small">{specialite.description || '—'}</td>
      <td className="text-center text-nowrap">
        <button
          type="button"
          className="btn btn-sm btn-outline-primary me-1"
          onClick={() => onEdit(specialite)}
          disabled={busy}
        >
          Modifier
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-danger"
          onClick={() => onDelete(specialite)}
          disabled={busy}
        >
          {busy ? '…' : 'Supprimer'}
        </button>
      </td>
    </tr>
  );
}
