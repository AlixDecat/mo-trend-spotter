export function ScoreRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint?: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="mt-4">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-sm text-ink-500">{value > 0 ? value : '·'}/5</span>
      </div>
      {hint ? <p className="hint">{hint}</p> : null}
      <div className="mt-2 grid grid-cols-5 gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={`rounded-xl border py-2.5 text-base font-bold ${
              n <= value
                ? 'border-clay-600 bg-clay-600 text-white'
                : 'border-line bg-white text-ink-500'
            }`}
            onClick={() => onChange(n === value ? 0 : n)}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}
