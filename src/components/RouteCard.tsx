import { useState } from 'react'
import type { City, Route } from '../data'
import { itemKey, resolveRoute } from '../data'
import { CheckCircle, Chip } from './ui'
import { useStore, type Progress } from '../store'
import { formatEs } from '../lib/format'

interface Props {
  city: City
  route: Route
  progress?: Progress
  defaultOpen?: boolean
  onOpenItem?: (itemId: string) => void
}

export function RouteCard({ city, route, progress, defaultOpen = false, onOpenItem }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const stops = resolveRoute(city, route)
  const statusMap = useStore((s) => s.status[s.activeProfile])
  const setStatus = useStore((s) => s.setStatus)

  return (
    <div className="card overflow-hidden">
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full p-3 text-left">
        <div className="flex items-center gap-2">
          {(route.date || route.dayLabel) && (
            <Chip tone="brand">{route.date ? formatEs(route.date) : route.dayLabel}</Chip>
          )}
          <span className="flex-1 text-[15px] font-semibold">{route.name}</span>
          {progress && (
            <span className="text-xs font-semibold text-ink-faint">
              {progress.done}/{progress.total}
            </span>
          )}
          <span className={`text-ink-faint transition-transform ${open ? 'rotate-180' : ''}`}>⌄</span>
        </div>
        {!open && <p className="mt-1 line-clamp-2 text-[13px] text-ink-soft">{route.summary}</p>}
      </button>

      {open && (
        <div className="px-3 pb-3.5">
          <p className="mb-3 text-[13px] leading-relaxed text-ink-soft">{route.summary}</p>
          <ol className="relative ml-1 space-y-3 border-l-2 border-paper-3 pl-4">
            {stops.map(({ stop, item }, i) => {
              const key = itemKey(city.id, item.id)
              const status = statusMap[key] ?? null
              return (
                <li key={`${item.id}-${i}`} className="relative">
                  <span className="absolute top-1.5 -left-[23px] h-3 w-3 rounded-full border-2 border-white bg-brand-400" />
                  <div className="flex items-start gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenItem?.(item.id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex items-baseline gap-1.5">
                        {stop.time && <span className="text-xs font-bold text-brand-600">{stop.time}</span>}
                        <span className="text-sm font-semibold">
                          {item.emoji} {item.name}
                        </span>
                      </div>
                      {item.nameZh && <div className="zh truncate text-[12px] text-ink-faint">{item.nameZh}</div>}
                      {stop.note && <p className="mt-0.5 text-[12px] text-ink-soft">{stop.note}</p>}
                      {stop.transport && (
                        <p className="mt-0.5 text-[12px] text-ink-faint">→ {stop.transport}</p>
                      )}
                    </button>
                    <CheckCircle
                      size={26}
                      state={status}
                      onClick={() => setStatus(key, status === 'done' ? null : 'done')}
                    />
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      )}
    </div>
  )
}
