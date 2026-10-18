import { useState, type ReactNode } from 'react'
import type { Item } from '../data'
import { amapLink, appleMapsLink, copyText, googleMapsLink } from '../lib/util'
import type { ItemStatus } from '../store'

export function Chip({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: ReactNode
  tone?: 'neutral' | 'gold' | 'brand' | 'jade' | 'sky'
  className?: string
}) {
  const tones: Record<string, string> = {
    neutral: 'bg-paper-2 text-ink-soft',
    gold: 'bg-gold-100 text-gold-700',
    brand: 'bg-brand-50 text-brand-600',
    jade: 'bg-jade-100 text-jade-700',
    sky: 'bg-sky-100 text-sky-700',
  }
  return <span className={`chip ${tones[tone]} ${className}`}>{children}</span>
}

export function ProgressBar({ pct, className = '' }: { pct: number; className?: string }) {
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-paper-3 ${className}`}>
      <div
        className="h-full rounded-full bg-jade-500 transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(pct, 0))}%` }}
      />
    </div>
  )
}

export function CheckCircle({
  state,
  onClick,
  size = 30,
}: {
  state: ItemStatus
  onClick: () => void
  size?: number
}) {
  const base = 'flex items-center justify-center rounded-full border-2 pressable shrink-0'
  if (state === 'done') {
    return (
      <button
        type="button"
        aria-label="Visitado"
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        className={`${base} border-jade-500 bg-jade-500 text-white`}
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" width={size * 0.55} height={size * 0.55}>
          <path d="M4 12.5l5 5L20 6.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    )
  }
  if (state === 'skip') {
    return (
      <button
        type="button"
        aria-label="Descartado"
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        className={`${base} border-paper-3 bg-paper-2 text-ink-faint`}
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width={size * 0.5} height={size * 0.5}>
          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
        </svg>
      </button>
    )
  }
  return (
    <button
      type="button"
      aria-label="Marcar como visitado"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={`${base} border-paper-3 bg-white text-transparent hover:border-jade-500`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" width={size * 0.55} height={size * 0.55}>
        <path d="M4 12.5l5 5L20 6.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string; className?: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="flex rounded-xl bg-paper-2 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-[10px] px-2 py-1.5 text-xs font-semibold transition-all ${
            value === o.value ? `bg-white shadow-sm ${o.className ?? 'text-ink'}` : 'text-ink-faint'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function CopyButton({ text, label = 'Copiar', className = '' }: { text: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={async (e) => {
        e.stopPropagation()
        const ok = await copyText(text)
        if (ok) {
          setCopied(true)
          setTimeout(() => setCopied(false), 1400)
        }
      }}
      className={`pressable inline-flex items-center gap-1 rounded-lg bg-paper-2 px-2.5 py-1.5 text-xs font-semibold text-ink-soft ${className}`}
    >
      {copied ? '✓ Copiado' : `⧉ ${label}`}
    </button>
  )
}

export function MapButtons({ item }: { item: Item }) {
  const amap = amapLink(item.lat, item.lng, item.name, item.nameZh)
  const apple = appleMapsLink(item.lat, item.lng, item.nameZh || item.name)
  const google = googleMapsLink(item.lat, item.lng, item.name)
  const btn = 'pressable rounded-lg px-2.5 py-1.5 text-xs font-semibold'
  return (
    <div className="flex flex-wrap gap-1.5">
      {amap && (
        <a href={amap} target="_blank" rel="noreferrer" className={`${btn} bg-brand-50 text-brand-600`}>
          🗺️ Amap
        </a>
      )}
      {apple && (
        <a href={apple} target="_blank" rel="noreferrer" className={`${btn} bg-paper-2 text-ink-soft`}>
          🍎 Mapas
        </a>
      )}
      {google && (
        <a href={google} target="_blank" rel="noreferrer" className={`${btn} bg-paper-2 text-ink-soft`}>
          🌐 Google
        </a>
      )}
      {item.web && (
        <a href={item.web} target="_blank" rel="noreferrer" className={`${btn} bg-paper-2 text-ink-soft`}>
          🔗 Web
        </a>
      )}
    </div>
  )
}

export function EmptyState({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <div className="text-3xl">{emoji}</div>
      <p className="max-w-[26ch] text-sm text-ink-faint">{text}</p>
    </div>
  )
}
