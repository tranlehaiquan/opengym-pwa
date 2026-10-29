# Tasks

## 1. Locale Registration & Core Setup

- [x] 1.1 Register `vi: 'Tiếng Việt'` in `LANGS` and `'vi-VN'` in `DATE_LOCALES` within `frontend/src/lib/i18n-core.js`, verifying `LANGS.vi` is defined and date formatting resolves `vi-VN`
- [x] 1.2 Ensure `vi` initial language detection in `frontend/src/lib/i18n-core.js` and `frontend/src/store/useStore.js` resolves correctly for `vi*` browser locales, verifying with unit tests in `src/lib/i18n-core.test.js`

## 2. UI Translation Dictionary

- [x] 2.1 Create `frontend/src/locales/vi.js` implementing all 2,575 application translation keys with accurate fitness terminology and strict placeholder parity (`{0}`, `{1}`)
- [x] 2.2 Validate `frontend/src/locales/vi.js` by running `node frontend/scripts/check-locales.mjs` and verifying all 20 locales pass with 0 missing keys or mismatched placeholders

## 3. Exercise Names & Instructions

- [x] 3.1 Create `frontend/src/exercise-names/vi.js` mapping standard catalogue exercise IDs to localized Vietnamese names, verifying lookup via `exerciseNameFor`
- [x] 3.2 Create `frontend/src/instr/vi.js` providing Vietnamese step-by-step instructions for standard exercises, verifying lookup via `instrFor`

## 4. Verification & Integration Checks

- [x] 4.1 Run static type check via `pnpm run typecheck` and verify 0 errors
- [x] 4.2 Run i18n test suites via `pnpm --filter opengym-frontend test "src/lib/i18n"` and verify all unit tests pass
- [x] 4.3 Run production build via `pnpm run build` and verify bundle generation and `vi` locale chunk output complete without warnings
