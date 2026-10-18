/** Utilidades de fecha/tiempo (todas locales, sin dependencias). */

export function todayIso(): string {
  const d = new Date()
  return toIso(d)
}

export function toIso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Parsea 'YYYY-MM-DD' como fecha local a mediodía (evita saltos de zona horaria). */
export function parseIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1, 12, 0, 0)
}

export function addDays(iso: string, n: number): string {
  const d = parseIso(iso)
  d.setDate(d.getDate() + n)
  return toIso(d)
}

export function diffDays(fromIso: string, toIsoStr: string): number {
  const a = parseIso(fromIso).getTime()
  const b = parseIso(toIsoStr).getTime()
  return Math.round((b - a) / 86_400_000)
}

export function formatEs(iso: string): string {
  return new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }).format(
    parseIso(iso),
  )
}

export function formatEsLong(iso: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(parseIso(iso))
}

export function formatEsShort(iso: string): string {
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(parseIso(iso))
}

export function between(iso: string, from: string, to: string): boolean {
  return iso >= from && iso <= to
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
