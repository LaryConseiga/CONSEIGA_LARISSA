import './stat.css';

const STAT_ITEMS = (t, e, i, f) => [
  {
    label: "Total étudiants",
    value: t,
    icon:  'bi-people-fill',
    desc:  'Étudiants enregistrés',
  },
  {
    label: "Établissements",
    value: e,
    icon:  'bi-buildings-fill',
    desc:  'Écoles actives',
  },
  {
    label: "Inscriptions",
    value: i,
    icon:  'bi-clipboard2-check-fill',
    desc:  'Cette année académique',
  },
  {
    label: "Filières actives",
    value: f,
    icon:  'bi-diagram-3-fill',
    desc:  'Programmes disponibles',
  },
];

export default function Stats({
  totalEtudiants       = '—',
  nombreEcoles         = '—',
  inscriptionsCetteAnnee = '—',
  filieresActives      = '—',
} = {}) {
  const items = STAT_ITEMS(totalEtudiants, nombreEcoles, inscriptionsCetteAnnee, filieresActives);

  return (
    <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3 mb-4">
      {items.map((item) => (
        <div key={item.label} className="col">
          <div className="stat-card card h-100 border-0">
            <div className="card-body d-flex align-items-center gap-3 p-3">
              {/* Icône */}
              <div className="stat-card-icon" aria-hidden="true">
                <i className={`bi ${item.icon}`}></i>
              </div>
              {/* Texte */}
              <div className="stat-card-body">
                <p className="stat-card-label mb-1">{item.label}</p>
                <p className="stat-card-value mb-0">{item.value}</p>
                <p className="stat-card-desc mb-0">{item.desc}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
