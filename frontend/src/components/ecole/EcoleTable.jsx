import EcoleTableRow from './EcoleTableRow';

export default function EcoleTable({
  data,
  emptyMessage = 'Aucune école ne correspond à la recherche.',
  onEdit,
  onDelete,
  busyId,
}) {
  const items = Array.isArray(data) ? data : [];

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-dark text-white fw-semibold fs-6">Liste des écoles</div>
      <div className="table-responsive">
        <table className="table table-striped table-hover table-bordered align-middle mb-0">
          <thead className="table-dark text-center">
            <tr>
              <th style={{ width: '50px' }}>N°</th>
              <th>Libellé</th>
              <th>Adresse</th>
              <th style={{ width: '120px' }}>Téléphone</th>
              <th>Email</th>
              <th style={{ width: '200px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((ecole, index) => (
                <EcoleTableRow
                  key={ecole?.id ?? index}
                  ecole={ecole}
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
