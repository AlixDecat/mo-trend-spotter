// « Saisie rapide » : un seul écran avec l'essentiel, pensé pour le salon.
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconBack } from '../components/icons'
import { PhotoSection } from '../components/PhotoSection'
import { ScoreRow, ScoredHint } from '../components/ScoreRow'
import { DECISION_TONES, Segment } from '../components/Segment'
import { scoredCriteria, totalScore } from '../lib/score'
import { toast } from '../lib/toast'
import { useObservationDraft } from '../lib/useObservationDraft'
import { useObservations } from '../store'
import { DECISION_OPTIONS, SCORE_FIELDS } from '../types'

export function QuickEntryPage() {
  const navigate = useNavigate()
  const { observations } = useObservations()
  const { obs, saveState, patch, patchSection, flush, ensureSaved } = useObservationDraft(undefined)

  const families = useMemo(
    () => [...new Set(observations.map((o) => o.familySignal).filter(Boolean))],
    [observations],
  )

  if (!obs) return <p className="py-10 text-center text-ink-500">Chargement…</p>

  async function saveAndGo(target: 'home' | 'full') {
    const saved = await flush()
    if (!saved) return
    if (target === 'home') {
      toast('Observation enregistrée')
      navigate('/', { replace: true })
    } else {
      navigate(`/observation/${saved.id}/edit`, { replace: true })
    }
  }

  return (
    <div className="pb-28 pt-3">
      <header className="flex items-center gap-1">
        <button
          type="button"
          className="-ml-2 rounded-xl p-2"
          aria-label="Retour"
          onClick={() => navigate(-1)}
        >
          <IconBack className="h-6 w-6" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-extrabold">Saisie rapide</p>
          <p className="text-xs text-ink-500">
            {saveState === 'pending'
              ? 'Enregistrement…'
              : saveState === 'saved'
                ? 'Enregistré ✓'
                : '1 stand = 1 fiche de 2 minutes'}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label">Hall</label>
          <input className="input" value={obs.hall} onChange={(e) => patch({ hall: e.target.value })} />
        </div>
        <div>
          <label className="label">Stand</label>
          <input className="input" value={obs.stand} onChange={(e) => patch({ stand: e.target.value })} />
        </div>
      </div>
      <label className="label">Marque / exposant</label>
      <input
        className="input"
        value={obs.brandName}
        placeholder="Nom du stand"
        onChange={(e) => patch({ brandName: e.target.value })}
      />
      <label className="label">Le signal en une phrase *</label>
      <textarea
        className="input"
        rows={3}
        value={obs.signalOneLiner}
        placeholder="Ce qui vous a arrêtée : matière + geste + usage."
        onChange={(e) => patch({ signalOneLiner: e.target.value })}
      />

      {SCORE_FIELDS.map((f) => (
        <ScoreRow
          key={f.key}
          label={f.label}
          value={obs.scoring[f.key]}
          onChange={(v) => patchSection('scoring', { [f.key]: v })}
        />
      ))}
      <div className="card mt-4 flex items-center justify-between py-3">
        <span className="font-bold">
          Score total
          <ScoredHint count={scoredCriteria(obs)} />
        </span>
        <span className="text-xl font-extrabold text-clay-600">{totalScore(obs)}/25</span>
      </div>

      <PhotoSection
        observationId={obs.id}
        type="ambiance"
        label="Photo ambiance"
        hint="Le stand en plan large"
        onChanged={() => void ensureSaved()}
      />

      <label className="label">Famille de signaux</label>
      <input
        className="input"
        value={obs.familySignal}
        list="familles-rapide"
        placeholder="Grès chamotté naturel…"
        onChange={(e) => patch({ familySignal: e.target.value })}
      />
      <datalist id="familles-rapide">
        {families.map((f) => (
          <option key={f} value={f} />
        ))}
      </datalist>
      <label className="label">Décision</label>
      <Segment
        options={DECISION_OPTIONS}
        value={obs.decision}
        onChange={(v) => patch({ decision: v })}
        cols={3}
        tones={DECISION_TONES}
      />

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto flex max-w-md gap-2 px-4 py-3">
          <button type="button" className="btn flex-1" onClick={() => void saveAndGo('full')}>
            Compléter la fiche
          </button>
          <button type="button" className="btn btn-primary flex-1" onClick={() => void saveAndGo('home')}>
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}
