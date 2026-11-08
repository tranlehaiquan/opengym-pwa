// @vitest-environment node

/* Exercise media offline (#281). The Workbox service worker keeps exercise stills and
 * clips in a dedicated cache (opengym-media-v1) configured with RangeRequestsPlugin
 * for video scrubbing and ExpirationPlugin (max 3000 entries, purgeOnQuotaError). */
import { beforeAll, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { MEDIA_CACHE } from './media-prefetch.js'

describe('Exercise media caching (Workbox)', () => {
  beforeAll(() => {
    if (typeof self === 'undefined') (globalThis as any).self = globalThis
  })

  const swSource = readFileSync(fileURLToPath(new URL('../sw.ts', import.meta.url)), 'utf8')

  it('pins the media cache name with media-prefetch', () => {
    expect(MEDIA_CACHE).toBe('opengym-media-v1')
    expect(swSource).toContain("MEDIA_CACHE_NAME = 'opengym-media-v1'")
    expect(swSource).toContain('cacheName: MEDIA_CACHE_NAME')
  })

  it('matches exercise media paths including clips, stills, img and gif', () => {
    expect(swSource).toContain('/exercise-media/')
    expect(swSource).toContain('/img/')
    expect(swSource).toContain('/gif/')
  })

  it('configures RangeRequestsPlugin for HTTP byte-range video streaming', () => {
    expect(swSource).toContain('new RangeRequestsPlugin()')
  })

  it('configures ExpirationPlugin with 3000 max entries and purge on quota error', () => {
    expect(swSource).toContain('maxEntries: 3000')
    expect(swSource).toContain('purgeOnQuotaError: true')
  })

  it('instantiates ExpirationPlugin and RangeRequestsPlugin from Workbox', async () => {
    const { RangeRequestsPlugin } = await import('workbox-range-requests')
    const { ExpirationPlugin } = await import('workbox-expiration')
    const rangePlugin = new RangeRequestsPlugin()
    const expPlugin = new ExpirationPlugin({ maxEntries: 3000, purgeOnQuotaError: true })
    expect(rangePlugin).toBeDefined()
    expect(expPlugin).toBeDefined()
  })
})
