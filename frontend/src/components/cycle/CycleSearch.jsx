import SearchFiltersCard from '../SearchFiltersCard';

export default function CycleSearch({ value, onChange, disabled }) {
  return (
    <SearchFiltersCard
      inputId="cycle-search"
      fieldLabel="Rechercher un cycle"
      placeholder="Libellé ou durée (années)"
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
}
