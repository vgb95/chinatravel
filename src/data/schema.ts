import { z } from 'zod'

/**
 * Esquema de datos del viaje. Fuente única de verdad: la app parsea cada JSON
 * con estos esquemas al cargar (rellenando defaults) y el script de validación
 * (`npm run validate`) comprueba todo antes de cada build.
 */

export const ItemSchema = z.strictObject({
  id: z.string().min(1),
  name: z.string().min(1),
  nameZh: z.string().optional(),
  pinyin: z.string().optional(),
  emoji: z.string().optional(),
  /** debe o no visitarse: lo marca la UI y el filtro "Imprescindibles" */
  must: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  desc: z.string().min(1),
  tips: z.array(z.string()).default([]),
  hours: z.string().optional(),
  price: z.string().optional(),
  metro: z.string().optional(),
  addressZh: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  durationMin: z.number().optional(),
  bestTime: z.string().optional(),
  booking: z.string().optional(),
  web: z.string().optional(),
})

export const RouteStopSchema = z.strictObject({
  itemId: z.string(),
  time: z.string().optional(),
  durationMin: z.number().optional(),
  transport: z.string().optional(),
  note: z.string().optional(),
})

export const RouteSchema = z.strictObject({
  id: z.string(),
  name: z.string(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  dayLabel: z.string().optional(),
  summary: z.string(),
  stops: z.array(RouteStopSchema),
})

export const LegSchema = z.strictObject({
  id: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().optional(),
  timeProvisional: z.boolean().default(false),
  from: z.string(),
  to: z.string(),
  fromZh: z.string().optional(),
  toZh: z.string().optional(),
  mode: z.string(),
  duration: z.string().optional(),
  note: z.string().optional(),
  confirmed: z.boolean().default(false),
})

export const CityPracticalSchema = z.strictObject({
  summary: z.string().optional(),
  metro: z.string().optional(),
  transport: z.string().optional(),
  tips: z.array(z.string()).default([]),
})

export const CitySectionsSchema = z.strictObject({
  must: z.array(ItemSchema).default([]),
  areas: z.array(ItemSchema).default([]),
  food: z.array(ItemSchema).default([]),
  shops: z.array(ItemSchema).default([]),
  extra: z.array(ItemSchema).default([]),
})

export const StaySchema = z.strictObject({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  nights: z.number(),
  base: z.string().optional(),
  note: z.string().optional(),
})

export const CitySchema = z.strictObject({
  id: z.string(),
  name: z.string(),
  nameZh: z.string(),
  pinyin: z.string(),
  emoji: z.string(),
  type: z.enum(['city', 'daytrip', 'layover']).default('city'),
  tagline: z.string(),
  intro: z.string(),
  stay: StaySchema,
  practical: CityPracticalSchema.optional(),
  sections: CitySectionsSchema,
  routes: z.array(RouteSchema).default([]),
})

export const TripSchema = z.strictObject({
  title: z.string(),
  subtitle: z.string(),
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  travelers: z.array(z.string()),
  cityOrder: z.array(z.string()),
  legs: z.array(LegSchema),
  notes: z.record(z.string(), z.string()).default({}),
})

export const PhrasesSchema = z.strictObject({
  categories: z.array(
    z.strictObject({
      id: z.string(),
      name: z.string(),
      emoji: z.string(),
      phrases: z.array(
        z.strictObject({
          zh: z.string(),
          pinyin: z.string(),
          es: z.string(),
          tip: z.string().optional(),
        }),
      ),
    }),
  ),
})

export const PrepSchema = z.strictObject({
  groups: z.array(
    z.strictObject({
      id: z.string(),
      name: z.string(),
      emoji: z.string(),
      items: z.array(
        z.strictObject({
          id: z.string(),
          text: z.string(),
          detail: z.string().optional(),
          critical: z.boolean().default(false),
        }),
      ),
    }),
  ),
})

export const MoreSectionSchema = z.strictObject({
  id: z.string(),
  name: z.string(),
  emoji: z.string(),
  blocks: z.array(
    z.strictObject({
      h: z.string().optional(),
      p: z.string().optional(),
      list: z.array(z.string()).optional(),
    }),
  ),
})

export const MoreInfoSchema = z.strictObject({
  sections: z.array(MoreSectionSchema),
})

export type Item = z.infer<typeof ItemSchema>
export type RouteStop = z.infer<typeof RouteStopSchema>
export type Route = z.infer<typeof RouteSchema>
export type Leg = z.infer<typeof LegSchema>
export type City = z.infer<typeof CitySchema>
export type Trip = z.infer<typeof TripSchema>
export type Phrases = z.infer<typeof PhrasesSchema>
export type Prep = z.infer<typeof PrepSchema>
export type MoreInfo = z.infer<typeof MoreInfoSchema>
export type CitySections = z.infer<typeof CitySectionsSchema>

export const SECTION_KEYS = ['must', 'areas', 'food', 'shops', 'extra'] as const
export type SectionKey = (typeof SECTION_KEYS)[number]

export const SECTION_LABELS: Record<SectionKey, { name: string; emoji: string }> = {
  must: { name: 'Imprescindibles', emoji: '⭐' },
  areas: { name: 'Zonas y sitios', emoji: '🗺️' },
  food: { name: 'Comida', emoji: '🥢' },
  shops: { name: 'Tiendas', emoji: '🛍️' },
  extra: { name: 'Otros', emoji: '✨' },
}
