# Proposal

## Why

While `README.md` was recently updated, supporting guides under `docs/`—specifically `docs/AI_COACH.md`, `docs/ARCHITECTURE.md`, and `docs/FAQ.md`—still portray the client AI Coach as phone-exclusive and do not describe the standalone offline PWA architecture or Turborepo / TypeScript tooling. Updating these documents ensures developer and self-hosting documentation accurately matches current capabilities.

## What Changes

- **Update `docs/AI_COACH.md`**: Expand the BYOK (Bring Your Own Key) section from phone-only to include web and standalone PWA environments, documenting client-side HTTP execution, credential security in browser storage, and data consent transparency.
- **Update `docs/ARCHITECTURE.md`**: Update architecture diagram notes and the repository map to reflect TypeScript usage, i18next JSON locales, Turborepo builds, standalone PWA IndexedDB state persistence, and direct client-to-LLM connections.
- **Update `docs/FAQ.md`**: Add the standalone offline PWA option to "Do I need my own server?" and clarify client-side LLM execution in "Does the app itself use AI?".
- **Audit Documentation Index (`docs/README.md`)**: Ensure summary tables and guide references remain consistent across all documents.

## Capabilities

### New Capabilities
<!-- None: Pure documentation change -->

### Modified Capabilities
<!-- None: Pure documentation change -->

## Impact

- **Documentation**: Updates `docs/AI_COACH.md`, `docs/ARCHITECTURE.md`, `docs/FAQ.md`, and `docs/README.md`.
- **Runtime Code & APIs**: No runtime code, database schemas, or APIs are modified.

