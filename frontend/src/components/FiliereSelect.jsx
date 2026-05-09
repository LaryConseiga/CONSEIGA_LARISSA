/**
 * Liste déroulante des filières (données issues de l’API, ex. GET /api/filieres).
 * Les options se mettent à jour quand la prop `filieres` change.
 */
export default function FiliereSelect({
  id = 'filiere-select',
  name = 'filieres_id',
  label = 'Filière',
  filieres = [],
  value,
  onChange,
  disabled = false,
  required = false,
  placeholderOption = 'Choisir une filière',
}) {
  const list = Array.isArray(filieres) ? filieres : [];
  const noData = list.length === 0;

  return (
    <div className="mb-3">
      {label ? (
        <label htmlFor={id} className="form-label">
          {label}
        </label>
      ) : null}
      <select
        id={id}
        name={name}
        className="form-select"
        aria-label={label || 'Sélection de la filière'}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled || noData}
      >
        <option value="">{placeholderOption}</option>
        {list.map((f) => (
          <option key={f.id} value={String(f.id)}>
            {f.libelle}
            {f.code ? ` (${f.code})` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
