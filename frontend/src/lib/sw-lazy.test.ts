import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

describe('the Workbox service worker precaches application and on-demand code', () => {
  it('vite.config.js configures VitePWA in injectManifest mode targeting src/sw.ts', () => {
    const vite = readFileSync(fileURLToPath(new URL('../../vite.config.js', import.meta.url)), 'utf8')
    expect(vite).toContain("strategies: 'injectManifest'")
    expect(vite).toContain("filename: 'sw.ts'")
    expect(vite).toContain("injectionPoint: 'self.__WB_MANIFEST'")
    expect(vite).toContain("'**/exercise-media/**'")
  })

  it('src/sw.ts configures Workbox precache and routing', () => {
    const sw = readFileSync(fileURLToPath(new URL('../sw.ts', import.meta.url)), 'utf8')
    expect(sw).toMatch(/precacheAndRoute\((?:self|sw)\.__WB_MANIFEST \|\| \[\]\)/)
    expect(sw).toContain('cleanupOutdatedCaches()')
    expect(sw).toContain('clientsClaim()')
    expect(sw).toMatch(/(?:self|sw)\.skipWaiting\(\)/)
  })
})
