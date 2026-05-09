import SearchFiltersCard from '../SearchFiltersCard';

export default function SpecialiteSearch({ value, onChange, disabled }) {
  return (
    <SearchFiltersCard
      inputId="specialite-search"
      fieldLabel="Rechercher une spécialité"
      placeholder="Libellé, filière, description"
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
}
