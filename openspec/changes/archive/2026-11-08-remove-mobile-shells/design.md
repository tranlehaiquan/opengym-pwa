# Design

## Context

openGym currently ships with legacy Capacitor native wrappers under `frontend/ios/` and `frontend/android/`. These native projects include custom Swift and Java plugins for local notifications, system bars, Apple Watch synchronization, home screen widgets, health data sync, and local file storage. Together with CocoaPods dependencies and Gradle build output, these directories contain ~27,300 files and exceed 550 MB in size.

The user's objective is to completely remove all legacy mobile wrapper artifacts now, while retaining a stable standalone web and PWA application, in order to re-initialize a fresh native mobile application in a future milestone.

## Goals / Non-Goals

**Goals:**
- Completely purge legacy native shell directories (`frontend/ios/` and `frontend/android/`).
- Remove Capacitor configuration (`frontend/capacitor.config.json`) and uninstall all `@capacitor/*` dependencies from `frontend/package.json`.
- Remove legacy mobile packaging scripts (`scripts/ios/`, `scripts/android/`, `frontend/scripts/check-mobile-bundle.*`).
- Remove mobile CI workflows (`.github/workflows/ios.yml`, `.gitlab-ci.yml` mobile jobs).
- Provide a clean, permanent `MOBILE = false` fallback stub in `frontend/src/lib/mobile.js` so that all existing UI components and store operations continue to run without runtime errors or import breakage.
- Ensure `pnpm build` and `pnpm test` (or `vitest run`) succeed cleanly for the web frontend.

**Non-Goals:**
- Refactoring every single React component and hook (`App.jsx`, `useStore.js`, `Settings.jsx`, etc.) to remove `if (MOBILE)` conditionals. Keeping the stub in `frontend/src/lib/mobile.js` achieves full web stability with zero regression risk to the web app.
- Implementing the new native app at this time. (A new native mobile client will be initialized in a future change.)

## Decisions

### 1. Remove Native Shell Directories
- **Choice**: Delete `frontend/ios/` and `frontend/android/` entirely.
- **Rationale**: These folders contain thousands of generated files, CocoaPods caches, Gradle wrappers, and outdated native bridge plugins. Removing them reclaims >550 MB and clears out legacy baggage.
- **Future Re-init**: When building native later, modern native toolchains (e.g., standard native Swift/Kotlin or modern cross-platform frameworks) will start from a clean slate.

### 2. Remove Capacitor Dependencies and Scripts from `frontend/package.json`
- **Choice**:
  - Remove runtime dependencies:
    - `@aparajita/capacitor-secure-storage`
    - `@capacitor-mlkit/barcode-scanning`
    - `@capacitor/app`
    - `@capacitor/core`
    - `@capacitor/filesystem`
    - `@capacitor/local-notifications`
    - `@capacitor/share`
    - `@capacitor/splash-screen`
  - Remove devDependencies:
    - `@capacitor/android`
    - `@capacitor/cli`
    - `@capacitor/ios`
  - Remove scripts:
    - `"build:mobile"`
  - Delete `frontend/capacitor.config.json`.
- **Rationale**: Eliminates unnecessary package resolution and prevents accidental attempts to sync or build Capacitor shells.

### 3. Safe Web Stub for `frontend/src/lib/mobile.js`
- **Choice**: Replace `frontend/src/lib/mobile.js` with a minimal, zero-dependency stub tailored for web/PWA mode:
  ```javascript
  export const MOBILE = false

  export async function isAndroid() { return false }
  export async function nativePlatform() { return null }

  export async function nativeLoad() { return null }
  export async function nativeSave(_state) { /* no-op on web */ }

  export async function readJsonFile(_name) { return null }
  export async function writeJsonFile(_name, _data) { /* no-op */ }
  export async function writeAutoBackup(_data) { /* no-op */ }

  export async function shareExport({ filename, data, mime }) {
    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
      try {
        const file = new File([data], filename, { type: mime || 'application/json' })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: filename })
          return true
        }
      } catch { /* fallback to download */ }
    }
    // Browser download fallback
    const blob = new Blob([data], { type: mime || 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    return true
  }

  export async function shareExportBlob(filename, blob) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    return true
  }

  export async function printHtml(html) {
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(html)
      win.document.close()
      win.focus()
      win.print()
    }
  }

  export async function syncReminder(_opts) { /* no-op on web */ }
  export async function initReminderSync(_opts) { return () => {} }
  export function onAppActive(_cb) { return () => {} }

  export async function backupFolder() { return null }
  export async function chooseBackupFolder() { return null }
  export async function resetBackupFolder() { /* no-op */ }
  export function onBackupFolderChange(_cb) { return () => {} }

  export async function loadRemoteFile(_name) { return null }
  export async function saveRemoteFile(_name, _data) { /* no-op */ }

  export function buildReminderNotifications() { return [] }
  export function buildNudgeNotifications() { return [] }
  ```
- **Rationale**:
  - Over 30 files in `frontend/src/` import symbols from `lib/mobile.js`.
  - Providing these safe stubs ensures that the web application, PWA, CSV export, HTML printing, and settings continue functioning perfectly without making delicate cross-cutting edits to dozens of application components.

### 4. Remove Auxiliary Mobile Scripts and CI Jobs
- **Choice**:
  - Delete `scripts/ios/` and `scripts/android/`.
  - Delete `frontend/scripts/check-mobile-bundle.mjs` and `frontend/scripts/check-mobile-bundle.test.mjs`.
  - Delete `.github/workflows/ios.yml`.
  - Remove `build:android` and `build:ios` jobs from `.gitlab-ci.yml`.
  - Remove path patterns for `frontend/ios/**` and `frontend/android/**` in `.github/workflows/docker-publish.yml` and `.github/dependabot.yml`.
- **Rationale**: Prevents stale CI runs from attempting to build non-existent mobile artifacts or failing on missing files.

### 5. Documentation Update
- **Choice**: Update `docs/MOBILE.md` to indicate that legacy Capacitor mobile shells have been removed, outlining the strategy for future native development.

## Risks / Trade-offs

- **[Risk] Existing unit tests targeting Capacitor bindings fail.**
  - *Mitigation*: Tests specifically testing native Capacitor file systems or native onboarding (`frontend/src/lib/mobile-state-file.test.js`, `frontend/src/views/MobileOnboarding.*.test.*`) will be retired or updated to match the new web-only stub.
- **[Risk] Leftover mobile files in `frontend/src/lib/` (e.g. `watch-sync.js`, `widgets.js`).**
  - *Mitigation*: These files immediately check `if (!MOBILE) return` on load, so they remain dormant with zero runtime impact until native clients are re-architected.
