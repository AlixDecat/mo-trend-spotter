import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ScoreBadge } from '../components/ObservationCard'
import { dbGetAllDirections, dbPutDirection } from '../db'
import { buildDirectionDraft } from '../lib/aggregate'
import { observationTitle } from '../lib/markdown'
import { MIN_SCORE_FILTERS, totalScore } from '../lib/score'
import { toast } from '../lib/toast'
import { useObservations } from '../store'
import type { Direction } from '../types'

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
  } catch {
    return iso
  }
}

export function DirectionListPage() {
  const { observations, loaded } = useObservations()
  const navigate = useNavigate()
  const [directions, setDirections] = useState<Direction[] | null>(null)
  const [selecting, setSelecting] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [minScore, setMinScore] = useState(0)

  useEffect(() => {
    void dbGetAllDirections().then((all) =>
      setDirections([...all].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))),
    )
  }, [])

  const candidates = useMemo(
    () =>
      [...observations]
        .sort((a, b) => totalScore(b) - totalScore(a))
        .filter((o) => totalScore(o) >= minScore),
    [observations, minScore],
  )

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= 10) {
        toast('10 observations maximum', 'err')
        return prev
      }
      return [...prev, id]
    })
  }

  async function generate() {
    const sources = observations.filter((o) => selected.includes(o.id))
    if (sources.length === 0) return
    const draft = buildDirectionDraft(sources)
    await dbPutDirection(draft)
    navigate(`/direction/${draft.id}`)
  }

  if (selecting) {
    return (
      <div className="pt-4">
        <p className="h1">Nouvelle direction</p>
        <p className="mt-1 text-xs text-ink-500">
          Sélectionnez vos meilleures observations (3 à 10 conseillées). Le brouillon se pré-remplit
          avec les couleurs, matières et formes qui reviennent le plus.
        </p>
        <div className="no-scrollbar -mx-4 mt-3 flex gap-1.5 overflow-x-auto px-4">
          {MIN_SCORE_FILTERS.map((m) => (
            <button
              key={m}
              type="button"
              className={`chip shrink-0 ${minScore === m ? 'chip-on' : ''}`}
              onClick={() => setMinScore(m)}
            >
              {m === 0 ? 'Toutes' : `≥ ${m}/25`}
            </button>
          ))}
        </div>
        {candidates.length === 0 ? (
          <p className="card mt-3 text-center text-sm text-ink-500">
            Aucune observation avec ce score minimum.
          </p>
        ) : null}
        {candidates.map((o) => {
          const isSelected = selected.includes(o.id)
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => toggle(o.id)}
              className={`mt-2 flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left ${
                isSelected ? 'border-clay-600 bg-clay-50' : 'border-line bg-white'
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                  isSelected ? 'border-clay-600 bg-clay-600 text-white' : 'border-line text-transparent'
                }`}
              >
                ✓
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                {observationTitle(o)}
              </span>
              <ScoreBadge score={totalScore(o)} />
            </button>
          )
        })}
        <div className="sticky bottom-24 mt-4 flex gap-2">
          <button
            type="button"
            className="btn flex-1"
            onClick={() => {
              setSelecting(false)
              setSelected([])
            }}
          >
            Annuler
          </button>
          <button
            type="button"
            className="btn btn-primary flex-1"
            disabled={selected.length === 0}
            onClick={() => void generate()}
          >
            Générer ({selected.length})
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-4">
      <p className="h1">Direction de collection</p>
      <p className="mt-1 text-xs text-ink-500">
        Une page qui transforme vos meilleures observations en direction : promesse, codes,
        système, merchandising.
      </p>
      <button
        type="button"
        className="btn btn-primary mt-4 w-full py-3.5"
        onClick={() => setSelecting(true)}
        disabled={!loaded || observations.length === 0}
      >
        Nouvelle direction
      </button>
      {loaded && observations.length === 0 ? (
        <p className="card mt-3 text-center text-sm text-ink-500">
          Créez d'abord quelques observations : la direction se génère à partir d'elles.
        </p>
      ) : null}
      {directions?.map((d) => (
        <Link key={d.id} to={`/direction/${d.id}`} className="card mt-3 block text-inherit no-underline">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate font-bold">{d.name || 'Direction sans nom'}</p>
            <span className="shrink-0 text-xs text-ink-500">
              {d.sourceObservationIds.length} obs.
            </span>
          </div>
          {d.promise ? <p className="mt-1 line-clamp-2 text-sm text-ink-500">{d.promise}</p> : null}
          <p className="mt-1 text-xs text-ink-500">Modifiée le {fmtDate(d.updatedAt)}</p>
        </Link>
      ))}
      {directions !== null && directions.length === 0 && observations.length > 0 ? (
        <p className="mt-3 text-center text-xs text-ink-500">Aucune direction pour l'instant.</p>
      ) : null}
    </div>
  )
}
