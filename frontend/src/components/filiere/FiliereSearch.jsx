import SearchFiltersCard from '../SearchFiltersCard';

export default function FiliereSearch({ value, onChange, disabled }) {
  return (
    <SearchFiltersCard
      inputId="filiere-search"
      fieldLabel="Rechercher une filière"
      placeholder="Code, libellé ou description"
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
}
