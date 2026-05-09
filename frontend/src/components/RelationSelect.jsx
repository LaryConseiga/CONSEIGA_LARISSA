/**
 * Sélecteur générique (form-select) alimenté par une liste { id, label }[].
 */
export default function RelationSelect({
  id,
  name,
  label,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  emptyLabel = 'Choisir',
}) {
  const list = Array.isArray(options) ? options : [];
  const noChoice = list.length === 0;

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
        aria-label={label || name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled || noChoice}
      >
        <option value="">{emptyLabel}</option>
        {list.map((o) => (
          <option key={o.id} value={String(o.id)}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
