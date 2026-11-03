# Tasks

## 1. Deactivate iOS Workflow Automatic Triggers

- [x] 1.1 In `.github/workflows/ios.yml`, comment out or remove `pull_request` and `push` triggers, keeping only `workflow_dispatch`, and verify that the YAML file syntax is valid.

## 2. Streamline `test.yml` for Frontend Focus

- [x] 2.1 In `.github/workflows/test.yml`, update the `changes` filter job to omit unused outputs (`mcp`, `android`, `images`), verifying paths-filter configuration remains valid.
- [x] 2.2 In `.github/workflows/test.yml`, remove or disable the `android` job and verify that no gradle or mobile build steps are executed during CI.
- [x] 2.3 In `.github/workflows/test.yml`, remove or disable the `mcp` job and verify that no MCP tests are executed during CI.
- [x] 2.4 In `.github/workflows/test.yml`, remove or disable the `images` Docker container build job to eliminate container build overhead on pull requests.
- [x] 2.5 In `.github/workflows/test.yml`, update the `report` job's `needs` array to depend only on `frontend`, verifying that `node scripts/ci/test-report.mjs` generates the summary without requiring MCP artifacts.
- [x] 2.6 In `.github/workflows/test.yml`, update the `tests-ok` gate job's `needs` array to depend only on `[changes, frontend, catalogue]`, verifying that the aggregate status check succeeds when active frontend checks pass.

## 3. Workflow Validation

- [x] 3.1 Verify syntax and structure of `.github/workflows/test.yml` and `.github/workflows/ios.yml` using a YAML validation script or parser.
- [x] 3.2 Run frontend tests and build commands locally (`pnpm --filter opengym-frontend test` and `pnpm --filter opengym-frontend build`) to verify that all commands specified in the CI frontend job execute cleanly.

