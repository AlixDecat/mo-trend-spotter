import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { IconBack } from '../components/icons'
import { ScoreBadge } from '../components/ObservationCard'
import { dbGetPhotosFor } from '../db'
import { shareOrDownload, slugify } from '../lib/export'
import { observationTitle, observationToMarkdown } from '../lib/markdown'
import { totalScore } from '../lib/score'
import { toast } from '../lib/toast'
import { removeObservation, useObservations } from '../store'
import {
  ARCHETYPE_OPTIONS,
  ASPECT_OPTIONS,
  CATEGORY_OPTIONS,
  COLOR_OPTIONS,
  COMPOSITION_OPTIONS,
  CONTRAST_OPTIONS,
  DECISION_OPTIONS,
  EXHIBITOR_OPTIONS,
  FABRICATION_PROCESS_OPTIONS,
  HARD_TO_COPY_OPTIONS,
  PHOTO_TYPES,
  POSITIONING_OPTIONS,
  PROPORTION_OPTIONS,
  SCENE_OPTIONS,
  SCORE_FIELDS,
  SUPPORT_OPTIONS,
  TEXTURE_OPTIONS,
  labelFor,
  labelsFor,
  type PhotoRecord,
} from '../types'

interface RowData {
  label: string
  value?: string
}

function Section({ title, rows }: { title: string; rows: RowData[] }) {
  if (!rows.some((r) => r.value)) return null
  return (
    <section className="card mt-3">
      <p className="text-sm font-bold">{title}</p>
      {rows.map((r) =>
        r.value ? (
          <p key={r.label} className="mt-1.5 text-sm">
            <span className="font-semibold text-ink-500">{r.label} : </span>
            {r.value}
          </p>
        ) : null,
      )}
    </section>
  )
}

function fmtDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export function DetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { observations, loaded } = useObservations()
  const obs = observations.find((o) => o.id === id)
  const [photos, setPhotos] = useState<PhotoRecord[]>([])
  const [zoomId, setZoomId] = useState<string | null>(null)
  const [armed, setArmed] = useState(false)
  const urls = useRef(new Map<string, string>())

  useEffect(() => {
    if (!id) return
    let alive = true
    void dbGetPhotosFor(id).then((all) => {
      if (alive) setPhotos(all)
    })
    return () => {
      alive = false
    }
  }, [id])

  useEffect(() => {
    const map = urls.current
    return () => {
      map.forEach((u) => URL.revokeObjectURL(u))
      map.clear()
    }
  }, [])

  useEffect(() => {
    if (loaded && !obs) navigate('/', { replace: true })
  }, [loaded, obs, navigate])

  if (!obs) return <p className="py-10 text-center text-ink-500">Chargement…</p>

  function urlFor(photo: PhotoRecord): string {
    let url = urls.current.get(photo.id)
    if (!url) {
      url = URL.createObjectURL(photo.blob)
      urls.current.set(photo.id, url)
    }
    return url
  }

  async function shareMd() {
    if (!obs) return
    const name = `${slugify(obs.brandName) || 'observation'}.md`
    const result = await shareOrDownload(
      name,
      new Blob([observationToMarkdown(obs)], { type: 'text/markdown' }),
    )
    if (result === 'downloaded') toast('Résumé Markdown téléchargé')
    else if (result === 'shared') toast('Résumé Markdown partagé')
  }

  async function onDelete() {
    if (!obs) return
    if (!armed) {
      setArmed(true)
      return
    }
    await removeObservation(obs.id)
    toast('Observation supprimée')
    navigate('/', { replace: true })
  }

  const meta = [
    obs.date,
    obs.salonName,
    obs.country,
    labelFor(EXHIBITOR_OPTIONS, obs.exhibitorType),
    labelFor(CATEGORY_OPTIONS, obs.category),
    labelFor(POSITIONING_OPTIONS, obs.perceivedPositioning),
  ]
    .filter(Boolean)
    .join(' · ')

  const total = totalScore(obs)
  const zoomed = photos.find((p) => p.id === zoomId)

  return (
    <div className="pt-3">
      <header className="flex items-center gap-1">
        <button
          type="button"
          className="-ml-2 rounded-xl p-2"
          aria-label="Retour"
          onClick={() => navigate(-1)}
        >
          <IconBack className="h-6 w-6" />
        </button>
        <p className="min-w-0 flex-1 truncate text-lg font-extrabold">{observationTitle(obs)}</p>
        <ScoreBadge score={total} />
      </header>

      {meta ? <p className="mt-1 text-xs text-ink-500">{meta}</p> : null}

      {obs.signalOneLiner ? (
        <div className="card mt-3 border-clay-200 bg-clay-50">
          <p className="text-xs font-bold uppercase tracking-wide text-clay-700">Signal</p>
          <p className="mt-1 text-sm">{obs.signalOneLiner}</p>
        </div>
      ) : null}

      {obs.decision || obs.familySignal ? (
        <p className="mt-3 text-sm">
          {obs.decision ? (
            <span className="font-semibold">{labelFor(DECISION_OPTIONS, obs.decision)}</span>
          ) : null}
          {obs.decision && obs.familySignal ? ' · ' : ''}
          {obs.familySignal ? <span className="text-ink-500">{obs.familySignal}</span> : null}
        </p>
      ) : null}

      <div className="mt-3 flex gap-2">
        <Link to={`/observation/${obs.id}/edit`} className="btn btn-primary flex-1 no-underline">
          Modifier
        </Link>
        <button type="button" className="btn flex-1" onClick={() => void shareMd()}>
          Partager .md
        </button>
      </div>

      {total > 0 ? (
        <section className="card mt-3">
          <p className="text-sm font-bold">Score : {total}/25</p>
          {SCORE_FIELDS.map((f) => (
            <div key={f.key} className="mt-1.5 flex items-center justify-between text-sm">
              <span className="text-ink-500">{f.label}</span>
              <span className="font-bold">{obs.scoring[f.key] || '·'}/5</span>
            </div>
          ))}
        </section>
      ) : null}

      <Section
        title="Palette et matière"
        rows={[
          { label: 'Couleurs', value: labelsFor(COLOR_OPTIONS, obs.palette.dominantColors).join(', ') },
          { label: 'Accent', value: labelFor(COLOR_OPTIONS, obs.palette.accentColor) },
          { label: 'Contraste', value: labelFor(CONTRAST_OPTIONS, obs.palette.contrastLevel) },
          { label: 'Aspect', value: labelsFor(ASPECT_OPTIONS, obs.materialTexture.aspect).join(', ') },
          { label: 'Texture', value: labelsFor(TEXTURE_OPTIONS, obs.materialTexture.texture).join(', ') },
          {
            label: 'Procédé de fabrication',
            value: labelsFor(FABRICATION_PROCESS_OPTIONS, obs.materialTexture.fabricationProcess ?? []).join(', '),
          },
          {
            label: 'Difficile à copier',
            value: labelsFor(HARD_TO_COPY_OPTIONS, obs.materialTexture.hardToCopyWhy).join(', '),
          },
          { label: 'Notes', value: obs.materialTexture.notes },
        ]}
      />

      <Section
        title="Formes et usage"
        rows={[
          { label: 'Archétypes', value: labelsFor(ARCHETYPE_OPTIONS, obs.formsVolumes.archetype).join(', ') },
          { label: 'Proportions', value: labelFor(PROPORTION_OPTIONS, obs.formsVolumes.proportions) },
          { label: 'Détails', value: obs.formsVolumes.distinctiveDetails },
          { label: 'Scènes', value: labelsFor(SCENE_OPTIONS, obs.indoorOutdoorUse.scenes).join(', ') },
          { label: 'Crédibilité dedans/dehors', value: obs.indoorOutdoorUse.credibilityNotes },
        ]}
      />

      <Section
        title="Collection et merchandising"
        rows={[
          { label: 'Série coordonnée', value: obs.collectionSystem.coordinatedSeries ? 'oui' : '' },
          {
            label: 'Règle de composition',
            value: labelFor(COMPOSITION_OPTIONS, obs.collectionSystem.compositionRule),
          },
          { label: 'Univers en 3 mots', value: obs.collectionSystem.universe3Words },
          {
            label: 'Corner lisible en 3 s',
            value: obs.merchandisability.cornerIn3Seconds ? 'oui' : '',
          },
          {
            label: 'Supports vus',
            value: labelsFor(SUPPORT_OPTIONS, obs.merchandisability.supportsSeen).join(', '),
          },
          { label: 'Starter pack', value: obs.merchandisability.starterPackIdea },
        ]}
      />

      <Section
        title="Transposition"
        rows={[
          { label: 'Garder', value: obs.transposition.keep },
          { label: 'Écarter', value: obs.transposition.discard },
          { label: 'Règle de traduction', value: obs.transposition.translationRule },
          { label: "Nom d'univers provisoire", value: obs.transposition.provisionalUniverseName },
        ]}
      />

      {photos.length > 0 ? (
        <section className="card mt-3">
          <p className="text-sm font-bold">Photos</p>
          {PHOTO_TYPES.map((t) => {
            const group = photos.filter((p) => p.type === t.value)
            if (group.length === 0) return null
            return (
              <div key={t.value} className="mt-2">
                <p className="text-xs font-semibold text-ink-500">{t.label}</p>
                <div className="mt-1 grid grid-cols-3 gap-2">
                  {group.map((p) => (
                    <figure key={p.id} className="m-0">
                      <img
                        src={urlFor(p)}
                        alt={p.caption || t.label}
                        className="aspect-square w-full cursor-zoom-in rounded-lg object-cover"
                        onClick={() => setZoomId(p.id)}
                      />
                      {p.caption ? (
                        <figcaption className="mt-0.5 truncate text-[10px] text-ink-500">
                          {p.caption}
                        </figcaption>
                      ) : null}
                    </figure>
                  ))}
                </div>
              </div>
            )
          })}
        </section>
      ) : null}

      <p className="mt-4 text-center text-[11px] text-ink-500">
        Créée le {fmtDateTime(obs.createdAt)} · modifiée le {fmtDateTime(obs.updatedAt)}
      </p>

      <button
        type="button"
        className={`btn mt-3 w-full ${armed ? 'bg-red-700 text-white' : 'btn-danger'}`}
        onClick={() => void onDelete()}
      >
        {armed ? 'Confirmer la suppression ?' : "Supprimer l'observation"}
      </button>

      {zoomed ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setZoomId(null)}
        >
          <img src={urlFor(zoomed)} alt={zoomed.caption} className="max-h-full max-w-full rounded-lg" />
        </div>
      ) : null}
    </div>
  )
}
