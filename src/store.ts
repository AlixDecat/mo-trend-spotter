// Petit store observable pour les observations, branché sur IndexedDB.
// Les composants s'abonnent via useObservations() (useSyncExternalStore).
import { useSyncExternalStore } from 'react'
import { dbDeleteObservation, dbGetAllObservations, dbPutObservation } from './db'
import type { Observation } from './types'

interface Snapshot {
  observations: Observation[]
  loaded: boolean
}

let observations: Observation[] = []
let loaded = false
let snapshot: Snapshot = { observations, loaded }
const listeners = new Set<() => void>()
let loading: Promise<void> | null = null

function emit(): void {
  snapshot = { observations, loaded }
  listeners.forEach((l) => l())
}

export function ensureLoaded(): Promise<void> {
  if (!loading) {
    loading = dbGetAllObservations().then((all) => {
      observations = all
      loaded = true
      emit()
    })
  }
  return loading
}

export async function reloadObservations(): Promise<void> {
  observations = await dbGetAllObservations()
  loaded = true
  emit()
}

export function byId(id: string): Observation | undefined {
  return observations.find((o) => o.id === id)
}

export function allObservations(): Observation[] {
  return observations
}

export async function saveObservation(obs: Observation): Promise<Observation> {
  const plain = JSON.parse(JSON.stringify(obs)) as Observation
  plain.updatedAt = new Date().toISOString()
  await dbPutObservation(plain)
  const exists = observations.some((o) => o.id === plain.id)
  observations = exists
    ? observations.map((o) => (o.id === plain.id ? plain : o))
    : [...observations, plain]
  emit()
  return plain
}

export async function removeObservation(id: string): Promise<void> {
  await dbDeleteObservation(id)
  observations = observations.filter((o) => o.id !== id)
  emit()
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

// Permet à d'autres modules (ex. sauvegarde Drive) de réagir aux changements.
export function subscribeObservations(cb: () => void): () => void {
  return subscribe(cb)
}

function getSnapshot(): Snapshot {
  return snapshot
}

export function useObservations(): Snapshot {
  void ensureLoaded()
  return useSyncExternalStore(subscribe, getSnapshot)
}
