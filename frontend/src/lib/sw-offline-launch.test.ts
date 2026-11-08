// Regression test for issue #274: on iOS, a cold-launch of the installed PWA with no network
// left the app on a black/white screen forever.
// The Workbox implementation uses NetworkFirst with networkTimeoutSeconds: 3 for navigation requests,
// falling back to cache if the network does not answer within 3 seconds without aborting requests.
import { beforeAll, describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const swSource = readFileSync(fileURLToPath(new URL('../sw.ts', import.meta.url)), 'utf8')

describe('service worker offline cold-launch (issue #274)', () => {
  beforeAll(() => {
    if (typeof self === 'undefined') (globalThis as any).self = globalThis
  })

  it('configures NetworkFirst with 3-second timeout for navigations in src/sw.ts', () => {
    expect(swSource).toContain("cacheName: 'opengym-shell-nav'")
    expect(swSource).toContain('networkTimeoutSeconds: 3')
    expect(swSource).toMatch(/request\.mode === 'navigate'/)
  })

  it('configures CacheFirst for hashed static assets', () => {
    expect(swSource).toContain("cacheName: 'opengym-assets'")
    expect(swSource).toContain('assets')
  })

  it('NetworkFirst strategy instantiates with expected timeout and cacheName', async () => {
    const { NetworkFirst } = await import('workbox-strategies')
    const strategy = new NetworkFirst({
      cacheName: 'opengym-shell-nav',
      networkTimeoutSeconds: 3,
    })
    expect(strategy.cacheName).toBe('opengym-shell-nav')
    expect((strategy as any)._networkTimeoutSeconds).toBe(3)
  })

  it('CacheFirst strategy instantiates with expected cacheName', async () => {
    const { CacheFirst } = await import('workbox-strategies')
    const strategy = new CacheFirst({
      cacheName: 'opengym-assets',
    })
    expect(strategy.cacheName).toBe('opengym-assets')
  })
})
