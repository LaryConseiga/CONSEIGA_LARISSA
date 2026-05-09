function fmtDate(d) {
  if (!d) return '—';
  const s = String(d);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

export default function AnneeAcademiqueTableRow({ annee, index, onEdit, onDelete, busyId }) {
  const busy = busyId === annee.id;
  const active = Boolean(Number(annee.est_active));

  return (
    <tr>
      <td className="text-center text-muted">{index + 1}</td>
      <td className="fw-medium">{annee.libelle}</td>
      <td className="small text-nowrap">{fmtDate(annee.date_debut)}</td>
      <td className="small text-nowrap">{fmtDate(annee.date_fin)}</td>
      <td className="text-center">
        {active ? (
          <span className="badge text-bg-success">Active</span>
        ) : (
          <span className="badge text-bg-secondary">Non</span>
        )}
      </td>
      <td className="text-center text-nowrap">
        <button
          type="button"
          className="btn btn-sm btn-outline-primary me-1"
          onClick={() => onEdit(annee)}
          disabled={busy}
        >
          Modifier
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-danger"
          onClick={() => onDelete(annee)}
          disabled={busy}
        >
          {busy ? '…' : 'Supprimer'}
        </button>
      </td>
    </tr>
  );
}
