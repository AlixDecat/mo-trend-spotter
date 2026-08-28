// Deux observations d'exemple (identifiants fixes : recharger ne duplique pas).
// Les photos sont des visuels générés localement, juste pour montrer l'usage.
import { dbPutPhoto } from './db'
import { saveObservation } from './store'
import { emptyObservation, type Observation, type PhotoType } from './types'

async function makePhoto(colors: [string, string], label: string): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = 800
  canvas.height = 600
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas indisponible')
  const gradient = ctx.createLinearGradient(0, 0, 800, 600)
  gradient.addColorStop(0, colors[0])
  gradient.addColorStop(1, colors[1])
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 800, 600)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.font = 'bold 44px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`Exemple · ${label}`, 400, 315)
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.8))
  if (!blob) throw new Error('export canvas impossible')
  return blob
}

function demoTerraNova(): Observation {
  const o = emptyObservation()
  o.id = 'demo-1'
  o.hall = '6'
  o.zone = 'A'
  o.stand = 'A12'
  o.brandName = 'Terra Nova Ceramics'
  o.country = 'Portugal'
  o.exhibitorType = 'artisan'
  o.category = 'contenants'
  o.perceivedPositioning = 'premium_accessible'
  o.signalOneLiner =
    'Grès chamotté à engobe blanc cassé, série dedans/dehors assumée du salon à la terrasse.'
  o.palette = { dominantColors: ['terracotta', 'ecru', 'sable'], accentColor: 'vert_olive', contrastLevel: 'moyen' }
  o.materialTexture = {
    aspect: ['mat', 'engobe', 'brut'],
    texture: ['chamottee', 'irregularite_controlee'],
    fabricationProcess: ['tournage', 'corde'],
    hardToCopyWhy: ['geste', 'recette'],
    notes: "L'engobe laisse apparaître la chamotte, toucher minéral très doux.",
  }
  o.formsVolumes = {
    archetype: ['jarre', 'coupe', 'empilable'],
    distinctiveDetails: 'Col légèrement pincé, anses pleines',
    proportions: 'equilibre',
  }
  o.indoorOutdoorUse = {
    scenes: ['salon', 'terrasse', 'patio'],
    credibilityNotes: 'Grandes jarres présentées sur graviers : usage dehors crédible.',
  }
  o.collectionSystem = {
    coordinatedSeries: true,
    compositionRule: 'trio_tailles',
    universe3Words: 'minéral, chaleureux, brut',
  }
  o.merchandisability = {
    cornerIn3Seconds: true,
    supportsSeen: ['story_card', 'podium'],
    starterPackIdea: 'Trio de jarres + coupe XL',
  }
  o.scoring = {
    fitMaisonDedansDehors: 5,
    signatureHardToCopy: 4,
    collectionnable: 5,
    premiumAccessibleCredible: 4,
    b2bReady: 3,
  }
  o.transposition = {
    keep: 'La matière chamottée et la palette terre',
    discard: 'Les anses trop fragiles pour le B2B',
    translationRule: "Traduire l'engobe en bicolore dedans/dehors",
    provisionalUniverseName: "Terre d'Ardèche",
  }
  o.familySignal = 'Grès chamotté naturel'
  o.decision = 'garder'
  return o
}

function demoStudioLumen(): Observation {
  const o = emptyObservation()
  o.id = 'demo-2'
  o.hall = '7'
  o.zone = 'C'
  o.stand = 'C03'
  o.brandName = 'Studio Lumen'
  o.country = 'France'
  o.exhibitorType = 'studio'
  o.category = 'objet_deco'
  o.perceivedPositioning = 'premium'
  o.signalOneLiner = "Totems sculpturaux mats, jeu d'ombres très graphique en vitrine."
  o.palette = {
    dominantColors: ['craie', 'gris_mineral', 'noir_charbon'],
    accentColor: 'ocre',
    contrastLevel: 'fort',
  }
  o.materialTexture = {
    aspect: ['mat', 'mineral_pierre'],
    texture: ['lisse'],
    fabricationProcess: ['moule'],
    hardToCopyWhy: ['superposition'],
    notes: '',
  }
  o.formsVolumes = {
    archetype: ['totem', 'rectiligne'],
    distinctiveDetails: 'Empilements décalés, arêtes adoucies',
    proportions: 'haut_elance',
  }
  o.indoorOutdoorUse = {
    scenes: ['entree', 'hotel_restaurant'],
    credibilityNotes: '',
  }
  o.collectionSystem = {
    coordinatedSeries: false,
    compositionRule: 'repetition_rythme',
    universe3Words: 'graphique, minéral, calme',
  }
  o.merchandisability = { cornerIn3Seconds: false, supportsSeen: ['podium'], starterPackIdea: '' }
  o.scoring = {
    fitMaisonDedansDehors: 3,
    signatureHardToCopy: 4,
    collectionnable: 2,
    premiumAccessibleCredible: 3,
    b2bReady: 3,
  }
  o.transposition = {
    keep: 'Le rythme des silhouettes en vitrine',
    discard: 'Trop sculptural pour les arts de la table',
    translationRule: '',
    provisionalUniverseName: '',
  }
  o.familySignal = 'Sculptural minimal'
  o.decision = 'surveiller'
  return o
}

export async function seedExamples(): Promise<number> {
  const list = [demoTerraNova(), demoStudioLumen()]
  for (const obs of list) await saveObservation(obs)

  const photos: {
    id: string
    observationId: string
    type: PhotoType
    caption: string
    colors: [string, string]
    label: string
  }[] = [
    { id: 'demo-1-a', observationId: 'demo-1', type: 'ambiance', caption: "Stand vu de l'allée", colors: ['#C1654B', '#D9C7A7'], label: 'Ambiance' },
    { id: 'demo-1-b', observationId: 'demo-1', type: 'macro', caption: 'Grès chamotté, engobe', colors: ['#B65C3F', '#7A5540'], label: 'Macro' },
    { id: 'demo-2-a', observationId: 'demo-2', type: 'ambiance', caption: 'Totems en vitrine', colors: ['#9A968E', '#2B2B2B'], label: 'Ambiance' },
    { id: 'demo-2-b', observationId: 'demo-2', type: 'silhouette', caption: 'Profil sculptural', colors: ['#33506E', '#9BB7B4'], label: 'Silhouette' },
  ]
  for (const p of photos) {
    await dbPutPhoto({
      id: p.id,
      observationId: p.observationId,
      type: p.type,
      caption: p.caption,
      createdAt: new Date().toISOString(),
      blob: await makePhoto(p.colors, p.label),
    })
  }
  return list.length
}
