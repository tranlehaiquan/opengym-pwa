# Design

## Context

The `frontend` package is a React 19 single-page application bundled with Vite and tested with Vitest. Its `tsconfig.app.json` has `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`, `allowJs: true`, and `jsx: react-jsx`. Foundational type declarations already exist in `frontend/src/types/` (`models.ts`, `storage.ts`, `store.ts`, `index.ts`), and helper hooks like `typedStore.ts` and `useUI.ts` are already TypeScript files.

However, the bulk of the frontend codebase (~301 source files and ~475 test files) remains in JavaScript (`.js` and `.jsx`). Because `allowJs: true` is active, TypeScript and JavaScript files co-exist seamlessly, allowing an incremental, phase-by-phase migration.

## Goals / Non-Goals

**Goals:**
- Systematically transform all `frontend/src` JavaScript files (`.js` and `.jsx`) to TypeScript (`.ts` and `.tsx`).
- Structure the transformation into logical module phases:
  1. Core stores, utilities, algorithms, and data modules (`store/`, `lib/`, `coach/`, `exercise-*`, `instr/`, `seasonal/`).
  2. UI layer (`components/`, `views/`, root application shell `App.jsx`, `sheets.jsx`, `main.jsx`, and `index.html`).
  3. Test suites (`*.test.js`, `*.test.jsx`).
- Maintain clean build passes (`tsc -b --noEmit`) and passing Vitest test runs at every phase boundary.
- Apply pragmatic typing: provide well-defined interfaces for React props, hooks, and store operations, while permitting safe type assertions or pragmatic `any` annotations for intricate dynamic or legacy structures to maintain velocity.

**Non-Goals:**
- Migrating code outside `frontend/src` (e.g., `mcp/`, root `scripts/`, or `website/`).
- Rewriting runtime logic or redesigning state structures; all runtime behavior, localStorage schemas, and UI interactions must remain unchanged.
- Enforcing dogmatic zero-`any` strictness where legacy dynamism would require extensive architectural refactoring.

## Decisions

### 1. Phased Bottom-Up Module Ordering
- **Choice**: Migrate foundational data and library modules first, followed by the component and view UI hierarchy, followed by test files.
- **Rationale**: Views and components depend heavily on `useStore`, `useUI`, and utility functions from `lib/`. Having underlying modules typed first ensures autocompletion, eliminates cascading type inference bugs, and minimizes diagnostic errors when converting UI components.
- **Alternatives Considered**:
  - *Big-Bang Conversion*: Converting all files in a single pass. Rejected due to insurmountable merge conflicts, noisy compiler output, and difficult debugging.
  - *Top-Down Conversion*: Converting views before stores/libs. Rejected because components would be typing against untyped JavaScript modules, forcing unnecessary placeholder typings that would have to be revisited later.

### 2. Pragmatic and Incremental Typing Standards
- **Choice**: Require explicit types for component props, exported utility signatures, and public store methods. Allow pragmatic `any`, `unknown`, or index signatures (`Record<string, unknown>`) for deeply nested dynamic objects, legacy local storage payloads, or third-party untyped library callbacks (e.g., canvas/QR/audio operations).
- **Rationale**: Accelerates migration without compromising runtime stability, strictly adhering to the user's requirement for incremental/pragmatic typing.
- **Alternatives Considered**:
  - *Strict Zero-Any*: Rejected because openGym has complex math, SVG coordinate mappings, and legacy state migrations that would require extensive typing overhead with negligible runtime benefit.

### 3. Handling Module Import Specifiers
- **Choice**: When renaming `.jsx` files to `.tsx` and `.js` files to `.ts`, transition import statements to either extensionless specifiers (e.g., `import { Button } from './Button'`) or matching extensions (`.tsx` / `.ts`).
- **Rationale**: Vite and TypeScript under bundler resolution seamlessly resolve extensionless imports, preventing stale `.jsx` import errors.
- **Alternatives Considered**:
  - *Leaving `.jsx` imports in place*: In TypeScript with bundler mode, importing `.jsx` when the file on disk is `.tsx` causes resolution errors in the compiler and build tools.

### 4. Application Entry Point Update
- **Choice**: Rename `frontend/src/main.jsx` to `main.tsx` and update `frontend/index.html` line 124 to `<script type="module" src="/src/main.tsx"></script>`.
- **Rationale**: Standard Vite convention for React + TypeScript projects; Vite natively detects and bundles `.tsx` entrypoints from `index.html`.

## Risks / Trade-offs

- **[Risk]** Compiler failures from `noUnusedLocals` and `noUnusedParameters` in `tsconfig.app.json` during file renames.
  → **Mitigation**: Prefix intentionally ignored parameters with an underscore (`_param`) or clean up dead variables during file conversion.
- **[Risk]** Circular dependencies or import cycles between `useStore` and `lib/` modules exposed by TypeScript compiler.
  → **Mitigation**: Use `import type` where only type definitions are needed to eliminate runtime cycle dependencies.
- **[Risk]** Test files failing due to strict mock typings in Vitest.
  → **Mitigation**: In test files (`*.test.ts` / `*.test.tsx`), use `as any` or Partial mocks (`Partial<WorkoutSession>`) when testing isolated edge cases.

## Migration Plan

1. **Phase 1: Stores, Libs, & Data Modules**
   - Convert `frontend/src/store/` (`useStore.js` -> `useStore.ts`, `persistence.js` -> `persistence.ts`).
   - Convert `frontend/src/lib/` utilities, math, formatters, and coach core.
   - Convert `exercise-*`, `instr/`, and `seasonal/` data modules.
   - Validate with `tsc -b --noEmit` and run module tests.

2. **Phase 2: Components, Views, and Application Shell**
   - Convert `frontend/src/components/` (`.jsx` -> `.tsx`, `.js` -> `.ts`).
   - Convert `frontend/src/views/` (`.jsx` -> `.tsx`).
   - Convert `frontend/src/App.jsx`, `frontend/src/sheets.jsx`, and `frontend/src/main.jsx` to `.tsx`.
   - Update `frontend/index.html` to reference `src/main.tsx`.
   - Validate with `tsc -b --noEmit`.

3. **Phase 3: Test Suites & Final Verification**
   - Convert `frontend/src/**/*.test.js` to `.test.ts`.
   - Convert `frontend/src/**/*.test.jsx` to `.test.tsx`.
   - Convert root test helpers (`test-setup.js` -> `test-setup.ts`).
   - Run full Vitest suite (`npm test`) and TypeScript check (`npm run typecheck`).
