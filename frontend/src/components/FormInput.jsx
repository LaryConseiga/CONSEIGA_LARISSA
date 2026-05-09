import { forwardRef } from 'react';

/**
 * Champ de formulaire réutilisable (Bootstrap).
 * Props HTML natives supplémentaires : min, max, step, pattern, etc. (via ...rest)
 */
const FormInput = forwardRef(function FormInput(
  {
    id,
    name,
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    helperText,
    error,
    required = false,
    disabled = false,
    readOnly = false,
    autoComplete,
    className = 'mb-3',
    inputClassName = '',
    labelClassName = 'form-label',
    showRequiredMark = false,
    ...rest
  },
  ref
) {
  const inputId = id ?? name;
  const invalid = Boolean(error);
  const inputClass = ['form-control', invalid ? 'is-invalid' : '', inputClassName]
    .filter(Boolean)
    .join(' ');

  const describedBy = [
    helperText && !invalid ? `${inputId}-help` : null,
    invalid ? `${inputId}-error` : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className}>
      {label ? (
        <label htmlFor={inputId} className={labelClassName}>
          {label}
          {showRequiredMark && required ? (
            <span className="text-danger" aria-hidden="true">
              {' '}
              *
            </span>
          ) : null}
        </label>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        name={name}
        type={type}
        className={inputClass}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        autoComplete={autoComplete}
        aria-invalid={invalid}
        aria-describedby={describedBy || undefined}
        {...rest}
      />
      {helperText && !invalid ? (
        <div id={`${inputId}-help`} className="form-text">
          {helperText}
        </div>
      ) : null}
      {error ? (
        <div id={`${inputId}-error`} className="invalid-feedback d-block">
          {error}
        </div>
      ) : null}
    </div>
  );
});

FormInput.displayName = 'FormInput';

export default FormInput;
