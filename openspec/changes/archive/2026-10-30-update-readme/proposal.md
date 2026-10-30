# Proposal

## Why

The `README.md` serves as the primary storefront and guide for openGym users, self-hosters, and contributors. Recent enhancements—including standalone 100% offline PWA execution, client-side LLM provider execution for the AI Coach, standard i18next localization with Vietnamese support, and Turborepo workspace tooling—are not fully reflected in the documentation. Updating the README ensures newcomers and existing users understand modern deployment modes and client capabilities.

## What Changes

- **Highlight Standalone Offline PWA Mode**: Document that openGym can run directly in the browser as a standalone offline PWA with client IndexedDB storage without requiring a Docker backend or server setup.
- **Update AI Coach Capabilities**: Clarify that the AI Coach can execute directly in the browser/client web runtime with user-supplied API keys (Gemini, Anthropic, OpenAI, custom endpoints) alongside the server and mobile options.
- **Update Localization Details**: Mention standard i18next localization engine with on-demand dictionary loading, and list Vietnamese ("Tiếng Việt") alongside the 20+ supported languages.
- **Modernize Development / Tooling Reference**: Note TypeScript migration and Turborepo monorepo task orchestration for contributors and local builders.

## Capabilities

### New Capabilities
<!-- None: Pure documentation change -->

### Modified Capabilities
<!-- None: Pure documentation change -->

## Impact

- **Documentation**: Updates `README.md` with accurate feature descriptions, quickstart options, and technical overview.
- **Specs & APIs**: No runtime code or API behavior is altered.

