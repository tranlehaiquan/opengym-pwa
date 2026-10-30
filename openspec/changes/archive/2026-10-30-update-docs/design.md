# Design

## Context

The core documentation set in `docs/` explains the architectural model, hosting options, and optional features (like the AI Coach) to developers and end users. Recent updates enabled standalone offline execution on the web via IndexedDB, client-side LLM calls directly from browsers, standard i18next translation resources, and Turborepo workspace orchestration.

## Goals / Non-Goals

**Goals:**
- Update `docs/AI_COACH.md` to document browser/client-side LLM requests, client storage of API keys, and privacy consent alongside mobile and server options.
- Update `docs/ARCHITECTURE.md` to incorporate the standalone offline PWA mode, IndexedDB persistence, client-to-AI connections, TypeScript, and Turborepo.
- Update `docs/FAQ.md` to include standalone offline PWA as an option alongside Docker self-hosting and phone apps.
- Verify `docs/README.md` index links and summaries.

**Non-Goals:**
- Modifying production runtime logic, tests, or Docker configs.
- Re-architecting unrelated guides (`SELF_HOSTING_*.md`, `APP_STORES.md`, etc.).

## Decisions

- **Decision 1: Generalizing BYOK in `docs/AI_COACH.md`**:
  - *Choice*: Rename section "On the phone" to "On the phone and web (Bring Your Own Key)" and explain how client-side API keys, model picker, and direct fetch work on web and standalone PWA without backend proxies.
  - *Rationale*: Prevents user confusion about whether BYOK is available only on iOS/Android native apps.

- **Decision 2: Updating Architecture Diagram & Repo Map in `docs/ARCHITECTURE.md`**:
  - *Choice*: Add `B -.client Coach.-> AI` to the mermaid flowchart and update the repository map for `frontend/src/` (TypeScript, Vite, i18next JSON dictionaries) and Turborepo.
  - *Rationale*: Keeps developer onboarding accurate and aligned with the codebase.

- **Decision 3: FAQ Alignment in `docs/FAQ.md`**:
  - *Choice*: Add a clear bullet for "Standalone web / offline PWA" under "Do I need my own server?", and mention browser client-side execution in "Does the app itself use AI?".
  - *Rationale*: Directly answers the most common newcomer questions.

## Risks / Trade-offs

- **[Risk] Markdown or Mermaid syntax breakages** → *Mitigation*: Preview and validate diagram nodes and markdown anchors to prevent syntax or rendering issues.

