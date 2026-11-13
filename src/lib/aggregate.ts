// Pré-remplissage d'une « Direction de collection » à partir des
// observations sélectionnées (fréquences des couleurs, matières, formes…).
// Tout reste modifiable ensuite dans l'éditeur.
import { totalScore } from './score'
import {
  ARCHETYPE_OPTIONS,
  ASPECT_OPTIONS,
  COLOR_OPTIONS,
  HARD_TO_COPY_OPTIONS,
  SCENE_OPTIONS,
  SCENE_ZONE_LABELS,
  SUPPORT_OPTIONS,
  TEXTURE_OPTIONS,
  labelFor,
  type Direction,
  type Observation,
  type SceneZone,
} from '../types'

function topValues(arrays: string[][], count: number): string[] {
  const freq = new Map<string, number>()
  for (const arr of arrays) {
    for (const value of arr) {
      if (value) freq.set(value, (freq.get(value) ?? 0) + 1)
    }
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([value]) => value)
}

function uniq(values: string[]): string[] {
  return [...new Set(values.map((v) => v.trim()).filter(Boolean))]
}

// Zone d'une scène ; une scène saisie librement (hors liste) compte « dedans ».
function sceneZone(value: string): SceneZone {
  return SCENE_OPTIONS.find((o) => o.value === value)?.zone ?? 'dedans'
}

const ZONE_ORDER: SceneZone[] = ['dedans', 'entre_deux', 'dehors', 'pro']

export function buildDirectionDraft(sources: Observation[]): Direction {
  const now = new Date().toISOString()
  const sorted = [...sources].sort((a, b) => totalScore(b) - totalScore(a))

  const colors = topValues(
    sorted.map((o) => [...o.palette.dominantColors, o.palette.accentColor]),
    4,
  ).map((v) => labelFor(COLOR_OPTIONS, v))
  const aspects = topValues(sorted.map((o) => o.materialTexture.aspect), 3).map((v) =>
    labelFor(ASPECT_OPTIONS, v),
  )
  const textures = topValues(sorted.map((o) => o.materialTexture.texture), 2).map((v) =>
    labelFor(TEXTURE_OPTIONS, v),
  )
  const signatures = topValues(sorted.map((o) => o.materialTexture.hardToCopyWhy), 3).map((v) =>
    labelFor(HARD_TO_COPY_OPTIONS, v),
  )
  const forms = topValues(sorted.map((o) => o.formsVolumes.archetype), 3).map((v) =>
    labelFor(ARCHETYPE_OPTIONS, v),
  )
  const scenes = topValues(sorted.map((o) => o.indoorOutdoorUse.scenes), 6)
  const scenesIn = (zone: SceneZone) =>
    scenes.filter((s) => sceneZone(s) === zone).map((v) => labelFor(SCENE_OPTIONS, v))
  const outdoorScenes = scenesIn('dehors')
  const supports = topValues(sorted.map((o) => o.merchandisability.supportsSeen), 3).map((v) =>
    labelFor(SUPPORT_OPTIONS, v),
  )
  const universeNames = uniq(sorted.map((o) => o.transposition.provisionalUniverseName))
  const universeWords = uniq(sorted.flatMap((o) => o.collectionSystem.universe3Words.split(/[,;/]+/)))
  const packs = uniq(sorted.map((o) => o.merchandisability.starterPackIdea))
  const rules = uniq(sorted.map((o) => o.transposition.translationRule))
  const keeps = uniq(sorted.map((o) => o.transposition.keep))
  const families = uniq(sorted.map((o) => o.familySignal))
  const bestSignal = sorted.map((o) => o.signalOneLiner).find(Boolean) ?? ''
  const cornerCount = sorted.filter((o) => o.merchandisability.cornerIn3Seconds).length
  const trioCount = sorted.filter((o) => o.collectionSystem.compositionRule === 'trio_tailles').length
  const nestingCount = sorted.filter((o) => o.collectionSystem.compositionRule === 'gigogne').length

  return {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    name: universeNames[0] ?? '',
    promise: bestSignal,
    codes: [
      aspects.length > 0 || textures.length > 0
        ? `1. Matière : ${[...aspects, ...textures].join(', ')}`
        : '1. Matière : à définir',
      signatures.length > 0 ? `2. Signature : ${signatures.join(', ')}` : '2. Signature : à définir',
      colors.length > 0 ? `3. Palette : ${colors.join(', ')}` : '3. Palette : à définir',
    ].join('\n'),
    systemForms: forms.join(' / '),
    systemSizes:
      nestingCount > trioCount
        ? 'Gigogne : S / M / L emboîtables'
        : trioCount > 0
          ? 'Trio de tailles : S / M / L'
          : '3 tailles : S / M / L (à préciser)',
    systemFinishes: aspects.slice(0, 2).join(' / '),
    systemBundles: packs.length > 0 ? packs.slice(0, 2).join(' · ') : 'Duo dedans/dehors à composer',
    scenes: ZONE_ORDER.map((zone) => {
      const list = scenesIn(zone)
      return list.length > 0 ? `${SCENE_ZONE_LABELS[zone]} : ${list.join(', ')}` : ''
    })
      .filter(Boolean)
      .join('\n'),
    merchCorner: `${cornerCount}/${sorted.length} stands lisibles en 3 secondes${
      supports.length > 0 ? ` · supports vus : ${supports.join(', ')}` : ''
    }`,
    merchPackVitrine: packs.join('\n'),
    merchPackTerrasse:
      outdoorScenes.length > 0 || forms.length > 0
        ? `À composer : ${forms.slice(0, 2).join(' + ') || 'formes clés'} pour ${
            outdoorScenes.join(' / ') || 'terrasse'
          }`
        : '',
    diffIndustriels: [signatures.length > 0 ? `Signature main : ${signatures.join(', ')}` : '', ...rules]
      .filter(Boolean)
      .join('\n'),
    diffPatrimonial:
      colors.length > 0
        ? `Palette ${colors.join(', ')} et usage dedans/dehors, loin du registre patrimonial`
        : '',
    notes: [
      universeNames.length > 1 ? `Autres noms d'univers : ${universeNames.slice(1).join(', ')}` : '',
      universeWords.length > 0 ? `Mots d'univers récoltés : ${universeWords.join(', ')}` : '',
      keeps.length > 0 ? `À garder (transpositions) : ${keeps.join(' · ')}` : '',
      families.length > 0 ? `Familles de signaux : ${families.join(', ')}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    sourceObservationIds: sorted.map((o) => o.id),
  }
}
