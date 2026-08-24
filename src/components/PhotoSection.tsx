import { useEffect, useRef, useState } from 'react'
import { dbDeletePhoto, dbGetPhotosFor, dbPutPhoto } from '../db'
import { addPhotoFromFile } from '../lib/photos'
import { toast } from '../lib/toast'
import type { PhotoRecord, PhotoType } from '../types'

export function PhotoSection({
  observationId,
  type,
  label,
  hint,
  onChanged,
}: {
  observationId: string
  type: PhotoType
  label: string
  hint?: string
  onChanged?: () => void
}) {
  const [photos, setPhotos] = useState<PhotoRecord[]>([])
  const [armedId, setArmedId] = useState<string | null>(null)
  const [zoomId, setZoomId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const urls = useRef(new Map<string, string>())

  useEffect(() => {
    let alive = true
    void dbGetPhotosFor(observationId).then((all) => {
      if (alive) setPhotos(all.filter((p) => p.type === type))
    })
    return () => {
      alive = false
    }
  }, [observationId, type])

  useEffect(() => {
    const map = urls.current
    return () => {
      map.forEach((u) => URL.revokeObjectURL(u))
      map.clear()
    }
  }, [])

  function urlFor(photo: PhotoRecord): string {
    let url = urls.current.get(photo.id)
    if (!url) {
      url = URL.createObjectURL(photo.blob)
      urls.current.set(photo.id, url)
    }
    return url
  }

  async function addFiles(files: File[]) {
    if (files.length === 0) return
    setBusy(true)
    try {
      const added: PhotoRecord[] = []
      for (const file of files) added.push(await addPhotoFromFile(observationId, type, file))
      setPhotos((prev) => [...prev, ...added])
      onChanged?.()
    } catch {
      toast('Photo impossible à enregistrer', 'err')
    } finally {
      setBusy(false)
    }
  }

  async function saveCaption(photo: PhotoRecord, caption: string) {
    await dbPutPhoto({ ...photo, caption })
    setPhotos((prev) => prev.map((p) => (p.id === photo.id ? { ...p, caption } : p)))
  }

  async function remove(photo: PhotoRecord) {
    if (armedId !== photo.id) {
      setArmedId(photo.id)
      return
    }
    setArmedId(null)
    await dbDeletePhoto(photo.id)
    const url = urls.current.get(photo.id)
    if (url) {
      URL.revokeObjectURL(url)
      urls.current.delete(photo.id)
    }
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id))
  }

  const zoomed = photos.find((p) => p.id === zoomId)

  return (
    <div className="mt-4">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold">{label}</span>
        {photos.length > 0 ? <span className="text-xs text-ink-500">{photos.length}</span> : null}
      </div>
      {hint ? <p className="hint">{hint}</p> : null}
      <div className="mt-2 grid grid-cols-3 gap-2">
        {photos.map((p) => (
          <div key={p.id} className="overflow-hidden rounded-xl border border-line bg-white">
            <img
              src={urlFor(p)}
              alt={p.caption || label}
              className="aspect-square w-full cursor-zoom-in object-cover"
              onClick={() => setZoomId(p.id)}
            />
            <input
              className="w-full border-0 bg-transparent px-1.5 py-1 text-xs outline-none"
              placeholder="Légende…"
              defaultValue={p.caption}
              onBlur={(e) => {
                if (e.target.value !== p.caption) void saveCaption(p, e.target.value)
              }}
            />
            <button
              type="button"
              className={`w-full py-1 text-xs font-semibold ${
                armedId === p.id ? 'bg-red-700 text-white' : 'text-ink-500'
              }`}
              onClick={() => void remove(p)}
            >
              {armedId === p.id ? 'Confirmer ?' : 'Supprimer'}
            </button>
          </div>
        ))}
        <label
          className={`flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-line text-ink-500 ${
            busy ? 'opacity-50' : ''
          }`}
        >
          <span className="text-2xl leading-none">+</span>
          <span className="text-xs font-semibold">{busy ? '…' : 'Photo'}</span>
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              const files = e.target.files ? Array.from(e.target.files) : []
              e.target.value = ''
              void addFiles(files)
            }}
          />
        </label>
      </div>
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
