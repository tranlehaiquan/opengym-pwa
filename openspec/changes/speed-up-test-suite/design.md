# Design

## Context

In `.github/workflows/test.yml`, the `frontend` test job is the primary gating check for pull requests and pushes to `main`. It currently runs:
1. `actions/setup-node` & `actions/cache@v4` (pnpm store, .vite, .vitest, .turbo)
2. `pnpm install --frozen-lockfile`
3. `pnpm exec vitest run --reporter=... --coverage ...` (~477 test suites, 6,000+ tests)
4. `pnpm run build`
5. Bundle size, locale checks, string checks, and `test:fatigue-probe`
6. `test-report.mjs` and `test-audit.mjs`

On GitHub Actions' standard 2-vCPU Ubuntu runners, running all 477 test files sequentially with full V8 coverage collection takes 70–90 seconds. In addition, `check-bundle-syntax.test.mjs` executes an auxiliary `vite build` within Vitest, and `fatigue-monotonic-probe.mjs` executes 108,000 calculations across 100 histories.

## Goals / Non-Goals

**Goals:**
- Cut CI test job wall-clock time from ~70–90s down to ~35–45s (~50% reduction).
- Implement 2-way native Vitest test sharding (`--shard=1/2`, `--shard=2/2`) via a GitHub Actions matrix.
- Decouple the bundle syntax check so it inspects the production build artifact `dist/` rather than rebuilding the bundle inside a unit test.
- Restrict V8 coverage collection to code files (`src/**/*.{js,jsx,ts,tsx}`), avoiding instrumentation of 20+ locale JSON files and stylesheets.
- Optimize runtime of heavy test probes (`fatigue-monotonic-probe.mjs`) and fixtures (`search-count.test.jsx`).
- Aggregate test statistics seamlessly using `scripts/ci/test-report.mjs --combine`.

**Non-Goals:**
- Switching Vitest's pool from `forks` to `threads` globally (since `src/lib/seasonal.test.js` relies on process-level `process.env.TZ` mutation for local time verification).
- Disabling tests or dropping coverage assertion reporting.
- Relying on paid remote execution services.

## Decisions

### 1. Two-Way Sharded Matrix in CI
Vitest natively supports test sharding via the `--shard=<index>/<count>` CLI option.
- **Workflow Matrix**:
  In `.github/workflows/test.yml`, add a strategy matrix to the `frontend` job:
  ```yaml
  strategy:
    fail-fast: false
    matrix:
      shard: ['1/2', '2/2']
  ```
- **Vitest Execution**:
  ```yaml
  pnpm exec vitest run \
    --shard=${{ matrix.shard }} \
    --reporter=default --reporter=json --outputFile.json=test-results.json \
    --reporter=junit --outputFile.junit=junit.xml \
    --coverage --coverage.provider=v8 --coverage.include='src/**/*.{js,jsx,ts,tsx}' \
    --coverage.reporter=json-summary --coverage.reporter=text-summary
  ```
- **Artifact Upload & Report Aggregation**:
  Each shard uploads its statistics with a distinct name:
  ```yaml
  - uses: actions/upload-artifact@...
    with:
      name: stats-frontend-shard-${{ strategy.job-index }}
      path: |
        stats/frontend.json
        frontend/junit.xml
  ```
  The existing `report` job downloads all `stats-*` artifacts and passes them to `node scripts/ci/test-report.mjs --combine "$@" --out combined.json`, which already merges per-suite results, test counts, and coverage totals into the unified summary.

### 2. Decouple Bundle Syntax Check Build
- Currently, `frontend/scripts/check-bundle-syntax.test.mjs` runs `vite build` into a temporary directory inside Vitest (~4s).
- Immediately following Vitest, the CI job executes `name: Web build (run: pnpm run build)`.
- **Change**:
  - Remove the temporary build invocation from `check-bundle-syntax.test.mjs`, retaining tests for AST parser methods (`regexFeatures`, `unsupportedSyntax`).
  - Add a dedicated CI step right after `Web build`:
    ```yaml
    - name: Web build
      run: pnpm run build
      working-directory: frontend
    - name: Verify bundle syntax compatibility
      run: node scripts/check-bundle-syntax.mjs dist
      working-directory: frontend
    ```
- **Benefit**: Inspects the exact production artifact shipped to users without duplicate compilation.

### 3. Target V8 Coverage to Code Files
- Currently, `--coverage.include='src/**'` instruments all static assets in `src/`, including 20+ locale translation JSON dictionaries and CSS files.
- Changing `--coverage.include` to `'src/**/*.{js,jsx,ts,tsx}'` eliminates V8 source map mapping for static dictionaries, speeding up coverage collection by ~20–30%.

### 4. Optimize Heavy Test Probes & Fixtures
- **`fatigue-monotonic-probe.mjs`**:
  Currently iterates 100 histories × 1,080 hours = 108,000 calculations (~3.9s).
  Introduce an adjustable hour step (e.g. `const STEP_HOURS = 3`).
  Testing hours 3, 6, 9... 1,080 cuts iterations to 36,000, bringing runtime to ~1.3s while still rigorously testing decay monotonicity over the entire 45-day window.
- **`search-count.test.jsx`**:
  Refactor exercise fixtures to verify search count behavior cleanly without repeatedly querying 1,000+ exercises across all assertions.

## Risks / Trade-offs

- **[Risk] Test Result Aggregation Drift Across Shards**
  - *Mitigation*: `scripts/ci/test-report.mjs` was specifically implemented with `--combine` to sum tests, detect broken suites, union coverage lines/branches, and combine slowest files across multiple runs.
- **[Risk] Uneven Shard Duration Distribution**
  - *Mitigation*: Vitest's internal sharding algorithm hashes test file paths to distribute test suites evenly across shards. Both shards contain ~238 test files.
- **[Risk] Monotonic Probe Precision Loss**
  - *Mitigation*: Stepping by 3 hours still exercises 36,000 points of decay across 100 randomized multi-session histories. The full 1-hour step remains available via environment flag or manual invocation.
