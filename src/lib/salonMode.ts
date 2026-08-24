// « Mode salon » : contraste renforcé et cibles tactiles plus grandes.
// Préférence d'affichage conservée dans localStorage (les données, elles,
// restent exclusivement dans IndexedDB).
import { useSyncExternalStore } from 'react'

const KEY = 'mo-salon-mode'
let enabled = false
try {
  enabled = localStorage.getItem(KEY) === '1'
} catch {
  enabled = false
}

const listeners = new Set<() => void>()

function apply(): void {
  document.documentElement.classList.toggle('salon', enabled)
}
apply()

export function toggleSalonMode(): void {
  enabled = !enabled
  try {
    localStorage.setItem(KEY, enabled ? '1' : '0')
  } catch {
    // stockage indisponible : le mode reste actif pour la session
  }
  apply()
  listeners.forEach((l) => l())
}

export function useSalonMode(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => {
        listeners.delete(cb)
      }
    },
    () => enabled,
  )
}
