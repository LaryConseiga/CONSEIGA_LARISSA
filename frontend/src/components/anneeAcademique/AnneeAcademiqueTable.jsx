import AnneeAcademiqueTableRow from './AnneeAcademiqueTableRow';

export default function AnneeAcademiqueTable({
  data,
  emptyMessage = 'Aucune année ne correspond à la recherche.',
  onEdit,
  onDelete,
  busyId,
}) {
  const items = Array.isArray(data) ? data : [];

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-dark text-white fw-semibold fs-6">Années académiques</div>
      <div className="table-responsive">
        <table className="table table-striped table-hover table-bordered align-middle mb-0 small">
          <thead className="table-dark text-center">
            <tr>
              <th style={{ width: '36px' }}>N°</th>
              <th>Libellé</th>
              <th>Début</th>
              <th>Fin</th>
              <th>Active</th>
              <th style={{ width: '170px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((a, index) => (
                <AnneeAcademiqueTableRow
                  key={a?.id ?? index}
                  annee={a}
                  index={index}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  busyId={busyId}
                />
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center text-muted py-5 fs-5">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
