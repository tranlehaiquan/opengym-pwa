/// <reference lib="webworker" />

import { clientsClaim } from 'workbox-core'
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { RangeRequestsPlugin } from 'workbox-range-requests'

declare const self: ServiceWorkerGlobalScope

self.skipWaiting()
clientsClaim()

// Clean up old precache versions from previous service workers
cleanupOutdatedCaches()

// Precache all assets discovered by Vite during build
// @ts-ignore
precacheAndRoute(self.__WB_MANIFEST || [])

// Device cache constants for push subscriptions
const DEVICE_CACHE = 'opengym-device'
const DEVICE_URL = '/opengym-device-id'

// Exercise media cache configuration
const MEDIA_CACHE_NAME = 'opengym-media-v1'
const isMediaPath = (url: URL) =>
  url.pathname.includes('/exercise-media/') ||
  url.pathname.includes('/img/') ||
  url.pathname.includes('/gif/')

// 1. Exercise media: CacheFirst with range request support and LRU expiration
registerRoute(
  ({ url }: { url: URL }) => isMediaPath(url) && !url.pathname.includes('/api/'),
  new CacheFirst({
    cacheName: MEDIA_CACHE_NAME,
    plugins: [
      new RangeRequestsPlugin(),
      new ExpirationPlugin({
        maxEntries: 3000,
        purgeOnQuotaError: true,
      }),
    ],
  })
)

// 2. Hashed static bundles: CacheFirst
registerRoute(
  ({ url }: { url: URL }) => /\/assets\/[^/]+-[A-Za-z0-9_-]{8}\.(?:js|css)$/.test(url.pathname) && !url.pathname.includes('/api/'),
  new CacheFirst({
    cacheName: 'opengym-assets',
  })
)

// 3. Navigation requests: NetworkFirst with 3-second timeout, falling back to cache
registerRoute(
  ({ request, url }: { request: Request; url: URL }) => request.mode === 'navigate' && !url.pathname.includes('/api/'),
  new NetworkFirst({
    cacheName: 'opengym-shell-nav',
    networkTimeoutSeconds: 3,
  })
)

// Push notification listeners
self.addEventListener('push', (e: any) => {
  e.waitUntil((async () => {
    let data: any = {}
    try {
      data = e.data ? e.data.json() : {}
    } catch {
      data = { body: (() => { try { return e.data.text() } catch { return '' } })() }
    }
    const tag = data.tag || 'opengym'
    try {
      for (const n of await self.registration.getNotifications({ tag })) n.close()
    } catch {}
    await self.registration.showNotification(data.title || 'openGym', {
      body: data.body || '',
      icon: 'icon-512.png',
      badge: 'icon-180.png',
      tag,
      renotify: true,
    } as any)
  })())
})

self.addEventListener('notificationclick', (e: any) => {
  e.notification.close()
  e.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients: any[]) => {
      const c = clients.find(c => 'focus' in c)
      return c ? c.focus() : self.clients.openWindow('./')
    })
  )
})

self.addEventListener('pushsubscriptionchange', (e: any) => {
  e.waitUntil((async () => {
    const old = e.oldSubscription || (await self.registration.pushManager.getSubscription())
    const key = e.newSubscription?.options?.applicationServerKey || old?.options?.applicationServerKey
    if (!key) return
    const sub = e.newSubscription || (await self.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key }))
    const deviceId = await caches.open(DEVICE_CACHE).then(c => c.match(DEVICE_URL)).then(r => r ? r.text() : undefined).catch(() => undefined)
    await fetch('api/push/subscribe', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ subscription: sub.toJSON(), deviceId }),
    }).catch(() => {})
  })())
})
