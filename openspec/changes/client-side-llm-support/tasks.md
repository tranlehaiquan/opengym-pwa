# Tasks

## 1. AI SDK Dependency & Persistent Storage Setup

- [x] 1.1 Add `ai`, `@ai-sdk/google`, `@ai-sdk/openai`, and `@ai-sdk/anthropic` to `frontend/package.json` and verify dependencies install cleanly
- [x] 1.2 Update `frontend/src/lib/coach-secrets.js` to persist API keys to `localStorage` when Capacitor secure storage is absent, and verify with `frontend/src/lib/coach-secrets.test.js`
- [x] 1.3 Verify that stored API keys are never included in application backup state exports in `frontend/src/lib/state-json.js` and confirm with unit tests

## 2. Gating and Settings Access for Standalone Clients

- [x] 2.1 Update `coachAvailable` in `frontend/src/lib/coach.js` and `frontend/src/lib/use-coach-gate.js` to permit client BYOK on web and PWA targets, and verify with `frontend/src/lib/coach.test.js`
- [x] 2.2 Update `pageVisible` in `frontend/src/views/settings-pages.js` to show the AI Coach row in standalone web/PWA mode, and verify with `frontend/src/views/settings-pages.test.jsx`
- [x] 2.3 Remove the mobile-only redirect guard in `frontend/src/views/CoachSetup.jsx` and verify standalone PWA route access

## 3. AI SDK Provider Integration & Execution Bridge

- [x] 3.1 Implement an AI SDK adapter layer in `frontend/src/coach/core/` leveraging `createGoogleGenerativeAI`, `createOpenAI`, and `createAnthropic` with `nativeFetch` support
- [x] 3.2 Connect the AI SDK adapter layer into `frontend/src/lib/coach-local.js` for executing plan creation, review, and model listing
- [x] 3.3 Add connection testing and actionable error feedback in `frontend/src/views/CoachSetup.jsx` and verify with `frontend/src/views/CoachSetup.test.jsx`

## 4. Localization and Full Test Suite Verification

- [x] 4.1 Add or update client API key configuration strings in `frontend/src/locales/en.json` and `frontend/src/locales/vi.json`
- [ ] 4.2 Run all unit and component tests (`pnpm test`) across settings, coach, and local pipeline to confirm zero regressions
