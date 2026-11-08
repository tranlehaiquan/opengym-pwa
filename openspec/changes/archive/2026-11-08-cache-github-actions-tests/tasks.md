# Tasks

## 1. Configure Caching in `test.yml`

- [x] 1.1 In `.github/workflows/test.yml`, add a step to resolve the dynamic pnpm store directory (`pnpm store path --silent`) into an environment variable.
- [x] 1.2 In `.github/workflows/test.yml`, add `actions/cache@v4` targeting the pnpm store, `frontend/node_modules/.vite`, `frontend/node_modules/.vitest`, and `.turbo`.
- [x] 1.3 Configure primary `key` with OS, lockfile hash, and commit SHA, along with fallback `restore-keys`.

## 2. Workflow Validation

- [x] 2.1 Verify YAML syntax of `.github/workflows/test.yml`.
- [x] 2.2 Verify that the `frontend` job execution flow (`pnpm install`, `vitest run`, `pnpm build`) aligns cleanly with the cache paths.
