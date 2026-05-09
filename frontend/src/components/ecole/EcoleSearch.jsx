import SearchFiltersCard from '../SearchFiltersCard';

export default function EcoleSearch({ value, onChange, disabled }) {
  return (
    <SearchFiltersCard
      inputId="ecole-search"
      fieldLabel="Rechercher une école"
      placeholder="Libellé, adresse, téléphone ou email"
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
}
