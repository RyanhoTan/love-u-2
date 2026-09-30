# Phase 37 context — Retry uncertain partner text messages

## Observed baseline

- Both clients create a fresh `clientMessageId` inside every `sendTextMessage` call.
- Socket close converts `sending` rows to `failed`, but does not distinguish uncertain transport outcomes from explicit server rejection.
- The UI renders a failure label but offers no text retry action.
- Local cache normalizes `sending` to `failed`, but the stable row ID and text are retained.
- Phase 35 server logic already treats an identical retry as idempotent and rejects changed payloads.
- Failed messages created by explicit server errors must not become retryable; only local transport uncertainty is safe to retry.

## Scope rules

- Retrying an existing row must never call the new-message path or append a second optimistic row.
- Eligibility requires outgoing text, failed status, explicit retryable transport uncertainty, active relationship, and current `ready` socket.
- Reuse `message.id` as `clientMessageId`; do not regenerate or alter the text.
- Explicit server errors and audio messages remain non-retryable.
- A retried row is not duplicated in local state; its existing ID is the outgoing `clientMessageId`.

## Unresolved / deferred

- Audio retry needs a user-facing choice between retaining the uploaded `objectKey` locally and re-uploading the source recording; object orphan cleanup is also unresolved.
- Receiver acknowledgements and cross-process delivery remain unavailable without a protocol change.
- Local cache writes are asynchronous and are not a durable queue.
