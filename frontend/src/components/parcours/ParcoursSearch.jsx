import SearchFiltersCard from '../SearchFiltersCard';

export default function ParcoursSearch({ value, onChange, disabled }) {
  return (
    <SearchFiltersCard
      inputId="parcours-search"
      fieldLabel="Rechercher un parcours"
      placeholder="Libellé, spécialité, niveau, cycle"
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
}
