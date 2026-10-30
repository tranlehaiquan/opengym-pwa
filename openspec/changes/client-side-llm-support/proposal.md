# Proposal

## Why

openGym includes an AI Coach capability, but standalone PWA and web users cannot currently use it without a paired self-hosted backend. The client-side "Bring Your Own Key" (BYOK) execution pipeline is currently restricted to native mobile builds (`VITE_MOBILE=1`), and in web environments API keys are stored in a non-persistent memory map that resets upon reload. As openGym operates as a standalone offline PWA, users should be able to configure LLM providers (Google Gemini, OpenAI, Anthropic, or local OpenAI-compatible endpoints like Ollama), persist their API keys securely in the client, and interact with the AI Coach directly from their browser or PWA using the unified **AI SDK**.

## What Changes

- **AI SDK Integration**: Adopt the unified **AI SDK** (`ai` with `@ai-sdk/google`, `@ai-sdk/openai`, and `@ai-sdk/anthropic`) for consistent, standardized prompt execution, structured output handling, and provider abstractions across client platforms.
- **Client-Side LLM Configuration**: Expose AI Coach setup in the client settings for standalone PWA and web environments, allowing users to select an LLM provider, enter their API key, specify custom base URLs (for local/LAN models), and choose models.
- **Persistent Client-Side Key Storage**: Implement persistent, isolated client-side storage for the user's API key (in browser `localStorage`) that persists across sessions and app reloads, without ever syncing to a server or exporting into plain backup files.
- **Client Pipeline & Gate Unlocking**: Update Coach availability rules and gate hooks (`coachAvailable`, `useCoachGate`, `pageVisible`, and route guards) so standalone/browser users can access `/coach/setup`, `/coach`, and `/coach/intake` in BYOK mode.
- **Direct Client Calling with Custom Fetch Support**: Leverage the AI SDK's custom `fetch` parameter (via `nativeFetch`) so requests execute directly via standard browser `fetch` in web/PWA and native HTTP on mobile.
- **Data Privacy & Consent Controls**: Present data consent disclosures before communicating with remote LLM endpoints, detailing what training and plan data is sent.

## Capabilities

### New Capabilities
- `client-ai-coach`: Configures and executes LLM-driven AI Coach workflows directly in the client using the AI SDK and user-provided API credentials stored locally on the client device.

### Modified Capabilities
- `standalone-app-shell`: Exposes the AI Coach setup and management entry point within the standalone settings view.

## Impact

- **Dependencies**: Add `ai`, `@ai-sdk/google`, `@ai-sdk/openai`, `@ai-sdk/anthropic` to `frontend/package.json`.
- **Frontend Core & Libs**:
  - `frontend/src/coach/core/adapters/`: Implement or bridge provider adapters using the AI SDK provider factories with custom fetch support.
  - `frontend/src/lib/coach-secrets.js`: Add persistent client storage fallback for non-Capacitor web/PWA clients.
  - `frontend/src/lib/coach.js` and `frontend/src/lib/use-coach-gate.js`: Allow client BYOK mode when not on native mobile.
  - `frontend/src/lib/coach-local.js`: Execute pipelines via the AI SDK adapter layer.
  - `frontend/src/views/settings-pages.js` and `frontend/src/views/Settings.jsx`: Make the AI Coach page visible in standalone web/PWA.
  - `frontend/src/views/CoachSetup.jsx`: Remove mobile-only redirection and allow browser/PWA setup flows.
- **Security & Storage**: Client keys are stored strictly in client device storage, isolated from routine application backups and remote sync payloads.
