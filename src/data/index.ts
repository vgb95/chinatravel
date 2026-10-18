import {
  CitySchema,
  MoreInfoSchema,
  PhrasesSchema,
  PrepSchema,
  TripSchema,
  SECTION_KEYS,
  type City,
  type Item,
  type MoreInfo,
  type Phrases,
  type Prep,
  type Route,
  type SectionKey,
  type Trip,
} from './schema'

import guangzhouRaw from './cities/guangzhou.json'
import shenzhenRaw from './cities/shenzhen.json'
import hongkongRaw from './cities/hongkong.json'
import yangshuoRaw from './cities/yangshuo.json'
import guilinRaw from './cities/guilin.json'
import shanghaiRaw from './cities/shanghai.json'
import suzhouRaw from './cities/suzhou.json'
import hangzhouRaw from './cities/hangzhou.json'
import chongqingRaw from './cities/chongqing.json'

import tripRaw from './trip.json'
import phrasesRaw from './phrases.json'
import prepRaw from './prep.json'
import moreRaw from './more.json'

function parseSafe<T>(
  schema: { safeParse: (v: unknown) => { success: true; data: T } | { success: false; error: { issues: unknown[] } } },
  raw: unknown,
  label: string,
  fallback: T,
): T {
  const result = schema.safeParse(raw)
  if (!result.success) {
    console.error(`[datos] ${label} no pasa la validación:`, result.error.issues)
    return fallback
  }
  return result.data
}

const rawCities: { id: string; raw: unknown }[] = [
  { id: 'guangzhou', raw: guangzhouRaw },
  { id: 'shenzhen', raw: shenzhenRaw },
  { id: 'hongkong', raw: hongkongRaw },
  { id: 'yangshuo', raw: yangshuoRaw },
  { id: 'guilin', raw: guilinRaw },
  { id: 'shanghai', raw: shanghaiRaw },
  { id: 'suzhou', raw: suzhouRaw },
  { id: 'hangzhou', raw: hangzhouRaw },
  { id: 'chongqing', raw: chongqingRaw },
]

export const trip: Trip = parseSafe(TripSchema, tripRaw, 'trip.json', {
  title: 'China Trip 2026',
  subtitle: '',
  start: '2026-10-26',
  end: '2026-11-10',
  travelers: [],
  cityOrder: [],
  legs: [],
  notes: {},
})

const citiesByIdRaw = new Map(
  rawCities.map(({ id, raw }) => [
    id,
    parseSafe(CitySchema, raw, `cities/${id}.json`, {
      id,
      name: id,
      nameZh: '',
      pinyin: '',
      emoji: '📍',
      type: 'city' as const,
      tagline: 'Pendiente de contenido',
      intro: 'Pendiente de contenido',
      stay: { from: trip.start, to: trip.end, nights: 0 },
      sections: { must: [], areas: [], food: [], shops: [], extra: [] },
      routes: [],
    }),
  ]),
)

/** Ciudades en el orden del viaje. */
export const cities: City[] = trip.cityOrder
  .map((id) => citiesByIdRaw.get(id))
  .filter((c): c is City => !!c)

export const phrases: Phrases = parseSafe(PhrasesSchema, phrasesRaw, 'phrases.json', { categories: [] })
export const prep: Prep = parseSafe(PrepSchema, prepRaw, 'prep.json', { groups: [] })
export const more: MoreInfo = parseSafe(MoreInfoSchema, moreRaw, 'more.json', { sections: [] })

export function getCity(id: string): City | undefined {
  return citiesByIdRaw.get(id)
}

/** Clave única de un item para el store local. */
export function itemKey(cityId: string, itemId: string): string {
  return `${cityId}/${itemId}`
}

export interface CityItem {
  section: SectionKey
  item: Item
}

/** Todos los items de una ciudad, con su sección. */
export function cityItems(city: City): CityItem[] {
  const out: CityItem[] = []
  for (const section of SECTION_KEYS) {
    for (const item of city.sections[section]) out.push({ section, item })
  }
  return out
}

export function findCityItem(city: City, itemId: string): CityItem | undefined {
  return cityItems(city).find((ci) => ci.item.id === itemId)
}

export interface ResolvedStop {
  stop: Route['stops'][number]
  item: Item
}

/** Resuelve los stops de una ruta a items reales. */
export function resolveRoute(city: City, route: Route): ResolvedStop[] {
  return route.stops
    .map((stop) => {
      const found = findCityItem(city, stop.itemId)
      return found ? { stop, item: found.item } : null
    })
    .filter((s): s is ResolvedStop => !!s)
}

export { SECTION_KEYS, SECTION_LABELS } from './schema'
export type { City, Item, Leg, Route, SectionKey, Trip } from './schema'
