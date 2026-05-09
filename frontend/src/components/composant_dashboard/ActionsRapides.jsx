import { Link } from 'react-router-dom';
import { IconPersonPlusFill, IconClipboardPlusFill, IconBuildings } from '../Icons';

const ACTIONS = [
  { to: '/etudiants/ajouter',  label: 'Ajouter un étudiant',  Icon: IconPersonPlusFill,    variant: 'btn-danger' },
  { to: '/etudiants/inscrire', label: 'Inscrire un étudiant', Icon: IconClipboardPlusFill, variant: 'btn-outline-danger' },
  { to: '/ressources/ecoles',  label: 'Gérer les écoles',     Icon: IconBuildings,         variant: 'btn-outline-danger' },
];

export default function ActionsRapides() {
  return (
    <section className="mb-4">
      <div className="d-flex flex-wrap gap-2">
        {ACTIONS.map(({ to, label, Icon, variant }) => (
          <Link
            key={to}
            to={to}
            className={`btn ${variant} d-inline-flex align-items-center gap-2 rounded-pill px-4`}
            style={{ fontWeight: 600, fontSize: '0.875rem' }}
          >
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </div>
    </section>
  );
}
