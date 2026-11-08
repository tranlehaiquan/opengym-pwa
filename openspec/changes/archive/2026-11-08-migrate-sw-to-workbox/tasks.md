# Tasks

## 1. Dependencies and Build Configuration

- [x] 1.1 Add `vite-plugin-pwa` and Workbox packages (`workbox-core`, `workbox-precaching`, `workbox-routing`, `workbox-strategies`, `workbox-expiration`, `workbox-range-requests`) to `frontend/package.json` and verify `pnpm install` succeeds
- [x] 1.2 Update `frontend/vite.config.js` to configure `VitePWA` in `injectManifest` mode targeting `src/sw.ts` and remove the legacy `swStamp` plugin, verifying Vite config passes evaluation

## 2. Workbox Service Worker Implementation

- [x] 2.1 Create `frontend/src/sw.ts` with `precacheAndRoute(self.__WB_MANIFEST)` to manage app shell and bundle asset precaching
- [x] 2.2 Configure runtime routing in `frontend/src/sw.ts` for hashed static assets (`CacheFirst`), document navigations (`NetworkFirst` with 3s timeout), and API bypass (`/api/`)
- [x] 2.3 Configure exercise media caching in `frontend/src/sw.ts` under cache `opengym-media-v1` using `CacheFirst`, `ExpirationPlugin` (max 3000 items), and `RangeRequestsPlugin` for HTTP byte-range video streaming
- [x] 2.4 Retain push notification handlers (`push`, `notificationclick`, `pushsubscriptionchange`) and device ID cache storage (`opengym-device`) in `frontend/src/sw.ts`

## 3. Legacy Cleanup and Verification

- [x] 3.1 Remove obsolete `frontend/scripts/sw-stamp.mjs` and remove legacy `frontend/public/sw.js`
- [x] 3.2 Update and adapt service worker test suites (`frontend/src/lib/sw*.test.ts`) for Workbox and verify test suite passes with `pnpm --filter opengym-frontend test`
- [x] 3.3 Run `pnpm --filter opengym-frontend build` to verify production build succeeds and generates valid `dist/sw.js` with the precache manifest injected
