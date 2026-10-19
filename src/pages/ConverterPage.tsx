import { useState } from 'react'
import { SubPageHeader } from '../components/Layout'
import { useStore } from '../store'

const CNY_CHIPS = [10, 20, 50, 100, 200, 500, 1000]
const EUR_CHIPS = [1, 2, 5, 10, 20, 50, 100]
const GLANCE_CNY = [10, 20, 50, 100, 200, 500, 1000]
const GLANCE_EUR = [1, 2, 5, 10, 20, 50, 100]

/** Acepta "12,5" y "12.5": en iOS el teclado decimal usa coma en español. */
function parseAmount(text: string): number | null {
  const n = Number.parseFloat(text.replace(/\s/g, '').replace(',', '.'))
  return Number.isFinite(n) && n >= 0 ? n : null
}

function fmt(value: number): string {
  return value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function ConverterPage() {
  const rate = useStore((s) => s.rate)
  const setRate = useStore((s) => s.setRate)
  const [dir, setDir] = useState<'cny' | 'eur'>('cny')
  const [amount, setAmount] = useState('100')

  const parsed = parseAmount(amount)
  const result = parsed === null ? null : dir === 'cny' ? parsed / rate : parsed * rate
  const inputUnit = dir === 'cny' ? '¥' : '€'
  const resultUnit = dir === 'cny' ? '€' : '¥'

  function commitRate(text: string, input: HTMLInputElement) {
    const next = parseAmount(text)
    if (next !== null && next > 0) setRate(next)
    else input.value = String(rate)
  }

  function swap() {
    if (result !== null) setAmount(String(Math.round(result * 100) / 100).replace('.', ','))
    setDir(dir === 'cny' ? 'eur' : 'cny')
  }

  return (
    <div>
      <SubPageHeader title="💱 Conversor" subtitle="Yuanes ⇄ euros sin conexión, con tasa editable" />
      <div className="space-y-3 p-4">
        <div className="card p-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[13px] font-semibold text-ink-faint">Tasa de cambio</div>
              <div className="mt-0.5 text-[11px] leading-relaxed text-ink-faint">
                Ajústala con la del banco o Revolut el día que salgas.
              </div>
            </div>
            <label className="flex shrink-0 items-center gap-1.5 rounded-xl border border-paper-3 bg-white px-2.5 py-1.5">
              <span className="text-[13px] font-semibold text-ink-soft">1 € =</span>
              <input
                defaultValue={String(rate)}
                onBlur={(e) => commitRate(e.currentTarget.value, e.currentTarget)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.currentTarget.blur()
                }}
                inputMode="decimal"
                aria-label="Yuanes por euro"
                className="w-14 bg-transparent text-center text-[15px] font-bold outline-none"
              />
              <span className="text-[13px] font-semibold text-ink-soft">¥</span>
            </label>
          </div>
        </div>

        <div className="card space-y-3 p-3.5">
          <div className="flex items-center gap-2">
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-paper-3 bg-white px-3 py-2.5">
              <span className="text-[18px] font-bold text-ink-faint">{inputUnit}</span>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                aria-label="Importe a convertir"
                className="min-w-0 flex-1 bg-transparent text-[22px] font-bold outline-none"
              />
            </label>
            <button
              type="button"
              onClick={swap}
              aria-label="Invertir la dirección de conversión"
              className="pressable flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-lg font-bold text-brand-600"
            >
              ⇄
            </button>
          </div>

          <div className="rounded-xl bg-paper p-3 text-center">
            <div className="text-[11px] font-bold tracking-wide text-ink-faint uppercase">
              {dir === 'cny' ? 'En euros' : 'En yuanes'}
            </div>
            <div className="mt-0.5 text-[26px] leading-tight font-bold text-jade-600">
              {result === null ? '—' : `${fmt(result)} ${resultUnit}`}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(dir === 'cny' ? CNY_CHIPS : EUR_CHIPS).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setAmount(String(c))}
                className="chip pressable border border-paper-3 bg-white text-ink-soft"
              >
                {c} {inputUnit}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-3.5">
          <div className="text-[13px] font-semibold text-ink-faint">De un vistazo</div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-paper p-2.5">
              <div className="text-[10px] font-bold tracking-wide text-ink-faint uppercase">Yuanes → euros</div>
              <ul className="mt-1.5 space-y-1">
                {GLANCE_CNY.map((c) => (
                  <li key={c} className="flex items-baseline justify-between gap-2 text-[13px]">
                    <span className="text-ink-soft">¥{c}</span>
                    <span className="font-semibold">{fmt(c / rate)} €</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-paper p-2.5">
              <div className="text-[10px] font-bold tracking-wide text-ink-faint uppercase">Euros → yuanes</div>
              <ul className="mt-1.5 space-y-1">
                {GLANCE_EUR.map((c) => (
                  <li key={c} className="flex items-baseline justify-between gap-2 text-[13px]">
                    <span className="text-ink-soft">€{c}</span>
                    <span className="font-semibold">{fmt(c * rate)} ¥</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-2.5 text-[11px] leading-relaxed text-ink-faint">
            Truco para el día a día: divide los yuanes entre 8 y redondea (¥100 ≈ {fmt(100 / rate)} € con la tasa
            actual).
          </p>
        </div>
      </div>
    </div>
  )
}
