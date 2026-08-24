// Persistance locale : IndexedDB via la librairie idb.
// Tout est stocké sur l'appareil, l'app fonctionne sans réseau.
import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Direction, Observation, PhotoRecord } from './types'

interface SpotterDB extends DBSchema {
  observations: { key: string; value: Observation }
  photos: {
    key: string
    value: PhotoRecord
    indexes: { 'by-observation': string }
  }
  directions: { key: string; value: Direction }
}

let dbPromise: Promise<IDBPDatabase<SpotterDB>> | null = null

function getDb(): Promise<IDBPDatabase<SpotterDB>> {
  if (!dbPromise) {
    dbPromise = openDB<SpotterDB>('mo-spotter', 1, {
      upgrade(db) {
        db.createObjectStore('observations', { keyPath: 'id' })
        const photos = db.createObjectStore('photos', { keyPath: 'id' })
        photos.createIndex('by-observation', 'observationId')
        db.createObjectStore('directions', { keyPath: 'id' })
      },
    })
  }
  return dbPromise
}

// Observations
export async function dbGetAllObservations(): Promise<Observation[]> {
  return (await getDb()).getAll('observations')
}

export async function dbPutObservation(obs: Observation): Promise<void> {
  await (await getDb()).put('observations', obs)
}

export async function dbDeleteObservation(id: string): Promise<void> {
  const db = await getDb()
  const photos = await db.getAllFromIndex('photos', 'by-observation', id)
  const tx = db.transaction(['observations', 'photos'], 'readwrite')
  void tx.objectStore('observations').delete(id)
  for (const p of photos) void tx.objectStore('photos').delete(p.id)
  await tx.done
}

// Photos
export async function dbGetPhotosFor(observationId: string): Promise<PhotoRecord[]> {
  return (await getDb()).getAllFromIndex('photos', 'by-observation', observationId)
}

export async function dbGetAllPhotos(): Promise<PhotoRecord[]> {
  return (await getDb()).getAll('photos')
}

export async function dbPutPhoto(photo: PhotoRecord): Promise<void> {
  await (await getDb()).put('photos', photo)
}

export async function dbDeletePhoto(id: string): Promise<void> {
  await (await getDb()).delete('photos', id)
}

export async function dbHasPhoto(id: string): Promise<boolean> {
  return (await (await getDb()).getKey('photos', id)) !== undefined
}

// Directions de collection
export async function dbGetAllDirections(): Promise<Direction[]> {
  return (await getDb()).getAll('directions')
}

export async function dbGetDirection(id: string): Promise<Direction | undefined> {
  return (await getDb()).get('directions', id)
}

export async function dbPutDirection(direction: Direction): Promise<void> {
  await (await getDb()).put('directions', direction)
}

export async function dbDeleteDirection(id: string): Promise<void> {
  await (await getDb()).delete('directions', id)
}
