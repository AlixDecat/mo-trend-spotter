import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChipMulti, ChipSingle } from '../components/ChipSelect'
import { IconBack } from '../components/icons'
import { PhotoSection } from '../components/PhotoSection'
import { ScoreRow } from '../components/ScoreRow'
import { DECISION_TONES, Segment } from '../components/Segment'
import { ToggleRow } from '../components/ToggleRow'
import { totalScore } from '../lib/score'
import { useObservationDraft } from '../lib/useObservationDraft'
import { useObservations } from '../store'
import {
  ARCHETYPE_OPTIONS,
  ASPECT_OPTIONS,
  CATEGORY_OPTIONS,
  COLOR_OPTIONS,
  COMPOSITION_OPTIONS,
  CONTRAST_OPTIONS,
  DECISION_OPTIONS,
  EXHIBITOR_OPTIONS,
  HARD_TO_COPY_OPTIONS,
  PHOTO_TYPES,
  POSITIONING_OPTIONS,
  PROPORTION_OPTIONS,
  SCENE_OPTIONS,
  SCORE_FIELDS,
  SUPPORT_OPTIONS,
  TEXTURE_OPTIONS,
} from '../types'

// 5 étapes de collecte : le menu tient entièrement à l'écran sur mobile.
const STEPS = [
  'Stand & identification',
  'Signal & design',
  'Usage & collection',
  'Merchandising & photos',
  'Score & décision',
]
const STEP_CHIPS = ['Stand', 'Design', 'Usage', 'Photos', 'Score']

export function FormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { observations } = useObservations()
  const { obs, missing, saveState, patch, patchSection, flush, ensureSaved } =
    useObservationDraft(id)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (missing) navigate('/', { replace: true })
  }, [missing, navigate])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [step])

  const families = useMemo(
    () => [...new Set(observations.map((o) => o.familySignal).filter(Boolean))],
    [observations],
  )

  if (!obs) return <p className="py-10 text-center text-ink-500">Chargement…</p>

  async function finish() {
    const saved = await flush()
    navigate(saved ? `/observation/${saved.id}` : '/', { replace: true })
  }

  return (
    <div className="pb-28 pt-3">
      <header className="flex items-center gap-1">
        <button
          type="button"
          className="-ml-2 rounded-xl p-2"
          aria-label="Retour"
          onClick={() => (step > 0 ? setStep(step - 1) : navigate(-1))}
        >
          <IconBack className="h-6 w-6" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-extrabold">{STEPS[step]}</p>
          <p className="text-xs text-ink-500">
            Étape {step + 1}/{STEPS.length} ·{' '}
            {saveState === 'pending'
              ? 'Enregistrement…'
              : saveState === 'saved'
                ? 'Enregistré ✓'
                : id
                  ? 'Fiche enregistrée'
                  : 'Nouvelle fiche'}
          </p>
        </div>
      </header>

      <div className="mt-2 grid grid-cols-5 gap-1">
        {STEP_CHIPS.map((label, i) => (
          <button
            key={label}
            type="button"
            className={`rounded-xl border px-1 py-1.5 text-xs font-semibold leading-tight ${
              i === step ? 'border-clay-600 bg-clay-600 text-white' : 'border-line bg-white text-ink-500'
            }`}
            onClick={() => setStep(i)}
          >
            <span className="block text-[10px] opacity-70">{i + 1}</span>
            {label}
          </button>
        ))}
      </div>

      {step === 0 ? (
        <section>
          <label className="label">Marque / exposant</label>
          <input
            className="input"
            value={obs.brandName}
            placeholder="Nom du stand"
            onChange={(e) => patch({ brandName: e.target.value })}
          />
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="label">Hall</label>
              <input className="input" value={obs.hall} onChange={(e) => patch({ hall: e.target.value })} />
            </div>
            <div>
              <label className="label">Zone</label>
              <input className="input" value={obs.zone} onChange={(e) => patch({ zone: e.target.value })} />
            </div>
            <div>
              <label className="label">Stand</label>
              <input className="input" value={obs.stand} onChange={(e) => patch({ stand: e.target.value })} />
            </div>
          </div>
          <label className="label">Pays</label>
          <input
            className="input"
            value={obs.country}
            placeholder="Portugal, Espagne…"
            onChange={(e) => patch({ country: e.target.value })}
          />
          <label className="label">Type d'exposant</label>
          <Segment
            options={EXHIBITOR_OPTIONS}
            value={obs.exhibitorType}
            onChange={(v) => patch({ exhibitorType: v })}
            cols={2}
          />
          <label className="label">Catégorie</label>
          <ChipSingle
            options={CATEGORY_OPTIONS}
            value={obs.category}
            onChange={(v) => patch({ category: v })}
          />
          <label className="label">Positionnement perçu</label>
          <Segment
            options={POSITIONING_OPTIONS}
            value={obs.perceivedPositioning}
            onChange={(v) => patch({ perceivedPositioning: v })}
            cols={2}
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label">Salon</label>
              <input
                className="input"
                value={obs.salonName}
                onChange={(e) => patch({ salonName: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                className="input"
                value={obs.date}
                onChange={(e) => patch({ date: e.target.value })}
              />
            </div>
          </div>
        </section>
      ) : null}

      {step === 1 ? (
        <section>
          <p className="h2">Le signal</p>
          <label className="label">Le signal en une phrase *</label>
          <textarea
            className="input"
            rows={4}
            value={obs.signalOneLiner}
            placeholder="Ce qui vous a arrêtée, dit simplement. Ex. : grès chamotté à engobe blanc, série dedans/dehors assumée."
            onChange={(e) => patch({ signalOneLiner: e.target.value })}
          />
          <p className="hint">Un bon signal est actionnable : matière + geste + usage.</p>
        </section>
      ) : null}

      {step === 1 ? (
        <section>
          <p className="h2">Palette</p>
          <label className="label">Couleurs dominantes (3 à 5)</label>
          <ChipMulti
            options={COLOR_OPTIONS}
            value={obs.palette.dominantColors}
            onChange={(v) => patchSection('palette', { dominantColors: v })}
            max={5}
            allowCustom
          />
          <label className="label">Couleur accent</label>
          <ChipSingle
            options={COLOR_OPTIONS}
            value={obs.palette.accentColor}
            onChange={(v) => patchSection('palette', { accentColor: v })}
            allowCustom
          />
          <label className="label">Niveau de contraste</label>
          <Segment
            options={CONTRAST_OPTIONS}
            value={obs.palette.contrastLevel}
            onChange={(v) => patchSection('palette', { contrastLevel: v })}
            cols={3}
          />

          <p className="h2">Matière</p>
          <label className="label">Aspect</label>
          <ChipMulti
            options={ASPECT_OPTIONS}
            value={obs.materialTexture.aspect}
            onChange={(v) => patchSection('materialTexture', { aspect: v })}
          />
          <label className="label">Texture</label>
          <ChipMulti
            options={TEXTURE_OPTIONS}
            value={obs.materialTexture.texture}
            onChange={(v) => patchSection('materialTexture', { texture: v })}
          />
          <label className="label">Difficile à copier parce que…</label>
          <ChipMulti
            options={HARD_TO_COPY_OPTIONS}
            value={obs.materialTexture.hardToCopyWhy}
            onChange={(v) => patchSection('materialTexture', { hardToCopyWhy: v })}
          />
          <label className="label">Notes matière</label>
          <textarea
            className="input"
            rows={2}
            value={obs.materialTexture.notes}
            onChange={(e) => patchSection('materialTexture', { notes: e.target.value })}
          />

          <p className="h2">Formes et volumes</p>
          <label className="label">Archétypes</label>
          <ChipMulti
            options={ARCHETYPE_OPTIONS}
            value={obs.formsVolumes.archetype}
            onChange={(v) => patchSection('formsVolumes', { archetype: v })}
          />
          <label className="label">Détails distinctifs</label>
          <input
            className="input"
            value={obs.formsVolumes.distinctiveDetails}
            placeholder="Col pincé, anses pleines…"
            onChange={(e) => patchSection('formsVolumes', { distinctiveDetails: e.target.value })}
          />
          <label className="label">Proportions</label>
          <Segment
            options={PROPORTION_OPTIONS}
            value={obs.formsVolumes.proportions}
            onChange={(v) => patchSection('formsVolumes', { proportions: v })}
            cols={3}
          />
        </section>
      ) : null}

      {step === 2 ? (
        <section>
          <p className="h2">Usage dedans/dehors</p>
          <label className="label">Scènes d'usage</label>
          <ChipMulti
            options={SCENE_OPTIONS}
            value={obs.indoorOutdoorUse.scenes}
            onChange={(v) => patchSection('indoorOutdoorUse', { scenes: v })}
          />
          <label className="label">Crédibilité dedans/dehors</label>
          <textarea
            className="input"
            rows={3}
            value={obs.indoorOutdoorUse.credibilityNotes}
            placeholder="Qu'est-ce qui rend l'usage dehors crédible (ou pas) ?"
            onChange={(e) => patchSection('indoorOutdoorUse', { credibilityNotes: e.target.value })}
          />
        </section>
      ) : null}

      {step === 2 ? (
        <section>
          <p className="h2">Collection</p>
          <ToggleRow
            label="Série coordonnée visible"
            checked={obs.collectionSystem.coordinatedSeries}
            onChange={(v) => patchSection('collectionSystem', { coordinatedSeries: v })}
          />
          <label className="label">Règle de composition</label>
          <ChipSingle
            options={COMPOSITION_OPTIONS}
            value={obs.collectionSystem.compositionRule}
            onChange={(v) => patchSection('collectionSystem', { compositionRule: v })}
          />
          <label className="label">Univers en 3 mots</label>
          <input
            className="input"
            value={obs.collectionSystem.universe3Words}
            placeholder="minéral, chaleureux, brut"
            onChange={(e) => patchSection('collectionSystem', { universe3Words: e.target.value })}
          />
        </section>
      ) : null}

      {step === 3 ? (
        <section>
          <p className="h2">Merchandising</p>
          <ToggleRow
            label="Corner lisible en 3 secondes"
            checked={obs.merchandisability.cornerIn3Seconds}
            onChange={(v) => patchSection('merchandisability', { cornerIn3Seconds: v })}
          />
          <label className="label">Supports vus</label>
          <ChipMulti
            options={SUPPORT_OPTIONS}
            value={obs.merchandisability.supportsSeen}
            onChange={(v) => patchSection('merchandisability', { supportsSeen: v })}
          />
          <label className="label">Idée de starter pack</label>
          <input
            className="input"
            value={obs.merchandisability.starterPackIdea}
            placeholder="Trio de jarres + coupe XL…"
            onChange={(e) => patchSection('merchandisability', { starterPackIdea: e.target.value })}
          />
        </section>
      ) : null}

      {step === 3 ? (
        <section>
          <p className="h2">Photos</p>
          {PHOTO_TYPES.map((t) => (
            <PhotoSection
              key={t.value}
              observationId={obs.id}
              type={t.value}
              label={t.label}
              hint={t.hint}
              onChanged={() => void ensureSaved()}
            />
          ))}
        </section>
      ) : null}

      {step === 4 ? (
        <section>
          <p className="h2">Score</p>
          {SCORE_FIELDS.map((f) => (
            <ScoreRow
              key={f.key}
              label={f.label}
              hint={f.hint}
              value={obs.scoring[f.key]}
              onChange={(v) => patchSection('scoring', { [f.key]: v })}
            />
          ))}
          <div className="card mt-5 flex items-center justify-between">
            <span className="font-bold">Score total</span>
            <span className="text-xl font-extrabold text-clay-600">{totalScore(obs)}/25</span>
          </div>
        </section>
      ) : null}

      {step === 4 ? (
        <section>
          <p className="h2">Transposition</p>
          <label className="label">Garder</label>
          <textarea
            className="input"
            rows={2}
            value={obs.transposition.keep}
            placeholder="Ce qu'on retient tel quel"
            onChange={(e) => patchSection('transposition', { keep: e.target.value })}
          />
          <label className="label">Écarter</label>
          <textarea
            className="input"
            rows={2}
            value={obs.transposition.discard}
            placeholder="Ce qu'on laisse de côté"
            onChange={(e) => patchSection('transposition', { discard: e.target.value })}
          />
          <label className="label">Règle de traduction</label>
          <textarea
            className="input"
            rows={2}
            value={obs.transposition.translationRule}
            placeholder="Comment le transposer chez nous"
            onChange={(e) => patchSection('transposition', { translationRule: e.target.value })}
          />
          <label className="label">Nom d'univers provisoire</label>
          <input
            className="input"
            value={obs.transposition.provisionalUniverseName}
            onChange={(e) => patchSection('transposition', { provisionalUniverseName: e.target.value })}
          />

          <p className="h2">Famille et décision</p>
          <label className="label">Famille de signaux</label>
          <input
            className="input"
            value={obs.familySignal}
            list="familles-existantes"
            placeholder="Grès chamotté naturel…"
            onChange={(e) => patch({ familySignal: e.target.value })}
          />
          <datalist id="familles-existantes">
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
        </section>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto flex max-w-md gap-2 px-4 py-3">
          {step > 0 ? (
            <button type="button" className="btn flex-1" onClick={() => setStep(step - 1)}>
              Précédent
            </button>
          ) : null}
          {step < STEPS.length - 1 ? (
            <button type="button" className="btn btn-primary flex-1" onClick={() => setStep(step + 1)}>
              Suivant
            </button>
          ) : (
            <button type="button" className="btn btn-primary flex-1" onClick={() => void finish()}>
              Terminer
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
