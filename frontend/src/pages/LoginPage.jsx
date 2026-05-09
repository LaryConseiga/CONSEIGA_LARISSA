import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/FormInput';
import { IconAlert, IconEye, IconEyeSlash, IconLogin } from '../components/Icons';
import logoImage from '../assets/image.png';
import './LoginPage.css';

export default function LoginPage() {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const [form,     setForm]     = useState({ email: '', password: '' });
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const email = form.email.trim();
      if (!email || !form.password) { setError('Email et mot de passe requis.'); return; }
      await login(email, form.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err?.message || 'Identifiants incorrects. Veuillez réessayer.');
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
          <h2 className="login-card-title">Connexion</h2>
          <p className="login-card-subtitle">Accédez à votre espace sécurisé</p>
        </div>

        {error && (
          <div className="alert alert-danger border-0 d-flex align-items-center gap-2 py-2 small mb-3" role="alert">
            <IconAlert size={14} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <FormInput
            id="email"
            name="email"
            label="Adresse email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="votre.email@2ie-edu.org"
          />

          <div className="mb-4 position-relative">
            <FormInput
              id="password"
              name="password"
              label="Mot de passe"
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              required
              placeholder="••••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="login-show-pass-btn"
              tabIndex={-1}
              aria-label={showPass ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPass ? <IconEyeSlash size={16} /> : <IconEye size={16} />}
            </button>
          </div>

          <button type="submit" className="btn btn-danger w-100 login-submit-btn d-flex align-items-center justify-content-center gap-2" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                Connexion en cours…
              </>
            ) : (
              <>
                <IconLogin size={15} />
                Se connecter
              </>
            )}
          </button>
        </form>

        <div className="login-card-footer">
          Nouveau ici ?{' '}
          <Link to="/register" className="login-register-link">Créer un compte</Link>
        </div>
      </div>
    </div>
  );
}
