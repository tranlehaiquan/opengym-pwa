# Design

## Context

See `proposal.md` for motivation.

openGym was architected with a decoupled frontend (React 19 + Zustand) and a Node.js backend (Express + SQLite + WebAuthn). While the frontend already maintains an in-memory reactive state (`useStore.js`) persisted to `localStorage` and custom media in `IndexedDB`, it actively communicates with `/api` for configuration, authentication, state synchronization, and push notifications.

To achieve a 100% offline standalone PWA, the frontend must be decoupled from the backend so that boot, state persistence, media handling, and views function autonomously in any browser without network dependencies.

## Goals / Non-Goals

**Goals:**
- Completely remove all backend code, Docker/Kubernetes deployment artifacts, and server-side dependencies.
- Refactor frontend boot in `frontend/src/store/useStore.js` to load local state directly and bypass all network requests (`/api/me`, `/api/config`, `/api/sync`).
- Remove login, passkey authentication, remote pairing, server sync banners, and server push notifications from the UI.
- Maintain existing client-side storage architecture (`localStorage` for state snapshot, `IndexedDB` for custom media, JSON backup export/import).
- Package all exercise catalogue stills and animations directly into the static `dist/` output and ensure the Service Worker precaches them.

**Non-Goals:**
- Multi-device cloud sync or remote user accounts (data lives exclusively in the local browser/PWA).
- Integrating client-side/BYOK AI Coach (deferred to a future change).
- Replacing the client storage engine with heavy WASM databases (e.g., DuckDB-Wasm or SQLite-Wasm).

## Decisions

### 1. Pure Clean Fork over Conditional Build Flags
- **Choice**: Permanently remove `api/`, `web/`, `kubernetes/`, `helm/`, and backend configurations from the repository.
- **Rationale**: Eliminates dead backend baggage, simplifies build scripts, reduces maintenance overhead, and ensures the codebase is dedicated purely to the offline client app.
- **Alternatives Considered**: Build-time toggle (`VITE_STANDALONE=1`). Rejected because the goal is a streamlined, purpose-built static fork.

### 2. Client Storage Architecture
- **Choice**: Retain `localStorage` for state `S` (`gym_state_v1`), `IndexedDB` for custom exercise media (`media-store-idb.js`), and file-based JSON backup/restore.
- **Rationale**: The state object is small (100KB - 2MB after years of daily tracking) and already operates reactively in memory with debounced writes. `mediaStore` already has an IndexedDB backend.
- **Alternatives Considered**: DuckDB-Wasm (adds ~30MB bundle size and is intended for large-scale OLAP analytics, not document state); SQLite-Wasm (adds WASM compilation complexity without material benefit over Zustand + IndexedDB).

### 3. Removal of Authentication & Sync UI
- **Choice**: Eliminate `Login.jsx`, `ServerSync.jsx`, `SyncBanner.jsx`, and WebAuthn/passkey management from Settings.
- **Rationale**: Without a backend, there are no remote user accounts or sync targets. The application acts as a single-user local appliance.
- **Boot Flow**:
```
User opens PWA
       │
       ▼
Service Worker (sw.js) serves shell + media from cache
       │
       ▼
Zustand loadState() reads localStorage('gym_state_v1')
       │
       ├─► State found: hydrate in-memory S directly
       └─► No state: seed starter routines & default preferences
       │
       ▼
Render Tracker / Home View (Zero network calls made)
```

### 4. Static Media Staging
- **Choice**: Run `stage-media.mjs` during the standard `npm run build` process to copy `catalogue/media/still` and `catalogue/media/clip` directly into `frontend/dist/exercise-media/`.
- **Rationale**: Enables all exercise demonstrations to be bundled into the static site and cached offline by `sw.js`.

## Risks / Trade-offs

- **[Risk: Browser Storage Eviction]**: Browsers may clear `localStorage` / `IndexedDB` under severe disk pressure or on iOS Safari if the site is not visited regularly.
  - **Mitigation**: Request persistent storage via `navigator.storage.persist()`; prompt users to install as a standalone PWA on Home Screen; encourage regular one-click JSON backups from Settings.
- **[Risk: Static Bundle Size with Media]**: Bundling all catalogue media increases the offline cache size (~100MB).
  - **Mitigation**: The Service Worker already employs LRU caching for exercise media (`MEDIA_MAX_BYTES`), downloading clips on demand when online, or precaching as needed.

