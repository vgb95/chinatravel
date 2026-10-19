import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { cities, cityItems, phrases, prep } from '../data'
import { SubPageHeader } from '../components/Layout'
import { Chip, EmptyState } from '../components/ui'
import { useStore } from '../store'
import { normalizeText } from '../lib/util'

const SUGGESTED = ['robotica', 'drones', 'dim-sum', 'templo', 'naturaleza', 'mirador', 'mercado', 'hotpot']

export function SearchPage() {
  const [query, setQuery] = useState('')
  const statusMap = useStore((s) => s.status[s.activeProfile])
  const q = normalizeText(query.trim())

  const items = useMemo(
    () => cities.flatMap((city) => cityItems(city).map((ci) => ({ city, ...ci }))),
    [],
  )
  const routes = useMemo(() => cities.flatMap((city) => city.routes.map((route) => ({ city, route }))), [])
  const prepItems = useMemo(() => prep.groups.flatMap((g) => g.items.map((item) => ({ group: g, item }))), [])

  const results = useMemo(() => {
    if (q.length < 2) return null
    const inItems = items
      .filter(({ item }) =>
        [item.name, item.nameZh, item.pinyin, item.desc, item.tags.join(' '), item.addressZh]
          .filter(Boolean)
          .some((field) => normalizeText(String(field)).includes(q)),
      )
      .slice(0, 40)
    const inRoutes = routes
      .filter(({ route }) => normalizeText(`${route.name} ${route.summary}`).includes(q))
      .slice(0, 10)
    const inCities = cities
      .filter((c) => normalizeText(`${c.name} ${c.nameZh} ${c.pinyin} ${c.tagline}`).includes(q))
      .slice(0, 6)
    const inPhrases = phrases.categories
      .flatMap((c) => c.phrases)
      .filter((p) => normalizeText(`${p.zh} ${p.pinyin} ${p.es}`).includes(q))
      .slice(0, 15)
    const inPrep = prepItems.filter(({ item }) => normalizeText(`${item.text} ${item.detail ?? ''}`).includes(q)).slice(0, 10)
    return { inItems, inRoutes, inCities, inPhrases, inPrep }
  }, [q, items, routes, prepItems])

  const empty =
    results &&
    results.inItems.length === 0 &&
    results.inRoutes.length === 0 &&
    results.inCities.length === 0 &&
    results.inPhrases.length === 0 &&
    results.inPrep.length === 0

  return (
    <div>
      <SubPageHeader title="Buscar" subtitle="Sitios, rutas, comida, frases…" />
      <div className="p-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="p. ej. «robot», «dim sum», «Huaqiangbei»…"
          className="w-full rounded-2xl border border-paper-3 bg-white px-4 py-3 text-[15px] shadow-sm outline-none focus:border-brand-300"
        />
        {q.length < 2 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {SUGGESTED.map((tag) => (
              <button key={tag} type="button" onClick={() => setQuery(tag)}>
                <Chip tone="neutral">#{tag}</Chip>
              </button>
            ))}
          </div>
        )}

        {empty && <EmptyState emoji="🤷" text="Sin resultados. Prueba con el nombre en inglés, chino o una etiqueta." />}

        {results && results.inItems.length > 0 && (
          <section className="mt-4">
            <h2 className="mb-2 text-[13px] font-bold tracking-wide text-ink-faint uppercase">
              Sitios ({results.inItems.length})
            </h2>
            <div className="space-y-2">
              {results.inItems.map(({ city, item, section }) => {
                const key = `${city.id}/${item.id}`
                const status = statusMap[key] ?? null
                return (
                  <Link
                    key={key}
                    to={`/ciudad/${city.id}?focus=${item.id}`}
                    className="card pressable flex items-center gap-2.5 p-2.5"
                  >
                    <span className="text-lg">{item.emoji ?? '📍'}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-[14px] font-semibold">{item.name}</span>
                        {item.must && <span className="text-[11px]">⭐</span>}
                      </span>
                      <span className="zh block truncate text-[12px] text-ink-faint">
                        {item.nameZh} · {section === 'food' ? 'comida' : section === 'shops' ? 'tienda' : city.name}
                      </span>
                    </span>
                    {status === 'done' && <span className="text-jade-600">✓</span>}
                    <span className="text-ink-faint">›</span>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {results && results.inRoutes.length > 0 && (
          <section className="mt-4">
            <h2 className="mb-2 text-[13px] font-bold tracking-wide text-ink-faint uppercase">
              Rutas ({results.inRoutes.length})
            </h2>
            <div className="space-y-2">
              {results.inRoutes.map(({ city, route }) => (
                <Link key={`${city.id}-${route.id}`} to={`/ciudad/${city.id}`} className="card pressable block p-2.5">
                  <span className="text-[14px] font-semibold">
                    {city.emoji} {route.name}
                  </span>
                  <span className="block text-[12px] text-ink-faint">
                    {city.name} · {route.dayLabel ?? route.date ?? ''}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {results && results.inCities.length > 0 && (
          <section className="mt-4">
            <h2 className="mb-2 text-[13px] font-bold tracking-wide text-ink-faint uppercase">Ciudades</h2>
            <div className="space-y-2">
              {results.inCities.map((city) => (
                <Link key={city.id} to={`/ciudad/${city.id}`} className="card pressable flex items-center gap-2.5 p-2.5">
                  <span className="text-lg">{city.emoji}</span>
                  <span className="min-w-0 flex-1">
                    <span className="text-[14px] font-semibold">{city.name}</span>
                    <span className="zh block text-[12px] text-ink-faint">{city.nameZh}</span>
                  </span>
                  <span className="text-ink-faint">›</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {results && results.inPhrases.length > 0 && (
          <section className="mt-4">
            <h2 className="mb-2 text-[13px] font-bold tracking-wide text-ink-faint uppercase">Frases</h2>
            <div className="space-y-2">
              {results.inPhrases.map((p, i) => (
                <div key={i} className="card flex items-center gap-3 p-2.5">
                  <span className="zh text-lg font-semibold">{p.zh}</span>
                  <span className="flex-1 text-[12px] text-ink-faint">{p.es}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {results && results.inPrep.length > 0 && (
          <section className="mt-4">
            <h2 className="mb-2 text-[13px] font-bold tracking-wide text-ink-faint uppercase">Preparativos</h2>
            <div className="space-y-2">
              {results.inPrep.map(({ item }) => (
                <Link key={item.id} to="/prep" className="card pressable block p-2.5 text-[13px]">
                  {item.text}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
