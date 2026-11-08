# Mobile Application Status

> [!NOTE]
> The legacy Capacitor mobile shells (`frontend/ios` and `frontend/android`) and associated Capacitor plugins have been removed from this repository.
> openGym currently operates as a 100% offline standalone Progressive Web App (PWA).
> A dedicated, modern native mobile implementation will be initialized in an upcoming release.

## Current Architecture: Standalone Offline PWA

openGym operates as a zero-dependency, local-first workout tracker in any modern web browser or as an installed PWA on iOS and Android devices:
- **Zero Backend**: All data is stored directly in browser storage (`localStorage` and `IndexedDB`).
- **Complete Privacy**: No tracking, accounts, or telemetry.
- **Offline Capabilities**: Precached static assets and local media storage allow the app to work seamlessly without internet connectivity.
- **Data Portability**: Full JSON and media zip backup export and import.

## Future Native Implementation

Mobile development will be re-initialized with a modern native architecture:
- Clean decoupling from legacy wrapper code and build caches.
- Native performance and OS integrations (widgets, health data sync, local notifications).
- Standalone client architecture aligned with openGym's local-first philosophy.
