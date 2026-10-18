import { useState } from 'react'
import { more } from '../data'
import { SubPageHeader } from '../components/Layout'

export function InfoPage() {
  const [open, setOpen] = useState<string | null>(more.sections[0]?.id ?? null)

  return (
    <div>
      <SubPageHeader title="📖 Información práctica" subtitle="Todo lo que hay que saber, sin conexión" />
      <div className="space-y-2.5 p-4">
        {more.sections.map((section) => {
          const isOpen = open === section.id
          return (
            <div key={section.id} className="card overflow-hidden">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : section.id)}
                className="flex w-full items-center gap-2 p-3.5 text-left"
              >
                <span className="text-xl">{section.emoji}</span>
                <span className="flex-1 text-[15px] font-bold">{section.name}</span>
                <span className={`text-ink-faint transition-transform ${isOpen ? 'rotate-180' : ''}`}>⌄</span>
              </button>
              {isOpen && (
                <div className="space-y-3 border-t border-paper-2 px-3.5 pt-3 pb-3.5">
                  {section.blocks.map((block, i) => (
                    <div key={i}>
                      {block.h && <h3 className="mb-1 text-[14px] font-semibold text-brand-700">{block.h}</h3>}
                      {block.p && <p className="text-[13px] leading-relaxed text-ink-soft">{block.p}</p>}
                      {block.list && (
                        <ul className="space-y-1.5">
                          {block.list.map((li, j) => (
                            <li key={j} className="flex gap-2 text-[13px] leading-relaxed text-ink-soft">
                              <span className="shrink-0 text-gold-600">•</span>
                              <span>{li}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
