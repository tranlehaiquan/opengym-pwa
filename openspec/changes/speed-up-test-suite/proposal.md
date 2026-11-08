# Proposal

## Why

Every push and pull request triggers `.github/workflows/test.yml`, where the `frontend` test job executes ~477 test suites and over 6,000 tests. Currently, running all 477 suites sequentially on a 2-vCPU GitHub Actions runner takes 70–90 seconds of wall-clock time, creating latency in developer feedback and PR turnaround.

Investigation identified key bottlenecks:
1. All 477 test suites run on a single runner without workload sharding.
2. `check-bundle-syntax.test.mjs` triggers a redundant full production `vite build` (~4s) inside Vitest right before CI runs `pnpm run build` a second time.
3. V8 coverage collection instruments non-code assets (20+ locale JSON files and CSS), more than doubling execution overhead.
4. Heavy integration loops like `fatigue-monotonic-probe.mjs` (108,000 calculations) and `search-count.test.jsx` (mounting 1,000+ exercises on each keystroke) needlessly inflate suite runtime.

## What Changes

- **Shard Frontend Tests in CI**:
  In `.github/workflows/test.yml`, introduce a 2-runner matrix (`matrix: { shard: ['1/2', '2/2'] }`) running `vitest run --shard=${{ matrix.shard }}` in parallel. Update artifact upload and the `report` summary job to combine shard stats and JUnit results seamlessly using `scripts/ci/test-report.mjs --combine`.
- **Decouple Bundle Syntax Check Build**:
  Remove the child-process production `vite build` from `frontend/scripts/check-bundle-syntax.test.mjs`. Keep unit tests for `regexFeatures` and `unsupportedSyntax` in Vitest, and run `node scripts/check-bundle-syntax.mjs dist` as a lightweight CI step immediately following `pnpm run build` against the already-built `dist/` directory.
- **Narrow Coverage Scope**:
  Update `--coverage.include` in CI to target source code files (`src/**/*.{js,jsx,ts,tsx}`), excluding locale JSON dictionaries and CSS files from V8 instrumentation and sourcemap overhead.
- **Calibrate Probe & Heavy Test Fixtures**:
  - In `frontend/scripts/fatigue-monotonic-probe.mjs`, support a configurable hour-step interval (e.g., stepping every 3 hours across the 45-day window for standard CI runs), reducing evaluations from 108,000 to 36,000 while retaining full monotonicity assertions.
  - In `frontend/src/search-count.test.jsx`, optimize repeated component mounting to avoid re-evaluating the full 1,000+ exercise database across every test case.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
None (`skip_specs: true` - internal test infrastructure and CI workflow optimization).

## Impact

- **Affected Files**:
  - `.github/workflows/test.yml`
  - `frontend/scripts/check-bundle-syntax.test.mjs`
  - `frontend/scripts/fatigue-monotonic-probe.mjs`
  - `frontend/src/search-count.test.jsx`
- **CI Performance**:
  - Wall-clock test step runtime drops from ~70–90s down to ~35–45s (~50% reduction).
  - Eliminates 4–5s of redundant build time in Vitest.
- **Application & Runtime**: Zero impact on user-facing code, runtime behavior, or production bundle output.
