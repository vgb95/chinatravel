import { Link } from 'react-router-dom'
import { cities, prep } from '../data'
import { SubPageHeader } from '../components/Layout'
import { Chip, ProgressBar } from '../components/ui'
import { PREP_IDS } from '../lib/transfer'
import { usePrepProgress, useStore } from '../store'
import { isStandalone } from '../lib/util'

export function MorePage() {
  const prepProgress = usePrepProgress(PREP_IDS)
  const status = useStore((s) => s.status)
  const names = useStore((s) => s.names)
  const standalone = isStandalone()

  const totals = {
    v: Object.values(status.v).filter((s) => s === 'done').length,
    p: Object.values(status.p).filter((s) => s === 'done').length,
  }

  return (
    <div>
      <SubPageHeader title="Más" subtitle="Preparativos, info práctica y ajustes" />
      <div className="space-y-3 p-4">
        <div className="card p-3.5">
          <div className="flex items-center justify-between">
            <div className="text-[13px] font-semibold text-ink-faint">Progreso</div>
            <Chip tone={standalone ? 'jade' : 'gold'}>
              {standalone ? '📲 instalada' : '🌐 en Safari'}
            </Chip>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {(['v', 'p'] as const).map((id) => (
              <div key={id} className="rounded-xl bg-paper p-2.5">
                <div className="text-[12px] font-bold text-ink-soft">{names[id]}</div>
                <div className="mt-0.5 text-xl font-bold text-jade-600">{totals[id]}</div>
                <div className="text-[11px] text-ink-faint">sitios visitados</div>
              </div>
            ))}
          </div>
        </div>

        <Link to="/prep" className="card pressable block p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[15px] font-bold">🧳 Antes de salir</div>
              <div className="mt-0.5 text-[12px] text-ink-faint">
                {prep.groups.length} bloques de preparativos · {prepProgress.done}/{prepProgress.total}
              </div>
            </div>
            <span className="text-lg text-ink-faint">›</span>
          </div>
          <div className="mt-2">
            <ProgressBar pct={prepProgress.pct} />
          </div>
        </Link>

        <Link to="/info" className="card pressable flex items-center justify-between p-3.5">
          <div>
            <div className="text-[15px] font-bold">📖 Información práctica</div>
            <div className="mt-0.5 text-[12px] text-ink-faint">
              Pagos, internet, trenes, robotaxis, emergencias…
            </div>
          </div>
          <span className="text-lg text-ink-faint">›</span>
        </Link>

        <Link to="/ajustes" className="card pressable flex items-center justify-between p-3.5">
          <div>
            <div className="text-[15px] font-bold">⚙️ Ajustes</div>
            <div className="mt-0.5 text-[12px] text-ink-faint">
              Perfiles, exportar/importar progreso, instalación
            </div>
          </div>
          <span className="text-lg text-ink-faint">›</span>
        </Link>

        <div className="card p-3.5">
          <div className="text-[15px] font-bold">🗺️ Sobre esta guía</div>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-faint">
            {cities.length} paradas · {(cities.reduce((n, c) => n + c.routes.length, 0) || 0) + 0} rutas · contenido
            orientativo verificado en oct 2026. Los horarios y precios pueden cambiar: confirma en Amap o en las
            webs oficiales.
          </p>
        </div>
      </div>
    </div>
  )
}
