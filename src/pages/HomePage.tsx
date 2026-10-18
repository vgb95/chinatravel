import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { cities, trip } from '../data'
import { CityCard } from '../components/CityCard'
import { LegRow } from '../components/LegRow'
import { ProfileSwitch } from '../components/ProfileSwitch'
import { RouteCard } from '../components/RouteCard'
import { Chip, ProgressBar } from '../components/ui'
import { ITEM_KEYS, PREP_IDS } from '../lib/transfer'
import { usePrepProgress, useProgress } from '../store'
import { between, capitalize, diffDays, formatEsLong, todayIso } from '../lib/format'
import { isStandalone } from '../lib/util'

export function HomePage() {
  const today = todayIso()
  const daysToStart = diffDays(today, trip.start)
  const totalDays = diffDays(trip.start, trip.end) + 1
  const dayNumber = diffDays(trip.start, today) + 1
  const finished = today > trip.end
  const started = today >= trip.start
  const overall = useProgress(ITEM_KEYS)
  const prepProgress = usePrepProgress(PREP_IDS)
  const [showAllLegs, setShowAllLegs] = useState(false)

  const activeCities = useMemo(
    () => cities.filter((c) => between(today, c.stay.from, c.stay.to)),
    [today],
  )
  const todayLegs = trip.legs.filter((l) => l.date === today)
  const todayRoutes = useMemo(
    () =>
      activeCities.flatMap((city) =>
        city.routes.filter((r) => r.date === today).map((route) => ({ city, route })),
      ),
    [activeCities, today],
  )
  const todayNote = trip.notes[today]
  const nextCity = cities.find((c) => c.stay.from > today) ?? activeCities[0]

  return (
    <div>
      <div className="pt-safe relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 text-white">
        <div className="zh pointer-events-none absolute -top-8 -right-4 text-[130px] leading-none opacity-10 select-none">
          福
        </div>
        <div className="relative px-4 pt-5 pb-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold tracking-[0.25em] text-gold-300 uppercase">
                China Trip 2026
              </div>
              <h1 className="mt-1.5 text-[26px] leading-tight font-bold">Nuestro viaje a China</h1>
              <p className="mt-1 text-[12px] text-white/75">
                {capitalize(formatEsLong(trip.start))} — {formatEsLong(trip.end)} · {cities.length} paradas
              </p>
            </div>
            <ProfileSwitch tone="dark" />
          </div>

          <div className="mt-4 rounded-2xl bg-white/10 p-3.5 backdrop-blur">
            {!started && (
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="text-[26px] leading-none font-bold">
                    {daysToStart === 1 ? '¡Mañana!' : `Faltan ${daysToStart} días`}
                  </div>
                  <div className="mt-1.5 text-[12px] text-white/75">
                    Próxima parada: {nextCity?.emoji} {nextCity?.name} {nextCity?.nameZh}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-white/60">preparativos</div>
                  <div className="text-lg font-bold">{prepProgress.pct}%</div>
                </div>
              </div>
            )}
            {started && !finished && (
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="text-[26px] leading-none font-bold">
                    Día {dayNumber} <span className="text-white/60">/ {totalDays}</span>
                  </div>
                  <div className="mt-1.5 text-[12px] text-white/75">
                    {activeCities.length > 0
                      ? activeCities.map((c) => `${c.emoji} ${c.name}`).join(' · ')
                      : 'En ruta'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-white/60">del viaje completado</div>
                  <div className="text-lg font-bold">{overall.pct}%</div>
                </div>
              </div>
            )}
            {finished && (
              <div>
                <div className="text-[26px] leading-none font-bold">¡Viaje completado! 🏮</div>
                <div className="mt-1.5 text-[12px] text-white/75">
                  {overall.done} de {overall.total} sitios visitados
                </div>
              </div>
            )}
            <div className="mt-3">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-gold-400 transition-all duration-500"
                  style={{ width: `${finished ? 100 : started ? overall.pct : prepProgress.pct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-4 pt-4">
        {!isStandalone() && (
          <div className="card border-gold-200 bg-gold-50 p-3.5">
            <div className="flex items-center gap-2 text-[15px] font-bold">📲 Instálala en el móvil</div>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
              En iPhone: <b>Safari → Compartir → Añadir a pantalla de inicio</b>. Ábrela una vez con
              wifi para precargar todo; después funcionará sin conexión.
            </p>
            <Link to="/ajustes" className="mt-1 inline-block text-[13px] font-semibold text-brand-600">
              Ver instrucciones completas →
            </Link>
          </div>
        )}

        {started && !finished && (
          <section>
            <h2 className="mb-2 px-1 text-[15px] font-bold">Hoy · {capitalize(formatEsLong(today))}</h2>
            <div className="space-y-3">
              {todayNote && (
                <div className="rounded-xl border border-gold-200 bg-gold-50 p-3 text-[13px] leading-relaxed text-gold-800">
                  💡 {todayNote}
                </div>
              )}
              {activeCities.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {activeCities.map((c) => (
                    <Link key={c.id} to={`/ciudad/${c.id}`}>
                      <Chip tone="brand">
                        {c.emoji} {c.name} {c.nameZh}
                      </Chip>
                    </Link>
                  ))}
                </div>
              )}
              {todayLegs.map((leg) => (
                <LegRow key={leg.id} leg={leg} showDate={false} />
              ))}
              {todayRoutes.map(({ city, route }) => (
                <RouteCard key={`${city.id}-${route.id}`} city={city} route={route} defaultOpen />
              ))}
              {activeCities.length === 0 && todayLegs.length === 0 && (
                <div className="card p-3.5 text-[13px] text-ink-soft">
                  Día de tránsito. Revisa los trayectos en el plan completo. ✈️
                </div>
              )}
            </div>
          </section>
        )}

        {!started && (
          <section>
            <h2 className="mb-2 px-1 text-[15px] font-bold">Antes de salir</h2>
            <Link to="/prep" className="card pressable block p-3.5">
              <div className="flex items-center justify-between">
                <div className="text-[15px] font-semibold">🧳 Preparativos del viaje</div>
                <div className="text-sm font-bold text-jade-600">{prepProgress.pct}%</div>
              </div>
              <div className="mt-2">
                <ProgressBar pct={prepProgress.pct} />
              </div>
              <div className="mt-1.5 text-[12px] text-ink-faint">
                {prepProgress.done} de {prepProgress.total} tareas hechas
              </div>
            </Link>
          </section>
        )}

        <section>
          <h2 className="mb-2 px-1 text-[15px] font-bold">Paradas del viaje</h2>
          <div className="space-y-2.5">
            {cities.map((c) => (
              <CityCard key={c.id} city={c} />
            ))}
          </div>
        </section>

        <section>
          <button
            type="button"
            onClick={() => setShowAllLegs((v) => !v)}
            className="flex w-full items-center justify-between px-1 py-1 text-[15px] font-bold"
          >
            <span>🚄 Todos los trayectos</span>
            <span className={`text-ink-faint transition-transform ${showAllLegs ? 'rotate-180' : ''}`}>⌄</span>
          </button>
          {showAllLegs && (
            <div className="mt-1 space-y-2">
              {trip.legs.map((leg) => (
                <LegRow key={leg.id} leg={leg} />
              ))}
              <p className="px-1 text-[11px] text-ink-faint">
                Los horarios marcados como provisionales hay que confirmarlos con los billetes reales.
              </p>
            </div>
          )}
        </section>

        <footer className="pt-2 pb-6 text-center text-[11px] text-ink-faint">
          Hecho con ❤️ para nuestro viaje · funciona 100% offline
        </footer>
      </div>
    </div>
  )
}
