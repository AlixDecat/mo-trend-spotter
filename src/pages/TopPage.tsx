import { useMemo, useState } from 'react'
import { ObservationCard } from '../components/ObservationCard'
import { totalScore } from '../lib/score'
import { useObservations } from '../store'
import { CATEGORY_OPTIONS, DECISION_OPTIONS, labelFor } from '../types'

const MIN_SCORES = [0, 10, 15, 18, 20]

export function TopPage() {
  const { observations, loaded } = useObservations()
  const [hall, setHall] = useState('')
  const [category, setCategory] = useState('')
  const [family, setFamily] = useState('')
  const [decision, setDecision] = useState('')
  const [minScore, setMinScore] = useState(0)

  const halls = useMemo(
    () => [...new Set(observations.map((o) => o.hall).filter(Boolean))].sort(),
    [observations],
  )
  const families = useMemo(
    () => [...new Set(observations.map((o) => o.familySignal).filter(Boolean))].sort(),
    [observations],
  )
  const categories = useMemo(
    () => [...new Set(observations.map((o) => o.category).filter(Boolean))],
    [observations],
  )

  const filtered = useMemo(
    () =>
      observations
        .filter((o) => !hall || o.hall === hall)
        .filter((o) => !category || o.category === category)
        .filter((o) => !family || o.familySignal === family)
        .filter((o) => !decision || o.decision === decision)
        .filter((o) => totalScore(o) >= minScore)
        .sort((a, b) => totalScore(b) - totalScore(a) || b.date.localeCompare(a.date)),
    [observations, hall, category, family, decision, minScore],
  )

  return (
    <div className="pt-4">
      <p className="h1">Top scores</p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <select className="input" value={hall} onChange={(e) => setHall(e.target.value)}>
          <option value="">Tous les halls</option>
          {halls.map((h) => (
            <option key={h} value={h}>
              Hall {h}
            </option>
          ))}
        </select>
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Toutes catégories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {labelFor(CATEGORY_OPTIONS, c)}
            </option>
          ))}
        </select>
        <select className="input" value={family} onChange={(e) => setFamily(e.target.value)}>
          <option value="">Toutes familles</option>
          {families.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <select className="input" value={decision} onChange={(e) => setDecision(e.target.value)}>
          <option value="">Toutes décisions</option>
          {DECISION_OPTIONS.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      <div className="no-scrollbar -mx-4 mt-2 flex gap-1.5 overflow-x-auto px-4">
        {MIN_SCORES.map((m) => (
          <button
            key={m}
            type="button"
            className={`chip shrink-0 ${minScore === m ? 'chip-on' : ''}`}
            onClick={() => setMinScore(m)}
          >
            {m === 0 ? 'Tous les scores' : `≥ ${m}/25`}
          </button>
        ))}
      </div>

      <p className="mt-3 text-xs text-ink-500">
        {filtered.length} observation{filtered.length > 1 ? 's' : ''}
      </p>
      {loaded && filtered.length === 0 ? (
        <p className="card mt-3 text-center text-sm text-ink-500">
          Aucune observation ne correspond aux filtres.
        </p>
      ) : null}
      {filtered.map((o) => (
        <ObservationCard key={o.id} obs={o} />
      ))}
    </div>
  )
}
