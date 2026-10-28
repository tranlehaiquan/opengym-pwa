# Proposal

## Why

openGym is currently architected as a self-hosted client-server application with Node.js backend dependencies for authentication, sync, and media proxying. Users who want a pure, private, zero-maintenance personal workout tracker cannot currently run openGym as a 100% offline standalone Progressive Web App (PWA) without deploying and managing backend infrastructure. Decoupling the client completely into a standalone static PWA eliminates hosting costs, removes privacy/data-leak risks, and ensures the app works indefinitely anywhere with zero network connectivity.

## What Changes

- **Clean Fork Decoupling**: Completely remove backend files, Express server, database scripts, Dockerfiles, and deployment configs (`api/`, `kubernetes/`, `helm/`, `web/`).
- **Remove Server Authentication**: Eliminate passkey/WebAuthn server registrations, password endpoints, session cookies, and login/auth screens. The app boots immediately into the local profile.
- **Remove Server Synchronization**: Strip out backend push/pull state replication, revision stamps, sync status indicators, and remote server pairing.
- **Client-First Persistence & Storage**: Preserve and harden reactive state persistence in `localStorage` / `IndexedDB`, retain IndexedDB custom media storage, and maintain full JSON backup export and import.
- **Offline PWA Bundling**: Ensure Service Worker precaches all app assets, icons, scripts, and pre-staged exercise illustrations/animations for 100% offline usage.
- **Remove Backend AI & Server Push**: Strip out server-dependent push notification registrations and backend coach endpoints, deferring local/BYOK AI coach capabilities for a future phase.
- **BREAKING**: Eliminates multi-device cloud synchronization and remote server accounts. Data is stored solely on the user's local device.

## Capabilities

### New Capabilities
- `client-offline-storage`: Manages persistent client-side storage for workout records, bodyweight logs, custom exercise definitions, and binary media (photos/videos) with file-based backup and restore.
- `standalone-app-shell`: Boots directly into the personal offline workout tracker, handles PWA lifecycle, and operates 100% offline without any backend or authentication requirements.

### Modified Capabilities
*(None - no existing capabilities defined in `openspec/specs/`)*

## Impact

- **Codebase**: Deletion of `api/`, `helm/`, `kubernetes/`, `web/`, and server-oriented deployment configurations.
- **Frontend Dependencies**: Cleanup of unused backend-related packages and build scripts.
- **Frontend Views & Stores**: Simplification of `useStore.js` (removal of sync/remote logic, boot directly into local profile), removal of `Login.jsx` and server sync components (`ServerSync.jsx`, `SyncBanner.jsx`).
- **Build Output**: Static assets compiled to `dist/`, fully self-contained and deployable to any static host (e.g. GitHub Pages, Cloudflare Pages, Netlify) or usable offline as an installed PWA.

