# Proposal

## Why

The openGym frontend currently contains over 800 JavaScript and JSX files with no compile-time type verification. As the offline-first application continues to grow in complexity—spanning workout tracking, routines, progression engines, IndexedDB storage, and offline media handling—the lack of static typing increases the risk of runtime type errors, degrades IDE autocompletion and refactoring confidence, and complicates domain model evolution. Adopting TypeScript incrementally provides compiler-backed type safety, catches regressions early, and formalizes core domain contracts without halting feature development or requiring an all-at-once rewrite of 800+ files.

## What Changes

- **Tooling & Build Setup**:
  - Install `typescript`, `@types/react`, `@types/react-dom`, `@types/node`, and relevant package definitions in `frontend/`.
  - Configure `tsconfig.json` and `tsconfig.node.json` with strict type checking enabled, configured for modern React 19 JSX runtime and Vite resolution.
  - Add typecheck npm scripts (`typecheck` / `typecheck:watch`) utilizing `tsc --noEmit` and integrate type validation into the frontend build and CI pipelines.
- **Incremental Migration Architecture**:
  - Enable `allowJs: true` and `checkJs: false` in `tsconfig.json` so existing JavaScript/JSX files continue compiling cleanly alongside new TypeScript (`.ts` / `.tsx`) modules.
  - Establish a typed foundational layer in `frontend/src/types/` defining core domain interfaces (Workouts, Exercises, Routines, Sets, Profile, and Offline Storage models).
- **Core Stores & Foundation Migration**:
  - Convert primary store state definitions (e.g. Zustand stores `useStore`, `useUI`) and foundational utility modules to typed interfaces or native `.ts` implementations.
  - Provide typed hooks and helper functions for components to consume state safely.
- **Verification & Documentation**:
  - Validate that `vite build`, `vite dev`, Vitest test suites, and mobile packaging (`build:mobile`) continue to execute seamlessly without regressions.
  - Document TypeScript contribution guidelines and file conversion patterns for contributors.

## Capabilities

### New Capabilities
*(None - this change is a pure developer tooling, compiler configuration, and refactoring migration that does not alter external user-observable behaviors. Opted out of spec deltas via `skip_specs: true` in `.openspec.yaml`.)*

### Modified Capabilities
*(None)*

## Impact

- **Build & CI**: `pnpm build` and CI workflows will include `pnpm run typecheck` (`tsc --noEmit`), catching type errors prior to bundling.
- **Dependencies**: Adds devDependencies (`typescript`, `@types/*`) in `frontend/package.json`. No runtime dependency overhead or bundle size increase.
- **Codebase**: Introduction of `frontend/tsconfig.json`, `frontend/tsconfig.node.json`, and `frontend/src/types/` directory. Incremental migration of store/utility files from `.js`/`.jsx` to `.ts`/`.tsx`.
- **Runtime & Deployment**: Zero change to application runtime behavior, offline PWA caching, IndexedDB schema, or Capacitor mobile wrappers.

