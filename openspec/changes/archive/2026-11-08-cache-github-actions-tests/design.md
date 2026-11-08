# Design

## Context

In `.github/workflows/test.yml`, the `frontend` job is the most resource-intensive job in CI. It currently runs:
1. `pnpm install --frozen-lockfile`
2. `pnpm exec vitest run --coverage ...` (~477 test suites, 5,800+ tests)
3. `pnpm run build`
4. Post-test audit and reporting scripts

While `actions/setup-node` specifies `cache: pnpm`, GitHub Actions does not preserve Vitest or Turborepo caches between runs. Each CI job transforms hundreds of TypeScript/JSX modules from scratch, adding unnecessary runner CPU time.

## Goals / Non-Goals

**Goals:**
- Implement GitHub Actions caching using `actions/cache@v4` in `.github/workflows/test.yml`.
- Cache pnpm store directory, Vitest/Vite transform caches, and `.turbo` cache.
- Structure cache keys to invalidate cleanly when dependencies change (`pnpm-lock.yaml`) while providing fallback restore keys for incremental commits.
- Cut test and build step durations on PR updates.

**Non-Goals:**
- Altering Vitest test coverage flags or disabling tests.
- Introducing external paid remote cache backends; relying on standard GitHub Actions cache storage.

## Decisions

### 1. Caching Targets
- **pnpm store**:
  Retrieve pnpm store path dynamically via:
  ```bash
  echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV
  ```
  Cache the store path so package downloads are restored across runners.
- **Vitest & Vite Cache**:
  Cache `frontend/node_modules/.vite` and `frontend/node_modules/.vitest`.
  Vitest stores compiled module graphs and cache metadata in these directories. Preserving them between runs drastically speeds up test runner startup and test file execution.
- **Turborepo Cache**:
  Cache `.turbo` directory at the repository root to leverage task output caching across runs.

### 2. Cache Key Strategy
- **Key Schema**:
  ```yaml
  key: ${{ runner.os }}-test-cache-${{ hashFiles('**/pnpm-lock.yaml') }}-${{ github.sha }}
  restore-keys: |
    ${{ runner.os }}-test-cache-${{ hashFiles('**/pnpm-lock.yaml') }}-
    ${{ runner.os }}-test-cache-
  ```
- **Rationale**:
  - The exact hash of `pnpm-lock.yaml` ensures that whenever dependencies change, a new cache tier is created.
  - Adding `${{ github.sha }}` to the primary key ensures that every new commit saves a fresh cache snapshot upon completion.
  - The `restore-keys` fallback ensures that even on a new commit with the same lockfile, the previous commit's module cache is restored.

### 3. Workflow Step Placement
- Place the cache setup immediately after `actions/setup-node` and before `pnpm install --frozen-lockfile`.
- This ensures pnpm can find the cached store during `install`, and Vitest finds the pre-compiled transform cache during `vitest run`.

## Risks / Trade-offs

- **[Risk] Corrupted cache causing unexpected test passes or failures.**
  - *Mitigation*: Vitest validates source file timestamps and contents against its cache metadata. If a source file is edited, Vitest re-executes and re-transforms it automatically. In addition, lockfile changes produce a completely new primary key.
- **[Risk] Cache storage quota exhaustion.**
  - *Mitigation*: GitHub Actions allows up to 10 GB per repository, with LRU eviction for caches unused for 7 days. The combined size of pnpm store, Vitest cache, and `.turbo` is under 250 MB, well within the limit.
