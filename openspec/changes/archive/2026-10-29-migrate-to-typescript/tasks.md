# Tasks

## 1. Tooling & Compiler Configuration

- [x] 1.1 Install TypeScript and type definitions (`typescript`, `@types/react`, `@types/react-dom`, `@types/node`) as devDependencies in `frontend/` and verify package installation with `pnpm --filter opengym-frontend ls`
- [x] 1.2 Create `frontend/tsconfig.json`, `frontend/tsconfig.app.json`, and `frontend/tsconfig.node.json` configured for Vite 8, React 19, `allowJs: true`, and strict checking for `.ts`/`.tsx`, verifying config validity with `pnpm --filter opengym-frontend exec tsc --showConfig`
- [x] 1.3 Add `frontend/src/types/ambient.d.ts` for build-time globals (`__APP_VERSION__`), static assets, and untyped third-party libraries, verifying with `pnpm --filter opengym-frontend exec tsc --noEmit`
- [x] 1.4 Add `typecheck` and `typecheck:watch` scripts to `frontend/package.json` and root `package.json`, verifying `pnpm run typecheck` executes cleanly

## 2. Core Domain Type Definitions

- [x] 2.1 Create `frontend/src/types/models.ts` defining core workout entities (Exercise, WorkoutSession, SetEntry, Routine, DayPlan, MuscleGroup) and verify types compile via `pnpm run typecheck`
- [x] 2.2 Create `frontend/src/types/storage.ts` defining offline storage schemas and backup/restore JSON contracts, verifying compilation via `pnpm run typecheck`
- [x] 2.3 Create barrel export `frontend/src/types/index.ts` re-exporting domain types and verify import resolution via `pnpm run typecheck`

## 3. State & Store Typing

- [x] 3.1 Create `frontend/src/types/store.ts` specifying state slices, actions, and persistence interfaces for Zustand stores, verifying types compile via `pnpm run typecheck`
- [x] 3.2 Migrate `frontend/src/store/useUI.js` to `frontend/src/store/useUI.ts` with explicit state types and verify unit tests pass with `pnpm --filter opengym-frontend test src/store/useUI.test.js`
- [x] 3.3 Add typed store accessors/wrappers for `useStore` providing strict autocompletion for components and verify store tests pass with `pnpm --filter opengym-frontend test src/store/`

## 4. Verification & Integration Checks

- [x] 4.1 Run full typecheck via `pnpm run typecheck` and verify 0 type errors exist in TypeScript files
- [x] 4.2 Run production build via `pnpm run build` and verify bundle generation and service worker stamping complete without warnings
- [x] 4.3 Run test suite via `pnpm test` and verify that all unit and component tests pass without regression

