# Phase 36 context — Isolate client chat state by relationship

## Observed baseline

- `createHistoryStorageKey(userId, relationshipId)` already isolates local storage by relationship and user.
- Web's synchronous cache read currently merges with all messages already in state when a new key appears.
- App's asynchronous `loadHistory` likewise merges cached rows with every current message.
- WS message payloads and REST history both include `relationshipId`; optimistic messages currently do not store it.
- App voice media upload happens before `sendAudioMessage` is invoked, so the screen must also verify the relationship did not change while upload was in flight.

## Scope rules

- Filtering is by exact relationship ID, not participant IDs or display name.
- Cached rows can be tagged using the relationship ID embedded in the storage key that was read.
- Active socket identity, current storage key, and current relationship are all checked before asynchronous or realtime results can mutate visible state.
- A confirmed unbind should clear the visible hook state while retaining the old relationship cache; this prevents the old room from remaining on screen during a later bind.
- Do not delete old keys or make any claim about historical access after unbind.

## Unresolved / deferred

- Old relation cache retention and in-app access after unbind requires the deferred product decision.
- Actual navigation, reconnection, and background/foreground races need device testing.
