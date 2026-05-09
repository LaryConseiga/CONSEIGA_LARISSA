import SearchFiltersCard from '../SearchFiltersCard';

export default function InscriptionSearch({ value, onChange, disabled }) {
  return (
    <SearchFiltersCard
      inputId="inscription-search"
      fieldLabel="Rechercher une inscription"
      placeholder="Étudiant, parcours, année, décision, date"
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
}
