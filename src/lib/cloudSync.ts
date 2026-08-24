// Sauvegarde automatique vers Google Drive via un script Apps Script personnel.
// Après chaque fiche enregistrée : envoi des données (+ nouvelles photos) vers
// le dossier « M&O Spotter - Sauvegardes » du Drive. Sans réseau, l'envoi est
// mis en file d'attente et repart dès que la connexion revient.
// L'URL du script reste locale à l'appareil (localStorage), jamais dans le code.
import { useSyncExternalStore } from 'react'
import { dbGetAllPhotos } from '../db'
import { allObservations, ensureLoaded, subscribeObservations } from '../store'
import { toast } from './toast'

const URL_KEY = 'mo-sync-url'
const LAST_KEY = 'mo-sync-last'
const PHOTOS_KEY = 'mo-sync-photos'

export type SyncStatus = 'off' | 'idle' | 'pending' | 'syncing' | 'ok' | 'error' | 'offline'

export interface SyncState {
  status: SyncStatus
  lastOkAt: string | null
}

function readLS(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeLS(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // stockage indisponible : l'état restera en mémoire pour la session
  }
}

let state: SyncState = {
  status: readLS(URL_KEY) ? 'idle' : 'off',
  lastOkAt: readLS(LAST_KEY),
}
const listeners = new Set<() => void>()

function setState(partial: Partial<SyncState>): void {
  state = { ...state, ...partial }
  listeners.forEach((l) => l())
}

export function useSyncState(): SyncState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => {
        listeners.delete(cb)
      }
    },
    () => state,
  )
}

export function getSyncUrl(): string {
  return readLS(URL_KEY) ?? ''
}

export function isValidSyncUrl(url: string): boolean {
  return url.startsWith('https://script.google.com/') && url.includes('/exec')
}

export function setSyncUrl(url: string): void {
  writeLS(URL_KEY, url.trim())
  setState({ status: url.trim() ? 'pending' : 'off' })
  if (url.trim()) queueSync()
}

function syncedPhotoIds(): Set<string> {
  try {
    return new Set(JSON.parse(readLS(PHOTOS_KEY) ?? '[]') as string[])
  } catch {
    return new Set()
  }
}

function saveSyncedPhotoIds(ids: Set<string>): void {
  writeLS(PHOTOS_KEY, JSON.stringify([...ids]))
}

async function post(payload: unknown): Promise<void> {
  const url = getSyncUrl()
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`sync http ${res.status}`)
  // La réponse traverse une redirection Google : on la lit si possible,
  // sans exiger un JSON strict, mais un refus explicite du script fait échouer.
  const text = await res.text().catch(() => '')
  if (text.includes('"ok":false')) throw new Error('sync refusé par le script')
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '')
    reader.onerror = () => reject(reader.error ?? new Error('lecture photo impossible'))
    reader.readAsDataURL(blob)
  })
}

let timer: ReturnType<typeof setTimeout> | undefined
let inFlight = false
let runAgain = false

export function queueSync(): void {
  if (!getSyncUrl()) return
  setState({ status: 'pending' })
  clearTimeout(timer)
  timer = setTimeout(() => {
    void syncNow()
  }, 2500)
}

export async function syncNow(): Promise<boolean> {
  if (!getSyncUrl()) return false
  if (inFlight) {
    runAgain = true
    return false
  }
  if (!navigator.onLine) {
    setState({ status: 'offline' })
    return false
  }
  inFlight = true
  setState({ status: 'syncing' })
  try {
    await ensureLoaded()
    await post({
      kind: 'data',
      day: new Date().toISOString().slice(0, 10),
      json: {
        app: 'mo-trend-spotter',
        format: 1,
        exportedAt: new Date().toISOString(),
        observations: allObservations(),
      },
    })
    const photos = await dbGetAllPhotos()
    const done = syncedPhotoIds()
    for (const photo of photos) {
      if (done.has(photo.id)) continue
      await post({ kind: 'photo', id: photo.id, base64: await blobToBase64(photo.blob) })
      done.add(photo.id)
      saveSyncedPhotoIds(done)
    }
    const now = new Date().toISOString()
    writeLS(LAST_KEY, now)
    setState({ status: 'ok', lastOkAt: now })
    return true
  } catch {
    setState({ status: navigator.onLine ? 'error' : 'offline' })
    return false
  } finally {
    inFlight = false
    if (runAgain) {
      runAgain = false
      queueSync()
    }
  }
}

export async function testSync(): Promise<boolean> {
  if (!getSyncUrl()) return false
  try {
    await post({ kind: 'ping' })
    return true
  } catch {
    return false
  }
}

export function initCloudSync(): void {
  // Toute modification des observations déclenche un envoi (debounce 2,5 s)
  subscribeObservations(() => queueSync())
  window.addEventListener('online', () => {
    if (getSyncUrl()) void syncNow()
  })
  document.addEventListener('visibilitychange', () => {
    if (
      document.visibilityState === 'visible' &&
      (state.status === 'error' || state.status === 'offline' || state.status === 'pending')
    ) {
      void syncNow()
    }
  })
  // Configuration en un clic : ouvrir l'app avec ?sync=<URL du script>
  try {
    const params = new URLSearchParams(window.location.search)
    const url = params.get('sync')
    if (url && isValidSyncUrl(url)) {
      setSyncUrl(url)
      params.delete('sync')
      const rest = params.toString()
      const clean = window.location.pathname + (rest ? `?${rest}` : '') + window.location.hash
      window.history.replaceState(null, '', clean)
      toast('Sauvegarde Google Drive connectée')
    }
  } catch {
    // paramètre illisible : ignorer
  }
  if (getSyncUrl()) queueSync()
}
