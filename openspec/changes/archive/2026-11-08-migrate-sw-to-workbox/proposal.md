# Proposal

## Why

The current offline caching implementation in OpenGym uses a custom, hand-rolled service worker (`frontend/public/sw.js`) and bespoke build-time string-replacement script (`frontend/scripts/sw-stamp.mjs`). While functional, maintaining custom asset scanning, manual cache-busting hashes (`__BUILD__`), custom lazy-bundle detection (`__LAZY__`), and hand-crafted byte-range slicing for video media introduces maintenance overhead and edge cases.

Migrating to Google's standard Workbox suite via `vite-plugin-pwa` in `injectManifest` mode provides production-grade caching strategies (`NetworkFirst`, `CacheFirst`), built-in LRU cache expiration (`workbox-expiration`), native byte-range request handling for video playback (`workbox-range-requests`), and automated precache manifest generation while preserving OpenGym's existing push notification handlers and subpath routing.

## What Changes

- **PWA & Workbox Integration**: Add `vite-plugin-pwa` and Google Workbox libraries (`workbox-core`, `workbox-precaching`, `workbox-routing`, `workbox-strategies`, `workbox-expiration`, `workbox-range-requests`) to frontend dependencies.
- **Vite Configuration**: Replace the custom `swStamp` plugin in `frontend/vite.config.js` with `VitePWA` configured in `injectManifest` mode targeting a source service worker file (`frontend/src/sw.ts`).
- **Precache & Manifest Injection**: Replace manual `precache()` and HTML regex parsing with Workbox's `precacheAndRoute(self.__WB_MANIFEST)`, automatically managing versioned app shell assets and on-demand chunks.
- **Runtime Caching Strategies**:
  - Network-first navigation strategy with network timeout fallback (matching current 3-second timeout) for document and shell navigations.
  - Cache-first strategy for hashed static assets (`/assets/*`).
  - Cache-first strategy with `ExpirationPlugin` (max entries / purge on quota) and `RangeRequestsPlugin` for exercise media (stills and MP4 clips) under `/exercise-media/`.
- **Preserved Custom Logic**: Retain Web Push event listeners (`push`, `notificationclick`, `pushsubscriptionchange`) and strict API bypassing (`/api/`) within the service worker source.
- **Clean up Legacy Tooling**: Deprecate and remove `frontend/scripts/sw-stamp.mjs` and the legacy raw `frontend/public/sw.js`.
- **Test Suite Updates**: Update service worker vitest suites (`sw.test.ts`, `sw-media.test.ts`, etc.) to validate the Workbox-based service worker pipeline and caching semantics.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `standalone-app-shell`: Update `Fully offline PWA caching` requirement to specify Workbox-driven precaching, runtime caching strategies (NetworkFirst with timeout, CacheFirst with LRU expiration for media, RangeRequests for media clips), and automated manifest injection.

## Impact

- **Dependencies**: Adds `vite-plugin-pwa` and Workbox dependencies to `frontend/package.json`.
- **Build Pipeline**: `frontend/vite.config.js` will invoke `VitePWA({ strategies: 'injectManifest', ... })` to compile `frontend/src/sw.ts` into `dist/sw.js`.
- **Files Modified/Removed**:
  - `frontend/public/sw.js` (replaced by `frontend/src/sw.ts`)
  - `frontend/scripts/sw-stamp.mjs` (removed)
  - `frontend/vite.config.js` (updated)
  - `frontend/src/lib/sw*.test.ts` (updated)
- **APIs & Compatibility**: Preserves all existing browser behaviors (PWA offline boot, video range streaming, Web Push notifications, subpath deployments).
