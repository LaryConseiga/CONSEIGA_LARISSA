import NiveauTableRow from './NiveauTableRow';

export default function NiveauTable({
  data,
  emptyMessage = 'Aucun niveau ne correspond à la recherche.',
  onEdit,
  onDelete,
  busyId,
}) {
  const items = Array.isArray(data) ? data : [];

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-dark text-white fw-semibold fs-6">Liste des niveaux</div>
      <div className="table-responsive">
        <table className="table table-striped table-hover table-bordered align-middle mb-0">
          <thead className="table-dark text-center">
            <tr>
              <th style={{ width: '50px' }}>N°</th>
              <th>Libellé</th>
              <th style={{ width: '100px' }}>Ordre</th>
              <th style={{ width: '200px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((niveau, index) => (
                <NiveauTableRow
                  key={niveau?.id ?? index}
                  niveau={niveau}
                  index={index}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  busyId={busyId}
                />
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center text-muted py-5 fs-5">
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
