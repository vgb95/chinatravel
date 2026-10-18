import { useEffect, useState } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { CitiesPage } from './pages/CitiesPage'
import { CityPage } from './pages/CityPage'
import { SearchPage } from './pages/SearchPage'
import { PhrasesPage } from './pages/PhrasesPage'
import { MorePage } from './pages/MorePage'
import { PrepPage } from './pages/PrepPage'
import { InfoPage } from './pages/InfoPage'
import { SettingsPage } from './pages/SettingsPage'

type UpdateFn = (reload?: boolean) => Promise<void>

function UpdateBanner({ needRefresh, offlineReady, updateSW }: {
  needRefresh: boolean
  offlineReady: boolean
  updateSW: UpdateFn | null
}) {
  const [showOffline, setShowOffline] = useState(false)

  useEffect(() => {
    if (!offlineReady) return
    setShowOffline(true)
    const t = setTimeout(() => setShowOffline(false), 4500)
    return () => clearTimeout(t)
  }, [offlineReady])

  if (needRefresh) {
    return (
      <div className="pt-safe fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 bg-brand-700 px-4 py-2.5 text-white shadow-lg">
          <span className="text-[13px] font-semibold">🔄 Hay una versión nueva con más contenido</span>
          <button
            type="button"
            onClick={() => updateSW?.(true)}
            className="pressable rounded-full bg-white px-3 py-1 text-[12px] font-bold text-brand-700"
          >
            Actualizar
          </button>
        </div>
      </div>
    )
  }

  if (showOffline) {
    return (
      <div className="pt-safe fixed inset-x-0 top-0 z-50">
        <div className="mx-auto max-w-2xl bg-jade-600 px-4 py-2.5 text-center text-[13px] font-semibold text-white shadow-lg">
          ✓ Lista para usar sin conexión
        </div>
      </div>
    )
  }

  return null
}

export default function App() {
  const [needRefresh, setNeedRefresh] = useState(false)
  const [offlineReady, setOfflineReady] = useState(false)
  const [updateSW, setUpdateSW] = useState<UpdateFn | null>(null)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const update = registerSW({
        immediate: true,
        onNeedRefresh: () => setNeedRefresh(true),
        onOfflineReady: () => setOfflineReady(true),
      })
      setUpdateSW(() => update)
    }
    navigator.storage?.persist?.().catch(() => {})
  }, [])

  return (
    <HashRouter>
      <UpdateBanner needRefresh={needRefresh} offlineReady={offlineReady} updateSW={updateSW} />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/ciudades" element={<CitiesPage />} />
          <Route path="/ciudad/:cityId" element={<CityPage />} />
          <Route path="/buscar" element={<SearchPage />} />
          <Route path="/frases" element={<PhrasesPage />} />
          <Route path="/mas" element={<MorePage />} />
          <Route path="/prep" element={<PrepPage />} />
          <Route path="/info" element={<InfoPage />} />
          <Route path="/ajustes" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
