import { cities, trip } from '../data'
import { CityCard } from '../components/CityCard'
import { SubPageHeader } from '../components/Layout'
import { formatEsShort } from '../lib/format'

export function CitiesPage() {
  return (
    <div>
      <SubPageHeader title="Paradas del viaje" subtitle={`${formatEsShort(trip.start)} – ${formatEsShort(trip.end)} · ${cities.length} paradas`} />
      <div className="space-y-2.5 p-4">
        {cities.map((c) => (
          <CityCard key={c.id} city={c} />
        ))}
        <p className="px-1 pt-1 text-[11px] text-ink-faint">
          Toca una ciudad para ver imprescindibles, rutas por día, comida, tiendas y direcciones en chino.
        </p>
      </div>
    </div>
  )
}
