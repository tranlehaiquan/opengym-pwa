# Tasks

## 1. Backend and Infrastructure Pruning

- [x] 1.1 Remove backend directories (`api/`, `web/`, `kubernetes/`, `helm/`, `certs/`) and verify deletion
- [x] 1.2 Clean up root `package.json` and remove backend-specific configuration files and scripts

## 2. Frontend Store and Boot Decoupling

- [x] 2.1 Refactor `frontend/src/store/useStore.js` `boot()` method to directly hydrate state from `localStorage` without calling `/api/me`, `/api/config`, or `/api/sync`
- [x] 2.2 Remove remote sync mechanisms (push/pull state, revision markers, adoption holds) from `useStore.js` and verify local state persistence tests pass
- [x] 2.3 Verify `media-store-idb.js` operates purely in client-side IndexedDB without attempting server sync

## 3. UI and Views Cleanup

- [x] 3.1 Remove login view and authentication gates in `App.jsx`, ensuring the application boots directly into the main workout view
- [x] 3.2 Remove `ServerSync.jsx` and `SyncBanner.jsx` components and references
- [x] 3.3 Update `views/Settings.jsx` to remove passkeys, remote server pairing, server connection status, and coach server settings while preserving JSON backup and restore

## 4. Offline PWA Bundling and Verification

- [x] 4.1 Update frontend build scripts in `frontend/package.json` to stage catalogue media into `dist/exercise-media` automatically during `npm run build`
- [x] 4.2 Verify Service Worker (`sw.js`) and PWA manifest correctly cache application assets and run fully offline
- [x] 4.3 Run test suite (`npm run test`) and production build (`npm run build`) in `frontend` to verify a clean, error-free standalone bundle

## Workflow follow-up

- Archive the change after the project's review requirements are satisfied.
- Verify the archived result.

