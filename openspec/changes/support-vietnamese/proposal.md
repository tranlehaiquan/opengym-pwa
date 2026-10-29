# Proposal

## Why

openGym is utilized internationally and currently supports 21 locales across European and Asian languages, but lacks Vietnamese (`vi`) language support. Adding first-class Vietnamese localization allows Vietnamese-speaking fitness enthusiasts to navigate workout routines, timers, measurements, and exercise instructions naturally in their native language, while preserving complete offline-first privacy and standalone operation.

## What Changes

- **Locale & Language Registration**:
  - Register `vi: 'Tiếng Việt'` in `LANGS` and configure `DATE_LOCALES['vi'] = 'vi-VN'` in `frontend/src/lib/i18n-core.js`.
  - Enable automatic first-run language detection for `vi` when `navigator.language` begins with `vi`.
- **UI Localization Dictionary**:
  - Add `frontend/src/locales/vi.js` containing complete translations for all 2,575 application UI string keys.
  - Maintain strict placeholder parity (`{0}`, `{1}`, etc.) to pass `frontend/scripts/check-locales.mjs`.
- **Catalogue & Exercise Translations**:
  - Add `frontend/src/exercise-names/vi.js` providing localized naming for standard exercises with English parenthetical fallback support.
  - Add `frontend/src/instr/vi.js` containing translated step-by-step instructions for core exercises.
- **Settings & Persistence Integration**:
  - Allow selecting "Tiếng Việt" in Settings → Language, dynamically re-rendering the application UI and persisting the user's preference in offline storage.

## Capabilities

### New Capabilities
- `internationalization`: Manages multi-language selection, UI dictionary translation loading, regional date formatting, and localized exercise names and instructions.

### Modified Capabilities
*(None - no existing requirements in main specs are being changed)*

## Impact

- **Affected Files**:
  - `frontend/src/lib/i18n-core.js` (registration in `LANGS` and `DATE_LOCALES`)
  - `frontend/src/locales/vi.js` (new locale dictionary)
  - `frontend/src/exercise-names/vi.js` and `frontend/src/instr/vi.js` (exercise translations)
- **Tooling & Tests**:
  - `node frontend/scripts/check-locales.mjs` will verify 20 locales with 2,575 keys each.
  - Vitest i18n test suites will include `vi` coverage.
- **Runtime Performance**:
  - Locale packs are dynamically lazy-loaded via `import.meta.glob('../locales/*.js')`, ensuring zero bundle-size overhead for users using other languages.

