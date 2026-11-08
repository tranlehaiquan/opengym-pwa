# Proposal

## Why

Every pull request and push to `main` triggers `.github/workflows/test.yml`, which executes unit tests, component tests, test coverage collection, and production builds across the frontend workspace. Currently, test runs must install dependencies, compile and transform thousands of modules, and execute ~5,800 tests without persistent test or tool caching across CI runner invocations.

While `actions/setup-node` enables `cache: pnpm`, this only caches the global pnpm download store without caching:
1. Workspace `pnpm store` across dynamic runner paths.
2. Vitest / Vite transformed module cache (`frontend/node_modules/.vitest`, `frontend/node_modules/.vite`).
3. Turborepo cache (`.turbo`) generated during task execution.

Adding dedicated GitHub Actions caching (`actions/cache@v4`) for the test execution pipeline will dramatically speed up repeat CI runs, reduce redundant module transformations, and shorten PR turnaround times.

## What Changes

- **Add GitHub Actions Cache Step**:
  In `.github/workflows/test.yml` under the `frontend` job, integrate `actions/cache@v4` to cache:
  - The pnpm store directory (resolved dynamically via `pnpm store path`).
  - Vitest and Vite transform caches (`frontend/node_modules/.vitest`, `frontend/node_modules/.vite`).
  - Turborepo task cache (`.turbo`).
- **Define Robust Cache Keys & Fallbacks**:
  - Key based on runner OS, `pnpm-lock.yaml`, and commit/source hashes.
  - Provide fallback `restore-keys` so incremental pushes within a branch or PR restore existing transform caches rather than starting cold.
- **Workflow Optimization**:
  - Ensure cache save and restore do not block the pipeline on cache miss.
  - Keep workflow syntax lean and maintainable.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
None (`skip_specs: true` - CI infrastructure only, no functional changes to application specifications).

## Impact

- **Affected Files**: `.github/workflows/test.yml`.
- **CI Performance**: Substantially faster test job runs on subsequent commits and PR updates due to cached module transformations and package stores.
- **Runtime Application**: Zero impact on user-facing application code, dependencies, or runtime behavior.
