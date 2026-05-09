import { IconClock, IconInbox, IconPersonPlusFill, IconClipboardCheckFill, IconPencil, IconTrash, IconBell } from '../Icons';
import './ActivitesRecentes.css';

const ACTIVITES_DEMO = [
  { id: '1', libelle: 'Étudiant ajouté : Kaboré Ali',        date: "À l'instant" },
  { id: '2', libelle: 'Étudiant inscrit : Ouédraogo Mariam', date: 'Il y a 2 h' },
  { id: '3', libelle: 'École modifiée : 2iE',                date: 'Il y a 5 h' },
];

function IconForLabel({ libelle = '' }) {
  const l = libelle.toLowerCase();
  if (l.includes('ajouté'))  return { Comp: IconPersonPlusFill,     color: '#198754' };
  if (l.includes('inscrit')) return { Comp: IconClipboardCheckFill, color: '#0d6efd' };
  if (l.includes('modifi'))  return { Comp: IconPencil,             color: '#fd7e14' };
  if (l.includes('supprim')) return { Comp: IconTrash,              color: '#dc3545' };
  return                            { Comp: IconBell,               color: '#6c757d' };
}

export default function ActivitesRecentes({ activites = ACTIVITES_DEMO }) {
  return (
    <section className="activites-recentes-section">
      <div className="d-flex align-items-center gap-2 mb-3">
        <IconClock style={{ color: 'var(--app-primary, #dc3545)', fontSize: '1rem' }} />
        <h2 className="h6 fw-bold mb-0" style={{ color: 'var(--app-text, #1a1d23)' }}>
          Activités récentes
        </h2>
      </div>

      <div className="card border-0 activites-card">
        {activites.length === 0 ? (
          <div className="activites-empty">
            <IconInbox className="text-muted d-block mb-2" size={28} />
            <p className="text-muted mb-0 small">Aucune activité récente.</p>
          </div>
        ) : (
          <ul className="activites-list mb-0 ps-0 list-unstyled">
            {activites.map(({ id, libelle, date }, idx) => {
              const { Comp, color } = IconForLabel({ libelle });
              const isLast = idx === activites.length - 1;
              return (
                <li key={id} className={`activite-item d-flex gap-3 align-items-start${isLast ? ' activite-item--last' : ''}`}>
                  <div className="activite-timeline">
                    <div
                      className="activite-dot d-flex align-items-center justify-content-center rounded-circle"
                      style={{ background: `${color}18`, color }}
                    >
                      <Comp size={10} />
                    </div>
                    {!isLast && <div className="activite-line"></div>}
                  </div>
                  <div className="activite-content flex-grow-1 pb-3">
                    <p className="activite-libelle mb-0">{libelle}</p>
                    {date && <time className="activite-date">{date}</time>}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
