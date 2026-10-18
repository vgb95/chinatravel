import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { getCity, cityItems, itemKey, SECTION_KEYS, SECTION_LABELS, trip, type SectionKey } from '../data'
import { ItemCard } from '../components/ItemCard'
import { RouteCard } from '../components/RouteCard'
import { LegRow } from '../components/LegRow'
import { ProfileSwitch } from '../components/ProfileSwitch'
import { SubPageHeader } from '../components/Layout'
import { EmptyState, ProgressBar, Segmented } from '../components/ui'
import { useProgress, useStore } from '../store'
import { capitalize, formatEsShort, todayIso } from '../lib/format'

type Filter = 'todo' | 'must' | 'pending' | 'done'

export function CityPage() {
  const { cityId } = useParams()
  const [searchParams] = useSearchParams()
  const focus = searchParams.get('focus')
  const city = cityId ? getCity(cityId) : undefined

  const [openItem, setOpenItem] = useState<string | null>(focus)
  const [filter, setFilter] = useState<Filter>('todo')
  const [showPractical, setShowPractical] = useState(false)
  const today = todayIso()

  const keys = useMemo(() => (city ? cityItems(city).map((ci) => itemKey(city.id, ci.item.id)) : []), [city])
  const progress = useProgress(keys)
  const statusMap = useStore((s) => s.status[s.activeProfile])

  if (!city) {
    return (
      <div>
        <SubPageHeader title="Ciudad no encontrada" backTo="/ciudades" />
        <EmptyState emoji="🧭" text="Esta ciudad no existe en la guía." />
      </div>
    )
  }

  const cityLegs = trip.legs.filter((l) => l.date >= city.stay.from && l.date <= city.stay.to)
  const sortedRoutes = [...city.routes].sort((a, b) => (a.date ?? '9999').localeCompare(b.date ?? '9999'))

  const visible = (key: string, must: boolean) => {
    const st = statusMap[key] ?? null
    if (filter === 'must') return must
    if (filter === 'pending') return st !== 'done' && st !== 'skip'
    if (filter === 'done') return st === 'done'
    return true
  }

  return (
    <div>
      <SubPageHeader
        title={`${city.emoji} ${city.name} ${city.nameZh}`}
        subtitle={`${formatEsShort(city.stay.from)}${
          city.stay.to !== city.stay.from ? ` – ${formatEsShort(city.stay.to)}` : ''
        }${city.stay.nights > 0 ? ` · ${city.stay.nights} noches` : ''}${
          city.stay.base ? ` · ${city.stay.base}` : ''
        }`}
      />

      <div className="space-y-4 p-4">
        <div className="card p-3.5">
          <p className="text-[13px] leading-relaxed text-ink-soft">
            <span className="font-semibold text-ink">{city.tagline}. </span>
            {city.intro}
          </p>
          {city.practical && (
            <>
              <button
                type="button"
                onClick={() => setShowPractical((v) => !v)}
                className="mt-2 text-[13px] font-semibold text-brand-600"
              >
                {showPractical ? 'Ocultar info práctica ⌃' : 'Info práctica (metro, traslados, avisos) ⌄'}
              </button>
              {showPractical && (
                <div className="mt-2 space-y-2 rounded-xl bg-paper p-3 text-[13px] text-ink-soft">
                  {city.practical.summary && <p>{city.practical.summary}</p>}
                  {city.practical.metro && (
                    <p>
                      <b className="text-ink">🚇 Metro:</b> {city.practical.metro}
                    </p>
                  )}
                  {city.practical.transport && (
                    <p>
                      <b className="text-ink">🚕 Transporte:</b> {city.practical.transport}
                    </p>
                  )}
                  {city.practical.tips.length > 0 && (
                    <ul className="space-y-1">
                      {city.practical.tips.map((t, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-gold-600">•</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </>
          )}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1">
              <ProgressBar pct={progress.pct} />
            </div>
            <span className="text-[12px] font-bold text-jade-600">
              {progress.done}/{progress.total} · {progress.pct}%
            </span>
            <ProfileSwitch />
          </div>
        </div>

        {cityLegs.length > 0 && (
          <section>
            <h2 className="mb-2 px-1 text-[15px] font-bold">🚄 Trayectos</h2>
            <div className="space-y-2">
              {cityLegs.map((leg) => (
                <LegRow key={leg.id} leg={leg} />
              ))}
            </div>
          </section>
        )}

        {sortedRoutes.length > 0 && (
          <section>
            <h2 className="mb-2 px-1 text-[15px] font-bold">🗓️ Rutas por día</h2>
            <div className="space-y-2.5">
              {sortedRoutes.map((route) => {
                const stopsKeys = route.stops.map((s) => itemKey(city.id, s.itemId))
                let done = 0
                for (const k of stopsKeys) if (statusMap[k] === 'done') done++
                return (
                  <RouteCard
                    key={route.id}
                    city={city}
                    route={route}
                    progress={{ done, skip: 0, total: stopsKeys.length, pct: 0 }}
                    defaultOpen={route.date === today || (sortedRoutes.length === 1 && !route.date)}
                    onOpenItem={(id) => setOpenItem(id)}
                  />
                )
              })}
            </div>
          </section>
        )}

        <div className="-mx-4 border-y border-paper-3 bg-paper/95 px-4 py-2">
          <Segmented<Filter>
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'todo', label: 'Todo' },
              { value: 'must', label: '⭐ Impr.' },
              { value: 'pending', label: 'Pendientes' },
              { value: 'done', label: '✓ Vistos' },
            ]}
          />
        </div>

        {SECTION_KEYS.map((section: SectionKey) => {
          const items = city.sections[section]
          const shown = items.filter((item) => visible(itemKey(city.id, item.id), item.must))
          if (shown.length === 0) return null
          const label = SECTION_LABELS[section]
          return (
            <section key={section}>
              <h2 className="mb-2 px-1 text-[15px] font-bold">
                {label.emoji} {label.name}
                <span className="ml-2 text-[12px] font-normal text-ink-faint">{shown.length}</span>
              </h2>
              <div className="space-y-2.5">
                {shown.map((item) => (
                  <ItemCard
                    key={item.id}
                    cityId={city.id}
                    item={item}
                    open={openItem === item.id}
                    onToggle={() => setOpenItem(openItem === item.id ? null : item.id)}
                  />
                ))}
              </div>
            </section>
          )
        })}

        {filter !== 'todo' &&
          SECTION_KEYS.every(
            (s) => city.sections[s].filter((item) => visible(itemKey(city.id, item.id), item.must)).length === 0,
          ) && <EmptyState emoji="🔍" text="Nada por aquí con este filtro. Prueba con «Todo»." />}

        <div className="pt-1 pb-4 text-center">
          <Link to="/ciudades" className="text-[13px] font-semibold text-brand-600">
            ← Todas las paradas
          </Link>
          <p className="mt-3 text-[11px] text-ink-faint">
            {capitalize(formatEsShort(today))} · {city.name} · datos orientativos: verifica horarios en Amap
          </p>
        </div>
      </div>
    </div>
  )
}
