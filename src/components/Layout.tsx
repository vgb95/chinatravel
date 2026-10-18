import { useEffect } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'Hoy', emoji: '📍' },
  { to: '/ciudades', label: 'Ciudades', emoji: '🗺️' },
  { to: '/buscar', label: 'Buscar', emoji: '🔍' },
  { to: '/frases', label: 'Frases', emoji: '🗣️' },
  { to: '/mas', label: 'Más', emoji: '📚' },
]

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  return null
}

export function Layout() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col">
      <ScrollToTop />
      <main className="flex-1 pb-24">
        <Outlet />
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-paper-3 bg-paper/95 backdrop-blur">
        <div className="pb-safe mx-auto flex max-w-2xl items-stretch justify-around px-1">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.to === '/'}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition-colors ${
                  isActive ? 'text-brand-600' : 'text-ink-faint'
                }`
              }
            >
              <span className="text-lg leading-none">{t.emoji}</span>
              {t.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

export function SubPageHeader({
  title,
  subtitle,
  backTo,
}: {
  title: string
  subtitle?: string
  backTo?: string
}) {
  const navigate = useNavigate()
  return (
    <header className="pt-safe sticky top-0 z-30 border-b border-paper-3 bg-paper/95 backdrop-blur">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button
          type="button"
          aria-label="Volver"
          onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
          className="pressable flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg shadow-sm"
        >
          ‹
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-[17px] font-bold">{title}</h1>
          {subtitle && <p className="truncate text-[11px] text-ink-faint">{subtitle}</p>}
        </div>
      </div>
    </header>
  )
}
