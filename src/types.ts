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
  { value: 'distributeur', label: 'Distributeur' },
  { value: 'collectif', label: 'Collectif / pavillon' },
]

export const CATEGORY_OPTIONS: Option[] = [
  { value: 'contenants', label: 'Contenants' },
  { value: 'objet_deco', label: 'Objet déco' },
  { value: 'arts_table', label: 'Arts de la table' },
  { value: 'luminaire', label: 'Luminaire' },
  { value: 'mobilier', label: 'Mobilier' },
  { value: 'outdoor_living', label: 'Outdoor living' },
  { value: 'surface_matiere', label: 'Surface / matière' },
  { value: 'autre', label: 'Autre' },
]

export const POSITIONING_OPTIONS: Option[] = [
  { value: 'entree_gamme', label: 'Entrée de gamme' },
  { value: 'milieu_gamme', label: 'Milieu de gamme' },
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
  // Classées par famille : clairs, terres chaudes, verts et bleus, foncés, métal.
  { value: 'craie', label: 'Craie', hex: '#FDFDFB' },
  { value: 'blanc_casse', label: 'Blanc cassé', hex: '#F5F1E8' },
  { value: 'ecru', label: 'Écru', hex: '#EFE6D8' },
  { value: 'sable', label: 'Sable', hex: '#D9C7A7' },
  { value: 'argile_rose', label: 'Argile rosée', hex: '#D8A08A' },
  { value: 'terracotta', label: 'Terracotta', hex: '#C1654B' },
  { value: 'rouge_brique', label: 'Rouge brique', hex: '#9E4A38' },
  { value: 'bordeaux', label: 'Bordeaux / lie-de-vin', hex: '#6E2F3A' },
  { value: 'jaune_paille', label: 'Jaune paille', hex: '#E3C36B' },
  { value: 'ocre', label: 'Ocre', hex: '#C68A3B' },
  { value: 'caramel', label: 'Caramel', hex: '#B07A4C' },
  { value: 'brun_terre', label: 'Brun terre', hex: '#7A5540' },
  { value: 'chocolat', label: 'Chocolat', hex: '#4A3328' },
  { value: 'vert_sauge', label: 'Vert sauge', hex: '#A8B39A' },
  { value: 'vert_olive', label: 'Vert olive', hex: '#7A7B4F' },
  { value: 'vert_profond', label: 'Vert profond', hex: '#34493B' },
  { value: 'celadon', label: 'Céladon', hex: '#9BB7B4' },
  { value: 'bleu_pale', label: 'Bleu pâle', hex: '#AFC3D3' },
  { value: 'bleu_profond', label: 'Bleu profond', hex: '#33506E' },
  { value: 'gris_mineral', label: 'Gris minéral', hex: '#9A968E' },
  { value: 'noir_charbon', label: 'Noir charbon', hex: '#2B2B2B' },
  { value: 'laiton_dore', label: 'Laiton / doré', hex: '#B89B5E' },
]

export const ASPECT_OPTIONS: Option[] = [
  // Brillance, puis effets d'émail, puis surfaces brutes.
  { value: 'mat', label: 'Mat' },
  { value: 'satine', label: 'Satiné' },
  { value: 'brillant', label: 'Brillant' },
  { value: 'lustre_metallise', label: 'Lustré / métallisé' },
  { value: 'craquele', label: 'Craquelé' },
  { value: 'reactif_coulures', label: 'Réactif / coulures' },
  { value: 'mouchete', label: 'Moucheté' },
  { value: 'nuance_degrade', label: 'Nuancé / dégradé' },
  { value: 'engobe', label: 'Engobe' },
  { value: 'brut', label: 'Brut' },
  { value: 'sable', label: 'Sablé' },
  { value: 'mineral_pierre', label: 'Minéral / pierre' },
]

export const TEXTURE_OPTIONS: Option[] = [
  { value: 'lisse', label: 'Lisse' },
  { value: 'strie', label: 'Strié' },
  { value: 'cannele_cotele', label: 'Cannelé / côtelé' },
  { value: 'facette', label: 'Facetté' },
  { value: 'grave_incise', label: 'Gravé / incisé' },
  { value: 'relief_estampe', label: 'Relief / estampé' },
  { value: 'ajoure', label: 'Ajouré' },
  { value: 'granuleuse', label: 'Granuleuse' },
  { value: 'chamottee', label: 'Chamottée' },
  { value: 'irregularite_controlee', label: 'Irrégularité contrôlée' },
]

export const FABRICATION_PROCESS_OPTIONS: Option[] = [
  // Fait main d'abord, puis procédés outillés / industriels.
  { value: 'tournage', label: 'Tournage' },
  { value: 'corde', label: 'Corde' },
  { value: 'plaque', label: 'Plaque' },
  { value: 'modelage', label: 'Modelage' },
  { value: 'moule', label: 'Moule' },
  { value: 'presse', label: 'Presse' },
  { value: 'calibrage', label: 'Calibrage' },
  { value: 'extrusion', label: 'Extrusion' },
  { value: 'impression_3d', label: 'Impression 3D' },
]

export const HARD_TO_COPY_OPTIONS: Option[] = [
  { value: 'geste', label: 'Geste' },
  { value: 'decor_main', label: 'Décor main' },
  { value: 'superposition', label: 'Superposition' },
  { value: 'recette', label: 'Recette' },
  { value: 'cuisson', label: 'Cuisson' },
  { value: 'patine', label: 'Patine' },
  { value: 'grand_format', label: 'Grand format' },
  { value: 'terre_locale', label: 'Terre / matière locale' },
  { value: 'autre', label: 'Autre' },
]

export const ARCHETYPE_OPTIONS: Option[] = [
  // Volumes géométriques, typologies d'objets, puis caractères transverses.
  { value: 'cylindre', label: 'Cylindre' },
  { value: 'sphere', label: 'Sphère' },
  { value: 'ovoide', label: 'Ovoïde' },
  { value: 'conique', label: 'Conique' },
  { value: 'rectiligne', label: 'Rectiligne' },
  { value: 'coupe', label: 'Coupe' },
  { value: 'vasque', label: 'Vasque' },
  { value: 'jarre', label: 'Jarre' },
  { value: 'amphore', label: 'Amphore' },
  { value: 'bouteille', label: 'Bouteille / soliflore' },
  { value: 'totem', label: 'Totem' },
  { value: 'organique', label: 'Organique / asymétrique' },
  { value: 'sur_pied', label: 'Sur pied' },
  { value: 'empilable', label: 'Empilable' },
]

export const PROPORTION_OPTIONS: Option[] = [
  { value: 'bas_large', label: 'Bas et large' },
  { value: 'equilibre', label: 'Équilibré' },
  { value: 'haut_elance', label: 'Haut et élancé' },
]

export type SceneZone = 'dedans' | 'entre_deux' | 'dehors' | 'pro'

export interface SceneOption extends Option {
  zone: SceneZone
}

export const SCENE_ZONE_LABELS: Record<SceneZone, string> = {
  dedans: 'Dedans',
  entre_deux: 'Entre-deux',
  dehors: 'Dehors',
  pro: 'Pro (CHR)',
}

export const SCENE_OPTIONS: SceneOption[] = [
  { value: 'salon', label: 'Salon', zone: 'dedans' },
  { value: 'salle_a_manger', label: 'Salle à manger', zone: 'dedans' },
  { value: 'cuisine', label: 'Cuisine', zone: 'dedans' },
  { value: 'salle_de_bain', label: 'Salle de bain', zone: 'dedans' },
  { value: 'entree', label: 'Entrée', zone: 'dedans' },
  { value: 'veranda', label: "Véranda / jardin d'hiver", zone: 'entre_deux' },
  { value: 'terrasse', label: 'Terrasse', zone: 'dehors' },
  { value: 'balcon', label: 'Balcon', zone: 'dehors' },
  { value: 'patio', label: 'Patio', zone: 'dehors' },
  { value: 'jardin', label: 'Jardin', zone: 'dehors' },
  { value: 'bord_piscine', label: 'Bord de piscine', zone: 'dehors' },
  { value: 'hotel_restaurant', label: 'Hôtel / restaurant', zone: 'pro' },
]

export const COMPOSITION_OPTIONS: Option[] = [
  { value: 'duo', label: 'Duo' },
  { value: 'trio_tailles', label: 'Trio de tailles' },
  { value: 'gigogne', label: 'Gigogne / emboîtable' },
  { value: 'set_mixte', label: 'Set mixte' },
  { value: 'declinaison_couleurs', label: 'Déclinaison de couleurs' },
  { value: 'repetition_rythme', label: 'Répétition / rythme' },
  { value: 'piece_heros', label: 'Pièce héros + satellites' },
]

export const SUPPORT_OPTIONS: Option[] = [
  { value: 'story_card', label: 'Story card' },
  { value: 'set_compose', label: 'Set composé' },
  { value: 'podium', label: 'Podium' },
  { value: 'mur_etagere', label: 'Mur / étagère' },
  { value: 'table_dressee', label: 'Table dressée' },
  { value: 'mise_en_scene_vegetale', label: 'Mise en scène végétale' },
  { value: 'nuancier', label: 'Nuancier / échantillons' },
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
    // Optionnel : les fiches créées avant l'ajout du champ ne l'ont pas.
    fabricationProcess?: string[]
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
    materialTexture: { aspect: [], texture: [], fabricationProcess: [], hardToCopyWhy: [], notes: '' },
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
