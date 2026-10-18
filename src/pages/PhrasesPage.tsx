import { useState } from 'react'
import { phrases } from '../data'
import { SubPageHeader } from '../components/Layout'
import { CopyButton } from '../components/ui'
import { speakChinese } from '../lib/util'

export function PhrasesPage() {
  const [active, setActive] = useState(phrases.categories[0]?.id ?? '')
  const category = phrases.categories.find((c) => c.id === active) ?? phrases.categories[0]

  return (
    <div>
      <SubPageHeader title="Frases en chino" subtitle="Con pinyin y audio: enséñalas o escúchalas" />
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 pt-3 pb-1">
        {phrases.categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActive(c.id)}
            className={`chip whitespace-nowrap border ${
              active === c.id
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-paper-3 bg-white text-ink-soft'
            }`}
          >
            {c.emoji} {c.name}
          </button>
        ))}
      </div>

      <div className="space-y-2.5 p-4">
        {category?.phrases.map((p, i) => (
          <div key={i} className="card p-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="zh text-[22px] leading-snug font-semibold">{p.zh}</div>
                <div className="mt-0.5 text-[13px] text-ink-faint italic">{p.pinyin}</div>
                <div className="mt-1 text-[14px] font-medium text-ink-soft">{p.es}</div>
                {p.tip && <div className="mt-1 text-[12px] text-gold-700">💡 {p.tip}</div>}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <button
                  type="button"
                  onClick={() => speakChinese(p.zh)}
                  className="pressable rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-semibold text-brand-600"
                  aria-label="Escuchar"
                >
                  🔊 Oír
                </button>
                <CopyButton text={p.zh} label="Chino" />
              </div>
            </div>
          </div>
        ))}
        <p className="px-1 pt-1 text-[11px] text-ink-faint">
          Para mostrárselo a alguien: enseña la pantalla con el texto chino grande. Si el audio chino no
          suena, instala la voz china: Ajustes → Accesibilidad → Contenido hablado → Voces → Chino.
        </p>
      </div>
    </div>
  )
}
