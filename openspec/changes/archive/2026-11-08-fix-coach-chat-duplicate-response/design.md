# Design

## Context

In `CoachChat.jsx`, the conversation view renders two layers of AI Coach output:
1. Synced historical chat messages (`S.coach.chat`), mapped via `<Message />` (which renders text, intake questionnaire, or folded recap cards for applied plans and debriefs).
2. Ephemeral interactive proposal cards (`pending`), rendered below chat via `<PlanCard />`, `<DebriefCard />`, or `<ReviewCard />`.

When a user decides on a proposal (such as clicking "Got it" in `DebriefCard` or "Import this plan" in `PlanCard`), `resolvePending` is invoked without `await` immediately before `refresh()`. Because `resolvePending` involves asynchronous storage writes to `localStorage` (via `coach-device.js`), `refresh()` calls `coachStatus()` / `localStatus()` which reads device storage before the write finishes. The un-cleared proposal is returned to React state, keeping the interactive card mounted on screen alongside the newly appended recap message in `coach.chat`.

## Goals / Non-Goals

**Goals:**
- Eliminate the asynchronous race condition between `resolvePending` and `refresh()`.
- Ensure proposal action handlers (`accept`, `discard`, `done`, `apply`) wait for the persistent pending clearance before refreshing status.
- Ensure pending state in the UI is immediately dismissed upon user action to avoid visual dual-rendering.
- Ensure questions answered in the chat do not restore expired or already-resolved proposals from `pending.prev`.

**Non-Goals:**
- Modifying the underlying LLM schemas (`CREATE_SCHEMA`, `DEBRIEF_SCHEMA`, `ASK_SCHEMA`).
- Changing prompt construction or exercise library validation rules.
- Redesigning the layout of `PlanCard` or `DebriefCard`.

## Decisions

### 1. Await `resolvePending` before triggering `refresh()` in all proposal cards
- **Choice**: Mark the action handlers in `PlanCard` (`accept`, `discard`), `DebriefCard` (`done`), and `ReviewCard` (`apply`, `discard`) as `async`, and `await resolvePending(...)` before calling `refresh()`.
- **Rationale**: `resolvePending` persists `{ pending: null }` asynchronously in device storage. Awaiting this guarantee ensures that `localStatus()` called during `refresh()` will read `pending: null`.
- **Alternatives Considered**:
  - *Fire-and-forget without refresh*: Leaves `useCoachStatus` holding the old proposal until the next poll (which is on an idle 60-second timer).
  - *Optimistic local state override only*: If not awaited, a background `refresh()` could still fetch the stale storage data and overwrite the local state.

### 2. Optimistic dismissal on user click
- **Choice**: Pass an optimistic dismissal handler or clear local pending state immediately when the user clicks an action button.
- **Rationale**: Gives instantaneous feedback to the user and avoids any perceptible latency or layout shift while awaiting storage operations.

### 3. Clear `pending.prev` when a proposal is resolved
- **Choice**: Ensure `localResolve()` in `coach-local.js` drops `prev` if the underlying proposal has already been handled, preventing resurrection of old cards after conversational questions.

## Risks / Trade-offs

- **[Risk] Slower UI transition if storage/network is delayed**
  - *Mitigation*: Optimistically dismiss the proposal card in local component state while awaiting `resolvePending`.
- **[Risk] Error during resolve leaves card stuck**
  - *Mitigation*: Wrap `resolvePending` with `.catch()` handling and ensure `finally` calls `refresh()` to re-sync with actual storage state.
