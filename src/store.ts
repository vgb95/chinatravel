import { create } from 'zustand'
import { useMemo } from 'react'
import { persist } from 'zustand/middleware'

export type ProfileId = 'v' | 'p'
export type StatusValue = 'done' | 'skip'
export type ItemStatus = StatusValue | null

export interface PersistedShape {
  names: Record<ProfileId, string>
  status: Record<ProfileId, Record<string, StatusValue>>
  stars: Record<ProfileId, Record<string, boolean>>
  notes: Record<ProfileId, Record<string, string>>
  prep: Record<string, boolean>
}

interface StoreState extends PersistedShape {
  activeProfile: ProfileId
  setActiveProfile: (id: ProfileId) => void
  setName: (id: ProfileId, name: string) => void
  toggleDone: (key: string) => void
  setStatus: (key: string, value: StatusValue | null) => void
  toggleStar: (key: string) => void
  setNote: (key: string, value: string) => void
  togglePrep: (id: string) => void
  replaceData: (data: PersistedShape) => void
  resetAll: () => void
}

function withValue<T>(map: Record<string, T>, key: string, value: T | null): Record<string, T> {
  const next = { ...map }
  if (value === null) delete next[key]
  else next[key] = value
  return next
}

const DEFAULT_NAMES: Record<ProfileId, string> = { v: 'vg', p: 'n' }

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      activeProfile: 'v',
      names: { ...DEFAULT_NAMES },
      status: { v: {}, p: {} },
      stars: { v: {}, p: {} },
      notes: { v: {}, p: {} },
      prep: {},

      setActiveProfile: (id) => set({ activeProfile: id }),

      setName: (id, name) => set((s) => ({ names: { ...s.names, [id]: name || DEFAULT_NAMES[id] } })),

      toggleDone: (key) => {
        const { activeProfile, status } = get()
        const current = status[activeProfile][key] ?? null
        set({
          status: { ...status, [activeProfile]: withValue(status[activeProfile], key, current === 'done' ? null : 'done') },
        })
      },

      setStatus: (key, value) => {
        const { activeProfile, status } = get()
        set({ status: { ...status, [activeProfile]: withValue(status[activeProfile], key, value) } })
      },

      toggleStar: (key) => {
        const { activeProfile, stars } = get()
        const current = stars[activeProfile][key] ?? false
        set({ stars: { ...stars, [activeProfile]: withValue(stars[activeProfile], key, current ? null : true) } })
      },

      setNote: (key, value) => {
        const { activeProfile, notes } = get()
        set({ notes: { ...notes, [activeProfile]: withValue(notes[activeProfile], key, value.trim() ? value : null) } })
      },

      togglePrep: (id) => set((s) => ({ prep: withValue(s.prep, id, s.prep[id] ? null : true) })),

      replaceData: (data) =>
        set({
          names: { ...DEFAULT_NAMES, ...data.names },
          status: { v: { ...data.status.v }, p: { ...data.status.p } },
          stars: { v: { ...data.stars.v }, p: { ...data.stars.p } },
          notes: { v: { ...data.notes.v }, p: { ...data.notes.p } },
          prep: { ...data.prep },
        }),

      resetAll: () =>
        set({
          activeProfile: 'v',
          names: { ...DEFAULT_NAMES },
          status: { v: {}, p: {} },
          stars: { v: {}, p: {} },
          notes: { v: {}, p: {} },
          prep: {},
        }),
    }),
    { name: 'chinatrip-v1', version: 1 },
  ),
)

// ---------- Selectores ----------

export function useActiveProfile(): ProfileId {
  return useStore((s) => s.activeProfile)
}

export function useProfileName(id: ProfileId): string {
  return useStore((s) => s.names[id])
}

export function useItemStatus(key: string): ItemStatus {
  return useStore((s) => s.status[s.activeProfile][key] ?? null)
}

export function useItemStar(key: string): boolean {
  return useStore((s) => s.stars[s.activeProfile][key] ?? false)
}

export function useItemNote(key: string): string {
  return useStore((s) => s.notes[s.activeProfile][key] ?? '')
}

export interface Progress {
  done: number
  skip: number
  total: number
  pct: number
}

function computeProgress(map: Record<string, StatusValue>, keys: string[]): Progress {
  let done = 0
  let skip = 0
  for (const k of keys) {
    const v = map[k]
    if (v === 'done') done++
    else if (v === 'skip') skip++
  }
  const total = keys.length
  return { done, skip, total, pct: total ? Math.round((done / total) * 100) : 0 }
}

export function useProgress(keys: string[]): Progress {
  const map = useStore((s) => s.status[s.activeProfile])
  return useMemo(() => computeProgress(map, keys), [map, keys])
}

export function usePrepProgress(ids: string[]): Progress {
  const prep = useStore((s) => s.prep)
  return useMemo(() => {
    let done = 0
    for (const id of ids) if (prep[id]) done++
    const total = ids.length
    return { done, skip: 0, total, pct: total ? Math.round((done / total) * 100) : 0 }
  }, [prep, ids])
}
