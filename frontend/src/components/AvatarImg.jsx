import { useState } from 'react';

/**
 * Avatar généré depuis ui-avatars.com.
 * L'URL est construite à partir du nom — elle change automatiquement
 * quand le nom change, donc l'image se met à jour en temps réel.
 */
export default function AvatarImg({ nom, size = 64, className = '', style = {} }) {
  const [erreur, setErreur] = useState(false);

  const nameEncoded = encodeURIComponent((nom || '?').trim());
  const src = `https://ui-avatars.com/api/?name=${nameEncoded}&background=dc3545&color=ffffff&bold=true&size=${size * 2}&format=png`;

  function initiales(n) {
    if (!n || typeof n !== 'string') return '?';
    const parts = n.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return n.slice(0, 2).toUpperCase();
  }

  if (erreur) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'linear-gradient(135deg,#dc3545,#b02a37)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: size * 0.35,
          userSelect: 'none',
          flexShrink: 0,
          ...style,
        }}
        aria-label={`Avatar de ${nom}`}
      >
        {initiales(nom)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`Avatar de ${nom}`}
      width={size}
      height={size}
      className={className}
      style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0, ...style }}
      onError={() => setErreur(true)}
    />
  );
}
