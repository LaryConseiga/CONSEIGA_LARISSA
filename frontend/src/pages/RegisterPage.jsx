import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/FormInput';
import { IconAlert, IconPersonPlusFill } from '../components/Icons';
import logoImage from '../assets/image.png';
import './LoginPage.css';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form,    setForm]    = useState({ nom: '', email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const nom   = form.nom.trim();
      const email = form.email.trim();
      if (!nom || !email || !form.password) { setError('Nom, email et mot de passe requis.'); return; }
      const res  = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Impossible de créer le compte.');
      await login(email, form.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err?.message || "Erreur d'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="text-center mb-4">
          <img src={logoImage} alt="Institut 2iE" className="login-logo" />
        </div>

        <div className="login-card-header">
          <h2 className="login-card-title">Inscription</h2>
          <p className="login-card-subtitle">Créez votre compte en quelques secondes</p>
        </div>

        {error && (
          <div className="alert alert-danger border-0 d-flex align-items-center gap-2 py-2 small mb-3" role="alert">
            <IconAlert size={14} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <FormInput id="nom" name="nom" label="Nom complet" type="text"
            value={form.nom} onChange={handleChange} required autoComplete="name" placeholder="Votre nom" />
          <FormInput id="email" name="email" label="Adresse email" type="email"
            value={form.email} onChange={handleChange} required autoComplete="email" placeholder="votre.email@2ie-edu.org" />
          <FormInput id="password" name="password" label="Mot de passe" type="password"
            value={form.password} onChange={handleChange} required autoComplete="new-password" placeholder="••••••••••" className="mb-4" />

          <button type="submit" className="btn btn-danger w-100 login-submit-btn d-flex align-items-center justify-content-center gap-2" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                Création du compte…
              </>
            ) : (
              <>
                <IconPersonPlusFill size={15} />
                Créer mon compte
              </>
            )}
          </button>
        </form>

        <div className="login-card-footer">
          Déjà inscrit ?{' '}
          <Link to="/login" className="login-register-link">Se connecter</Link>
        </div>
      </div>
    </div>
  );
}
