import { Link } from 'react-router-dom'
import type { City } from '../data'
import { cityItems, itemKey } from '../data'
import { useProgress } from '../store'
import { ProgressBar } from './ui'
import { formatEsShort } from '../lib/format'

const TYPE_LABEL: Record<City['type'], string | null> = {
  city: null,
  daytrip: 'Excursión',
  layover: 'Escala',
}

export function CityCard({ city, compact = false }: { city: City; compact?: boolean }) {
  const keys = cityItems(city).map((ci) => itemKey(city.id, ci.item.id))
  const progress = useProgress(keys)
  const mustTotal = city.sections.must.length

  return (
    <Link to={`/ciudad/${city.id}`} className="card pressable block p-3.5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-2xl">
          {city.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-1.5">
            <span className="text-[15px] leading-tight font-bold">{city.name}</span>
            <span className="zh shrink-0 text-[13px] text-ink-faint">{city.nameZh}</span>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12px] text-ink-faint">
            <span>
              {formatEsShort(city.stay.from)}
              {city.stay.to !== city.stay.from && <> – {formatEsShort(city.stay.to)}</>}
              {city.stay.nights > 0 && <> · {city.stay.nights} noches</>}
              {mustTotal > 0 && <> · {mustTotal} ⭐</>}
            </span>
            {TYPE_LABEL[city.type] && (
              <span className="chip bg-sky-100 text-sky-700">{TYPE_LABEL[city.type]}</span>
            )}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-sm font-bold text-jade-600">{progress.total ? `${progress.pct}%` : '—'}</div>
          <div className="text-[10px] text-ink-faint">
            {progress.total ? `${progress.done}/${progress.total}` : 'en preparación'}
          </div>
        </div>
      </div>
      {!compact && (
        <div className="mt-2.5">
          <ProgressBar pct={progress.pct} />
        </div>
      )}
    </Link>
  )
}
