// Exports (CSV, JSON, ZIP, Markdown), partage Android (Web Share API)
// et import de sauvegardes (JSON ou ZIP), validé avec zod.
import JSZip from 'jszip'
import { z } from 'zod'
import { dbGetAllPhotos, dbHasPhoto, dbPutObservation, dbPutPhoto } from '../db'
import { allObservations, byId, ensureLoaded, reloadObservations } from '../store'
import { observationToMarkdown } from './markdown'
import { totalScore } from './score'
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
  POSITIONING_OPTIONS,
  PROPORTION_OPTIONS,
  SCENE_OPTIONS,
  SUPPORT_OPTIONS,
  TEXTURE_OPTIONS,
  emptyObservation,
  labelFor,
  labelsFor,
  type Observation,
  type PhotoType,
} from '../types'

export function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

// Téléchargement / partage

export function download(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

export type ShareResult = 'shared' | 'downloaded' | 'cancelled'

export async function shareOrDownload(filename: string, blob: Blob): Promise<ShareResult> {
  const file = new File([blob], filename, { type: blob.type || 'application/octet-stream' })
  if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename })
      return 'shared'
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled'
      // partage indisponible : on retombe sur le téléchargement classique
    }
  }
  download(filename, blob)
  return 'downloaded'
}

// CSV (point-virgule + BOM : s'ouvre directement dans Excel français)

function csvCell(value: string | number | boolean): string {
  if (typeof value === 'boolean') return value ? 'oui' : 'non'
  return `"${String(value).replace(/"/g, '""')}"`
}

export function buildCsv(list: Observation[]): string {
  const headers = [
    'Date', 'Salon', 'Hall', 'Zone', 'Stand', 'Marque', 'Pays', 'Type exposant', 'Catégorie',
    'Positionnement', 'Signal', 'Couleurs dominantes', 'Couleur accent', 'Contraste', 'Aspect',
    'Texture', 'Procédé de fabrication', 'Difficile à copier', 'Notes matière', 'Archétypes', 'Détails distinctifs',
    'Proportions', 'Scènes', 'Crédibilité dedans/dehors', 'Série coordonnée',
    'Règle de composition', 'Univers en 3 mots', 'Corner lisible 3 s', 'Supports vus',
    'Starter pack', 'Score fit', 'Score signature', 'Score collectionnable', 'Score premium',
    'Score B2B', 'Score total /25', 'À garder', 'À écarter', 'Règle de traduction',
    "Nom d'univers", 'Famille de signaux', 'Décision', 'ID',
  ]
  const rows = list.map((o) => {
    const cells: (string | number | boolean)[] = [
      o.date, o.salonName, o.hall, o.zone, o.stand, o.brandName, o.country,
      labelFor(EXHIBITOR_OPTIONS, o.exhibitorType),
      labelFor(CATEGORY_OPTIONS, o.category),
      labelFor(POSITIONING_OPTIONS, o.perceivedPositioning),
      o.signalOneLiner,
      labelsFor(COLOR_OPTIONS, o.palette.dominantColors).join(' | '),
      labelFor(COLOR_OPTIONS, o.palette.accentColor),
      labelFor(CONTRAST_OPTIONS, o.palette.contrastLevel),
      labelsFor(ASPECT_OPTIONS, o.materialTexture.aspect).join(' | '),
      labelsFor(TEXTURE_OPTIONS, o.materialTexture.texture).join(' | '),
      labelsFor(FABRICATION_PROCESS_OPTIONS, o.materialTexture.fabricationProcess ?? []).join(' | '),
      labelsFor(HARD_TO_COPY_OPTIONS, o.materialTexture.hardToCopyWhy).join(' | '),
      o.materialTexture.notes,
      labelsFor(ARCHETYPE_OPTIONS, o.formsVolumes.archetype).join(' | '),
      o.formsVolumes.distinctiveDetails,
      labelFor(PROPORTION_OPTIONS, o.formsVolumes.proportions),
      labelsFor(SCENE_OPTIONS, o.indoorOutdoorUse.scenes).join(' | '),
      o.indoorOutdoorUse.credibilityNotes,
      o.collectionSystem.coordinatedSeries,
      labelFor(COMPOSITION_OPTIONS, o.collectionSystem.compositionRule),
      o.collectionSystem.universe3Words,
      o.merchandisability.cornerIn3Seconds,
      labelsFor(SUPPORT_OPTIONS, o.merchandisability.supportsSeen).join(' | '),
      o.merchandisability.starterPackIdea,
      o.scoring.fitMaisonDedansDehors, o.scoring.signatureHardToCopy, o.scoring.collectionnable,
      o.scoring.premiumAccessibleCredible, o.scoring.b2bReady, totalScore(o),
      o.transposition.keep, o.transposition.discard, o.transposition.translationRule,
      o.transposition.provisionalUniverseName,
      o.familySignal, labelFor(DECISION_OPTIONS, o.decision), o.id,
    ]
    return cells
  })
  return '\uFEFF' + [headers, ...rows].map((r) => r.map(csvCell).join(';')).join('\r\n')
}

// JSON (sauvegarde de sécurité en 1 tap)

export function buildJsonBlob(list: Observation[]): Blob {
  const payload = {
    app: 'mo-trend-spotter',
    format: 1,
    exportedAt: new Date().toISOString(),
    observations: list,
  }
  return new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
}

export async function backupJsonNow(): Promise<ShareResult> {
  await ensureLoaded()
  return shareOrDownload(`observations-mo-${today()}.json`, buildJsonBlob(allObservations()))
}

// ZIP complet : données + photos

interface BackupPhotoMeta {
  id: string
  observationId: string
  type: string
  caption: string
  createdAt: string
  file: string
}

export async function buildFullZipBlob(list: Observation[]): Promise<Blob> {
  const zip = new JSZip()
  const photos = await dbGetAllPhotos()
  const ids = new Set(list.map((o) => o.id))
  const metas: BackupPhotoMeta[] = []
  for (const p of photos) {
    if (!ids.has(p.observationId)) continue
    const file = `photos/${p.id}.jpg`
    zip.file(file, p.blob)
    metas.push({
      id: p.id,
      observationId: p.observationId,
      type: p.type,
      caption: p.caption,
      createdAt: p.createdAt,
      file,
    })
  }
  zip.file(
    'data.json',
    JSON.stringify(
      {
        app: 'mo-trend-spotter',
        format: 1,
        exportedAt: new Date().toISOString(),
        observations: list,
        photos: metas,
      },
      null,
      2,
    ),
  )
  return zip.generateAsync({ type: 'blob' })
}

// ZIP Markdown : un résumé .md par observation

export async function buildMarkdownZipBlob(list: Observation[]): Promise<Blob> {
  const zip = new JSZip()
  const used = new Set<string>()
  for (const o of list) {
    let name = `${o.date}-${slugify(o.brandName) || o.id.slice(0, 8)}`
    if (used.has(name)) name = `${name}-${o.id.slice(0, 6)}`
    used.add(name)
    zip.file(`${name}.md`, observationToMarkdown(o))
  }
  return zip.generateAsync({ type: 'blob' })
}

// Import (JSON ou ZIP), fusion par identifiant : le plus récent gagne

const photoMetaSchema = z.object({
  id: z.string().min(1),
  observationId: z.string().min(1),
  type: z.string().catch('ambiance'),
  caption: z.string().catch(''),
  createdAt: z.string().catch(''),
  file: z.string().min(1),
})

const backupSchema = z.object({
  observations: z.array(z.record(z.unknown())),
  photos: z.array(photoMetaSchema).optional(),
})

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : []
}

function asBoolean(value: unknown): boolean {
  return value === true
}

function asScore(value: unknown): number {
  const n = typeof value === 'number' ? Math.round(value) : 0
  return Math.max(0, Math.min(5, n))
}

function section(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
}

export function normalizeObservation(raw: Record<string, unknown>): Observation | null {
  const id = asString(raw.id)
  if (!id) return null
  const base = emptyObservation()
  base.id = id
  base.createdAt = asString(raw.createdAt) || base.createdAt
  base.updatedAt = asString(raw.updatedAt) || base.updatedAt
  base.salonName = asString(raw.salonName) || base.salonName
  base.date = asString(raw.date) || base.date
  base.hall = asString(raw.hall)
  base.zone = asString(raw.zone)
  base.stand = asString(raw.stand)
  base.brandName = asString(raw.brandName)
  base.country = asString(raw.country)
  base.exhibitorType = asString(raw.exhibitorType)
  base.category = asString(raw.category)
  base.perceivedPositioning = asString(raw.perceivedPositioning)
  base.signalOneLiner = asString(raw.signalOneLiner)
  const palette = section(raw.palette)
  base.palette = {
    dominantColors: asStringArray(palette.dominantColors),
    accentColor: asString(palette.accentColor),
    contrastLevel: asString(palette.contrastLevel),
  }
  const material = section(raw.materialTexture)
  base.materialTexture = {
    aspect: asStringArray(material.aspect),
    texture: asStringArray(material.texture),
    fabricationProcess: asStringArray(material.fabricationProcess),
    hardToCopyWhy: asStringArray(material.hardToCopyWhy),
    notes: asString(material.notes),
  }
  const forms = section(raw.formsVolumes)
  base.formsVolumes = {
    archetype: asStringArray(forms.archetype),
    distinctiveDetails: asString(forms.distinctiveDetails),
    proportions: asString(forms.proportions),
  }
  const usage = section(raw.indoorOutdoorUse)
  base.indoorOutdoorUse = {
    scenes: asStringArray(usage.scenes),
    credibilityNotes: asString(usage.credibilityNotes),
  }
  const system = section(raw.collectionSystem)
  base.collectionSystem = {
    coordinatedSeries: asBoolean(system.coordinatedSeries),
    compositionRule: asString(system.compositionRule),
    universe3Words: asString(system.universe3Words),
  }
  const merch = section(raw.merchandisability)
  base.merchandisability = {
    cornerIn3Seconds: asBoolean(merch.cornerIn3Seconds),
    supportsSeen: asStringArray(merch.supportsSeen),
    starterPackIdea: asString(merch.starterPackIdea),
  }
  const scoring = section(raw.scoring)
  base.scoring = {
    fitMaisonDedansDehors: asScore(scoring.fitMaisonDedansDehors),
    signatureHardToCopy: asScore(scoring.signatureHardToCopy),
    collectionnable: asScore(scoring.collectionnable),
    premiumAccessibleCredible: asScore(scoring.premiumAccessibleCredible),
    b2bReady: asScore(scoring.b2bReady),
  }
  const transposition = section(raw.transposition)
  base.transposition = {
    keep: asString(transposition.keep),
    discard: asString(transposition.discard),
    translationRule: asString(transposition.translationRule),
    provisionalUniverseName: asString(transposition.provisionalUniverseName),
  }
  base.familySignal = asString(raw.familySignal)
  base.decision = asString(raw.decision)
  return base
}

export interface ImportReport {
  added: number
  updated: number
  skipped: number
  photosAdded: number
}

export async function importFromFile(file: File): Promise<ImportReport> {
  const report: ImportReport = { added: 0, updated: 0, skipped: 0, photosAdded: 0 }
  await ensureLoaded()
  let parsed: z.infer<typeof backupSchema>
  let zip: JSZip | null = null
  if (file.name.toLowerCase().endsWith('.zip') || file.type.includes('zip')) {
    zip = await JSZip.loadAsync(file)
    const dataFile = zip.file('data.json')
    if (!dataFile) throw new Error('data.json introuvable dans le ZIP')
    parsed = backupSchema.parse(JSON.parse(await dataFile.async('string')))
  } else {
    parsed = backupSchema.parse(JSON.parse(await file.text()))
  }
  const importedIds = new Set<string>()
  for (const raw of parsed.observations) {
    const obs = normalizeObservation(raw)
    if (!obs) {
      report.skipped += 1
      continue
    }
    importedIds.add(obs.id)
    const existing = byId(obs.id)
    if (!existing) {
      await dbPutObservation(obs)
      report.added += 1
    } else if (obs.updatedAt > existing.updatedAt) {
      await dbPutObservation(obs)
      report.updated += 1
    } else {
      report.skipped += 1
    }
  }
  if (zip && parsed.photos) {
    for (const meta of parsed.photos) {
      if (!importedIds.has(meta.observationId) && !byId(meta.observationId)) continue
      if (await dbHasPhoto(meta.id)) continue
      const entry = zip.file(meta.file)
      if (!entry) continue
      const data = await entry.async('blob')
      await dbPutPhoto({
        id: meta.id,
        observationId: meta.observationId,
        type: (meta.type || 'ambiance') as PhotoType,
        caption: meta.caption,
        createdAt: meta.createdAt || new Date().toISOString(),
        blob: new Blob([data], { type: 'image/jpeg' }),
      })
      report.photosAdded += 1
    }
  }
  await reloadObservations()
  return report
}

// Stockage

export async function storageInfo(): Promise<{ usageMb: number; quotaMb: number } | null> {
  if (!navigator.storage?.estimate) return null
  const { usage = 0, quota = 0 } = await navigator.storage.estimate()
  return { usageMb: usage / (1024 * 1024), quotaMb: quota / (1024 * 1024) }
}

export async function requestPersistentStorage(): Promise<boolean> {
  if (!navigator.storage?.persist) return false
  return navigator.storage.persist()
}
