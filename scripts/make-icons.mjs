/**
 * Genera los PNG de la PWA a partir de los SVG (npm run icons).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pub = join(root, 'public')

const icon = readFileSync(join(pub, 'icon.svg'))
const maskable = readFileSync(join(pub, 'icon-maskable.svg'))

async function png(svg, size, out) {
  await sharp(svg, { density: 300 }).resize(size, size).png().toFile(join(pub, out))
  console.log(`✓ ${out} (${size}x${size})`)
}

await png(icon, 192, 'pwa-192.png')
await png(icon, 512, 'pwa-512.png')
await png(maskable, 512, 'pwa-512-maskable.png')
await png(maskable, 180, 'apple-touch-icon.png')

// favicon.svg = icon.svg (por si se sirve sin build)
writeFileSync(join(pub, 'favicon.svg'), icon)
console.log('✓ favicon.svg')
