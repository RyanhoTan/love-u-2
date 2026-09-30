# Phase 41 — Retry uncertain uploaded partner audio

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-CHAT-001 requires retries not to create duplicate messages and truthful failure states.
- Phase 35 makes identical `(sender, clientMessageId, payload)` retries idempotent and rejects changed payloads.
- Phase 37 implemented explicit retry for uncertain text sends but deferred audio because the uploaded object key was not retained for retry.
- Web uploads audio before its first WebSocket send; App uploads before creating the optimistic message. Both currently fail without a same-session retry if the socket closes after upload.

## Objective

Allow Web and App users to retry an audio message after its private object upload succeeded but the WebSocket send result is uncertain, without re-uploading the file or creating a second message.

## Scope

- Keep the uploaded `audioObjectKey` and duration on the in-memory optimistic message until the server confirms persistence or reports an explicit error.
- Mark a sent audio message retryable only when its transport result is uncertain and its original object key is still available in memory.
- Retry the existing row using its unchanged local `clientMessageId`, exact object key, and original duration; do not append another optimistic message.
- Show an explicit retry control for eligible outgoing audio messages in Web and App, disabled until the current relationship socket is ready.
- Clear the object key after the server confirms a persisted message or emits an explicit error.
- Exclude object keys from localStorage/AsyncStorage serialization. Server history remains the recovery route for messages that were persisted before the process ended.
- Keep upload failures non-retryable in this path; they have no confirmed reusable uploaded object key.
- Record verification and limitations without claiming durable outbox, orphan cleanup, or device integration.

## Non-goals

- No automatic retry loop, audio re-upload, audio source-file persistence, or durable outbox.
- No object deletion, orphan cleanup, media retention policy, schema change, server API change, or new dependency.
- No retry after process restart when the server has no persisted message row; the key is intentionally not persisted locally.
- No changes to text retries, relationship ownership, or cross-process delivery notifications.

## Material decisions

- Retry applies only after upload success and uncertain WebSocket transport (socket loss or synchronous send failure). The same client ID and exact payload let existing server idempotency safely resolve whether the first send was committed.
- The private object key is retained only in runtime memory and is never placed in localStorage, AsyncStorage, chat history responses, or partner-facing events. The server continues to validate the authenticated sender's object-key ownership on each retry.
- A server delivery event or history row proves the message exists; the local object key is then unnecessary and is cleared. Explicit server errors remain non-retryable, matching Phase 37's treatment of deterministic server outcomes.
- If the app/page restarts before the server row is recovered, no retry is offered because the source key was deliberately not persisted. If the object uploaded but the server never saved a row, its orphan-cleanup policy remains unresolved.

## Acceptance criteria

- Web and App can retry an eligible failed audio message only when the current active relationship and ready socket match.
- Retry preserves the original message identity, audio key, and duration and never adds a second optimistic row.
- A socket close/send exception after a successful upload exposes a retry action; upload failure and explicit server errors do not.
- Server-confirmed delivery/history and persisted local history do not retain the object key; local cache inspection shows no private key serialization.
- Text retry behavior is unchanged; incoming audio cannot be retried by the receiver.
- Web lint/build, App lint/typecheck, and `git diff --check` pass.
- No claim of database idempotency integration, R2 cleanup, browser playback, or native-device behavior is made.

## Verification plan

- Static-review Web and App upload, socket-close, send-exception, explicit-error, retry, history-merge, and local-persistence paths.
- Confirm the server's existing audio idempotency comparison covers `audioObjectKey` and duration and retains sender/relationship scoping.
- Inspect local storage serializers to ensure the key is excluded.
- Run Web lint/build, App lint/typecheck, and `git diff --check`.
- Do not access a real object store, database, live WebSocket, browser session, or mobile device.

## Results

- Web and App keep the uploaded private object key and original optional duration on the in-memory outgoing message until server persistence is confirmed or explicitly rejected.
- A failed uncertain audio send can be retried only for the same active relationship and ready socket. It reuses the existing message ID, exact key, and duration without adding a second optimistic row or uploading the recording again.
- Socket-close and synchronous-send failures expose a retry action only when the key remains available. Upload failures and explicit server errors are not retryable.
- Delivery events, read receipts, and server-history merges clear the object key. Browser localStorage and App AsyncStorage serializers omit it; restored audio without a persisted server row has no retry affordance.
- Added a server unit test for identical audio payload idempotency and rejection of changed object keys or durations.

## Verification results

- Passed: `pnpm --dir server test` (5 tests), `pnpm --dir server lint`, and `pnpm --dir server build`.
- Passed: `pnpm --dir web lint`, `pnpm --dir web build`, `pnpm --dir app lint`, `pnpm --dir app exec tsc --noEmit`, and `git diff --check`.
- Static review confirmed the same-ID comparison includes audio object key and duration; the existing server write path validates sender ownership and active relationship before persistence.
- Web build emitted the existing Zod Rollup comment-position and >500 kB chunk warnings. No DB, R2, live WebSocket, browser, or device integration was run.

## Risks and limitations

- An upload that succeeds but never becomes a server message can leave an orphan object. Cleanup and retention are not defined.
- The object key is intentionally not persisted. If the process ends before server persistence, the retry affordance is lost; if the row was saved, server history recovers it.
- No durable outbox, automatic retry, re-upload workflow, or cross-process delivery notification was added.

## Handoff

Continue the PRD R1/P0 audit. Audio retry remains unavailable after restart when no server message row exists; object cleanup and cross-process delivery require separate work.
