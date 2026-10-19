// Stub de `virtual:pwa-register` para el modo singlefile (sin service worker).
// Solo se usa mediante alias de Vite; el build normal usa el módulo real de vite-plugin-pwa.
type UpdateFn = (reload?: boolean) => Promise<void>

export function registerSW(_options?: {
  immediate?: boolean
  onNeedRefresh?: () => void
  onOfflineReady?: () => void
}): UpdateFn {
  void _options
  return async () => {}
}
