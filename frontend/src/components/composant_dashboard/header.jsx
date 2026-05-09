import { useAuth } from '../../context/AuthContext';
import { IconMortarboardFill } from '../Icons';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bonjour';
  if (h < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

function formatDateFr() {
  return new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day:     'numeric',
    month:   'long',
    year:    'numeric',
  });
}

export default function Header() {
  const { user } = useAuth();
  const prenom = user?.nom?.trim().split(/\s+/)[0] ?? '';

  return (
    <header className="dashboard-header px-3 px-lg-4 pt-4 pb-0">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div>
          <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--app-text, #1a1d23)' }}>
            {getGreeting()}{prenom ? `, ${prenom}` : ''}&nbsp;
            <span style={{ color: 'var(--app-primary, #dc3545)' }}>!</span>
          </h1>
        </div>

        <span
          className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill fw-semibold small"
          style={{
            background: 'var(--app-primary-bg, rgba(220,53,69,0.08))',
            color:      'var(--app-primary-dark, #b02a37)',
            border:     '1px solid rgba(220,53,69,0.18)',
          }}
        >
          <IconMortarboardFill size={14} />
          Institut 2iE
        </span>
      </div>

      <hr className="mt-3 mb-0" style={{ borderColor: 'var(--app-border, #e9ecef)', opacity: 1 }} />
    </header>
  );
}
