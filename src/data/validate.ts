/**
 * Validación de los datos de contenido. Se ejecuta con:
 *   npm run validate
 * Comprueba esquema (zod), ids únicos, referencias de rutas, fechas y avisos
 * de calidad (coordenadas, direcciones en chino, prefijos de id...).
 */
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import {
  CitySchema,
  MoreInfoSchema,
  PhrasesSchema,
  PrepSchema,
  TripSchema,
  SECTION_KEYS,
  type City,
  type Trip,
} from './schema.ts'

const DATA_DIR = dirname(fileURLToPath(import.meta.url))
const CITIES_DIR = join(DATA_DIR, 'cities')

export interface ValidationResult {
  ok: boolean
  errors: string[]
  warnings: string[]
  cityIds: string[]
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function zodErrors(label: string, err: { issues: { path: PropertyKey[]; message: string }[] }) {
  return err.issues.map((i) => `${label}: ${i.path.map(String).join('.') || '(raíz)'} — ${i.message}`)
}

export function validateData(): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  const files = readdirSync(CITIES_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort()
  const cityIds = files.map((f) => f.replace(/\.json$/, ''))

  const cities: City[] = []
  for (const file of files) {
    const label = `cities/${file}`
    try {
      const parsed = CitySchema.safeParse(readJson(join(CITIES_DIR, file)))
      if (!parsed.success) {
        errors.push(...zodErrors(label, parsed.error))
        continue
      }
      const city = parsed.data
      cities.push(city)
      if (`${city.id}.json` !== file) errors.push(`${label}: el id "${city.id}" no coincide con el nombre del fichero`)
      validateCity(city, label, errors, warnings)
    } catch (e) {
      errors.push(`${label}: JSON inválido — ${(e as Error).message}`)
    }
  }

  // Trip
  let trip: Trip | undefined
  try {
    const parsed = TripSchema.safeParse(readJson(join(DATA_DIR, 'trip.json')))
    if (!parsed.success) errors.push(...zodErrors('trip.json', parsed.error))
    else trip = parsed.data
  } catch (e) {
    errors.push(`trip.json: JSON inválido — ${(e as Error).message}`)
  }

  // Otros ficheros globales
  const globals: [string, import('zod').ZodType][] = [
    ['phrases.json', PhrasesSchema],
    ['prep.json', PrepSchema],
    ['more.json', MoreInfoSchema],
  ]
  for (const [name, schema] of globals) {
    try {
      const parsed = schema.safeParse(readJson(join(DATA_DIR, name)))
      if (!parsed.success) errors.push(...zodErrors(name, parsed.error))
    } catch (e) {
      errors.push(`${name}: JSON inválido — ${(e as Error).message}`)
    }
  }

  // Coherencia trip <-> ciudades
  if (trip) {
    const tripOrder = trip.cityOrder
    for (const id of tripOrder) if (!cityIds.includes(id)) errors.push(`trip.json: cityOrder referencia "${id}" que no existe`)
    for (const id of cityIds) if (!tripOrder.includes(id)) errors.push(`trip.json: la ciudad "${id}" no está en cityOrder`)

    const legIds = new Set<string>()
    for (const leg of trip.legs) {
      if (legIds.has(leg.id)) errors.push(`trip.json: id de trayecto duplicado "${leg.id}"`)
      legIds.add(leg.id)
      if (leg.date < trip.start || leg.date > trip.end) warnings.push(`trip.json: el trayecto "${leg.id}" (${leg.date}) cae fuera del viaje`)
      if (!leg.confirmed) warnings.push(`trip.json: trayecto "${leg.id}" sin confirmar (horario provisional)`)
    }

    for (const city of cities) {
      if (city.stay.from < trip.start || city.stay.to > trip.end)
        warnings.push(`cities/${city.id}.json: estancia ${city.stay.from}–${city.stay.to} fuera del viaje`)
      if (city.stay.from > city.stay.to) errors.push(`cities/${city.id}.json: stay.from es posterior a stay.to`)
      for (const route of city.routes) {
        if (route.date && (route.date < city.stay.from || route.date > city.stay.to))
          warnings.push(`cities/${city.id}.json: la ruta "${route.id}" (${route.date}) cae fuera de la estancia`)
      }
    }
  }

  return { ok: errors.length === 0, errors, warnings, cityIds }
}

function validateCity(city: City, label: string, errors: string[], warnings: string[]) {
  const seen = new Set<string>()
  const all: { id: string; hasCoords: boolean; hasAddress: boolean }[] = []

  for (const key of SECTION_KEYS) {
    const items = city.sections[key]
    if (items.length === 0 && key !== 'extra') warnings.push(`${label}: la sección "${key}" está vacía`)
    for (const item of items) {
      if (seen.has(item.id)) errors.push(`${label}: id de item duplicado "${item.id}"`)
      seen.add(item.id)
      all.push({ id: item.id, hasCoords: item.lat !== undefined && item.lng !== undefined, hasAddress: !!item.addressZh })
      if ((item.lat === undefined) !== (item.lng === undefined)) errors.push(`${label}: el item "${item.id}" tiene lat o lng pero no ambos`)
      if (item.lat !== undefined && (item.lat < -90 || item.lat > 90)) errors.push(`${label}: lat fuera de rango en "${item.id}"`)
      if (item.lng !== undefined && (item.lng < -180 || item.lng > 180)) errors.push(`${label}: lng fuera de rango en "${item.id}"`)
      if (key === 'must' && !item.must) warnings.push(`${label}: el item "${item.id}" está en must pero no tiene must:true`)
      if (!item.hasOwnProperty('nameZh')) warnings.push(`${label}: el item "${item.id}" no tiene nombre en chino`)
      if ((item.lat === undefined || item.lng === undefined) && !item.addressZh)
        warnings.push(`${label}: el item "${item.id}" no tiene coordenadas ni dirección en chino`)
    }
  }

  const routeIds = new Set<string>()
  for (const route of city.routes) {
    if (routeIds.has(route.id)) errors.push(`${label}: id de ruta duplicado "${route.id}"`)
    routeIds.add(route.id)
    for (const stop of route.stops) {
      if (!seen.has(stop.itemId)) errors.push(`${label}: la ruta "${route.id}" referencia el item inexistente "${stop.itemId}"`)
    }
  }
}

// Ejecución directa por CLI
const invokedDirectly =
  !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (invokedDirectly) {
  const result = validateData()
  for (const w of result.warnings) console.warn(`⚠️  ${w}`)
  for (const e of result.errors) console.error(`❌ ${e}`)
  console.log(
    `\n${result.ok ? '✅' : '❌'} Validación: ${result.cityIds.length} ciudades, ${result.errors.length} errores, ${result.warnings.length} avisos`,
  )
  process.exit(result.ok ? 0 : 1)
}
