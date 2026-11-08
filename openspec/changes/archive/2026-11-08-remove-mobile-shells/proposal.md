# Proposal

## Why

openGym previously packaged its web frontend into iOS and Android native applications using Capacitor (`frontend/ios/`, `frontend/android/`). Over time, this native wrapper layer has accumulated over 550 MB of build artifacts, CocoaPods dependencies, Xcode project files, Gradle wrappers, and native platform plugins across more than 27,000 files.

With the repository now focused on a standalone offline Progressive Web App (PWA), maintaining legacy Capacitor wrappers adds substantial overhead to repository maintenance, cloning, package installations, and git operations. Furthermore, the plan is to build a modern, dedicated native mobile application in a future phase.

Removing the legacy mobile wrappers, Capacitor dependencies, and CI workflows will dramatically clean up the repository, reduce bundle and repository bloat, eliminate native CI bottlenecks, and establish a clear foundation for a future native mobile implementation.

## What Changes

- **Purge Legacy Native Shells**: Completely delete `frontend/ios/` and `frontend/android/`, reclaiming ~550 MB of disk space and removing ~27,300 files from the repository.
- **Remove Capacitor Configuration**: Delete `frontend/capacitor.config.json`.
- **Clean Up NPM Dependencies**:
  - In `frontend/package.json`, remove runtime packages: `@capacitor/core`, `@capacitor/app`, `@capacitor/filesystem`, `@capacitor/local-notifications`, `@capacitor/share`, `@capacitor/splash-screen`, `@capacitor-mlkit/barcode-scanning`, and `@aparajita/capacitor-secure-storage`.
  - In `frontend/package.json`, remove devDependencies: `@capacitor/android`, `@capacitor/cli`, and `@capacitor/ios`.
  - In `frontend/package.json`, remove the `"build:mobile"` script.
- **Remove Mobile Scripts & Bundling Checks**:
  - Delete `scripts/ios/` (`finish-ipa.sh`).
  - Delete `scripts/android/` (`build-release.sh`, `gym-reminder-emulator.sh`, `gym-reminder-approach-emulator.sh`, `make-asset-packs.mjs`).
  - Delete `frontend/scripts/check-mobile-bundle.mjs` and `frontend/scripts/check-mobile-bundle.test.mjs`.
- **Remove Mobile CI Pipelines**:
  - Delete `.github/workflows/ios.yml`.
  - Clean up `.gitlab-ci.yml` (remove `build:android` and `build:ios` jobs).
  - Update `.github/workflows/docker-publish.yml` and `.github/dependabot.yml` to remove references to `frontend/ios` and `frontend/android`.
- **Safe Web/PWA Bridge Stub**:
  - Replace `frontend/src/lib/mobile.js` with a lightweight, dependency-free stub where `MOBILE = false` and all bridge functions are safe no-ops or fallback to browser APIs (e.g., standard download for exports, `navigator.share` if available).
  - This ensures all 30+ web components and store hooks importing from `mobile.js` continue operating seamlessly without risky large-scale refactorings across the frontend UI.
- **Documentation**:
  - Update `docs/MOBILE.md` and repository README to reflect that legacy Capacitor shells have been retired and a new native application will be developed in a future release.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
None (`skip_specs: true` - core PWA capabilities specified in `openspec/specs/` are preserved).

## Impact

- **Repository Size & Performance**: Eliminates >550 MB of native source and build caches and removes ~27,300 files, dramatically speeding up git operations, searches, and repo cloning.
- **Dependencies**: Drops 11 Capacitor-related npm packages from `frontend/package.json` and updates `pnpm-lock.yaml`.
- **CI/CD**: Removes the macOS runner iOS build workflow (`.github/workflows/ios.yml`) and GitLab mobile build jobs, saving CI minutes.
- **Frontend & PWA**: Zero breaking changes to the standalone web application or PWA functionality; workout tracking, local persistence, AI coach, and exercise catalogue continue working offline.
