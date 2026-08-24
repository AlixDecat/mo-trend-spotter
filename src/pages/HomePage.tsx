import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { IconContrast, IconDownload, IconZap } from '../components/icons'
import { ObservationCard, ScoreBadge } from '../components/ObservationCard'
import { backupJsonNow } from '../lib/export'
import { observationTitle } from '../lib/markdown'
import { averageScore, isScored, totalScore } from '../lib/score'
import { toggleSalonMode, useSalonMode } from '../lib/salonMode'
import { toast } from '../lib/toast'
import { seedExamples } from '../seed'
import { useObservations } from '../store'

export function HomePage() {
  const { observations, loaded } = useObservations()
  const salonMode = useSalonMode()
  const sorted = useMemo(
    () => [...observations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [observations],
  )
  const top5 = useMemo(
    () =>
      [...observations]
        .filter(isScored)
        .sort((a, b) => totalScore(b) - totalScore(a))
        .slice(0, 5),
    [observations],
  )
  const avg = averageScore(observations)
  const keepCount = observations.filter((o) => o.decision === 'garder').length

  async function backup() {
    if (observations.length === 0) {
      toast('Rien à sauvegarder pour le moment', 'err')
      return
    }
    const result = await backupJsonNow()
    if (result === 'downloaded') toast('Sauvegarde JSON téléchargée')
    else if (result === 'shared') toast('Sauvegarde JSON partagée')
  }

  async function loadExamples() {
    const count = await seedExamples()
    toast(`${count} exemples ajoutés (supprimables)`)
  }

  return (
    <div className="pt-4">
      <header className="flex items-center justify-between">
        <div>
          <p className="h1">M&O Spotter</p>
          <p className="text-xs text-ink-500">Carnet de tendances · Maison et Objet</p>
        </div>
        <div className="flex">
          <button
            type="button"
            className="rounded-xl p-2"
            title="Mode salon (contraste renforcé)"
            aria-pressed={salonMode}
            onClick={toggleSalonMode}
          >
            <IconContrast className={`h-6 w-6 ${salonMode ? 'text-clay-600' : 'text-ink-500'}`} />
          </button>
          <button
            type="button"
            className="rounded-xl p-2"
            title="Sauvegarde JSON en 1 tap"
            onClick={() => void backup()}
          >
            <IconDownload className="h-6 w-6 text-ink-500" />
          </button>
        </div>
      </header>
      {salonMode ? (
        <p className="mt-2 inline-block rounded-full bg-clay-100 px-3 py-1 text-xs font-semibold text-clay-800">
          Mode salon actif
        </p>
      ) : null}

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="card px-2 py-3 text-center">
          <p className="text-xl font-extrabold">{observations.length}</p>
          <p className="text-[11px] text-ink-500">Observations</p>
        </div>
        <div className="card px-2 py-3 text-center">
          <p className="text-xl font-extrabold">{avg > 0 ? avg.toFixed(1) : '·'}</p>
          <p className="text-[11px] text-ink-500">Score moyen /25</p>
        </div>
        <div className="card px-2 py-3 text-center">
          <p className="text-xl font-extrabold">{keepCount}</p>
          <p className="text-[11px] text-ink-500">À garder</p>
        </div>
      </div>

      <Link to="/quick" className="btn btn-primary mt-4 w-full py-3.5 text-base no-underline">
        <IconZap className="h-5 w-5" /> Saisie rapide
      </Link>
      <Link to="/observation/new" className="btn mt-2 w-full no-underline">
        Observation complète
      </Link>

      {top5.length > 0 ? (
        <>
          <div className="mt-6 flex items-baseline justify-between">
            <p className="text-base font-bold">Top 5</p>
            <Link to="/top" className="text-xs font-semibold text-clay-600 no-underline">
              Voir tout
            </Link>
          </div>
          {top5.map((o) => (
            <Link
              key={o.id}
              to={`/observation/${o.id}`}
              className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-line bg-white px-3 py-2 text-inherit no-underline"
            >
              <span className="truncate text-sm font-semibold">{observationTitle(o)}</span>
              <ScoreBadge score={totalScore(o)} />
            </Link>
          ))}
        </>
      ) : null}

      <p className="mt-6 text-base font-bold">Récentes</p>
      {!loaded ? <p className="mt-3 text-sm text-ink-500">Chargement…</p> : null}
      {loaded && sorted.length === 0 ? (
        <div className="card mt-3 text-center">
          <p className="font-semibold">Aucune observation pour l'instant</p>
          <p className="hint mt-1">Au salon : un stand qui vous arrête = une fiche de 2 minutes.</p>
          <button type="button" className="btn mt-3" onClick={() => void loadExamples()}>
            Charger 2 exemples
          </button>
        </div>
      ) : null}
      {sorted.map((o) => (
        <ObservationCard key={o.id} obs={o} />
      ))}
    </div>
  )
}
