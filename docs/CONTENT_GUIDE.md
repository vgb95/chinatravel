# Guía de contenido — China Trip 2026

Esta guía explica cómo crear los ficheros de contenido de cada ciudad en `src/data/cities/<id>.json`.
El esquema formal está en `src/data/schema.ts` (Zod). **Los ficheros se validan con `npm run validate`.**

## Contexto del viaje

- Viajeros: Valentín y su pareja (dos perfiles con checks independientes).
- Fechas: 26 oct – 10 nov 2026. Español como idioma del contenido; los nombres de sitios deben incluir **nombre en chino (中文) y pinyin con tonos**.
- Temática especial: **robótica, drones y tecnología** (la estancia en Shenzhen con base en Nanshan es el núcleo, pero se valoran toques tech en todas las ciudades).
- La app se usará **offline en China**: el contenido debe ser autosuficiente (direcciones en chino, horarios, precios, metro, avisos).

## Reglas de calidad (importante)

1. **Solo sitios reales y verificados con búsquedas web**. Si algo no se puede verificar, omítelo. Si un dato concreto (horario, precio) es dudoso, usa el prefijo `～` o añade `(verificar)`.
2. Información lo más actual posible (2025-2026). Los horarios y precios cambian: usa valores aproximados.
3. `desc`: 1-3 frases en español: qué es y por qué merece la pena.
4. `tips`: 1-4 viñetas prácticas (horario recomendado, cómo evitar colas, qué pedir, avisos).
5. `addressZh`: dirección completa en chino para enseñar a un taxista (incluye distrito y calle/nombre del sitio). Ej: `深圳市南山区西丽街道 大疆天空之城（留仙洞地铁站）`.
6. Coordenadas `lat`/`lng`: aprox. 5 decimales. Si no las encuentras con fiabilidad, omite ambas y asegúrate de que hay `addressZh`.
7. `metro`: estación más cercana con líneas si se conocen. Ej: `华强北 (L2, L7)`.
8. `id`: prefijo de ciudad (`gz-`, `sz-`, `hk-`, `ys-`, `gl-`, `sh-`, `su-`, `hz-`, `cq-`) + kebab-case. Únicos dentro del fichero.
9. **JSON estricto**: sin comentarios, sin comas finales. Los objetos del esquema son estrictos: **no añadas claves que no estén en el esquema**.
10. `must: true` para imprescindibles. Además, TODO item que liste `sections.must` debe llevar `must: true`. Puede haber imprescindibles fuera de `must` (p. ej. un restaurante).
11. `price` y `hours` en texto libre: `~60 CNY`, `10:00-18:00 (lunes cerrado)`, `Gratis`.
12. Rutas: `stops` referencian `itemId` de items del MISMO fichero. Incluye `time` aproximado, `transport` entre paradas y `note` si hace falta.
13. Etiquetas (`tags`) sugeridas (usa 1-4): `robotica`, `drones`, `tecnologia`, `tecnologia-shopping`, `compras`, `regateo`, `mercado`, `templo`, `naturaleza`, `senderismo`, `mirador`, `barrio`, `parque`, `museo`, `arte`, `nocturno`, `fotografia`, `gastronomia`, `dim-sum`, `cerveza`, `hotpot`, `picante`, `postres`, `cafe`, `vistas`, `historia`, `religioso`, `rio`, `lago`, `montana`, `bici`, `barco`, `tren`, `espectaculo`, `familia`, `imprescindible`, `tipico`, `lluvia`, `reserva-recomendada`, `gratis`, `accesible-dia`.

## Cantidades orientativas por ciudad

| Sección | Sugerido | Notas |
|---|---|---|
| `must` | 5-8 | Lo que no puede faltar (todos con `must: true`) |
| `areas` | 5-8 | Zonas, barrios, monumentos, parques |
| `food` | 6-10 | Platos típicos + restaurantes concretos (nombra restaurantes reales) |
| `shops` | 3-6 | Tiendas, mercados, souvenirs, especialidades locales |
| `extra` | 0-5 | Actividades, espectáculos, experiencias |
| `routes` | 1-4 | Itinerarios con paradas y tiempos |

## Ejemplo de fichero (recortado)

```json
{
  "id": "suzhou",
  "name": "Suzhou",
  "nameZh": "苏州",
  "pinyin": "Sūzhōu",
  "emoji": "🎋",
  "type": "daytrip",
  "tagline": "Jardines clásicos y canales",
  "intro": "Excursión de un día desde Shanghai...",
  "stay": { "from": "2026-11-06", "to": "2026-11-06", "nights": 0, "base": "Excursión desde Shanghai" },
  "practical": { "summary": "...", "metro": "...", "transport": "...", "tips": ["..."] },
  "sections": {
    "must": [
      {
        "id": "su-humble-administrator",
        "name": "Jardín del Administrador Humilde",
        "nameZh": "拙政园",
        "pinyin": "Zhuōzhèng Yuán",
        "emoji": "🌿",
        "must": true,
        "tags": ["naturaleza", "historia"],
        "desc": "El jardín clásico más famoso de Suzhou...",
        "tips": ["Ir a primera hora para evitar colas", "Reservar entrada online en temporada alta"],
        "hours": "07:30-17:30",
        "price": "~80 CNY",
        "metro": "苏州站 + taxi 10 min",
        "addressZh": "苏州市姑苏区东北街178号",
        "lat": 31.32612,
        "lng": 120.62945,
        "durationMin": 90,
        "bestTime": "Mañana temprano"
      }
    ],
    "areas": [], "food": [], "shops": [], "extra": []
  },
  "routes": [
    {
      "id": "su-day",
      "name": "Suzhou en un día",
      "date": "2026-11-06",
      "dayLabel": "Vie 6 nov",
      "summary": "Ruta de jardines y canales...",
      "stops": [
        { "itemId": "su-humble-administrator", "time": "10:00", "durationMin": 90, "transport": "AVE 上海虹桥→苏州 (~25 min) + metro L4" }
      ]
    }
  ]
}
```

## Flujo de trabajo

1. Investiga con `web_search` (varias búsquedas por ciudad; fuentes oficiales o guías recientes).
2. Escribe el fichero JSON completo con la herramienta de escritura de ficheros.
3. Ejecuta `npm run validate` en `/Users/valentin/Code/chinatravel` y corrige los **errores** que mencionen TUS ficheros. (Puede haber errores/avisos de otros ficheros que no son tuyos: ignóralos.)
4. Repite hasta que tus ciudades pasen sin errores.
5. No modifiques ningún otro fichero del proyecto.
