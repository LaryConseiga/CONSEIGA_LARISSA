import { Navigate, useParams } from 'react-router-dom';
import Etudiant from '../components/etudiant/Etudiant';
import EtudiantAjouter from '../components/etudiant/EtudiantAjouter';
import EtudiantInscrire from '../components/etudiant/EtudiantInscrire';
import CertificatInscription from '../components/etudiant/CertificatInscription';

const SLUG_TO_TITLE = {
  ajouter: 'Ajouter un étudiant',
  inscrire: 'Inscrire un étudiant',
  liste: 'Lister les étudiants',
  certificat: "Éditer le certificat d'inscription",
};

export default function EtudiantSectionPage() {
  const { slug } = useParams();
  const title = SLUG_TO_TITLE[slug];

  if (!title) {
    return <Navigate to="/etudiants" replace />;
  }

  if (slug === 'liste') {
    return <Etudiant />;
  }

  if (slug === 'ajouter') {
    return <EtudiantAjouter />;
  }

  if (slug === 'inscrire') {
    return <EtudiantInscrire />;
  }

  if (slug === 'certificat') {
    return <CertificatInscription />;
  }

  return (
    <div className="container-fluid py-4 px-3 px-lg-4 flex-grow-1 bg-white">
      <h1 className="h3 mb-3">{title}</h1>
      <p className="text-muted mb-0">Gestion des étudiants. Contenu à brancher.</p>
    </div>
  );
}
