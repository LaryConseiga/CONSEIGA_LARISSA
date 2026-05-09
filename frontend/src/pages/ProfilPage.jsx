import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AvatarImg from '../components/AvatarImg';
import { IconAlert, IconShieldCheck, IconInfoCircle, IconLock, IconEnvelope, IconId } from '../components/Icons';
import './ProfilPage.css';

function InfoRow({ icon: IconComp, label, value }) {
  return (
    <div className="profil-info-row">
      <div className="profil-info-icon" aria-hidden="true">
        <IconComp size={14} />
      </div>
      <div className="profil-info-body">
        <span className="profil-info-label">{label}</span>
        <span className="profil-info-value">{value || '—'}</span>
      </div>
    </div>
  );
}

export default function ProfilPage() {
  const { user, getToken } = useAuth();
  const [profil,  setProfil]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const chargerProfil = useCallback(async () => {
    const token = getToken();
    if (!token) { setProfil(null); setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.message || `Erreur ${res.status}`);
        setProfil(user);
      } else {
        setProfil(await res.json());
      }
    } catch {
      setError('Impossible de joindre le serveur.');
      setProfil(user);
    } finally {
      setLoading(false);
    }
  }, [getToken, user]);

  useEffect(() => { chargerProfil(); }, [chargerProfil]);

  return (
    <div className="profil-page">
      <div className="profil-page-topbar px-3 px-lg-4 pt-4 pb-3">
        <h1 className="h4 fw-bold mb-0" style={{ color: 'var(--app-text, #1a1d23)' }}>Mon profil</h1>
        <p className="small mb-0" style={{ color: 'var(--app-text-muted, #6c757d)' }}>
          Informations liées à votre compte
        </p>
      </div>

      <div className="profil-body px-3 px-lg-4 pb-5">
        {error ? (
          <div className="alert alert-warning border-0 d-flex align-items-center gap-2 py-2 small mb-4" role="alert">
            <IconAlert size={14} style={{ flexShrink: 0 }} />
            {error} — affichage des données en cache.
          </div>
        ) : null}

        {loading ? (
          <div className="profil-loading">
            <div className="profil-loading-cover"></div>
            <div className="profil-loading-body">
              <div className="profil-skeleton profil-skeleton--avatar mx-auto"></div>
              <div className="profil-skeleton profil-skeleton--title mx-auto mt-3"></div>
              <div className="profil-skeleton profil-skeleton--sub mx-auto mt-2"></div>
            </div>
          </div>
        ) : profil ? (
          <div className="profil-card">
            <div className="profil-cover" aria-hidden="true"></div>

            <div className="profil-identity">
              {/* Avatar web — se met à jour automatiquement si le nom change */}
              <AvatarImg
                nom={profil.nom}
                size={88}
                style={{ border: '4px solid #fff', boxShadow: '0 4px 16px rgba(220,53,69,0.3)' }}
              />
              <div className="profil-identity-text">
                <h2 className="profil-name">{profil.nom}</h2>
                <span className="profil-role-badge">
                  <IconShieldCheck size={11} style={{ marginRight: '0.25rem' }} />
                  Administrateur
                </span>
              </div>
            </div>

            <hr className="profil-divider" />

            <div className="profil-section-title">
              <IconInfoCircle size={13} style={{ color: 'var(--app-primary, #dc3545)', marginRight: '0.5rem' }} />
              Informations du compte
            </div>

            <div className="profil-info-list">
              <InfoRow icon={IconEnvelope} label="Adresse email"     value={profil.email} />
              <InfoRow icon={IconId}       label="Identifiant système" value={`#${profil.id}`} />
            </div>

            <div className="profil-card-footer">
              <span className="profil-footer-note">
                <IconLock size={11} style={{ color: 'var(--app-primary, #dc3545)', flexShrink: 0, marginTop: 1 }} />
                Pour modifier vos informations, contactez l&apos;administration.
              </span>
            </div>
          </div>
        ) : (
          <p className="text-muted small">Aucune information de profil disponible.</p>
        )}
      </div>
    </div>
  );
}
