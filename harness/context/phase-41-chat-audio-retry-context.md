# Phase 41 context — Retry uncertain uploaded partner audio

## Observed baseline

- Phase 31 stores new voice media as a sender-owned private object key and refreshes its playback URL by persisted server message ID.
- Phase 35 compares audio object key and duration as part of same-ID message idempotency.
- Phase 37 permits same-ID text retry but excludes audio because clients did not retain the upload result for reuse.
- Web keeps an optimistic audio message while uploading; App uploads before calling the chat hook to add its optimistic row.
- Both clients currently clear `sending` on socket close, but audio rows are not retryable. Web local history omits blob URLs; App local history omits local file URIs.

## Scope rules

- Only retry an audio row whose upload succeeded, whose object key remains in current process memory, and whose original relationship is still active.
- Reuse the exact message ID, object key, and duration. Never re-upload a local recording as part of this retry.
- The object key is an opaque private locator, not a signed URL, but still must not be serialized into localStorage/AsyncStorage or a partner-facing/history payload.
- Do not expose retry for upload failures, explicit server errors, incoming messages, or after restart when no server row can restore the message.

## Unresolved / deferred

- Uploaded objects without a persisted message row can become orphans; cleanup and retention rules are not defined.
- There is no durable outbox. A process exit before server persistence can remove the in-memory key and retry affordance.
- Real R2, database idempotency races, and browser/native UI integration remain unavailable.

## Implemented behavior

- After successful upload, both clients attach the private key to the outgoing in-memory row and preserve its existing optional duration.
- Uncertain transport failures are retryable only while the exact key remains available and the same relationship has a ready socket. Retry reuses the row ID and does not append another message.
- Persisted delivery/history or an explicit server error clears the key. Local serializers also strip it, so restart retry is intentionally limited to messages recoverable from server history.
- Server idempotency compares the audio key and duration; changed payloads under an existing client ID are rejected.
