import { useEffect } from 'react'
import { HashRouter, Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { IconCompass, IconDownload, IconHome, IconStar, IconZap } from './components/icons'
import { ToastHost } from './lib/toast'
import { DetailPage } from './pages/DetailPage'
import { DirectionEditorPage } from './pages/DirectionEditorPage'
import { DirectionListPage } from './pages/DirectionListPage'
import { ExportPage } from './pages/ExportPage'
import { FormPage } from './pages/FormPage'
import { HomePage } from './pages/HomePage'
import { QuickEntryPage } from './pages/QuickEntryPage'
import { TopPage } from './pages/TopPage'

function NavItem({ to, label, children }: { to: string; label: string; children: ReactNode }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-semibold no-underline ${
          isActive ? 'text-clay-600' : 'text-ink-500'
        }`
      }
    >
      {children}
      {label}
    </NavLink>
  )
}

function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex max-w-md items-center px-2">
        <NavItem to="/" label="Accueil">
          <IconHome className="h-6 w-6" />
        </NavItem>
        <NavItem to="/top" label="Top">
          <IconStar className="h-6 w-6" />
        </NavItem>
        <Link
          to="/quick"
          aria-label="Saisie rapide"
          className="mx-1 -mt-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-clay-600 text-white no-underline shadow-lg"
        >
          <IconZap className="h-7 w-7" />
        </Link>
        <NavItem to="/direction" label="Direction">
          <IconCompass className="h-6 w-6" />
        </NavItem>
        <NavItem to="/export" label="Export">
          <IconDownload className="h-6 w-6" />
        </NavItem>
      </div>
    </nav>
  )
}

function Shell() {
  const location = useLocation()
  const hideNav =
    location.pathname === '/quick' ||
    location.pathname === '/observation/new' ||
    location.pathname.endsWith('/edit')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="min-h-dvh">
      <main className={`mx-auto max-w-md px-4 ${hideNav ? 'pb-6' : 'pb-28'}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quick" element={<QuickEntryPage />} />
          <Route path="/observation/new" element={<FormPage />} />
          <Route path="/observation/:id" element={<DetailPage />} />
          <Route path="/observation/:id/edit" element={<FormPage />} />
          <Route path="/top" element={<TopPage />} />
          <Route path="/export" element={<ExportPage />} />
          <Route path="/direction" element={<DirectionListPage />} />
          <Route path="/direction/:id" element={<DirectionEditorPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      {!hideNav ? <BottomNav /> : null}
      <ToastHost />
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Shell />
    </HashRouter>
  )
}
