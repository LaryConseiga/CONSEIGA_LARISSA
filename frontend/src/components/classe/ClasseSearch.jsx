import SearchFiltersCard from '../SearchFiltersCard';

export default function ClasseSearch({ value, onChange, disabled }) {
  return (
    <SearchFiltersCard
      inputId="classe-search"
      fieldLabel="Rechercher une classe"
      placeholder="Libellé, filière, niveau, année"
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
}
