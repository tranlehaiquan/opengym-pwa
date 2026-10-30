# Design

## Context

`README.md` is the central introductory document for the openGym repository. While recent commits and changes introduced Turborepo, TypeScript, standalone PWA offline storage, i18next dynamic localization with Vietnamese, and client-side LLM Coach execution, `README.md` still reflects older architecture and feature descriptions.

## Goals / Non-Goals

**Goals:**
- Update `README.md` sections (Introduction/Why openGym, Features, Optional extras, Architecture/How it works) to accurately describe all current capabilities.
- Preserve the existing concise, punchy writing style, badges, and layout of the README.
- Ensure all relative doc links, badges, and code blocks remain valid.

**Non-Goals:**
- Rewriting unrelated guides in `docs/` or deep technical documentation.
- Changing runtime source code or build configuration.

## Decisions

- **Decision 1: Standalone PWA Framing**:
  - *Choice*: Highlight standalone offline PWA mode alongside Docker self-hosting in the "Why openGym" and "Quick start" sections as a zero-setup, zero-backend option.
  - *Rationale*: Allows users who do not want to run Docker or backend servers to use openGym immediately in any modern browser.
  - *Alternatives considered*: Creating a separate section vs integrating into existing flow. Integrating into existing flow preserves clean structure without cluttering top-level headers.

- **Decision 2: AI Coach Client-Side Execution**:
  - *Choice*: Update the AI Coach feature bullet in `README.md` to note that it can run directly in the browser/client PWA using local API keys, in addition to server-side and phone options.
  - *Rationale*: Client-side LLM calls are a key privacy-preserving, zero-backend feature that simplifies setup.

- **Decision 3: i18next and Localization Details**:
  - *Choice*: Update the localization bullet under "Accounts and data" to mention 21+ languages, specifically noting Vietnamese ("Tiếng Việt"), lazy dictionary loading, and the i18next engine.
  - *Rationale*: Highlights active internationalization support and performance optimizations.

- **Decision 4: Architecture & Tooling Updates**:
  - *Choice*: Mention Turborepo monorepo management and TypeScript in the "How it works" / development sections.
  - *Rationale*: Helps contributors understand modern build scripts (`turbo build`, `npm run dev`) and language standards.

## Risks / Trade-offs

- **[Risk] Cluttering the clean README format** → *Mitigation*: Keep additions tight, using the same sentence rhythm and formatting conventions as the existing text.

