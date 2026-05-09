import SearchFiltersCard from '../SearchFiltersCard';

export default function AnneeAcademiqueSearch({ value, onChange, disabled }) {
  return (
    <SearchFiltersCard
      inputId="annee-academique-search"
      fieldLabel="Rechercher une année académique"
      placeholder="Libellé, dates"
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
}
