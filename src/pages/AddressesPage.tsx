import { useMemo, useState } from 'react'
import { cities, cityItems, type City, type Item } from '../data'
import { SubPageHeader } from '../components/Layout'
import { CopyButton, EmptyState } from '../components/ui'
import { normalizeText } from '../lib/util'

interface AddressRow {
  city: City
  item: Item
  address: string
}

export function AddressesPage() {
  const [active, setActive] = useState('all')
  const [query, setQuery] = useState('')

  const all = useMemo<AddressRow[]>(
    () =>
      cities.flatMap((city) =>
        cityItems(city).flatMap(({ item }) => (item.addressZh ? [{ city, item, address: item.addressZh }] : [])),
      ),
    [],
  )

  const q = normalizeText(query.trim())

  const groups = useMemo(
    () =>
      cities
        .map((city) => ({
          city,
          rows: all.filter((row) => {
            if (row.city.id !== city.id) return false
            if (active !== 'all' && city.id !== active) return false
            if (!q) return true
            return normalizeText(
              [row.item.name, row.item.nameZh, row.item.pinyin, row.address, city.name].filter(Boolean).join(' '),
            ).includes(q)
          }),
        }))
        .filter((g) => g.rows.length > 0),
    [all, active, q],
  )

  return (
    <div>
      <SubPageHeader title="📋 Direcciones" subtitle={`${all.length} direcciones en chino, listas para copiar`} />
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 pt-3 pb-1">
        <button
          type="button"
          onClick={() => setActive('all')}
          className={`chip border whitespace-nowrap ${
            active === 'all' ? 'border-brand-600 bg-brand-600 text-white' : 'border-paper-3 bg-white text-ink-soft'
          }`}
        >
          🗂️ Todas
        </button>
        {cities.map((city) => (
          <button
            key={city.id}
            type="button"
            onClick={() => setActive(city.id)}
            className={`chip border whitespace-nowrap ${
              active === city.id ? 'border-brand-600 bg-brand-600 text-white' : 'border-paper-3 bg-white text-ink-soft'
            }`}
          >
            {city.emoji} {city.name}
          </button>
        ))}
      </div>

      <div className="space-y-3 p-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busca por sitio, pinyin o calle…"
          className="w-full rounded-2xl border border-paper-3 bg-white px-4 py-3 text-[15px] shadow-sm outline-none focus:border-brand-300"
        />

        {groups.length === 0 && (
          <EmptyState emoji="🤷" text="Sin direcciones que coincidan. Prueba con otro nombre o cambia de ciudad." />
        )}

        {groups.map(({ city, rows }) => (
          <section key={city.id} className="space-y-2">
            <h2 className="px-1 text-[12px] font-bold tracking-wide text-ink-faint uppercase">
              {city.emoji} {city.name} · {rows.length}
            </h2>
            {rows.map((row) => (
              <div key={row.item.id} className="card p-3">
                <div className="flex items-start gap-2.5">
                  <span className="text-lg">{row.item.emoji ?? '📍'}</span>
                  <div className="min-w-0 flex-1">
                    <span className="text-[14px] font-semibold">{row.item.name}</span>
                    {row.item.nameZh && (
                      <div className="zh mt-0.5 truncate text-[12px] text-ink-faint">
                        {row.item.nameZh}
                        {row.item.pinyin ? (
                          <span className="ml-1.5 font-sans text-[11px] italic">{row.item.pinyin}</span>
                        ) : null}
                      </div>
                    )}
                    <p className="zh mt-1.5 text-[15px] leading-relaxed">{row.address}</p>
                  </div>
                  <CopyButton text={row.address} className="shrink-0" />
                </div>
              </div>
            ))}
          </section>
        ))}

        {groups.length > 0 && (
          <p className="px-1 pt-1 text-[11px] leading-relaxed text-ink-faint">
            Copia la dirección y pégala en DiDi (destino). El nombre en chino de arriba también sirve para buscar el
            sitio en Amap o para enseñárselo a quien te ayude.
          </p>
        )}
      </div>
    </div>
  )
}
