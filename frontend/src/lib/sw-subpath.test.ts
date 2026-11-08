// @vitest-environment node

/* The worker leaves the API alone under a subpath too (#238). Its "never cache auth/data" guard
 * ensures that under /myGym/ every GET of data or rev is never intercepted by cache routes.
 * Tested against route matchers defined in src/sw.ts. */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const swSrc = readFileSync(fileURLToPath(new URL('../sw.ts', import.meta.url)), 'utf8')

describe('the service worker and the API', () => {
  const isApiUrl = (urlStr: string) => new URL(urlStr).pathname.includes('/api/')

  it('leaves the API alone at the site root', () => {
    expect(isApiUrl('https://gym.example.com/api/data')).toBe(true)
    expect(isApiUrl('https://gym.example.com/api/data/rev')).toBe(true)
    expect(swSrc).toContain("!url.pathname.includes('/api/')")
  })

  it('leaves the API alone under a subpath, so an old document is never replayed offline', () => {
    expect(isApiUrl('https://example.com/myGym/api/data')).toBe(true)
    expect(isApiUrl('https://example.com/myGym/api/data/rev')).toBe(true)
  })

  it('still serves navigations and assets under that subpath', () => {
    expect(isApiUrl('https://example.com/myGym/')).toBe(false)
    expect(isApiUrl('https://example.com/myGym/assets/index-12345678.js')).toBe(false)
    expect(isApiUrl('https://example.com/myGym/exercise-media/still/0001.webp')).toBe(false)
  })
})
