import ParcoursTableRow from './ParcoursTableRow';

export default function ParcoursTable({
  data,
  emptyMessage = 'Aucun parcours ne correspond à la recherche.',
  onEdit,
  onDelete,
  busyId,
}) {
  const items = Array.isArray(data) ? data : [];

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-dark text-white fw-semibold fs-6">Liste des parcours</div>
      <div className="table-responsive">
        <table className="table table-striped table-hover table-bordered align-middle mb-0 small">
          <thead className="table-dark text-center">
            <tr>
              <th style={{ width: '44px' }}>N°</th>
              <th>Libellé</th>
              <th>Spécialité</th>
              <th>Niveau</th>
              <th>Cycle</th>
              <th style={{ width: '180px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((p, index) => (
                <ParcoursTableRow
                  key={p?.id ?? index}
                  parcours={p}
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
