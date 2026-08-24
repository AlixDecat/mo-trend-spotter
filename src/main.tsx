import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import './style.css'

registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(<App />)

// En développement : window.__seed() ajoute 2 observations d'exemple.
if (import.meta.env.DEV) {
  void import('./seed').then((m) => {
    ;(window as unknown as Record<string, unknown>).__seed = m.seedExamples
  })
}
