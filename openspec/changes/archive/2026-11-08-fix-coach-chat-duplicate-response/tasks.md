# Tasks

## 1. Proposal Resolution & State Handling

- [x] 1.1 Update `DebriefCard.done` in `frontend/src/views/CoachChat.jsx` to be `async` and `await resolvePending({ accepted: ['debrief'] })` before calling `refresh()`, verifying it dismisses properly.
- [x] 1.2 Update `PlanCard.accept` and `PlanCard.discard` in `frontend/src/views/CoachChat.jsx` to await `resolvePending(...)` before calling `refresh()`.
- [x] 1.3 Update `ReviewCard.apply` and `ReviewCard.discard` in `frontend/src/views/CoachChat.jsx` to await `resolvePending(...)` before calling `refresh()`.
- [x] 1.4 Add optimistic local pending state clearing in `CoachChat.jsx` so resolved proposal cards unmount instantly without waiting for storage I/O.
- [x] 1.5 Ensure `localResolve` in `frontend/src/lib/coach-local.js` drops stale or resolved `pending.prev` references to prevent accidental proposal resurrection.

## 2. Testing & Verification

- [x] 2.1 Add test in `frontend/src/views/CoachChat.test.jsx` verifying that clicking "Got it" on a debrief proposal dismisses the card and does not leave a duplicate pending card alongside the recap message.
- [x] 2.2 Add test in `frontend/src/views/CoachChat.test.jsx` verifying that accepting or discarding a generated plan proposal clears the pending card cleanly.
- [x] 2.3 Run full test suite with `pnpm --filter opengym-frontend test` to verify no regressions across all AI Coach components and views.
