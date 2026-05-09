// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }  from './context/AuthContext';
import ProtectedRoute    from './components/ProtectedRoute';
import AppLayout         from './components/AppLayout';
import LoginPage         from './pages/LoginPage';
import RegisterPage      from './pages/RegisterPage';
import Dashboard         from './pages/Dashboard';
import RessourcesPage    from './pages/RessourcesPage';
import RessourceSectionPage from './pages/RessourceSectionPage';
import GestionEtudiantsPage from './pages/GestionEtudiantsPage';
import EtudiantSectionPage from './pages/EtudiantSectionPage';
import ProfilPage from './pages/ProfilPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Route publique */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Routes protégées + barre latérale */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profil" element={<ProfilPage />} />
              <Route path="ressources" element={<RessourcesPage />} />
              <Route path="ressources/:slug" element={<RessourceSectionPage />} />
              <Route path="etudiants" element={<GestionEtudiantsPage />} />
              <Route path="etudiants/:slug" element={<EtudiantSectionPage />} />
            </Route>
          </Route>

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}