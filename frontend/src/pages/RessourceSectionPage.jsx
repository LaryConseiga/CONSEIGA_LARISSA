import { Navigate, useParams } from 'react-router-dom';
import Ecole from '../components/ecole/Ecole';
import Filiere from '../components/filiere/Filiere';
import Specialite from '../components/specialite/Specialite';
import Niveau from '../components/niveau/Niveau';
import Cycle from '../components/cycle/Cycle';
import Parcours from '../components/parcours/Parcours';
import Inscription from '../components/inscription/Inscription';
import Etudiant from '../components/etudiant/Etudiant';
import Pays from '../components/pays/Pays';
import AnneeAcademique from '../components/anneeAcademique/AnneeAcademique';
import Classe from '../components/classe/Classe';

const SLUG_TO_TITLE = {
  ecoles: 'Écoles',
  filieres: 'Filières',
  specialites: 'Spécialités',
  niveaux: 'Niveaux',
  cycles: 'Cycles',
  parcours: 'Parcours',
  inscriptions: 'Inscriptions',
  etudiants: 'Étudiants',
  pays: 'Pays',
  'annee-academique': 'Année académique',
  classe: 'Classe',
};

export default function RessourceSectionPage() {
  const { slug } = useParams();
  const title = SLUG_TO_TITLE[slug];

  if (!title) {
    return <Navigate to="/ressources" replace />;
  }

  if (slug === 'ecoles') {
    return <Ecole />;
  }

  if (slug === 'filieres') {
    return <Filiere />;
  }

  if (slug === 'specialites') {
    return <Specialite />;
  }

  if (slug === 'niveaux') {
    return <Niveau />;
  }

  if (slug === 'cycles') {
    return <Cycle />;
  }

  if (slug === 'parcours') {
    return <Parcours />;
  }

  if (slug === 'inscriptions') {
    return <Inscription />;
  }

  if (slug === 'etudiants') {
    return <Etudiant />;
  }

  if (slug === 'pays') {
    return <Pays />;
  }

  if (slug === 'annee-academique') {
    return <AnneeAcademique />;
  }

  if (slug === 'classe') {
    return <Classe />;
  }

  return (
    <div className="container-fluid py-4 px-3 px-lg-4 flex-grow-1 bg-white">
      <h1 className="h3 mb-3">{title}</h1>
      <p className="text-muted mb-0">Section ressources — contenu à brancher.</p>
    </div>
  );
}
