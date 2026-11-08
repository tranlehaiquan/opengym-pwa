# Tasks

## 1. Purge Native Shell Directories & Capacitor Config

- [x] 1.1 Delete `frontend/ios/` directory recursively (~307 MB, ~18,000 files).
- [x] 1.2 Delete `frontend/android/` directory recursively (~243 MB, ~9,200 files).
- [x] 1.3 Delete `frontend/capacitor.config.json`.

## 2. Clean Up Package Dependencies & Scripts

- [x] 2.1 In `frontend/package.json`, remove the `"build:mobile"` script.
- [x] 2.2 In `frontend/package.json`, remove `@aparajita/capacitor-secure-storage`, `@capacitor-mlkit/barcode-scanning`, `@capacitor/app`, `@capacitor/core`, `@capacitor/filesystem`, `@capacitor/local-notifications`, `@capacitor/share`, and `@capacitor/splash-screen` from `dependencies`.
- [x] 2.3 In `frontend/package.json`, remove `@capacitor/android`, `@capacitor/cli`, and `@capacitor/ios` from `devDependencies`.
- [x] 2.4 Update package lockfile (`pnpm install`) to reflect removed dependencies.

## 3. Remove Mobile Scripts & Bundling Checks

- [x] 3.1 Delete `scripts/ios/` directory (`finish-ipa.sh`).
- [x] 3.2 Delete `scripts/android/` directory (`build-release.sh`, `gym-reminder-emulator.sh`, `gym-reminder-approach-emulator.sh`, `make-asset-packs.mjs`).
- [x] 3.3 Delete `frontend/scripts/check-mobile-bundle.mjs` and `frontend/scripts/check-mobile-bundle.test.mjs`.

## 4. Remove Mobile CI Workflows & Configurations

- [x] 4.1 Delete `.github/workflows/ios.yml`.
- [x] 4.2 In `.gitlab-ci.yml`, remove `build:android` and `build:ios` jobs.
- [x] 4.3 In `.github/workflows/docker-publish.yml`, remove path triggers for `frontend/ios/**` and `frontend/android/**`.
- [x] 4.4 In `.github/dependabot.yml`, remove comments/entries referring to `frontend/ios` and `frontend/android`.

## 5. Implement Clean Web Stub in `frontend/src/lib/mobile.js`

- [x] 5.1 Replace `frontend/src/lib/mobile.js` with the lightweight zero-dependency web stub providing `MOBILE = false`, safe sharing/downloads, and no-op hooks.
- [x] 5.2 Remove or update obsolete native-only test suites (`frontend/src/lib/mobile-state-file.test.js`, `frontend/src/lib/mobile.autobackup.test.js`, `frontend/src/lib/mobile.backupfolder.test.js`, `frontend/src/lib/mobile.remote-file.test.js`).
- [x] 5.3 Verify that remaining tests in `frontend/src/lib/mobile.test.js` succeed with the web stub.

## 6. Documentation & Build Validation

- [x] 6.1 Update `docs/MOBILE.md` (or archive/replace with a notice indicating legacy shells have been removed in preparation for a future clean-slate native app).
- [x] 6.2 Run `pnpm run build` in `frontend/` to verify that the web/PWA bundle builds without errors or missing imports.
- [x] 6.3 Run `pnpm run test` in `frontend/` to verify that unit tests pass.
