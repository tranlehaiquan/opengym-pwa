# Proposal

## Why

When users ask the AI Coach to review their last workout or generate a new workout plan from questionnaire answers, interactive proposal cards (`PlanCard`, `DebriefCard`, `ReviewCard`) are presented. When a user accepts or dismisses a proposal (e.g. clicking "Got it" or "Import this plan"), `resolvePending` is invoked without awaiting its asynchronous persistence before calling `refresh()`. As a result, the status polling re-reads the un-cleared proposal from device storage, re-populating `pending` state while simultaneously adding the accepted recap message to chat history. This causes duplicate responses (both the interactive proposal card and the chat recap entry) to be displayed on screen at the same time.

## What Changes

- **Synchronous and Awaited Proposal Resolution**: Make proposal action handlers (`accept`, `discard`, `done`) `async` in `PlanCard`, `DebriefCard`, and `ReviewCard`, and await `resolvePending(...)` before executing `refresh()`.
- **Optimistic Pending State Clearance**: Ensure local proposal state in `CoachChat` drops immediately upon user decision so the UI never displays the interactive card concurrently with its durable recap.
- **Robust Proposal State Rehydration**: Prevent resolved proposals from being resurrected via `pending.prev` during subsequent conversational question answers.
- **Unit and Interaction Tests**: Add automated test coverage verifying that resolving a debrief or generated plan does not result in dual rendering or duplicate chat entries.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `client-ai-coach`: Ensures proposal resolution (for workout debriefs, plans, and reviews) executes consistently and clears ephemeral pending proposal cards atomically without dual rendering against durable conversation history.

## Impact

- **Affected Code**: `frontend/src/views/CoachChat.jsx`, `frontend/src/lib/coach-local.js`, and associated test files (`frontend/src/views/CoachChat.test.jsx`).
- **Dependencies**: None.
- **APIs**: No external API changes; internal client resolution flow is made asynchronous and race-free.
