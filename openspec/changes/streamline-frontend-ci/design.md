# Design

## Context

The CI setup consists primarily of `.github/workflows/test.yml` and `.github/workflows/ios.yml`.
Currently, every PR and push triggers:
- `.github/workflows/test.yml` with jobs: `changes`, `frontend`, `mcp`, `catalogue`, `images`, `android`, `report`, and `tests-ok`.
- `.github/workflows/ios.yml` on macOS runners with jobs: `gate`, `simulator`, `ui-tests`, and `device-archive`.

Because active development is focused on the web frontend, running Android builds (Java/Gradle/Capacitor), iOS builds (macOS runners), Docker image builds, and MCP test suites adds up to 30+ minutes of execution and queue latency per push, while failing to give fast feedback to frontend developers.

## Goals / Non-Goals

**Goals:**
- Focus standard CI on the web frontend (`frontend/` workspace).
- Disable automatic execution of iOS, Android, and MCP checks during PR and push events.
- Retain manual execution capabilities (`workflow_dispatch`) so mobile and MCP checks can still be triggered intentionally.
- Adjust aggregate reporting (`report`) and validation gates (`tests-ok`) in `test.yml` so they only depend on the active jobs.
- Reduce typical PR CI runtime down to ~2-3 minutes.

**Non-Goals:**
- Deleting mobile/MCP source code, native plugins, or Gradle/Xcode project files.
- Changing production release deployment workflows (`docker-publish.yml`, `pages.yml`).

## Decisions

### 1. Disable Automatic iOS CI in `.github/workflows/ios.yml`
- **Choice**: Remove or comment out `pull_request` and `push` triggers in `ios.yml`, retaining only `workflow_dispatch`.
- **Rationale**: macOS runners on GitHub Actions have limited concurrency and high queue times. Retaining `workflow_dispatch` allows manual testing of native iOS builds when changes explicitly target the iOS shell.
- **Alternative considered**: Keep path filters for `frontend/ios/**`. Rejected because changes to shared code or dependencies frequently trigger the gate and waste runner minutes when focusing on web.

### 2. Disable `android` and `mcp` Jobs in `.github/workflows/test.yml`
- **Choice**: Remove or comment out the `mcp` and `android` jobs from `test.yml`, and remove their corresponding output filters in the `changes` job.
- **Rationale**: The user explicitly requested disabling iOS, Android, and MCP tests to accelerate CI. Removing these jobs eliminates Java 21, Gradle daemon initialization, APK packaging, and MCP test runs from the critical path.
- **Alternative considered**: Using workflow feature flags or conditional job expressions (`if: false`). Commenting out or cleanly removing the job declarations keeps `test.yml` readable and avoids confusion in the GitHub Actions UI.

### 3. Streamline `images` Job
- **Choice**: Disable `images` job during pull requests (or remove from `test.yml`), relying on dedicated release workflows (`docker-publish.yml`) for container builds.
- **Rationale**: The `images` job takes up to 25 minutes building Docker containers on every PR, even when tests already pass. Removing it from routine test CI provides maximum speedup.

### 4. Update Aggregate Gate (`tests-ok`) and Summary Report (`report`)
- **Choice**:
  - Update `report`: change `needs: [frontend, mcp]` to `needs: [frontend]`.
  - Update `tests-ok`: change `needs: [changes, frontend, mcp, catalogue, images, android]` to `needs: [changes, frontend, catalogue]`.
- **Rationale**: If disabled jobs remain in `needs`, GitHub Actions will mark dependencies as skipped or missing, potentially blocking PR merge gates.

## Risks / Trade-offs

- **[Risk] Regressions in Android, iOS, or MCP codebases go unnoticed in standard PRs.**
  → *Mitigation*: These components can still be run locally (`pnpm test` in `mcp/`, `./gradlew test` in `frontend/android/`), and manual `workflow_dispatch` triggers remain available for mobile and CI audit runs.
- **[Risk] GitHub branch protection rules might expect `tests-ok` or individual job names.**
  → *Mitigation*: `tests-ok` remains the primary composite required check; only its internal `needs` array is updated to match the active jobs.

