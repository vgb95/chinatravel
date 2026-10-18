import { useEffect, useRef, useState } from 'react'
import type { Item } from '../data'
import { itemKey } from '../data'
import { CheckCircle, Chip, CopyButton, MapButtons, Segmented } from './ui'
import { useItemNote, useItemStar, useItemStatus, useStore, type StatusValue } from '../store'
import { speakChinese } from '../lib/util'

interface Props {
  cityId: string
  item: Item
  open?: boolean
  onToggle?: () => void
  cityName?: string
}

export function ItemCard({ cityId, item, open, onToggle, cityName }: Props) {
  const key = itemKey(cityId, item.id)
  const status = useItemStatus(key)
  const star = useItemStar(key)
  const note = useItemNote(key)
  const toggleDone = useStore((s) => s.toggleDone)
  const setStatus = useStore((s) => s.setStatus)
  const toggleStar = useStore((s) => s.toggleStar)
  const setNote = useStore((s) => s.setNote)

  const [localOpen, setLocalOpen] = useState(false)
  const isOpen = open ?? localOpen
  const toggle = onToggle ?? (() => setLocalOpen((v) => !v))
  const [noteDraft, setNoteDraft] = useState(note)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setNoteDraft(note)
  }, [note])

  useEffect(() => {
    if (isOpen && open !== undefined) {
      const t = setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60)
      return () => clearTimeout(t)
    }
  }, [isOpen, open])

  const meta: { icon: string; label: string }[] = []
  if (item.hours) meta.push({ icon: '🕐', label: item.hours })
  if (item.price) meta.push({ icon: '💴', label: item.price })
  if (item.durationMin) meta.push({ icon: '⏱️', label: `~${item.durationMin} min` })
  if (item.metro) meta.push({ icon: '🚇', label: item.metro })
  if (item.bestTime) meta.push({ icon: '✨', label: item.bestTime })
  if (item.booking) meta.push({ icon: '🎟️', label: item.booking })

  return (
    <div ref={ref} id={`item-${item.id}`} className={`card overflow-hidden ${status === 'done' ? 'bg-jade-50/60' : ''}`}>
      <div className="flex items-start gap-2.5 p-3" onClick={toggle} role="button" tabIndex={0}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-paper-2 text-xl">
          {item.emoji ?? '📍'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`text-[15px] leading-snug font-semibold ${status === 'done' ? 'text-ink-soft' : ''}`}>
              {item.name}
            </span>
            {item.must && <Chip tone="gold">⭐</Chip>}
            {star && <Chip tone="brand">❤️</Chip>}
          </div>
          {item.nameZh && (
            <div className="zh mt-0.5 truncate text-[13px] text-ink-faint">
              {item.nameZh}
              {item.pinyin ? <span className="ml-1.5 font-sans text-[11px] italic">{item.pinyin}</span> : null}
            </div>
          )}
          {!isOpen && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {cityName && <Chip tone="sky">{cityName}</Chip>}
              {item.tags.slice(0, cityName ? 2 : 3).map((t) => (
                <Chip key={t}>{t}</Chip>
              ))}
              {status === 'skip' && <Chip>descartado</Chip>}
            </div>
          )}
        </div>
        <CheckCircle
          state={status}
          onClick={() => {
            if (status === 'done') setStatus(key, null)
            else toggleDone(key)
          }}
        />
      </div>

      {isOpen && (
        <div className="space-y-3 border-t border-paper-2 px-3 pt-3 pb-3.5">
          <p className="text-sm leading-relaxed text-ink-soft">{item.desc}</p>

          {meta.length > 0 && (
            <div className="grid grid-cols-1 gap-1.5 rounded-xl bg-paper p-2.5 text-[13px]">
              {meta.map((m) => (
                <div key={m.label} className="flex gap-2">
                  <span className="shrink-0">{m.icon}</span>
                  <span className="text-ink-soft">{m.label}</span>
                </div>
              ))}
            </div>
          )}

          {item.tips.length > 0 && (
            <ul className="space-y-1 text-[13px] text-ink-soft">
              {item.tips.map((tip, i) => (
                <li key={i} className="flex gap-2">
                  <span className="shrink-0 text-gold-600">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          )}

          {item.addressZh && (
            <div className="rounded-xl border border-gold-200 bg-gold-50 p-2.5">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold tracking-wide text-gold-700 uppercase">
                  Dirección para el taxista
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => speakChinese(item.addressZh ?? '')}
                    className="pressable rounded-lg bg-white px-2 py-1 text-xs font-semibold text-ink-soft"
                    aria-label="Escuchar dirección"
                  >
                    🔊
                  </button>
                  <CopyButton text={item.addressZh} label="Copiar" className="bg-white" />
                </div>
              </div>
              <p className="zh text-[17px] leading-relaxed font-medium">{item.addressZh}</p>
            </div>
          )}

          <MapButtons item={item} />

          <div className="space-y-2 rounded-xl bg-paper p-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wide text-ink-faint uppercase">Mi estado</span>
              <button
                type="button"
                onClick={() => toggleStar(key)}
                className="pressable text-base"
                aria-label="Favorito"
              >
                {star ? '❤️' : '🤍'}
              </button>
            </div>
            <Segmented<Exclude<StatusValue, never> | 'pending'>
              value={status ?? 'pending'}
              options={[
                { value: 'pending', label: 'Pendiente' },
                { value: 'done', label: '✓ Visto', className: 'text-jade-600' },
                { value: 'skip', label: '✗ Descartado', className: 'text-ink-soft' },
              ]}
              onChange={(v) => setStatus(key, v === 'pending' ? null : v)}
            />
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              onBlur={() => setNote(key, noteDraft)}
              rows={2}
              placeholder="Nota personal (reservas, precios regateados, qué pedir…)"
              className="w-full resize-none rounded-lg border border-paper-3 bg-white px-2.5 py-2 text-[13px] outline-none focus:border-brand-300"
            />
          </div>
        </div>
      )}
    </div>
  )
}
