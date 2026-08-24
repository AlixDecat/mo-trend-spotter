import type { Option } from '../types'

const COLS: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
}

export function Segment({
  options,
  value,
  onChange,
  cols,
  tones,
}: {
  options: Option[]
  value: string
  onChange: (v: string) => void
  cols?: number
  // Classes appliquées à l'option sélectionnée (ex. couleurs de décision)
  tones?: Record<string, string>
}) {
  const colClass = COLS[cols ?? (options.length <= 3 ? 3 : 2)] ?? 'grid-cols-2'
  return (
    <div className={`grid gap-1.5 ${colClass}`}>
      {options.map((o) => {
        const selected = value === o.value
        const selectedClass = tones?.[o.value] ?? 'border-clay-600 bg-clay-600 text-white'
        return (
          <button
            key={o.value}
            type="button"
            className={`rounded-xl border px-2 py-2.5 text-sm font-semibold leading-tight ${
              selected ? selectedClass : 'border-line bg-white'
            }`}
            onClick={() => onChange(selected ? '' : o.value)}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export const DECISION_TONES: Record<string, string> = {
  garder: 'border-keep bg-keep text-white',
  surveiller: 'border-watch bg-watch text-white',
  ecarter: 'border-drop bg-drop text-white',
}
