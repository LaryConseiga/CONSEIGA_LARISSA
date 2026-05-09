import SearchFiltersCard from '../SearchFiltersCard';

export default function PaysSearch({ value, onChange, disabled }) {
  return (
    <SearchFiltersCard
      inputId="pays-search"
      fieldLabel="Rechercher un pays"
      placeholder="Libellé, nationalité, code, ISO"
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
}
