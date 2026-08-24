import { useSyncExternalStore } from 'react'

interface Toast {
  id: number
  text: string
  kind: 'ok' | 'err'
}

let toasts: Toast[] = []
let counter = 0
const listeners = new Set<() => void>()

function emit(): void {
  listeners.forEach((l) => l())
}

export function toast(text: string, kind: 'ok' | 'err' = 'ok'): void {
  const item: Toast = { id: ++counter, text, kind }
  toasts = [...toasts, item]
  emit()
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== item.id)
    emit()
  }, 3500)
}

export function ToastHost() {
  const list = useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => {
        listeners.delete(cb)
      }
    },
    () => toasts,
  )
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4">
      {list.map((t) => (
        <div
          key={t.id}
          className={`rounded-xl px-4 py-2 text-sm font-medium text-white shadow-lg ${
            t.kind === 'err' ? 'bg-red-700' : 'bg-ink'
          }`}
        >
          {t.text}
        </div>
      ))}
    </div>
  )
}
