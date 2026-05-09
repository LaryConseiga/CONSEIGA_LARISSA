import { IconSearch } from './Icons';

export default function SearchFiltersCard({
  fieldLabel,
  placeholder,
  inputId = 'search-filters-input',
  value,
  onChange,
  disabled,
  headerTitle = 'Recherche & Filtres',
}) {
  return (
    <div
      className="card border-0 mb-4"
      style={{ boxShadow: 'var(--app-shadow-sm, 0 1px 4px rgba(0,0,0,0.05))' }}
    >
      <div
        className="card-header d-flex align-items-center gap-2 fw-semibold"
        style={{
          background: 'linear-gradient(135deg, var(--app-primary, #dc3545) 0%, var(--app-primary-dark, #b02a37) 100%)',
          color: '#fff',
          borderBottom: '1px solid rgba(0,0,0,0.1)',
          borderRadius: 'var(--app-radius, 0.5rem) var(--app-radius, 0.5rem) 0 0',
          fontSize: '0.9rem',
        }}
      >
        <IconSearch size={14} />
        {headerTitle}
      </div>

      <div className="card-body" style={{ background: '#fafbfc' }}>
        <label
          htmlFor={inputId}
          className="form-label small fw-semibold text-uppercase mb-1"
          style={{ color: 'var(--app-text-muted, #6c757d)', letterSpacing: '0.06em', fontSize: '0.7rem' }}
        >
          {fieldLabel}
        </label>
        <div className="input-group">
          <span className="input-group-text bg-white border-end-0" style={{ borderColor: '#dee2e6' }}>
            <IconSearch size={13} style={{ color: '#adb5bd' }} />
          </span>
          <input
            id={inputId}
            type="search"
            className="form-control border-start-0 ps-1"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            autoComplete="off"
            style={{ borderColor: '#dee2e6' }}
          />
        </div>
      </div>
    </div>
  );
}
