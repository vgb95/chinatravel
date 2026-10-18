/**
 * Capturas de pantalla para revisar el diseño (npm run shots [url-base]).
 * Usa el Chrome instalado (playwright-core, channel: chrome) — sin descargas.
 */
import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright-core'

const base = process.argv[2] ?? 'http://localhost:5173'
const outDir = process.argv[3] ?? '/private/var/folders/91/rsmwswfj4cq8jc7jfdhblbb40000gn/T/opencode/shots'
mkdirSync(outDir, { recursive: true })

const routes = [
  ['/', 'home'],
  ['/ciudades', 'ciudades'],
  ['/ciudad/guangzhou', 'guangzhou'],
  ['/ciudad/shenzhen', 'shenzhen'],
  ['/ciudad/shanghai', 'shanghai'],
  ['/buscar', 'buscar'],
  ['/frases', 'frases'],
  ['/mas', 'mas'],
  ['/prep', 'prep'],
  ['/info', 'info'],
  ['/ajustes', 'ajustes'],
]

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({
  viewport: { width: 393, height: 852 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
})

const errors = []
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`[console] ${msg.text()}`)
})
page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`))

for (const [route, name] of routes) {
  await page.goto(`${base}/#${route}`, { waitUntil: 'networkidle' }).catch(() => {})
  await page.waitForTimeout(500)
  await page.screenshot({ path: `${outDir}/${name}.png` })
  console.log(`✓ ${name}.png`)
}

// Home con vista larga para ver todo
await page.goto(`${base}/#/`, { waitUntil: 'networkidle' }).catch(() => {})
await page.waitForTimeout(400)
await page.screenshot({ path: `${outDir}/home-full.png`, fullPage: true })
console.log('✓ home-full.png')

await browser.close()
if (errors.length) {
  console.log('\nErrores de consola:')
  for (const e of errors) console.log('  ' + e)
} else {
  console.log('\nSin errores de consola ✓')
}
