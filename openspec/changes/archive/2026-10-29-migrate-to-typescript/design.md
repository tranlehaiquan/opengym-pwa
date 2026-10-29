# Design

## Context

The openGym frontend is a React 19 Single Page Application bundled with Vite 8 and tested with Vitest. It currently consists of over 800 `.js` and `.jsx` files without TypeScript compilation or static type verification. 

State management is centralized in Zustand (`useStore.js`, `useUI.js`), persisting data offline in `localStorage` and `IndexedDB`. 

See `proposal.md` for the motivation and architectural context.

## Goals / Non-Goals

**Goals:**
- Configure TypeScript compiler infrastructure (`tsconfig.json`, `tsconfig.node.json`) tailored for Vite 8, React 19, and Vitest.
- Enable smooth coexistence of JavaScript (`.js`/`.jsx`) and TypeScript (`.ts`/`.tsx`) via `allowJs: true` and `checkJs: false`, with `strict: true` enforced on all TypeScript code.
- Add `pnpm run typecheck` (`tsc --noEmit`) to package scripts and build pipelines.
- Establish centralized domain type definitions (`frontend/src/types/`) covering Workouts, Exercises, Routines, Sets, and Store State.
- Convert core stores (`useStore`, `useUI`) or provide typed interfaces and hooks to establish type safety at the state boundary.
- Ensure 100% backward compatibility with Vite dev/build, PWA service worker stamping, Vitest tests, and Capacitor mobile builds.

**Non-Goals:**
- Big-bang migration of all 800+ components, views, and test files in this single change.
- Enforcing `checkJs: true` on unmigrated legacy JavaScript files (which would create thousands of immediate compilation errors).
- Changing runtime UI behavior, database schemas, or API contracts.

## Decisions

### 1. Incremental Hybrid Migration Strategy (`allowJs` + Strict TypeScript)
- **Decision**: Configure `allowJs: true` and `checkJs: false` in `tsconfig.json`, while enabling full `strict: true` (including `noImplicitAny`, `strictNullChecks`).
- **Rationale**: This allows existing `.js`/`.jsx` files to compile and run without modification, while ensuring that any newly authored or migrated `.ts`/`.tsx` file adheres to strict type safety.
- **Alternatives Considered**:
  - *All-at-once migration*: Renaming all 800+ files to `.ts`/`.tsx` at once. Rejected because it would require hundreds of person-hours, stall ongoing development, and risk massive regressions.
  - *Loose TypeScript (`strict: false`)*: Rejected because migrating to non-strict TypeScript yields minimal safety benefits and requires an expensive second pass later.

### 2. TypeScript Compiler & Project References Configuration
- **Decision**: Provide a project-references configuration:
  - `tsconfig.json`: Solution root referencing `tsconfig.app.json` and `tsconfig.node.json`.
  - `tsconfig.app.json`: Targets `src/`, with `target: "ES2022"`, `module: "ESNext"`, `moduleResolution: "bundler"`, `jsx: "react-jsx"`, `noEmit: true`, `skipLibCheck: true`.
  - `tsconfig.node.json`: Targets Vite config and build scripts (`vite.config.js`, `scripts/`).
- **Rationale**: Cleanly isolates browser/DOM code from Node.js build-time tooling, conforming to modern Vite recommendations.
- **Alternatives Considered**: A single flat `tsconfig.json` with combined DOM and Node types, which can cause type leakage (e.g. `process` or `Buffer` appearing in client-side code).

### 3. Centralized Domain Types Directory (`frontend/src/types/`)
- **Decision**: Organize TypeScript interfaces into modular domain files under `frontend/src/types/`:
  - `models.ts`: Core entities (Exercise, WorkoutSession, SetEntry, Routine, DayPlan, MuscleGroup).
  - `store.ts`: Zustand store state contracts, actions, and persistence schema.
  - `ambient.d.ts`: Typings for untyped third-party modules or global assets (`*.svg`, `*.webp`, `__APP_VERSION__`).
  - `index.ts`: Barrel export for convenience.
- **Rationale**: Decouples domain definitions from UI components and allows incremental typing of both stores and components without circular dependencies.

### 4. Zustand Store Typing Strategy
- **Decision**: Type `useStore` and `useUI` using Zustand's recommended typed slice pattern (`StateCreator<T>`) or explicit State/Action interfaces.
- **Rationale**: Zustand is the central backbone of openGym. Typing the store immediately surfaces type hints and autocomplete to consuming components, even before those components are converted to TypeScript.

### 5. Typecheck Pipeline Integration
- **Decision**: Add `"typecheck": "tsc --noEmit"` and `"typecheck:watch": "tsc --noEmit --watch"` to `frontend/package.json`. Add `"typecheck": "pnpm --filter opengym-frontend typecheck"` to root `package.json`.
- **Rationale**: Vite does not perform type checking during build (by design for speed). `tsc --noEmit` is the standard, authoritative verification step for CI and pre-commit checks.

## Risks / Trade-offs

- **[Risk] Type errors in ambient third-party imports (e.g., `jsqr`, `lean-qr`, `@aparajita/capacitor-secure-storage`)**  
  → *Mitigation*: Include `frontend/src/types/ambient.d.ts` with explicit fallback module declarations and use `skipLibCheck: true`.
- **[Risk] Complex Zustand store structure (`useStore.js` is over 1,000 lines with multiple slices)**  
  → *Mitigation*: Start by creating strong TypeScript interface definitions (`StoreState`, `StoreActions`) in `types/store.ts`. Migrate store slices incrementally or type the store boundary so components get instant autocompletion.
- **[Risk] Regression in Vitest test suite**  
  → *Mitigation*: Vitest uses Vite's transform pipeline, so it natively supports `.ts`/`.tsx` out of the box. Verify existing Vitest configuration and run test suites against migrated files.
- **[Risk] Mobile bundle check or service worker stamp disruption**  
  → *Mitigation*: `scripts/sw-stamp.mjs` and `scripts/check-mobile-bundle.mjs` operate on the output `dist/` directory. Since `tsc --noEmit` does not alter Vite's bundling pipeline, the build output format remains unchanged.

## Migration Plan

1. **Setup & Tooling**: Install packages, add `tsconfig*.json` configurations, add `ambient.d.ts` and `typecheck` scripts.
2. **Domain Contracts**: Create `src/types/` and define core entity models (Workout, Routine, Exercise, Profile).
3. **State Foundation**: Define Zustand store types and migrate `useUI` / `useStore` foundations to TypeScript.
4. **Verification**: Run `pnpm run typecheck`, `pnpm run build`, and `pnpm test` to ensure zero compilation or test failures.
5. **Rollback Strategy**: The migration is non-breaking. In the unlikely event of an issue, reverting configuration files and package installations cleanly restores the pure JavaScript setup.

