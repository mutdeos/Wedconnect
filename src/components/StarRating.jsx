// Display-only stars when `onChange` is omitted, clickable stars otherwise.
export default function StarRating({ value, onChange, size = 'md' }) {
  const rounded = Math.round(value * 2) / 2

  if (onChange) {
    return (
      <div className={`stars stars-${size} stars-input`} role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            className={n <= value ? 'star filled' : 'star'}
            onClick={() => onChange(n)}
          >
            ★
          </button>
        ))}
      </div>
    )
  }

  return (
    <span className={`stars stars-${size}`} aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const cls = n <= rounded ? 'star filled' : n - 0.5 === rounded ? 'star half' : 'star'
        return (
          <span key={n} className={cls} aria-hidden="true">
            ★
          </span>
        )
      })}
    </span>
  )
}
