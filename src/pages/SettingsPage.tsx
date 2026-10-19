import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import QRCode from 'react-qr-code'
import { SubPageHeader } from '../components/Layout'
import { Chip, CopyButton, Segmented } from '../components/ui'
import { exportProgress, importProgress, ITEM_KEYS } from '../lib/transfer'
import { useStore, type ProfileId } from '../store'
import { copyText, isIos, isStandalone } from '../lib/util'

export function SettingsPage() {
  const state = useStore()
  const [exported, setExported] = useState('')
  const [importText, setImportText] = useState('')
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [installMsg, setInstallMsg] = useState('')
  const [exportMsg, setExportMsg] = useState('')
  const [persisted, setPersisted] = useState<boolean | null>(null)
  const exportRef = useRef<HTMLDivElement>(null)
  const importRef = useRef<HTMLElement>(null)
  const [searchParams, setSearchParams] = useSearchParams()

  const appUrl = `${window.location.origin}${import.meta.env.BASE_URL}`
  const standalone = isStandalone()

  useEffect(() => {
    navigator.storage
      ?.persisted?.()
      .then(setPersisted)
      .catch(() => setPersisted(null))
  }, [])

  // QR: la app se abre con #/ajustes?import=<código> y lo deja pegado, listo para importar.
  useEffect(() => {
    const incoming = searchParams.get('import')
    if (!incoming) return
    setImportText(incoming)
    setMessage({ ok: true, text: 'Código leído del QR ✓. Revisa y pulsa «Importar».' })
    setSearchParams({}, { replace: true })
    requestAnimationFrame(() => importRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }, [searchParams, setSearchParams])

  useEffect(() => {
    if (exported) exportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [exported])

  function doExport() {
    const text = exportProgress({
      names: state.names,
      status: state.status,
      stars: state.stars,
      notes: state.notes,
      prep: state.prep,
      rate: state.rate,
    })
    setExported(text)
    setExportMsg('')
    setMessage(null)
  }

  async function shareText(text: string, title: string): Promise<string> {
    try {
      if (navigator.share) {
        await navigator.share({ title, text })
        return ''
      }
    } catch {
      // usuario canceló o no soportado: copiamos
    }
    const ok = await copyText(text)
    return ok ? 'Copiado al portapapeles.' : 'No se pudo compartir. Copia manualmente.'
  }

  function doImport() {
    const result = importProgress(importText.trim())
    if (!result.ok) {
      setMessage({ ok: false, text: result.error })
      return
    }
    state.replaceData(result.data)
    const done = Object.values(result.data.status).reduce(
      (n, map) => n + Object.values(map).filter((v) => v === 'done').length,
      0,
    )
    setMessage({
      ok: true,
      text: `Importado ✓ (${done} ${done === 1 ? 'sitio marcado' : 'sitios marcados'} como visto${done === 1 ? '' : 's'}).`,
    })
    setImportText('')
  }

  return (
    <div>
      <SubPageHeader title="⚙️ Ajustes" subtitle="Perfiles, progreso y compartición" />
      <div className="space-y-4 p-4">
        <section className="card space-y-3 p-3.5">
          <h2 className="text-[15px] font-bold">👤 Perfiles</h2>
          {(['v', 'p'] as ProfileId[]).map((id) => (
            <label key={id} className="block">
              <span className="text-[12px] font-semibold text-ink-faint">
                {id === 'v' ? 'Perfil 1' : 'Perfil 2'}
              </span>
              <input
                value={state.names[id]}
                onChange={(e) => state.setName(id, e.target.value)}
                className="mt-1 w-full rounded-xl border border-paper-3 bg-white px-3 py-2 text-[14px] outline-none focus:border-brand-300"
              />
            </label>
          ))}
          <div>
            <span className="text-[12px] font-semibold text-ink-faint">Perfil activo</span>
            <div className="mt-1">
              <Segmented<ProfileId>
                value={state.activeProfile}
                onChange={(v) => state.setActiveProfile(v)}
                options={[
                  { value: 'v', label: state.names.v },
                  { value: 'p', label: state.names.p },
                ]}
              />
            </div>
          </div>
        </section>

        <section className="card space-y-2.5 p-3.5">
          <h2 className="text-[15px] font-bold">📲 Instalar en el otro iPhone</h2>
          {standalone ? (
            <Chip tone="jade">✓ Ya estás usando la app instalada</Chip>
          ) : (
            <p className="text-[13px] leading-relaxed text-ink-soft">
              {isIos() ? (
                <>
                  1. Abre esta web en <b>Safari</b> en el otro iPhone.
                  <br />
                  2. Toca <b>Compartir</b> (el cuadrado con la flecha).
                  <br />
                  3. Elige <b>«Añadir a pantalla de inicio»</b> y confirma.
                  <br />
                  4. Ábrela una vez con wifi y navega por todas las secciones para precargar el contenido.
                </>
              ) : (
                <>
                  En Android: menú ⋮ de Chrome → <b>«Añadir a pantalla de inicio»</b> / «Instalar app».
                </>
              )}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <CopyButton text={appUrl} label="Copiar enlace" />
            <button
              type="button"
              onClick={async () => setInstallMsg(await shareText(appUrl, 'China Trip 2026'))}
              className="pressable rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-semibold text-brand-600"
            >
              📤 Compartir enlace
            </button>
          </div>
          <p className="text-[11px] break-all text-ink-faint">{appUrl}</p>
          {installMsg && <p className="text-[11px] font-semibold text-ink-soft">{installMsg}</p>}
        </section>

        <section className="card space-y-2.5 p-3.5">
          <h2 className="text-[15px] font-bold">📤 Exportar mi progreso</h2>
          <p className="text-[12px] leading-relaxed text-ink-faint">
            Genera un texto pequeño con tu perfil actual (los dos perfiles van incluidos). Envíalo al otro móvil
            por AirDrop/Notas y pégalo en «Importar». La numeración coincide porque ambos tenéis la misma versión
            de la app ({ITEM_KEYS.length} sitios).
          </p>
          <button
            type="button"
            onClick={doExport}
            className="pressable w-full rounded-xl bg-brand-600 py-2.5 text-[14px] font-bold text-white"
          >
            Generar código de progreso
          </button>
          {exported && (
            <div ref={exportRef} className="space-y-2">
              <textarea
                readOnly
                value={exported}
                rows={4}
                className="w-full rounded-xl border border-paper-3 bg-paper p-2 font-mono text-[10px] break-all"
              />
              <div className="flex flex-wrap gap-2">
                <CopyButton text={exported} label="Copiar" />
                <button
                  type="button"
                  onClick={async () => setExportMsg(await shareText(exported, 'China Trip · progreso'))}
                  className="pressable rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-semibold text-brand-600"
                >
                  📤 Compartir
                </button>
                <span className="self-center text-[11px] text-ink-faint">{exported.length} caracteres</span>
              </div>
              {exportMsg && <p className="text-[11px] font-semibold text-ink-soft">{exportMsg}</p>}
              {exported.length <= 2000 && (
                <div className="space-y-2">
                  <div className="mx-auto w-fit rounded-2xl bg-white p-3 shadow-sm">
                    <QRCode
                      value={`${appUrl}#/ajustes?import=${encodeURIComponent(exported)}`}
                      size={168}
                      bgColor="#FFFFFF"
                      fgColor="#221C1A"
                    />
                  </div>
                  <p className="text-center text-[11px] leading-relaxed text-ink-faint">
                    Escanéalo con la cámara del otro iPhone: abre la guía con el código ya pegado. Si la app está
                    instalada, comparte el texto y pégalo dentro de la app (Safari y la app guardan progresos
                    separados).
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        <section ref={importRef} className="card space-y-2.5 p-3.5">
          <h2 className="text-[15px] font-bold">📥 Importar progreso</h2>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={4}
            placeholder="Pega aquí el código o el JSON exportado del otro móvil…"
            className="w-full rounded-xl border border-paper-3 bg-white p-2 font-mono text-[11px]"
          />
          <button
            type="button"
            onClick={doImport}
            disabled={!importText.trim()}
            className="pressable w-full rounded-xl bg-jade-600 py-2.5 text-[14px] font-bold text-white disabled:opacity-40"
          >
            Importar (reemplaza el progreso actual)
          </button>
          {message && (
            <p className={`text-[13px] font-semibold ${message.ok ? 'text-jade-600' : 'text-brand-600'}`}>
              {message.text}
            </p>
          )}
        </section>

        <section className="card space-y-2 p-3.5">
          <h2 className="text-[15px] font-bold">📦 Estado</h2>
          <ul className="space-y-1 text-[12px] text-ink-faint">
            <li>Versión de datos: {ITEM_KEYS.length} sitios en {Object.keys(state.status).length} perfiles</li>
            <li>Instalada como app: {standalone ? 'sí ✓' : 'no (abierta en Safari)'}</li>
            <li>Almacenamiento persistente: {persisted === null ? '—' : persisted ? 'sí ✓' : 'no (puede borrarse si no usas la app 7 días en Safari)'}</li>
            <li>Build: {__BUILD_TIME__}</li>
          </ul>
          {!persisted && (
            <button
              type="button"
              onClick={async () => {
                const ok = await navigator.storage?.persist?.()
                setPersisted(!!ok)
              }}
              className="pressable rounded-lg bg-paper-2 px-2.5 py-1.5 text-xs font-semibold text-ink-soft"
            >
              Pedir almacenamiento persistente
            </button>
          )}
        </section>

        <section className="card space-y-2 border-brand-100 p-3.5">
          <h2 className="text-[15px] font-bold">🧨 Zona peligrosa</h2>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('¿Borrar TODO el progreso y las notas de los dos perfiles? No se puede deshacer.')) {
                state.resetAll()
                setExported('')
                setMessage({ ok: true, text: 'Progreso borrado.' })
              }
            }}
            className="pressable w-full rounded-xl border border-brand-200 bg-brand-50 py-2.5 text-[14px] font-bold text-brand-700"
          >
            Borrar todo el progreso
          </button>
        </section>
      </div>
    </div>
  )
}
