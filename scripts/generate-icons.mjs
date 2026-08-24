// Génère les icônes PWA (PNG) à partir du glyphe SVG « jarre ».
// Usage : npm run icons  (les fichiers sont committés dans public/icons/)
import { mkdirSync } from 'node:fs'
import sharp from 'sharp'

const CLAY = '#B65C3F'
const PAPER = '#FAF7F2'

const glyph = `
  <g fill="${PAPER}">
    <rect x="206" y="88" width="100" height="30" rx="14"/>
    <path d="M224 118 L219 152 C 172 166 142 208 142 262 C 142 334 190 388 256 388 C 322 388 370 334 370 262 C 370 208 340 166 293 152 L288 118 Z"/>
    <rect x="215" y="388" width="82" height="26" rx="12"/>
  </g>
  <rect x="168" y="252" width="176" height="14" rx="7" fill="${CLAY}"/>`

const appIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="115" fill="${CLAY}"/>${glyph}</svg>`
// Icône « maskable » : fond plein bord à bord, glyphe réduit dans la zone sûre.
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="${CLAY}"/><g transform="translate(256 256) scale(0.74) translate(-256 -256)">${glyph}</g></svg>`

mkdirSync('public/icons', { recursive: true })
await sharp(Buffer.from(appIcon)).resize(512, 512).png().toFile('public/icons/icon-512.png')
await sharp(Buffer.from(appIcon)).resize(192, 192).png().toFile('public/icons/icon-192.png')
await sharp(Buffer.from(maskable)).resize(512, 512).png().toFile('public/icons/icon-512-maskable.png')
await sharp(Buffer.from(maskable)).resize(180, 180).png().toFile('public/icons/apple-touch-icon.png')
console.log('Icônes générées dans public/icons/')
