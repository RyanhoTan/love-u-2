# Phase 37 — Retry uncertain partner text messages

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-CHAT-001 requires retries not to create duplicate messages and client statuses to reflect failure honestly.
- Phase 35 guarantees that identical `(sender, clientMessageId, payload)` retries reuse the original row and rejects conflicting payloads.
- Phase 36 scopes retries to the active relationship and persists relationship-tagged client history.
- Current Web/App hooks create new client IDs for sends and expose no retry action for failed text rows.

## Objective

Let a user explicitly retry a text message whose outcome is uncertain after a socket/send interruption, reusing the original message ID and exact text so a server-accepted first attempt cannot become a duplicate.

## Scope

- Add retryability to client text-message state and restore it for locally persisted `sending` text rows, which become uncertain after process restart.
- Allow retry only for a failed outgoing text row marked retryable and belonging to the active relationship.
- Reuse the existing local/client ID and exact stored text in the retried WebSocket payload.
- Add a visible retry action to failed retryable text rows in Web and App; disable it until the current connection is relationship-ready.
- Keep explicit server errors (including idempotency conflicts) non-retryable.

## Non-goals

- No automatic resend loop or infinite retries.
- No audio retry or re-upload changes. Web and App differ in upload timing, and a safe audio retry needs an explicit object-key/payload retention decision.
- No schema/API changes, new database tables, new dependencies, or changes to server idempotency semantics.
- No claim of durable outbox semantics if local persistence did not finish before process termination.

## Material decisions

- Retry is user-triggered and limited to the current relationship and ready socket.
- A retry preserves the original client message ID and exact normalized text. The existing server idempotency key handles the ambiguous case where the first frame was committed but its acknowledgement was lost.
- Mark only local transport uncertainty as retryable. A deterministic server validation/conflict response remains failed but is not offered again.
- A persisted `sending` text row normalizes to `failed + retryable` because the client cannot know whether the old process's send reached the server.
- A persisted `sending` audio row remains non-retryable in this phase; the UI does not show audio retry controls.

## Acceptance criteria

- An uncertain failed outgoing text message shows a retry action in both clients; action is unavailable while the socket is not ready.
- Retrying sends the same `clientMessageId` and exact stored text, without appending another optimistic message.
- If the first attempt was saved, the server returns/replays the same row; if not saved, the same key can create the row once.
- Explicit server errors, especially `client_message_id_conflict`, do not expose the retry action.
- After local restore, an interrupted pending text can be retried with the original ID when its cache row exists.
- Audio messages do not receive a misleading text-retry action.
- Web lint/build, App lint/typecheck, and `git diff --check` pass.

## Verification plan

- Static-review both clients' initial-send, socket-close, explicit-error, persistence-normalization, and retry paths.
- Exercise the retry payload construction/eligibility logic with a small pure helper or matrix if an isolated seam exists; otherwise record the exact static review performed.
- Run `pnpm --dir web lint`, `pnpm --dir web build`, `pnpm --dir app lint`, `pnpm --dir app exec tsc --noEmit`, and `git diff --check`.
- Do not claim real MySQL idempotency, WebSocket delivery, or browser/native UI behavior without integration access.

## Results

- Both clients mark text as retryable only when the local send outcome is uncertain (socket not open at send time, synchronous send failure, or pending send interrupted by socket close). A `sending` text restored from local cache becomes `failed + retryable`.
- Server-originated errors explicitly clear retryability, including `client_message_id_conflict`; server history/delivery state also clears it.
- A retry requires a self-authored text row with failed/retryable state, exact active `relationshipId`, and ready/open socket. It changes that row back to sending and sends the original text with `clientMessageId` equal to the existing row ID. It does not create another optimistic row.
- Web/App show an accessible “重试” action only for failed retryable text. App does not offer retry for audio; Web upload failures likewise remain non-retryable.

## Verification results

- Passed: `pnpm --dir web lint`
- Passed: `pnpm --dir web build` (existing Rollup dependency-annotation and >500 kB chunk warnings remain)
- Passed: `pnpm --dir app lint`
- Passed: `pnpm --dir app exec tsc --noEmit` (`app/package.json` has no `typecheck` script)
- Passed: `git diff --check`
- Static review verified same-row/same-ID retry payload construction, retry eligibility, explicit-error suppression, cache restoration behavior, and audio exclusion. No isolated retry helper/test harness exists.

## Risks and limitations

- The user may retry a message whose first delivery reached the partner but whose sender acknowledgement was lost; this is intentional and safe only because the retry reuses exactly the same client ID and payload.
- Local cache persistence is asynchronous; a force-stop before the cache write may lose the retry affordance. Server history can still restore a saved message, but there is no durable outbox guarantee.
- Audio retry, including uploaded-but-unsent private object handling, remains an explicit follow-up.

## Handoff

Complete explicit same-ID retry for uncertain text only. Continue audio recovery and end-to-end receiver acknowledgements as separate PRD-CHAT-001 stages.
