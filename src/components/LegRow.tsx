import type { Leg } from '../data'
import { Chip } from './ui'
import { formatEs } from '../lib/format'

export function LegRow({ leg, showDate = true }: { leg: Leg; showDate?: boolean }) {
  return (
    <div className="rounded-xl border border-paper-3 bg-white p-2.5">
      <div className="flex items-center gap-1.5">
        {showDate && <Chip tone="brand">{formatEs(leg.date)}</Chip>}
        <span className="text-[13px] font-semibold">
          {leg.from} → {leg.to}
        </span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-ink-soft">
        <span>
          {leg.mode}
          {leg.duration ? ` · ${leg.duration}` : ''}
        </span>
        {leg.time && (
          <span className="font-semibold text-brand-600">
            {leg.time}
            {leg.timeProvisional && <span className="ml-1 font-normal text-gold-600">(provisional)</span>}
          </span>
        )}
        {!leg.time && <span className="text-gold-600">hora por confirmar</span>}
      </div>
      {(leg.fromZh || leg.toZh) && (
        <div className="zh mt-0.5 text-[12px] text-ink-faint">
          {leg.fromZh} → {leg.toZh}
        </div>
      )}
      {leg.note && <p className="mt-1 text-[12px] leading-relaxed text-ink-faint">{leg.note}</p>}
    </div>
  )
}
