import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImage from '../assets/image.png';
import {
  IconBuilding, IconDiagram, IconBookmarkStar, IconLayers,
  IconArrowRepeat, IconSignpost, IconClipboardCheck, IconPeople,
  IconGlobe, IconCalendarRange, IconDoor, IconPersonPlus,
  IconClipboardPlus, IconListUl, IconFileText,
  IconSpeedometer, IconGrid, IconMortarboard, IconLogout,
} from './Icons';
import './Sidebar.css';

const RESSOURCES_ITEMS = [
  { to: '/ressources/ecoles',          label: 'Écoles',            Icon: IconBuilding },
  { to: '/ressources/filieres',         label: 'Filières',          Icon: IconDiagram },
  { to: '/ressources/specialites',      label: 'Spécialités',       Icon: IconBookmarkStar },
  { to: '/ressources/niveaux',          label: 'Niveaux',           Icon: IconLayers },
  { to: '/ressources/cycles',           label: 'Cycles',            Icon: IconArrowRepeat },
  { to: '/ressources/parcours',         label: 'Parcours',          Icon: IconSignpost },
  { to: '/ressources/inscriptions',     label: 'Inscriptions',      Icon: IconClipboardCheck },
  { to: '/ressources/etudiants',        label: 'Étudiants',         Icon: IconPeople },
  { to: '/ressources/pays',             label: 'Pays',              Icon: IconGlobe },
  { to: '/ressources/annee-academique', label: 'Année académique',  Icon: IconCalendarRange },
  { to: '/ressources/classe',           label: 'Classe',            Icon: IconDoor },
];

const ETUDIANTS_ITEMS = [
  { to: '/etudiants/ajouter',    label: 'Ajouter un étudiant',              Icon: IconPersonPlus },
  { to: '/etudiants/inscrire',   label: 'Inscrire un étudiant',             Icon: IconClipboardPlus },
  { to: '/etudiants/liste',      label: 'Lister les étudiants',             Icon: IconListUl },
  { to: '/etudiants/certificat', label: "Éditer le certificat d'inscription", Icon: IconFileText },
];

function initialesSidebar(nom) {
  if (!nom || typeof nom !== 'string') return '?';
  const parts = nom.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return nom.slice(0, 2).toUpperCase();
}

function SidebarNavDropdown({ label, Icon, items, isActive }) {
  return (
    <div className="nav-item dropdown app-sidebar-dropdown-wrap w-100 px-0">
      <button
        type="button"
        className={`nav-link dropdown-toggle w-100 text-start ${isActive ? 'active' : ''}`}
        data-bs-toggle="dropdown"
        data-bs-reference="parent"
        data-bs-placement="bottom-start"
        data-bs-offset="0,4"
        aria-expanded="false"
      >
        <Icon className="sidebar-icon" />
        {label}
      </button>
      <ul className="dropdown-menu app-sidebar-dropdown border-0 shadow-none">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink className="dropdown-item" to={item.to}>
              <item.Icon className="sidebar-sub-icon" />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const ressourcesActive = location.pathname.startsWith('/ressources');
  const etudiantsActive  = location.pathname.startsWith('/etudiants');

  return (
    <aside className="app-sidebar d-flex flex-column">
      <div className="app-sidebar-header">
        <img src={logoImage} alt="Institut 2iE" className="app-sidebar-logo" />
      </div>

      <div className="app-sidebar-section">Navigation</div>

      <nav className="nav flex-column app-sidebar-nav flex-grow-1">
        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <IconSpeedometer className="sidebar-icon" />
          Tableau de bord
        </NavLink>

        <SidebarNavDropdown
          label="Ressources"
          Icon={IconGrid}
          items={RESSOURCES_ITEMS}
          isActive={ressourcesActive}
        />

        <SidebarNavDropdown
          label="Gestion des étudiants"
          Icon={IconMortarboard}
          items={ETUDIANTS_ITEMS}
          isActive={etudiantsActive}
        />
      </nav>

      <div className="app-sidebar-footer">
        {user ? (
          <div className="app-sidebar-profile-card">
            <div className="app-sidebar-profile-avatar" aria-hidden="true">
              {initialesSidebar(user.nom)}
            </div>
            <div className="app-sidebar-profile-text">
              <span className="app-sidebar-profile-name">{user.nom}</span>
              <span className="app-sidebar-profile-role" title={user.email}>
                {user.email}
              </span>
            </div>
          </div>
        ) : null}

        <button type="button" className="sidebar-logout-btn" onClick={logout}>
          <IconLogout />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
