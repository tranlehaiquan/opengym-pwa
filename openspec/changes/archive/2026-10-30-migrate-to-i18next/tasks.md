# Tasks

## 1. Dependencies & Locale JSON Conversion

- [x] 1.1 Install `i18next` and `react-i18next` into `frontend/package.json` and verify installation succeeds via `pnpm install`
- [x] 1.2 Convert all 20 locale files in `frontend/src/locales/*.js` to `.json` (materializing `pt-BR.json` by merging `pt` base and `PT_BR_OVERRIDES`), remove old `.js` locale files, and verify file existence
- [x] 1.3 Update `frontend/scripts/check-locales.mjs`, `frontend/scripts/check-source-strings.mjs`, and `frontend/ios/ci/watch-strings.mjs` to read `.json` files, verifying `node frontend/scripts/check-locales.mjs` outputs 20 locales in sync

## 2. Core Translation & Pluralization Adapter

- [x] 2.1 Configure and initialize `i18next` core instance in `frontend/src/lib/i18n-core.js` with `{0}`, `{1}` parameter interpolation, verifying core translation resolution via unit tests
- [x] 2.2 Refactor `t()` and `tn()` in `frontend/src/lib/i18n-core.js` to delegate translation and plural resolution through `i18next`, verifying with `pnpm --filter opengym-frontend test "src/lib/i18n-plural.test.js"`
- [x] 2.3 Integrate Swiss German (`de-CH`) text transformation and Arabic (`ar`) RTL document direction into the `i18next` flow, verifying with `pnpm --filter opengym-frontend test "src/lib/i18n-core.test.js"`

## 3. Dynamic Bundling & React Integration

- [x] 3.1 Update `frontend/src/lib/i18n.js` to load locale dictionaries via `import.meta.glob('../locales/*.json')` and register loaded packs into `i18next` with `addResourceBundle`, verifying on-demand chunk delivery
- [x] 3.2 Re-export `useTranslation` and `I18nextProvider` from `frontend/src/lib/i18n.js` alongside the backward-compatible `useLang` hook, verifying component reactivity in React tests
- [x] 3.3 Update Vitest test suites that directly import `locales/*.js` files to import `locales/*.json` (with JSON import assertions / attributes), verifying test suite execution

## 4. Verification & Integration Checks

- [x] 4.1 Run `node frontend/scripts/check-locales.mjs` and verify all 20 JSON locales pass multiset validation with 0 missing keys
- [x] 4.2 Run static type check via `pnpm run typecheck` and verify 0 errors
- [x] 4.3 Run full test suites via `pnpm --filter opengym-frontend test "i18n"` and `pnpm --filter opengym-frontend test "exercise-names"` and verify all tests pass
- [x] 4.4 Run production build via `pnpm run build` and verify build succeeds and JSON locale chunks are generated cleanly
