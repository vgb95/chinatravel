# 🐼 China Trip 2026

Guía de viaje **offline-first** (PWA instalable) para nuestro viaje a China del
**26 de octubre al 10 de noviembre de 2026**.

Paradas: **Guangzhou · Shenzhen · Hong Kong (Disneyland) · Yangshuo · Guilin ·
Shanghai · Suzhou · Hangzhou · Chongqing (escala)** — con especial cariño a la
**ruta robótica de Shenzhen** (base en Nanshan).

## ✨ Qué incluye

- **Checks por dos perfiles** (los dos viajeros marcan independientemente:
  visto / descartado / pendiente), favoritos y notas personales.
- **Rutas por día** con paradas, tiempos y transportes; vista **«Hoy»** con el
  plan del día según la fecha real.
- Cada sitio con **nombre en chino + pinyin**, **dirección en chino lista para
  enseñar al taxista**, audio, horario, precio, metro y enlaces a Amap / Mapas.
- **Frases en chino** con audio, **checklist de preparativos**, **información
  práctica** (Alipay/WeChat, VPN, trenes, robotaxis, emergencias…) y
  **export/import del progreso** entre los dos móviles (texto + QR).
- **100% offline**: todo el contenido se precarga al instalar. Sin Google Fonts,
  sin CDNs, sin servicios bloqueados en China.

## 📲 Instalar en el iPhone (¡importante hacerlo antes de salir de casa!)

1. Abrir la URL en **Safari**: <https://vgb95.github.io/chinatravel/>
2. **Compartir → Añadir a pantalla de inicio** (en los DOS iPhones).
3. Abrir la app instalada **con wifi** y visitar todas las ciudades para
   precargar el contenido.
4. Probar en **modo avión**: todo debe funcionar.

> En iOS el almacenamiento local (los checks) es persistente solo en apps
> instaladas desde «Añadir a pantalla de inicio».

## 🛠️ Desarrollo

```bash
npm install          # (si npm falla: ya está fijado legacy-peer-deps en .npmrc)
npm run dev          # servidor de desarrollo
npm run validate     # valida TODO el contenido JSON (zod + referencias)
npm run build        # valida + compila la PWA a dist/
npm run build:single # genera dist-single/index.html autocontenido (respaldo)
npm run icons        # regenera los PNG de la PWA desde public/icon.svg
npm run shots        # capturas de pantalla (Chrome requerido)
```

El contenido vive en `src/data/`:

- `cities/<id>.json` — una parada por fichero (esquema en `src/data/schema.ts`,
  guía en `docs/CONTENT_GUIDE.md`)
- `trip.json` — fechas, orden de ciudades y trayectos
- `phrases.json`, `prep.json`, `more.json` — frases, preparativos e info práctica

### Nota de entorno

Vite 8 usa el binario nativo `@rolldown/binding-*`, que requiere
**Node ≥ 22.12**. Con Node 22.11 npm lo omite; solución local:

```bash
npm i --force --no-save @rolldown/binding-darwin-arm64
```

(el CI usa Node 22.x actualizado y no tiene este problema).

## 🚀 Despliegue

`main` → GitHub Actions → GitHub Pages:
<https://vgb95.github.io/chinatravel/>
