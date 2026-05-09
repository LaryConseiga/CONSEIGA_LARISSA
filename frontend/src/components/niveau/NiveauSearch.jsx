import SearchFiltersCard from '../SearchFiltersCard';

export default function NiveauSearch({ value, onChange, disabled }) {
  return (
    <SearchFiltersCard
      inputId="niveau-search"
      fieldLabel="Rechercher un niveau"
      placeholder="Libellé ou ordre"
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
}
