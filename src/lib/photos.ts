// Compression des photos avant stockage en Blob dans IndexedDB
// (largeur max 1600 px, qualité JPEG 0,75) pour ne pas saturer l'espace.
import { dbPutPhoto } from '../db'
import type { PhotoRecord, PhotoType } from '../types'
import { queueSync } from './cloudSync'

const MAX_SIZE = 1600
const JPEG_QUALITY = 0.75

export async function compressImage(file: Blob): Promise<Blob> {
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    const scale = Math.min(1, MAX_SIZE / Math.max(img.naturalWidth, img.naturalHeight))
    const width = Math.max(1, Math.round(img.naturalWidth * scale))
    const height = Math.max(1, Math.round(img.naturalHeight * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(img, 0, 0, width, height)
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY),
    )
    return blob ?? file
  } catch {
    return file
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function addPhotoFromFile(
  observationId: string,
  type: PhotoType,
  file: File,
): Promise<PhotoRecord> {
  const blob = await compressImage(file)
  const record: PhotoRecord = {
    id: crypto.randomUUID(),
    observationId,
    type,
    caption: '',
    createdAt: new Date().toISOString(),
    blob,
  }
  await dbPutPhoto(record)
  queueSync()
  return record
}
