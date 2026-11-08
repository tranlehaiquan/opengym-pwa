/* Service worker tests for src/sw.ts with Workbox and Web Push. */
import { readFileSync, existsSync } from 'node:fs'
import { beforeAll, describe, expect, it } from 'vitest'

class FakeCache {
  name: string
  m: Map<string, any>
  constructor(name: string) { this.name = name; this.m = new Map() }
  async put(req: any, res: any) { this.m.set(String(req?.url || req), res) }
  async add(u: any) { const r = await globalThis.fetch(u); if (!r.ok) throw new Error('add failed ' + u); this.m.set(String(u), r) }
  async match(req: any) { return this.m.get(String(req?.url || req)) }
  async delete(req: any) { return this.m.delete(String(req?.url || req)) }
  keys() { return [...this.m.keys()] }
}

class FakeCaches {
  c: Map<string, FakeCache>
  constructor() { this.c = new Map() }
  async open(n: string) { if (!this.c.has(n)) this.c.set(n, new FakeCache(n)); return this.c.get(n)! }
  async keys() { return [...this.c.keys()] }
  async delete(n: string) { return this.c.delete(n) }
  async match(req: any) { for (const c of this.c.values()) { const hit = await c.match(req); if (hit) return hit } return undefined }
}

const handlers: Record<string, Function> = {}
let skipWaitingCount = 0

const fire = async (type: string, ev: any = {}) => {
  const e = { ...ev, waitUntil: (p: Promise<any>) => { e._done = p }, respondWith: (p: Promise<any>) => { e._res = p } }
  if (handlers[type]) handlers[type](e)
  if (e._done) await e._done
  return e
}

describe('sw.ts Workbox lifecycle and push handlers', () => {
  const pushUrl = existsSync(new URL('./push.ts', import.meta.url))
    ? new URL('./push.ts', import.meta.url)
    : new URL('./push.js', import.meta.url)
  const pageSrc = readFileSync(pushUrl, 'utf8')
  const swSrc = readFileSync(new URL('../sw.ts', import.meta.url), 'utf8')
  const constant = (src: string, name: string) => src.match(new RegExp('const ' + name + " = '([^']+)'"))?.[1]
  const DEVICE_CACHE = constant(pageSrc, 'DEVICE_CACHE')!
  const DEVICE_URL = constant(pageSrc, 'DEVICE_URL')!

  beforeAll(async () => {
    globalThis.self = {
      addEventListener: (type: string, fn: Function) => { handlers[type] = fn },
      skipWaiting: () => { skipWaitingCount++ },
      clients: { claim: async () => {}, matchAll: async () => [], openWindow: async () => {} },
      registration: { getNotifications: async () => [], showNotification: async () => {}, pushManager: {} },
      location: { origin: 'https://gym.test', href: 'https://gym.test/sw.js' },
    } as any
    globalThis.location = { origin: 'https://gym.test', href: 'https://gym.test/sw.js' } as any
    globalThis.caches = new FakeCaches() as any
    await import('../sw.ts')
  })

  it('the page and the worker share the same device cache name and key', () => {
    expect(DEVICE_CACHE).toBeTruthy()
    expect(DEVICE_URL).toBeTruthy()
    expect(constant(swSrc, 'DEVICE_CACHE')).toBe(DEVICE_CACHE)
    expect(constant(swSrc, 'DEVICE_URL')).toBe(DEVICE_URL)
  })

  it('initializes skipWaiting and Workbox claims', () => {
    expect(skipWaitingCount).toBe(1)
    expect(handlers['push']).toBeDefined()
    expect(handlers['notificationclick']).toBeDefined()
    expect(handlers['pushsubscriptionchange']).toBeDefined()
  })

  it('sends the device id the page left on pushsubscriptionchange', async () => {
    await (await globalThis.caches.open(DEVICE_CACHE)).put(DEVICE_URL, new Response('dev1234abcd'))

    const sent: any[] = []
    globalThis.fetch = (async (url: any, init: any) => {
      sent.push([String(url), JSON.parse(init.body)])
      return { ok: true, status: 200 }
    }) as any

    const rotated = {
      endpoint: 'https://push.example/e2',
      options: { applicationServerKey: new Uint8Array([1, 2, 3]).buffer },
      toJSON: () => ({ endpoint: 'https://push.example/e2', keys: { p256dh: 'p2', auth: 'a2' } }),
    }

    await fire('pushsubscriptionchange', {
      oldSubscription: { endpoint: 'https://push.example/e1', options: rotated.options },
      newSubscription: rotated,
    })

    expect(sent).toEqual([['api/push/subscribe', {
      subscription: { endpoint: 'https://push.example/e2', keys: { p256dh: 'p2', auth: 'a2' } },
      deviceId: 'dev1234abcd',
    }]])
  })

  it('with nothing in device cache, sends the subscription alone', async () => {
    const cache = await globalThis.caches.open(DEVICE_CACHE)
    await cache.delete(DEVICE_URL)

    const sent: any[] = []
    globalThis.fetch = (async (url: any, init: any) => {
      sent.push([String(url), JSON.parse(init.body)])
      return { ok: true, status: 200 }
    }) as any

    const rotated = {
      endpoint: 'https://push.example/e2',
      options: { applicationServerKey: new Uint8Array([1, 2, 3]).buffer },
      toJSON: () => ({ endpoint: 'https://push.example/e2', keys: { p256dh: 'p2', auth: 'a2' } }),
    }

    await fire('pushsubscriptionchange', {
      oldSubscription: { endpoint: 'https://push.example/e1', options: rotated.options },
      newSubscription: rotated,
    })

    expect(sent).toHaveLength(1)
    expect(sent[0][1]).toEqual({ subscription: { endpoint: 'https://push.example/e2', keys: { p256dh: 'p2', auth: 'a2' } } })
  })

  it('shows notifications and closes matching tag on push event', async () => {
    const closed: string[] = []
    const shown: any[] = []

    globalThis.self.registration = {
      getNotifications: async ({ tag }: { tag: string }) => [{ close: () => closed.push(tag) }],
      showNotification: async (title: string, opts: any) => { shown.push({ title, opts }) },
      pushManager: {},
    } as any

    await fire('push', {
      data: {
        json: () => ({ title: 'Rest Timer', body: 'Rest is over', tag: 'rest-timer' }),
      },
    })

    expect(closed).toEqual(['rest-timer'])
    expect(shown).toHaveLength(1)
    expect(shown[0].title).toBe('Rest Timer')
    expect(shown[0].opts.body).toBe('Rest is over')
    expect(shown[0].opts.tag).toBe('rest-timer')
    expect(shown[0].opts.renotify).toBe(true)
  })

  it('focuses existing window or opens new window on notificationclick', async () => {
    let closed = false
    let focused = false
    let openedUrl = ''

    globalThis.self.clients = {
      matchAll: async () => [{ focus: async () => { focused = true } }],
      openWindow: async (url: string) => { openedUrl = url },
      claim: async () => {},
    } as any

    await fire('notificationclick', {
      notification: { close: () => { closed = true } },
    })

    expect(closed).toBe(true)
    expect(focused).toBe(true)
  })
})
