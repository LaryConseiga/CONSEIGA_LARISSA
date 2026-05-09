import EtudiantTableRow from './EtudiantTableRow';

export default function EtudiantTable({
  data,
  emptyMessage = 'Aucun étudiant ne correspond à la recherche.',
  onEdit,
  onDelete,
  busyId,
}) {
  const items = Array.isArray(data) ? data : [];

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-dark text-white fw-semibold fs-6">Liste des étudiants</div>
      <div className="table-responsive">
        <table className="table table-striped table-hover table-bordered align-middle mb-0 small">
          <thead className="table-dark text-center">
            <tr>
              <th style={{ width: '36px' }}>N°</th>
              <th>Nom</th>
              <th>Prénoms</th>
              <th>Pays</th>
              <th>Civilité</th>
              <th>Naissance</th>
              <th>Email</th>
              <th>Tél.</th>
              <th>Créé</th>
              <th>Maj</th>
              <th style={{ width: '170px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((e, index) => (
                <EtudiantTableRow
                  key={e?.id ?? index}
                  etudiant={e}
                  index={index}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  busyId={busyId}
                />
              ))
            ) : (
              <tr>
                <td colSpan={11} className="text-center text-muted py-5 fs-5">
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
