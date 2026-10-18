/**
 * Export/Import del progreso entre los dos móviles.
 * Formato compacto: los items se referencian por índice sobre una firma (sig)
 * que garantiza que ambas apps tienen exactamente los mismos datos.
 */
import { cities, prep } from '../data'
import { itemKey } from '../data'
import type { PersistedShape, ProfileId, StatusValue } from '../store'

export const ITEM_KEYS: string[] = cities.flatMap((city) =>
  (['must', 'areas', 'food', 'shops', 'extra'] as const).flatMap((section) =>
    city.sections[section].map((item) => itemKey(city.id, item.id)),
  ),
)

export const PREP_IDS: string[] = prep.groups.flatMap((g) => g.items.map((i) => i.id))

const ITEM_INDEX = new Map(ITEM_KEYS.map((k, i) => [k, i]))
const PREP_INDEX = new Map(PREP_IDS.map((k, i) => [k, i]))

export function signature(): string {
  const text = ITEM_KEYS.join('|') + '#' + PREP_IDS.join('|')
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

interface ExportPayload {
  v: 1
  sig: string
  n: Record<ProfileId, string>
  d: Record<ProfileId, number[]>
  s: Record<ProfileId, number[]>
  f: Record<ProfileId, number[]>
  t: Record<string, string>
  q: number[]
}

export function exportProgress(state: PersistedShape): string {
  const toIdx = (keys: string[]) => keys.map((k) => ITEM_INDEX.get(k)).filter((i): i is number => i !== undefined)
  const byStatus = (profile: ProfileId, value: StatusValue) =>
    toIdx(
      Object.entries(state.status[profile])
        .filter(([, v]) => v === value)
        .map(([k]) => k),
    )
  const stars = (profile: ProfileId) =>
    toIdx(Object.entries(state.stars[profile]).filter(([, v]) => v).map(([k]) => k))
  const notes: Record<string, string> = {}
  for (const profile of ['v', 'p'] as ProfileId[]) {
    for (const [k, text] of Object.entries(state.notes[profile])) {
      const idx = ITEM_INDEX.get(k)
      if (idx !== undefined && text.trim()) notes[`${profile}:${idx}`] = text
    }
  }
  const payload: ExportPayload = {
    v: 1,
    sig: signature(),
    n: state.names,
    d: { v: byStatus('v', 'done'), p: byStatus('p', 'done') },
    s: { v: byStatus('v', 'skip'), p: byStatus('p', 'skip') },
    f: { v: stars('v'), p: stars('p') },
    t: notes,
    q: Object.entries(state.prep)
      .filter(([, v]) => v)
      .map(([k]) => PREP_INDEX.get(k))
      .filter((i): i is number => i !== undefined),
  }
  return JSON.stringify(payload)
}

export function exportSummary(state: PersistedShape): string {
  return JSON.stringify({ v: 1, sig: signature(), d: state.status, f: state.stars, n: state.notes, names: state.names, prep: state.prep })
}

export type ImportResult =
  | { ok: true; data: PersistedShape }
  | { ok: false; error: string }

export function importProgress(text: string): ImportResult {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return { ok: false, error: 'El texto no es JSON válido. Copia el bloque completo.' }
  }
  const obj = raw as Partial<ExportPayload> & {
    names?: Record<ProfileId, string>
    status?: Record<ProfileId, Record<string, StatusValue>>
    stars?: Record<ProfileId, Record<string, boolean>>
    notes?: Record<ProfileId, Record<string, string>>
    prep?: Record<string, boolean>
  }

  // Formato completo (ids) — aceptado como alternativa.
  if (obj.status && obj.names) {
    return {
      ok: true,
      data: {
        names: obj.names,
        status: obj.status,
        stars: obj.stars ?? { v: {}, p: {} },
        notes: obj.notes ?? { v: {}, p: {} },
        prep: obj.prep ?? {},
      },
    }
  }

  if (obj.v !== 1 || typeof obj.sig !== 'string') {
    return { ok: false, error: 'Formato no reconocido. Exporta de nuevo desde el otro móvil.' }
  }
  if (obj.sig !== signature()) {
    return {
      ok: false,
      error: 'Los datos son de otra versión de la app. Actualiza ambos móviles a la última versión y reintenta.',
    }
  }
  const check = (arr: unknown): number[] =>
    Array.isArray(arr) ? arr.filter((n): n is number => typeof n === 'number' && n >= 0 && n < ITEM_KEYS.length) : []

  const status: Record<ProfileId, Record<string, StatusValue>> = { v: {}, p: {} }
  const stars: Record<ProfileId, Record<string, boolean>> = { v: {}, p: {} }
  const notes: Record<ProfileId, Record<string, string>> = { v: {}, p: {} }
  for (const profile of ['v', 'p'] as ProfileId[]) {
    for (const i of check(obj.d?.[profile])) status[profile][ITEM_KEYS[i]] = 'done'
    for (const i of check(obj.s?.[profile])) status[profile][ITEM_KEYS[i]] = 'skip'
    for (const i of check(obj.f?.[profile])) stars[profile][ITEM_KEYS[i]] = true
  }
  for (const [key, text] of Object.entries(obj.t ?? {})) {
    const [profile, idxStr] = key.split(':')
    const idx = Number(idxStr)
    if ((profile === 'v' || profile === 'p') && Number.isInteger(idx) && ITEM_KEYS[idx]) {
      notes[profile][ITEM_KEYS[idx]] = String(text)
    }
  }
  const prepOut: Record<string, boolean> = {}
  for (const i of check(obj.q)) prepOut[PREP_IDS[i]] = true

  return {
    ok: true,
    data: {
      names: { v: obj.n?.v || 'Valentín', p: obj.n?.p || 'Pareja' },
      status,
      stars,
      notes,
      prep: prepOut,
    },
  }
}
