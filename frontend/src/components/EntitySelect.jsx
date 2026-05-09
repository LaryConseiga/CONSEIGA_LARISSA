/**
 * Liste déroulante générique (form-select) pour clés étrangères ou listes de référence.
 */
export default function EntitySelect({
  id,
  name,
  label,
  items = [],
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = 'Choisir',
  getOptionValue = (item) => String(item.id),
  getOptionLabel,
}) {
  const list = Array.isArray(items) ? items : [];
  const labelFn = getOptionLabel || ((item) => item.libelle ?? String(item.id));

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
        disabled={disabled || (required && list.length === 0)}
      >
        <option value="">{placeholder}</option>
        {list.map((item) => {
          const v = getOptionValue(item);
          return (
            <option key={v} value={v}>
              {labelFn(item)}
            </option>
          );
        })}
      </select>
    </div>
  );
}
