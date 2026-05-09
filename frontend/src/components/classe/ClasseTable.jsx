import ClasseTableRow from './ClasseTableRow';

export default function ClasseTable({
  data,
  emptyMessage = 'Aucune classe ne correspond à la recherche.',
  onEdit,
  onDelete,
  busyId,
}) {
  const items = Array.isArray(data) ? data : [];

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-dark text-white fw-semibold fs-6">Liste des classes</div>
      <div className="table-responsive">
        <table className="table table-striped table-hover table-bordered align-middle mb-0 small">
          <thead className="table-dark text-center">
            <tr>
              <th style={{ width: '36px' }}>N°</th>
              <th>Libellé</th>
              <th>Filière</th>
              <th>Niveau</th>
              <th>Année académique</th>
              <th>Créé</th>
              <th>Maj</th>
              <th style={{ width: '170px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((c, index) => (
                <ClasseTableRow
                  key={c?.id ?? index}
                  classe={c}
                  index={index}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  busyId={busyId}
                />
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center text-muted py-5 fs-5">
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
