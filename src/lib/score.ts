import type { Observation } from '../types'

export const SCORE_MAX = 25

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

export function isScored(obs: Observation): boolean {
  return totalScore(obs) > 0
}

export function averageScore(list: Observation[]): number {
  const scored = list.filter(isScored)
  if (scored.length === 0) return 0
  return scored.reduce((sum, o) => sum + totalScore(o), 0) / scored.length
}
