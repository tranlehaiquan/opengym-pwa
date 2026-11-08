# Tasks

## 1. Foundation, Stores, and Data Modules

- [x] 1.1 Migrate `frontend/src/store/` files (`useStore.js` -> `useStore.ts`, `persistence.js` -> `persistence.ts`) using pragmatic store typing, and verify clean type compilation with `cd frontend && npx tsc -b --noEmit`.
- [x] 1.2 Migrate localization data and catalog dictionary modules (`frontend/src/exercise-names/`, `frontend/src/instr/`, `frontend/src/exercise-desc/`, `frontend/src/seasonal/`) to `.ts`/`.tsx`, and verify imports resolve without compiler errors.
- [x] 1.3 Migrate `frontend/src/lib/` utilities (formatting, math, dates, audio, QR, and offline storage helpers) to `.ts` with typed function signatures and pragmatic assertions where needed, and verify with `cd frontend && npx tsc -b --noEmit`.
- [x] 1.4 Migrate `frontend/src/coach/` logic and `coach/core/` modules to `.ts`, and verify that coach unit tests run and pass.

## 2. UI Components, Views, and Application Shell

- [x] 2.1 Migrate reusable UI components in `frontend/src/components/` (`.jsx` -> `.tsx`, `.js` -> `.ts`) defining typed props interfaces, and verify with `cd frontend && npx tsc -b --noEmit`.
- [x] 2.2 Migrate application views in `frontend/src/views/` (`.jsx` -> `.tsx`, `.js` -> `.ts`), updating local import specifiers to point to `.tsx`/extensionless paths, and verify with `cd frontend && npx tsc -b --noEmit`.
- [x] 2.3 Migrate application root files (`frontend/src/App.jsx`, `frontend/src/sheets.jsx`, `frontend/src/main.jsx`) to `.tsx`, update `frontend/index.html` script source to `/src/main.tsx`, and verify `cd frontend && npm run build` completes successfully.

## 3. Test Suites and Full Verification

- [x] 3.1 Migrate root test setup (`frontend/src/test-setup.js` -> `.ts`) and root test files (`frontend/src/*.test.js` -> `.test.ts`, `frontend/src/*.test.jsx` -> `.test.tsx`), verifying root tests pass under `vitest run`.
- [x] 3.2 Migrate module-level test files across `frontend/src/lib/`, `frontend/src/store/`, `frontend/src/components/`, `frontend/src/views/`, and `frontend/src/coach/` to `.test.ts` and `.test.tsx`.
- [x] 3.3 Execute full end-to-end frontend typecheck (`cd frontend && npm run typecheck`) and Vitest test suite (`cd frontend && npm test`), verifying zero TypeScript diagnostic errors and 100% passing tests.
