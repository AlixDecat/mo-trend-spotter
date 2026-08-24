// Brouillon d'observation avec enregistrement automatique (debounce 500 ms)
// et sauvegarde de secours quand on quitte l'écran.
import { useEffect, useRef, useState } from 'react'
import { byId, ensureLoaded, saveObservation } from '../store'
import { emptyObservation, type Observation } from '../types'

export type SaveState = 'idle' | 'pending' | 'saved'

export type SectionKey =
  | 'palette'
  | 'materialTexture'
  | 'formsVolumes'
  | 'indoorOutdoorUse'
  | 'collectionSystem'
  | 'merchandisability'
  | 'scoring'
  | 'transposition'

export function useObservationDraft(id: string | undefined) {
  const [obs, setObs] = useState<Observation | null>(null)
  const [missing, setMissing] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const dirty = useRef(false)
  const latest = useRef<Observation | null>(null)

  useEffect(() => {
    let alive = true
    void ensureLoaded().then(() => {
      if (!alive) return
      if (id) {
        const found = byId(id)
        if (!found) {
          setMissing(true)
          return
        }
        setObs(JSON.parse(JSON.stringify(found)) as Observation)
      } else {
        setObs(emptyObservation())
      }
    })
    return () => {
      alive = false
    }
  }, [id])

  useEffect(() => {
    latest.current = obs
    if (!obs || !dirty.current) return
    setSaveState('pending')
    const timer = setTimeout(() => {
      void saveObservation(obs).then(() => {
        dirty.current = false
        setSaveState('saved')
      })
    }, 500)
    return () => clearTimeout(timer)
  }, [obs])

  useEffect(() => {
    return () => {
      if (latest.current && dirty.current) void saveObservation(latest.current)
    }
  }, [])

  function patch(partial: Partial<Observation>): void {
    dirty.current = true
    setObs((o) => (o ? { ...o, ...partial } : o))
  }

  function patchSection(key: SectionKey, partial: Record<string, unknown>): void {
    dirty.current = true
    setObs((o) => {
      if (!o) return o
      const current = o[key] as unknown as Record<string, unknown>
      return { ...o, [key]: { ...current, ...partial } } as Observation
    })
  }

  async function flush(): Promise<Observation | null> {
    if (!obs) return null
    const saved = await saveObservation(obs)
    dirty.current = false
    setSaveState('saved')
    return saved
  }

  // Garantit que la fiche existe en base (utile dès qu'une photo est ajoutée).
  async function ensureSaved(): Promise<void> {
    if (!obs) return
    if (dirty.current || !byId(obs.id)) await flush()
  }

  return { obs, missing, saveState, patch, patchSection, flush, ensureSaved }
}
