# Tasks

## 1. Test Sharding in GitHub Actions

- [x] 1.1 In `.github/workflows/test.yml`, configure a 2-runner matrix strategy (`matrix: { shard: ['1/2', '2/2'] }`) on the `frontend` job with `fail-fast: false`.
- [x] 1.2 In `.github/workflows/test.yml`, append `--shard=${{ matrix.shard }}` to the `pnpm exec vitest run` command.
- [x] 1.3 In `.github/workflows/test.yml`, update the `stats-frontend` artifact upload step to use a shard-indexed artifact name (`stats-frontend-shard-${{ strategy.job-index }}`) to prevent artifact collision.
- [x] 1.4 In `.github/workflows/test.yml`, ensure the `report` and `tests-ok` jobs depend on the matrix job and combine shard statistics through `scripts/ci/test-report.mjs --combine`.

## 2. Decouple Bundle Syntax Check Build

- [x] 2.1 In `frontend/scripts/check-bundle-syntax.test.mjs`, remove the temporary-directory production `vite build` test while keeping AST parsing and regex syntax unit tests.
- [x] 2.2 In `.github/workflows/test.yml`, add a step `Check bundle syntax` immediately following `pnpm run build` that executes `node scripts/check-bundle-syntax.mjs dist`.

## 3. Scope V8 Coverage Collection

- [x] 3.1 In `.github/workflows/test.yml`, update the Vitest command's `--coverage.include` parameter to `'src/**/*.{js,jsx,ts,tsx}'`, excluding translation JSON files and stylesheets from instrumentation.

## 4. Optimize Heavy Probes & Fixtures

- [x] 4.1 In `frontend/scripts/fatigue-monotonic-probe.mjs`, introduce a configurable step interval (defaulting to 3 hours) across the 45-day window to cut evaluations from 108,000 to 36,000.
- [x] 4.2 In `frontend/src/search-count.test.jsx`, optimize component mounting and exercise catalogue queries to reduce test execution duration.

## 5. Verification & Workflow Validation

- [x] 5.1 Run frontend unit tests and verify all test suites pass cleanly.
- [x] 5.2 Validate YAML syntax and job structure of `.github/workflows/test.yml`.
- [x] 5.3 Test `scripts/ci/test-report.mjs --combine` with multi-shard test outputs to verify accurate report generation.
