import type { Observation } from '../types'

export const SCORE_MAX = 25

// Paliers communs au badge de score et aux filtres « score minimum » :
// vert (fort) à partir de 18, orange (à surveiller) à partir de 13.
export const SCORE_STRONG = 18
export const SCORE_WATCH = 13
export const MIN_SCORE_FILTERS = [0, SCORE_WATCH, 15, SCORE_STRONG, 20]

export function totalScore(obs: Observation): number {
  const s = obs.scoring
  return (
    s.fitMaisonDedansDehors +
    s.signatureHardToCopy +
    s.collectionnable +
    s.premiumAccessibleCredible +
    s.b2bReady
  )
}

// Nombre de critères notés (0 = non noté) : un total sur 3 critères
// ne se compare pas à un total sur 5.
export function scoredCriteria(obs: Observation): number {
  return Object.values(obs.scoring).filter((v) => v > 0).length
}

export function isScored(obs: Observation): boolean {
  return totalScore(obs) > 0
}

export function averageScore(list: Observation[]): number {
  const scored = list.filter(isScored)
  if (scored.length === 0) return 0
  return scored.reduce((sum, o) => sum + totalScore(o), 0) / scored.length
}
