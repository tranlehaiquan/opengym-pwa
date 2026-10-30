# Design

## Context

openGym provides an offline-capable architecture for workout tracking. While it contains a client-side AI Coach engine (`frontend/src/coach/core/` and `frontend/src/lib/coach-local.js`), the "Bring Your Own Key" (BYOK) execution flow has been restricted exclusively to Capacitor mobile builds (`VITE_MOBILE=1`). In web and standalone PWA environments, the AI Coach settings page is hidden, the setup route redirects to settings, and API keys are stored in an in-memory Map that is lost on every page reload.

By adopting the unified **AI SDK** (`ai`) alongside persistent client-side key storage, openGym standardizes all provider communication (Google Gemini, OpenAI, Anthropic, and local OpenAI-compatible endpoints) across browsers, PWAs, and mobile apps.

## Goals / Non-Goals

**Goals:**
- Integrate the unified **AI SDK** (`ai`, `@ai-sdk/google`, `@ai-sdk/openai`, `@ai-sdk/anthropic`) for client-side LLM provider execution.
- Enable AI Coach configuration in standalone PWA, browser, and mobile environments without requiring a backend server.
- Persist the user's API key securely in client storage (across browser reloads and restarts).
- Keep API credentials strictly isolated from workout export backups and sync payloads.
- Pass custom `fetch` (`nativeFetch`) to the AI SDK provider instances so requests use browser `fetch` in web/PWA and native HTTP on mobile.
- Support Anthropic, OpenAI, Google Gemini, and OpenAI-compatible endpoints (such as Ollama, LM Studio, and OpenRouter).

**Non-Goals:**
- Building a server-side proxy or relay for standalone clients (all requests remain client-to-provider).
- Storing third-party provider accounts or multi-user key management on the client.
- Redesigning workout validation rules or exercise catalogue data structures.

## Decisions

### 1. Unified LLM Orchestration via the AI SDK
- **Choice**: Use the **Vercel AI SDK** (`ai`) along with provider packages (`@ai-sdk/google`, `@ai-sdk/openai`, `@ai-sdk/anthropic`) for client execution.
- **Rationale**:
  - Provides a single, battle-tested API (`generateText` / `generateObject`) across all supported LLM providers.
  - Automatically handles provider-specific differences in parameter formats, JSON schema formatting, and error extraction.
  - Built-in support for passing custom `fetch: nativeFetch` to provider factories (`createGoogleGenerativeAI`, `createOpenAI`, `createAnthropic`), preserving openGym's mobile Capacitor HTTP bypass while running seamlessly with browser `window.fetch` in PWA.
- **Alternatives Considered**:
  - *Custom ad-hoc HTTP adapters*: Current approach; requires maintaining bespoke schema strictness fallback, header handling, and response parsing for each individual provider.
  - *Individual vendor SDKs (`@google/genai`, `openai`, `@anthropic-ai/sdk`)*: Incompatible interfaces, large combined bundle size, duplicate types.

### 2. Dynamic Provider Factory Instantiation
- When executing a client Coach task, the client dynamically instantiates the required AI SDK model using the user's stored API key and options:
  - **Google Gemini**: `createGoogleGenerativeAI({ apiKey, fetch: nativeFetch })(modelId)`
  - **OpenAI**: `createOpenAI({ apiKey, fetch: nativeFetch })(modelId)`
  - **Anthropic**: `createAnthropic({ apiKey, headers: { 'anthropic-dangerous-direct-browser-access': 'true' }, fetch: nativeFetch })(modelId)`
  - **OpenAI-Compatible (Ollama, LM Studio, etc.)**: `createOpenAI({ baseURL, apiKey: apiKey || 'dummy', fetch: nativeFetch })(modelId)`

### 3. Persistent Client-Side Key Storage in `coach-secrets.js`
- **Choice**: When `@aparajita/capacitor-secure-storage` is unavailable (on web/PWA browsers), use origin-isolated `localStorage` under `coach.apiKey` as the persistent fallback instead of an ephemeral in-memory map.
- **Rationale**: `localStorage` is origin-scoped and persists across restarts. openGym's backup export system serializes the application state `S` (`stateJson(S)`), so storing secrets in `localStorage['coach.apiKey']` guarantees that keys are never included in exported JSON backup files or sync merges.

### 4. Universal BYOK Availability across App Targets
- **Choice**: Update `coachAvailable` in `frontend/src/lib/coach.js` and `frontend/src/lib/use-coach-gate.js` to return `true` whenever `coachMode === 'byok'`, regardless of whether `MOBILE` is true or false.
- In `frontend/src/views/settings-pages.js`, update `pageVisible('coach', ctx)` so it returns `true` for standalone clients (when `!ctx.user` or `ctx.mobile` or client BYOK is active).
- In `frontend/src/views/CoachSetup.jsx`, remove the `if (!MOBILE) nav('/settings')` barrier.

### 5. Explicit Privacy Consent
- Retain the existing `AiConsentSection` and consent verification modal before any payload is dispatched to a third-party LLM provider, guaranteeing transparent user control over their data.

## Risks / Trade-offs

- **[Risk] Bundle size increase from AI SDK packages**
  - *Mitigation*: Dynamically import the AI SDK and provider packages only when the Coach is invoked or configured, ensuring users who don't use AI Coach never download the SDK code during initial page load.
- **[Risk] Browser CORS restrictions on certain endpoints**
  - *Mitigation*: The setup interface provides explicit guidance for local endpoints (such as `OLLAMA_ORIGINS="*"` for Ollama) and surfaces actionable errors if preflight requests fail.
- **[Risk] Direct browser access restrictions on Anthropic**
  - *Mitigation*: Pass `anthropic-dangerous-direct-browser-access: 'true'` via `createAnthropic({ headers })` so browser calls to Anthropic proceed smoothly.
