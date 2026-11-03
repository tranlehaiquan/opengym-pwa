# Proposal

## Why

Current CI workflows execute heavy multi-platform pipelines across every change—including iOS simulator and device builds on macOS runners, Android Gradle compilations and JVM tests, Docker container builds, and MCP test suites. With ongoing development focused primarily on the frontend web application, these lengthy background checks create significant feedback latency, consume runner resources, and slow down development iteration.

Streamlining CI to focus on the frontend while disabling automatic execution for iOS, Android, and MCP tests will dramatically cut PR turnaround time while keeping manual triggers available when needed.

## What Changes

- **Disable Android CI Job**: Deactivate the `android` job in `.github/workflows/test.yml` (or guard behind manual dispatch) to avoid running Gradle builds and JVM tests during standard PR and push events.
- **Disable MCP CI Job**: Deactivate the `mcp` job in `.github/workflows/test.yml` so that MCP unit tests and node-loadable checks do not run on normal frontend workflows.
- **Disable iOS Workflow Triggers**: Restrict `.github/workflows/ios.yml` to manual invocation (`workflow_dispatch`), disabling automatic PR and push triggers that consume macOS runner minutes.
- **Update Status and Reporting Gates in `test.yml`**: Update the `tests-ok` aggregate gate job and `report` summary job to no longer depend on `android` or `mcp`, ensuring the final status check succeeds cleanly based on frontend results.
- **Speed Up Frontend Job Execution**: Ensure pnpm caching and paths-filtering in `.github/workflows/test.yml` run cleanly and quickly for frontend PRs without unnecessary intermediate dependencies.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
None.

## Impact

- Affected files: `.github/workflows/test.yml`, `.github/workflows/ios.yml`.
- APIs & Runtime: No runtime application code or public APIs are affected.
- CI/CD & Developer Experience: CI runtimes are cut from 20-30+ minutes down to 2-3 minutes; PR status checks unblock significantly faster.

