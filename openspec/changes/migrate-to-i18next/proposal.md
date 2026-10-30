# Proposal

## Why

openGym currently relies on a custom, handwritten i18n implementation in `frontend/src/lib/i18n.js` and `frontend/src/lib/i18n-core.js` with manual placeholder substitution (`replaceAll('{0}', ...)`), custom plural lookup tables, and custom React store listeners, alongside JavaScript-based locale files (`.js`). Migrating the localization engine to `i18next` and `react-i18next` adopts an industry-standard, well-tested framework with advanced CLDR pluralization, formatted interpolation, and standard React hooks. Converting translation dictionaries from `.js` to standard `.json` aligns openGym with standard translation management systems (TMS) and i18next resource conventions, while maintaining full compatibility with lazy Vite code-split bundles, Swiss German derivation, and bilingual exercise catalogue packs.

## What Changes

- Add `i18next` and `react-i18next` to `frontend/package.json` dependencies.
- Convert all 20 locale files in `frontend/src/locales/*.js` to standard JSON files (`frontend/src/locales/*.json`), expanding `pt-BR` into a full dictionary.
- Update `frontend/scripts/check-locales.mjs`, `frontend/scripts/check-source-strings.mjs`, and `frontend/ios/ci/watch-strings.mjs` to read `.json` locale files.
- Re-architect `frontend/src/lib/i18n-core.js` and `frontend/src/lib/i18n.js` to initialize and delegate to an `i18next` instance.
- Provide backward-compatible facade functions `t()`, `tn()`, `setLang()`, `getLang()`, `dateLocale()`, and `useLang()` so that existing UI call sites across 70+ components continue functioning without breaking changes.
- Expose modern `react-i18next` primitives (`useTranslation`, `Trans`) for future components.
- Connect `i18next` dynamic bundle loading to Vite's `import.meta.glob('../locales/*.json')` so that only selected languages are loaded on-demand.
- Preserve existing Swiss German (`de-CH`) text transformation (`ß` -> `ss`) and RTL direction setting for Arabic (`ar`).
- Preserve catalogue exercise name (`exerciseNameFor`) and instruction (`instrFor`) pack loading and English fallback resolution.
- Update all test files and CI scripts importing locale files to import `.json` (with JSON import assertions / attributes) or load them via standard JSON parsing.

## Capabilities

### New Capabilities
- `internationalization`: Standardized i18next-backed localization engine and JSON translation resources providing runtime translations, plural rules, date formatting, and lazy locale pack delivery.

### Modified Capabilities
<!-- None: existing behavior and requirements are preserved; client-offline-storage and standalone-app-shell remain unaffected. -->

## Impact

- **Dependencies**: `frontend/package.json` adds `i18next` and `react-i18next`.
- **Locale Files**: 20 files in `frontend/src/locales/` converted from `.js` to `.json`.
- **Tooling & Scripts**: `check-locales.mjs`, `check-source-strings.mjs`, and `watch-strings.mjs` updated to parse `.json`.
- **Core Library**: `frontend/src/lib/i18n-core.js` and `frontend/src/lib/i18n.js` refactored to delegate translation logic to `i18next` and load `.json` packs.
- **Components & Views**: Zero breaking changes to existing consumer components importing `t`, `tn`, or `useLang` from `lib/i18n`.
- **Tests**: `src/lib/i18n-core.test.js`, `src/lib/coach-api.i18n.test.js`, `frontend/scripts/check-locales.mjs`, and Vitest test suites updated and passing.
