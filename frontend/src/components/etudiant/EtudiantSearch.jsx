import SearchFiltersCard from '../SearchFiltersCard';

export default function EtudiantSearch({ value, onChange, disabled }) {
  return (
    <SearchFiltersCard
      inputId="etudiant-search"
      fieldLabel="Rechercher un étudiant"
      placeholder="Nom, prénom, email, pays, civilité"
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
}
