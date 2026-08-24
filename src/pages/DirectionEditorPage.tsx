import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { IconBack } from '../components/icons'
import { dbDeleteDirection, dbGetDirection, dbPutDirection } from '../db'
import { shareOrDownload, slugify } from '../lib/export'
import { directionToMarkdown, observationTitle } from '../lib/markdown'
import { totalScore } from '../lib/score'
import { toast } from '../lib/toast'
import { useObservations } from '../store'
import type { Direction, Observation } from '../types'

function Field({
  label,
  value,
  onChange,
  rows,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  rows?: number
  placeholder?: string
}) {
  return (
    <>
      <label className="label">{label}</label>
      {rows ? (
        <textarea
          className="input"
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="input"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </>
  )
}

export function DirectionEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { observations } = useObservations()
  const [dir, setDir] = useState<Direction | null>(null)
  const [missing, setMissing] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'pending' | 'saved'>('idle')
  const [armed, setArmed] = useState(false)
  const dirty = useRef(false)
  const latest = useRef<Direction | null>(null)

  useEffect(() => {
    if (!id) return
    let alive = true
    void dbGetDirection(id).then((found) => {
      if (!alive) return
      if (!found) setMissing(true)
      else setDir(found)
    })
    return () => {
      alive = false
    }
  }, [id])

  useEffect(() => {
    if (missing) navigate('/direction', { replace: true })
  }, [missing, navigate])

  useEffect(() => {
    latest.current = dir
    if (!dir || !dirty.current) return
    setSaveState('pending')
    const timer = setTimeout(() => {
      void dbPutDirection({ ...dir, updatedAt: new Date().toISOString() }).then(() => {
        dirty.current = false
        setSaveState('saved')
      })
    }, 500)
    return () => clearTimeout(timer)
  }, [dir])

  useEffect(() => {
    return () => {
      if (latest.current && dirty.current) {
        void dbPutDirection({ ...latest.current, updatedAt: new Date().toISOString() })
      }
    }
  }, [])

  const sources = useMemo(
    () =>
      dir
        ? dir.sourceObservationIds
            .map((sid) => observations.find((o) => o.id === sid))
            .filter((o): o is Observation => Boolean(o))
        : [],
    [dir, observations],
  )

  if (!dir) return <p className="py-10 text-center text-ink-500">Chargement…</p>

  function patch(partial: Partial<Direction>) {
    dirty.current = true
    setDir((d) => (d ? { ...d, ...partial } : d))
  }

  const markdown = directionToMarkdown(dir, sources)

  async function shareMd() {
    if (!dir) return
    const result = await shareOrDownload(
      `direction-${slugify(dir.name) || 'collection'}.md`,
      new Blob([markdown], { type: 'text/markdown' }),
    )
    if (result === 'downloaded') toast('Direction téléchargée en Markdown')
    else if (result === 'shared') toast('Direction partagée')
  }

  async function copyMd() {
    try {
      await navigator.clipboard.writeText(markdown)
      toast('Markdown copié')
    } catch {
      toast('Copie impossible sur cet appareil', 'err')
    }
  }

  async function onDelete() {
    if (!dir) return
    if (!armed) {
      setArmed(true)
      return
    }
    await dbDeleteDirection(dir.id)
    toast('Direction supprimée')
    navigate('/direction', { replace: true })
  }

  return (
    <div className="pt-3">
      <div className="print:hidden">
        <header className="flex items-center gap-1">
          <button
            type="button"
            className="-ml-2 rounded-xl p-2"
            aria-label="Retour"
            onClick={() => navigate('/direction')}
          >
            <IconBack className="h-6 w-6" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-extrabold">{dir.name || 'Direction de collection'}</p>
            <p className="text-xs text-ink-500">
              {saveState === 'pending'
                ? 'Enregistrement…'
                : saveState === 'saved'
                  ? 'Enregistré ✓'
                  : `${sources.length} observation${sources.length > 1 ? 's' : ''} source${
                      sources.length > 1 ? 's' : ''
                    }`}
            </p>
          </div>
        </header>

        <div className="mt-2 flex gap-2">
          <button type="button" className="btn flex-1" onClick={() => void shareMd()}>
            Partager .md
          </button>
          <button type="button" className="btn flex-1" onClick={() => void copyMd()}>
            Copier
          </button>
          <button type="button" className="btn flex-1" onClick={() => window.print()}>
            PDF
          </button>
        </div>

        <Field label="Nom de la direction" value={dir.name} onChange={(v) => patch({ name: v })} placeholder="Terre d'Ardèche…" />
        <Field label="Promesse (1 phrase)" value={dir.promise} onChange={(v) => patch({ promise: v })} rows={2} />
        <Field label="3 codes non négociables" value={dir.codes} onChange={(v) => patch({ codes: v })} rows={4} />

        <p className="mt-5 text-base font-bold">Système de collection</p>
        <Field label="3 formes" value={dir.systemForms} onChange={(v) => patch({ systemForms: v })} />
        <Field label="3 tailles" value={dir.systemSizes} onChange={(v) => patch({ systemSizes: v })} />
        <Field label="2 finitions" value={dir.systemFinishes} onChange={(v) => patch({ systemFinishes: v })} />
        <Field label="Bundles" value={dir.systemBundles} onChange={(v) => patch({ systemBundles: v })} />
        <Field
          label="Scènes d'usage dedans/dehors"
          value={dir.scenes}
          onChange={(v) => patch({ scenes: v })}
          rows={2}
        />

        <p className="mt-5 text-base font-bold">Merchandising</p>
        <Field label="Idée corner" value={dir.merchCorner} onChange={(v) => patch({ merchCorner: v })} rows={2} />
        <Field
          label="Starter pack vitrine"
          value={dir.merchPackVitrine}
          onChange={(v) => patch({ merchPackVitrine: v })}
          rows={2}
        />
        <Field
          label="Starter pack terrasse"
          value={dir.merchPackTerrasse}
          onChange={(v) => patch({ merchPackTerrasse: v })}
          rows={2}
        />

        <p className="mt-5 text-base font-bold">Différenciation</p>
        <Field
          label="Vs industriels"
          value={dir.diffIndustriels}
          onChange={(v) => patch({ diffIndustriels: v })}
          rows={2}
        />
        <Field
          label="Vs premium patrimonial"
          value={dir.diffPatrimonial}
          onChange={(v) => patch({ diffPatrimonial: v })}
          rows={2}
        />
        <Field label="Notes" value={dir.notes} onChange={(v) => patch({ notes: v })} rows={3} />

        {sources.length > 0 ? (
          <section className="card mt-5">
            <p className="text-sm font-bold">Observations sources</p>
            {sources.map((o) => (
              <p key={o.id} className="mt-1.5 flex items-center justify-between text-sm">
                <span className="truncate">{observationTitle(o)}</span>
                <span className="ml-2 shrink-0 font-bold">{totalScore(o)}/25</span>
              </p>
            ))}
          </section>
        ) : null}

        <button
          type="button"
          className={`btn mt-5 w-full ${armed ? 'bg-red-700 text-white' : 'btn-danger'}`}
          onClick={() => void onDelete()}
        >
          {armed ? 'Confirmer la suppression ?' : 'Supprimer la direction'}
        </button>
        <div className="h-6" />
      </div>

      {/* Version imprimable (Imprimer → Enregistrer en PDF) */}
      <div className="hidden whitespace-pre-wrap text-sm print:block">{markdown}</div>
    </div>
  )
}
