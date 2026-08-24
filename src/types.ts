// Modèle de données et listes d'options (libellés français).
// Les valeurs stockées restent des identifiants stables sans accent.

export interface Option {
  value: string
  label: string
}

export interface ColorOption extends Option {
  hex: string
}

export const EXHIBITOR_OPTIONS: Option[] = [
  { value: 'editeur', label: 'Éditeur' },
  { value: 'artisan', label: 'Artisan' },
  { value: 'manufacturier', label: 'Manufacturier' },
  { value: 'studio', label: 'Studio' },
]

export const CATEGORY_OPTIONS: Option[] = [
  { value: 'contenants', label: 'Contenants' },
  { value: 'objet_deco', label: 'Objet déco' },
  { value: 'arts_table', label: 'Arts de la table' },
  { value: 'mobilier', label: 'Mobilier' },
  { value: 'outdoor_living', label: 'Outdoor living' },
  { value: 'surface_matiere', label: 'Surface / matière' },
  { value: 'autre', label: 'Autre' },
]

export const POSITIONING_OPTIONS: Option[] = [
  { value: 'entree_gamme', label: 'Entrée de gamme' },
  { value: 'premium_accessible', label: 'Premium accessible' },
  { value: 'premium', label: 'Premium' },
  { value: 'luxe', label: 'Luxe' },
]

export const CONTRAST_OPTIONS: Option[] = [
  { value: 'faible', label: 'Faible' },
  { value: 'moyen', label: 'Moyen' },
  { value: 'fort', label: 'Fort' },
]

export const COLOR_OPTIONS: ColorOption[] = [
  { value: 'terracotta', label: 'Terracotta', hex: '#C1654B' },
  { value: 'argile_rose', label: 'Argile rosée', hex: '#D8A08A' },
  { value: 'ocre', label: 'Ocre', hex: '#C68A3B' },
  { value: 'sable', label: 'Sable', hex: '#D9C7A7' },
  { value: 'ecru', label: 'Écru', hex: '#EFE6D8' },
  { value: 'blanc_casse', label: 'Blanc cassé', hex: '#F5F1E8' },
  { value: 'craie', label: 'Craie', hex: '#FDFDFB' },
  { value: 'noir_charbon', label: 'Noir charbon', hex: '#2B2B2B' },
  { value: 'gris_mineral', label: 'Gris minéral', hex: '#9A968E' },
  { value: 'brun_terre', label: 'Brun terre', hex: '#7A5540' },
  { value: 'vert_olive', label: 'Vert olive', hex: '#7A7B4F' },
  { value: 'vert_sauge', label: 'Vert sauge', hex: '#A8B39A' },
  { value: 'bleu_profond', label: 'Bleu profond', hex: '#33506E' },
  { value: 'celadon', label: 'Céladon', hex: '#9BB7B4' },
  { value: 'jaune_paille', label: 'Jaune paille', hex: '#E3C36B' },
  { value: 'rouge_brique', label: 'Rouge brique', hex: '#9E4A38' },
]

export const ASPECT_OPTIONS: Option[] = [
  { value: 'mat', label: 'Mat' },
  { value: 'satine', label: 'Satiné' },
  { value: 'brillant', label: 'Brillant' },
  { value: 'craquele', label: 'Craquelé' },
  { value: 'engobe', label: 'Engobe' },
  { value: 'brut', label: 'Brut' },
  { value: 'sable', label: 'Sablé' },
  { value: 'mineral_pierre', label: 'Minéral / pierre' },
]

export const TEXTURE_OPTIONS: Option[] = [
  { value: 'lisse', label: 'Lisse' },
  { value: 'strie', label: 'Strié' },
  { value: 'granuleuse', label: 'Granuleuse' },
  { value: 'chamottee', label: 'Chamottée' },
  { value: 'irregularite_controlee', label: 'Irrégularité contrôlée' },
]

export const HARD_TO_COPY_OPTIONS: Option[] = [
  { value: 'geste', label: 'Geste' },
  { value: 'superposition', label: 'Superposition' },
  { value: 'recette', label: 'Recette' },
  { value: 'cuisson', label: 'Cuisson' },
  { value: 'patine', label: 'Patine' },
  { value: 'autre', label: 'Autre' },
]

export const ARCHETYPE_OPTIONS: Option[] = [
  { value: 'cylindre', label: 'Cylindre' },
  { value: 'coupe', label: 'Coupe' },
  { value: 'jarre', label: 'Jarre' },
  { value: 'amphore', label: 'Amphore' },
  { value: 'ovoide', label: 'Ovoïde' },
  { value: 'rectiligne', label: 'Rectiligne' },
  { value: 'totem', label: 'Totem' },
  { value: 'empilable', label: 'Empilable' },
]

export const PROPORTION_OPTIONS: Option[] = [
  { value: 'bas_large', label: 'Bas et large' },
  { value: 'equilibre', label: 'Équilibré' },
  { value: 'haut_elance', label: 'Haut et élancé' },
]

export const SCENE_OPTIONS: Option[] = [
  { value: 'salon', label: 'Salon' },
  { value: 'entree', label: 'Entrée' },
  { value: 'terrasse', label: 'Terrasse' },
  { value: 'patio', label: 'Patio' },
  { value: 'balcon', label: 'Balcon' },
  { value: 'hotel_restaurant', label: 'Hôtel / restaurant' },
]

export const COMPOSITION_OPTIONS: Option[] = [
  { value: 'trio_tailles', label: 'Trio de tailles' },
  { value: 'duo', label: 'Duo' },
  { value: 'set_mixte', label: 'Set mixte' },
  { value: 'repetition_rythme', label: 'Répétition / rythme' },
]

export const SUPPORT_OPTIONS: Option[] = [
  { value: 'story_card', label: 'Story card' },
  { value: 'set_compose', label: 'Set composé' },
  { value: 'podium', label: 'Podium' },
  { value: 'bundle', label: 'Bundle' },
  { value: 'recommandation_assortiment', label: "Recommandation d'assortiment" },
]

export const DECISION_OPTIONS: Option[] = [
  { value: 'garder', label: 'Garder' },
  { value: 'surveiller', label: 'Surveiller' },
  { value: 'ecarter', label: 'Écarter' },
]

export type PhotoType = 'ambiance' | 'macro' | 'silhouette' | 'serie' | 'merchandising'

export const PHOTO_TYPES: { value: PhotoType; label: string; hint: string }[] = [
  { value: 'ambiance', label: 'Ambiance', hint: 'Le stand en plan large' },
  { value: 'macro', label: 'Macro matière', hint: 'Gros plan sur la surface, la texture' },
  { value: 'silhouette', label: 'Silhouette', hint: 'Une pièce isolée, de profil' },
  { value: 'serie', label: 'Série', hint: 'La déclinaison en tailles ou formes' },
  { value: 'merchandising', label: 'Merchandising', hint: 'Podium, story card, set composé' },
]

export const SCORE_FIELDS: { key: keyof Observation['scoring']; label: string; hint: string }[] = [
  {
    key: 'fitMaisonDedansDehors',
    label: 'Fit maison dedans/dehors',
    hint: 'Cohérent avec une collection à vivre dedans et dehors ?',
  },
  {
    key: 'signatureHardToCopy',
    label: 'Signature difficile à copier',
    hint: 'Geste, matière ou recette difficile à imiter ?',
  },
  {
    key: 'collectionnable',
    label: 'Collectionnable',
    hint: 'Se décline en série cohérente (tailles, formes) ?',
  },
  {
    key: 'premiumAccessibleCredible',
    label: 'Premium accessible crédible',
    hint: 'Le prix perçu tient-il en premium accessible ?',
  },
  {
    key: 'b2bReady',
    label: 'Prêt pour le B2B',
    hint: 'Crédible pour hôtellerie, restaurants, concept stores ?',
  },
]

export function labelFor(options: Option[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value
}

export function labelsFor(options: Option[], values: string[]): string[] {
  return values.map((v) => labelFor(options, v))
}

export interface Observation {
  id: string
  createdAt: string
  updatedAt: string
  salonName: string
  date: string
  hall: string
  zone: string
  stand: string
  brandName: string
  country: string
  exhibitorType: string
  category: string
  perceivedPositioning: string
  signalOneLiner: string
  palette: {
    dominantColors: string[]
    accentColor: string
    contrastLevel: string
  }
  materialTexture: {
    aspect: string[]
    texture: string[]
    hardToCopyWhy: string[]
    notes: string
  }
  formsVolumes: {
    archetype: string[]
    distinctiveDetails: string
    proportions: string
  }
  indoorOutdoorUse: {
    scenes: string[]
    credibilityNotes: string
  }
  collectionSystem: {
    coordinatedSeries: boolean
    compositionRule: string
    universe3Words: string
  }
  merchandisability: {
    cornerIn3Seconds: boolean
    supportsSeen: string[]
    starterPackIdea: string
  }
  scoring: {
    fitMaisonDedansDehors: number
    signatureHardToCopy: number
    collectionnable: number
    premiumAccessibleCredible: number
    b2bReady: number
  }
  transposition: {
    keep: string
    discard: string
    translationRule: string
    provisionalUniverseName: string
  }
  familySignal: string
  decision: string
}

export interface PhotoRecord {
  id: string
  observationId: string
  type: PhotoType
  caption: string
  createdAt: string
  blob: Blob
}

export interface Direction {
  id: string
  createdAt: string
  updatedAt: string
  name: string
  promise: string
  codes: string
  systemForms: string
  systemSizes: string
  systemFinishes: string
  systemBundles: string
  scenes: string
  merchCorner: string
  merchPackVitrine: string
  merchPackTerrasse: string
  diffIndustriels: string
  diffPatrimonial: string
  notes: string
  sourceObservationIds: string[]
}

export function emptyObservation(): Observation {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    salonName: 'Maison et Objet',
    date: now.slice(0, 10),
    hall: '',
    zone: '',
    stand: '',
    brandName: '',
    country: '',
    exhibitorType: '',
    category: '',
    perceivedPositioning: '',
    signalOneLiner: '',
    palette: { dominantColors: [], accentColor: '', contrastLevel: '' },
    materialTexture: { aspect: [], texture: [], hardToCopyWhy: [], notes: '' },
    formsVolumes: { archetype: [], distinctiveDetails: '', proportions: '' },
    indoorOutdoorUse: { scenes: [], credibilityNotes: '' },
    collectionSystem: { coordinatedSeries: false, compositionRule: '', universe3Words: '' },
    merchandisability: { cornerIn3Seconds: false, supportsSeen: [], starterPackIdea: '' },
    scoring: {
      fitMaisonDedansDehors: 0,
      signatureHardToCopy: 0,
      collectionnable: 0,
      premiumAccessibleCredible: 0,
      b2bReady: 0,
    },
    transposition: { keep: '', discard: '', translationRule: '', provisionalUniverseName: '' },
    familySignal: '',
    decision: '',
  }
}
