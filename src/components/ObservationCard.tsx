import { Link } from 'react-router-dom'
import { totalScore } from '../lib/score'
import { CATEGORY_OPTIONS, DECISION_OPTIONS, labelFor, type Observation } from '../types'

export function ScoreBadge({ score }: { score: number }) {
  const cls =
    score >= 18
      ? 'bg-keep text-white'
      : score >= 13
        ? 'bg-watch text-white'
        : score > 0
          ? 'bg-line text-ink'
          : 'border border-line bg-paper text-ink-500'
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full px-2.5 py-1 text-sm font-bold ${cls}`}
    >
      {score > 0 ? score : '·'}
      <span className="ml-0.5 text-[10px] font-semibold opacity-80">/25</span>
    </span>
  )
}

const DECISION_DOT: Record<string, string> = {
  garder: 'bg-keep',
  surveiller: 'bg-watch',
  ecarter: 'bg-drop',
}

export function ObservationCard({ obs }: { obs: Observation }) {
  const where = [obs.hall && `Hall ${obs.hall}`, obs.stand && `Stand ${obs.stand}`]
    .filter(Boolean)
    .join(' · ')
  const category = labelFor(CATEGORY_OPTIONS, obs.category)
  return (
    <Link to={`/observation/${obs.id}`} className="card mt-3 block text-inherit no-underline">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-bold">{obs.brandName || 'Stand sans nom'}</p>
          <p className="mt-0.5 text-xs text-ink-500">
            {[where, category].filter(Boolean).join(' · ') || obs.date}
          </p>
        </div>
        <ScoreBadge score={totalScore(obs)} />
      </div>
      {obs.signalOneLiner ? <p className="mt-2 line-clamp-2 text-sm">{obs.signalOneLiner}</p> : null}
      {obs.decision || obs.familySignal ? (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-500">
          {obs.decision ? (
            <>
              <span
                className={`inline-block h-2 w-2 rounded-full ${DECISION_DOT[obs.decision] ?? 'bg-line'}`}
              />
              {labelFor(DECISION_OPTIONS, obs.decision)}
            </>
          ) : null}
          {obs.decision && obs.familySignal ? <span>·</span> : null}
          {obs.familySignal ? <span className="truncate">{obs.familySignal}</span> : null}
        </p>
      ) : null}
    </Link>
  )
}
