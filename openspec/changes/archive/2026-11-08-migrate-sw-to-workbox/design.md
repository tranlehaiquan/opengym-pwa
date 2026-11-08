# Design

## Context

OpenGym is an offline-capable workout tracking PWA with a Vite 8 / React 19 frontend. Offline operation and PWA caching are currently managed through a handwritten ~300-line service worker (`frontend/public/sw.js`) and a build-time regex replacement script (`frontend/scripts/sw-stamp.mjs`) orchestrated by a custom `swStamp` plugin in `frontend/vite.config.js`.

The current implementation manually solves several problems:
1. Precaching the app shell by parsing `index.html` via regex at runtime during the `install` event.
2. Injecting lazy-loaded chunk lists (`__LAZY__`) and cache version hashes (`__BUILD__`) at build time.
3. Network-first caching with a 3-second timeout for HTML documents.
4. Cache-first caching for hashed JS/CSS assets.
5. Cache-first media caching with a custom LRU eviction loop (`trimMedia`, max 150MB / 3000 items) and custom byte-range slicing (`slice(res, range)`) for video demonstration clips.
6. Web push notifications (`push`, `notificationclick`, `pushsubscriptionchange`).

See `proposal.md` for the motivation to modernize this with Google Workbox.

## Goals / Non-Goals

**Goals:**
- Replace custom precaching and bundle stamping with Workbox's `precacheAndRoute` manifest injection.
- Use `vite-plugin-pwa` in `injectManifest` mode to compile a TypeScript service worker source file (`frontend/src/sw.ts`) into `dist/sw.js`.
- Use Workbox's `NetworkFirst`, `CacheFirst`, `ExpirationPlugin`, and `RangeRequestsPlugin` for runtime routing and media caching.
- Preserve all existing runtime behaviors:
  - Web Push event handlers (`push`, `notificationclick`, `pushsubscriptionchange`).
  - Device ID caching (`opengym-device`).
  - Bypassing `/api/` endpoints.
  - Video range playback and media cache persistence (`opengym-media-v1`).
- Clean up legacy build scripts (`sw-stamp.mjs`, `public/sw.js`, and `swStamp` in `vite.config.js`).
- Update existing service worker test suites to validate the new setup.

**Non-Goals:**
- Modifying backend APIs or push subscription contracts.
- Altering user data storage (localStorage / IndexedDB) or UI components.
- Introducing service worker auto-update popups or aggressive reload prompts in the UI.

## Decisions

### 1. `vite-plugin-pwa` with `injectManifest` mode
- **Decision**: Configure `vite-plugin-pwa` with `strategies: 'injectManifest'`, specifying `src/sw.ts` as the source worker.
- **Rationale**: `generateSW` cannot accommodate custom push notification handlers (`push`, `notificationclick`, `pushsubscriptionchange`) or device ID cache handling. `injectManifest` gives us full control over custom events in TypeScript while Workbox automatically generates and injects `self.__WB_MANIFEST`.
- **Alternatives considered**:
  - `generateSW`: Incompatible with custom push notification logic and bespoke device ID storage.
  - Standalone `workbox-build` CLI script: Requires maintaining separate build scripts and doesn't seamlessly integrate into Vite's dev server or bundle pipeline.

### 2. Workbox strategies and official plugins for runtime caching
- **Decision**: Use:
  - `NetworkFirst` with `networkTimeoutSeconds: 3` for document navigation requests.
  - `CacheFirst` for hashed bundle assets matching `/\/assets\/.*-[A-Za-z0-9_-]{8}\.(?:js|css)$/`.
  - `CacheFirst` with `ExpirationPlugin` (`maxEntries: 3000`, `purgeOnQuotaError: true`) and `RangeRequestsPlugin` for `/exercise-media/` (stills and clips).
  - Explicit cache name `opengym-media-v1` for media, ensuring media assets outlive service worker updates.
- **Rationale**: Replaces error-prone manual ArrayBuffer slicing and manual LRU loops with battle-tested Google Workbox modules.
- **Alternatives considered**:
  - Retaining manual range slicing in `sw.ts`: Unnecessary code duplication when `workbox-range-requests` exists specifically for HTTP 206 video streaming.

### 3. Source service worker in TypeScript (`frontend/src/sw.ts`)
- **Decision**: Place the service worker source in `frontend/src/sw.ts` instead of `public/sw.js`.
- **Rationale**: Benefit from TypeScript types (`ServiceWorkerGlobalScope`, Workbox typings), code completion, and bundler compilation.
- **Alternatives considered**:
  - Keeping a plain JS file in `public/sw.js`: Misses type checking and requires custom Rollup configuration.

## Risks / Trade-offs

- **[Risk]** `vite-plugin-pwa` integration with Vite 8.
  - **Mitigation**: `vite-plugin-pwa` v2 supports Vite 8. Verify with a clean `pnpm build` in `frontend/`.
- **[Risk]** Media cache wiped on service worker upgrades.
  - **Mitigation**: Isolate media in a named cache (`cacheName: 'opengym-media-v1'`) separate from Workbox's precache bucket so activate cleanup never touches it.
- **[Risk]** Vitest unit tests currently import `public/sw.js` directly with custom mocks.
  - **Mitigation**: Update tests in `frontend/src/lib/sw*.test.ts` to mock Workbox runtime or test the compiled service worker.

## Migration Plan

1. Install dependencies in `frontend`: `vite-plugin-pwa`, `workbox-core`, `workbox-precaching`, `workbox-routing`, `workbox-strategies`, `workbox-expiration`, `workbox-range-requests`.
2. Create `frontend/src/sw.ts` with Workbox precaching, runtime strategies, and push event handlers.
3. Update `frontend/vite.config.js` to register `VitePWA` and remove `swStamp`.
4. Delete `frontend/scripts/sw-stamp.mjs` and remove `frontend/public/sw.js`.
5. Update test files (`frontend/src/lib/sw.test.ts`, `sw-media.test.ts`, etc.).
6. Build and test to verify offline behavior and asset generation.
