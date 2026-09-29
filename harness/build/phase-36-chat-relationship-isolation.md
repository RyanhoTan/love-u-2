# Phase 36 — Isolate client chat state by relationship

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-CHAT-001 requires relationship rooms/history not to cross-contaminate.
- Web and App local-storage keys already include both relationship ID and user ID.
- On WebSocket `ready` for a different key, both hooks currently merge the new key's cache with the entire current in-memory list; previous-room messages can therefore remain visible.
- Phase 32 revokes stale sockets and Phase 33 server history is scoped to the current relationship, but neither can remove stale messages already in a hook's React state.

## Objective

Ensure each rendered chat message and each local/server merge is scoped to the exact relationship that produced it, especially when the same component survives an unbind/rebind or relationship switch.

## Material decisions

- Add optional relationship identity to client messages for backward-compatible normalization of existing cached records.
- Tag cache rows at load time using their already relationship-scoped storage key; tag HTTP/WS payload rows from their explicit relationship ID; tag optimistic messages with the currently known relationship ID.
- When a new relationship key loads, preserve only in-memory rows tagged with that exact ID and merge them with that key's local cache. Never mix the prior key's rows into the new state.
- Preserve each relationship's existing local cache; do not delete old rows or redefine post-unbind retention/ownership policy.
- No DB/API changes and no history export.

## Acceptance criteria

- Switching from relationship A to B replaces A's in-memory message list with B's cache/history/realtime messages; A's messages never appear in B's room.
- Reconnecting to the same relationship continues to merge local history and in-flight/realtime events without loss or duplication.
- Existing cached messages without an explicit relationship field are tagged from the storage key when loaded.
- Messages from a stale relationship ID received or mapped after switching are excluded from the current displayed list.
- Web lint/build, App lint/typecheck, and `git diff --check` pass.

## Verification plan

- Review ready-handler state transitions, local key construction, REST history mapping, WS mapping, and optimistic send construction in both clients.
- Exercise a small relationship-filter matrix if a pure helper seam is available; otherwise document static review.
- Do not claim device-level visual behavior without browser/native integration.

## Results

- Web and App messages now carry an optional `relationshipId`; rows restored from their relationship-scoped local key are tagged at load time, preserving compatibility with old cache records that lack the field.
- Ready transitions merge only cache/current rows for the newly active relationship. REST history responses are rejected when their key is stale and merge only matching relationship rows; stale failures/finalizers cannot mutate the new relationship's loading/error state.
- Realtime messages/read receipts are checked against the active relationship. Delivery/error updates and local persistence affect only matching rows. Events from replaced WebSocket instances are ignored.
- Sending is enabled only after the current socket's `ready` handshake. Web audio upload captures its originating relationship and is discarded if that relationship changes before upload completes; App voice upload checks the active relationship before sending.
- A server-confirmed unbind clears visible in-memory messages and resets pagination/history refs; the old relationship's local cache is retained untouched. Relationship changes reset loading state without deleting previous relationship caches.

## Verification results

- Passed: `pnpm --dir web lint`
- Passed: `pnpm --dir web build` (existing non-blocking dependency annotation and >500 kB chunk warnings remain)
- Passed: `pnpm --dir app lint`
- Passed: `pnpm --dir app exec tsc --noEmit` (`app/package.json` has no `typecheck` script)
- Passed: `git diff --check`
- Static review covered A→B cache/state replacement, same-key reconnect merging, legacy untagged cache rows, stale HTTP results, stale socket events, and in-flight audio upload relationship changes. No pure helper seam exists for a standalone matrix test.

## Risks and limitations

- Old relationship history remains stored locally and may remain accessible under its own storage key; retention/export/visibility after unbind is unresolved product policy.
- WebSocket and device timing races require live integration tests, unavailable in this workspace.

## Handoff

Complete client-side relationship state isolation only. Continue sender retry reliability as a separate PRD-CHAT-001 step.
