import InscriptionTableRow from './InscriptionTableRow';

export default function InscriptionTable({
  data,
  emptyMessage = 'Aucune inscription ne correspond à la recherche.',
  onEdit,
  onDelete,
  busyId,
}) {
  const items = Array.isArray(data) ? data : [];

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-dark text-white fw-semibold fs-6">Liste des inscriptions</div>
      <div className="table-responsive">
        <table className="table table-striped table-hover table-bordered align-middle mb-0 small">
          <thead className="table-dark text-center">
            <tr>
              <th style={{ width: '40px' }}>N°</th>
              <th>Étudiant</th>
              <th>Parcours</th>
              <th>Année acad.</th>
              <th>Décision</th>
              <th style={{ width: '110px' }}>Date inscr.</th>
              <th style={{ width: '130px' }}>Créé le</th>
              <th style={{ width: '170px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((row, index) => (
                <InscriptionTableRow
                  key={row?.id ?? index}
                  inscription={row}
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
