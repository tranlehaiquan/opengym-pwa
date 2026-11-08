# Proposal

## Why

The `frontend` application codebase currently contains over 770 JavaScript (`.js` and `.jsx`) files with only 7 files authored in TypeScript. This lack of static typing creates maintenance overhead, increases the likelihood of regressions during refactoring, and obscures component prop contracts and store state mutations across views and utilities. Migrating `frontend/src` to TypeScript (`.ts` and `.tsx`) with pragmatic, incremental typing provides immediate compile-time safety and developer ergonomics without disrupting test coverage or application stability.

## What Changes

- **Phased Migration Pipeline**: Transform `frontend/src` from JavaScript (`.js`/`.jsx`) to TypeScript (`.ts`/`.tsx`) across logical tiers:
  - **Phase 1: Foundation & Data Tiers**: Migrate shared utilities, domain models, algorithms, and core stores (`frontend/src/store`, `frontend/src/lib`, `frontend/src/coach`, and localization data modules).
  - **Phase 2: UI & Application Shell**: Convert React components and views (`frontend/src/components`, `frontend/src/views`, `frontend/src/seasonal`, `App.jsx`, `sheets.jsx`, `main.jsx`), and update `frontend/index.html` entrypoint to `/src/main.tsx`.
  - **Phase 3: Test Suites & Build Validation**: Convert unit, component, and integration tests (`*.test.js`, `*.test.jsx`) to `*.test.ts` and `*.test.tsx`, ensuring zero TypeScript diagnostic errors and passing Vitest suites.
- **Pragmatic Typing Strategy**: Use sound, idiomatic TypeScript definitions for interfaces, store states, and component props while leveraging safe type assertions and pragmatic `any` annotations where existing dynamic JavaScript patterns would otherwise impede incremental conversion.
- **Compiler & Tooling Alignment**: Retain strict configuration in `tsconfig.app.json` while verifying `vite.config.js` and build scripts smoothly resolve and bundle TypeScript entrypoints.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
<!-- None (refactoring and type system migration only; skip_specs: true declared in .openspec.yaml) -->

## Impact

- **Affected Code**: Files within `frontend/src/` (approximately 301 source files and 475 test files), along with `frontend/index.html` script entrypoint.
- **APIs**: No external API or schema alterations; runtime behavior and persisted localStorage structures (`gym_state_v1`) remain unchanged.
- **Dependencies & Tooling**: Uses existing `typescript`, `@types/react`, `@types/react-dom`, and `@types/node` already installed in `frontend/package.json`. No new package dependencies required.
