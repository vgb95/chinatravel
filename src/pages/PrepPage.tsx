import { prep } from '../data'
import { SubPageHeader } from '../components/Layout'
import { Chip, ProgressBar } from '../components/ui'
import { PREP_IDS } from '../lib/transfer'
import { usePrepProgress, useStore } from '../store'

export function PrepPage() {
  const togglePrep = useStore((s) => s.togglePrep)
  const prepState = useStore((s) => s.prep)
  const progress = usePrepProgress(PREP_IDS)

  return (
    <div>
      <SubPageHeader title="🧳 Antes de salir" subtitle="Checklist offline: tócalo cuando lo tengas hecho" />
      <div className="space-y-4 p-4">
        <div className="card p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-ink-soft">Preparativos completados</span>
            <span className="text-[13px] font-bold text-jade-600">
              {progress.done}/{progress.total}
            </span>
          </div>
          <div className="mt-2">
            <ProgressBar pct={progress.pct} />
          </div>
        </div>

        {prep.groups.map((group) => {
          const total = group.items.length
          const done = group.items.filter((i) => prepState[i.id]).length
          return (
            <section key={group.id}>
              <div className="mb-2 flex items-center justify-between px-1">
                <h2 className="text-[15px] font-bold">
                  {group.emoji} {group.name}
                </h2>
                <span className="text-[12px] font-semibold text-ink-faint">
                  {done}/{total}
                </span>
              </div>
              <div className="space-y-2">
                {group.items.map((item) => {
                  const checked = !!prepState[item.id]
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => togglePrep(item.id)}
                      className={`card pressable flex w-full items-start gap-3 p-3 text-left ${checked ? 'bg-jade-50/60' : ''}`}
                    >
                      <span
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[12px] font-bold ${
                          checked
                            ? 'border-jade-500 bg-jade-500 text-white'
                            : 'border-paper-3 bg-white text-transparent'
                        }`}
                      >
                        ✓
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block text-[14px] leading-snug font-medium ${checked ? 'text-ink-soft line-through decoration-ink-faint/50' : ''}`}>
                          {item.text}
                        </span>
                        {item.critical && !checked && (
                          <Chip tone="brand" className="mt-1">
                            importante
                          </Chip>
                        )}
                        {item.detail && !checked && (
                          <span className="mt-1 block text-[12px] leading-relaxed text-ink-faint">{item.detail}</span>
                        )}
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          )
        })}

        <p className="px-1 text-[11px] text-ink-faint">
          Consejo: haz esta lista desde el móvil y con wifi. Los puntos marcados como «importante» son los que
          pueden fastidiar el viaje si se olvidan (VPN, Alipay, trenes…).
        </p>
      </div>
    </div>
  )
}
