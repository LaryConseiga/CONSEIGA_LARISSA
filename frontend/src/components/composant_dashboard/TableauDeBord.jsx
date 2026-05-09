import Header from './header';
import Stats from './stat.jsx';
import ActivitesRecentes from './ActivitesRecentes.jsx';
import ActionsRapides from './ActionsRapides.jsx';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDashboardActivitesRecentes, getDashboardStats } from '../../services/serviceDashboard';
import { IconAlert } from '../Icons';

export default function TableauDeBord() {
  const { getToken } = useAuth();
  const [stats,    setStats]    = useState(null);
  const [activites, setActivites] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    const token = getToken();

    Promise.allSettled([
      getDashboardStats(token),
      getDashboardActivitesRecentes(token, { limit: 6 }),
    ]).then(([statsRes, actRes]) => {
      if (cancelled) return;

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value);
      } else {
        setStats(null);
        setError(statsRes.reason?.message || 'Impossible de charger les statistiques.');
      }

      setActivites(
        actRes.status === 'fulfilled' && Array.isArray(actRes.value)
          ? actRes.value
          : []
      );
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [getToken]);

  return (
    <div className="d-flex flex-column flex-grow-1 w-100 min-vh-0"
      style={{ background: 'var(--app-page-bg, #f4f6f9)' }}
    >
      {/* En-tête avec salutation */}
      <Header />

      {/* Contenu principal */}
      <main
        className="flex-grow-1 container-fluid px-3 px-lg-4 py-4"
        aria-label="Contenu du tableau de bord"
      >
        {/* Actions rapides */}
        <ActionsRapides />

        {/* Alerte erreur */}
        {error ? (
          <div className="alert alert-warning border-0 py-2 small mb-3 d-flex align-items-center gap-2" role="alert">
            <IconAlert size={14} style={{ flexShrink: 0 }} />
            {error}
          </div>
        ) : null}

        {/* Statistiques */}
        {loading ? (
          <div className="d-flex align-items-center gap-2 text-muted mb-4 py-2">
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span className="small">Chargement des statistiques…</span>
          </div>
        ) : (
          <Stats
            totalEtudiants={stats?.totalEtudiants ?? '—'}
            nombreEcoles={stats?.nombreEcoles ?? '—'}
            inscriptionsCetteAnnee={stats?.inscriptionsCetteAnnee ?? '—'}
            filieresActives={stats?.filieresActives ?? '—'}
          />
        )}

        {/* Activités récentes */}
        <ActivitesRecentes activites={activites} />
      </main>
    </div>
  );
}
