# Phase 35 context — Reject conflicting partner chat idempotency keys

## Observed baseline

- Schema has a unique key on `(sender_id, client_message_id)`; `client_message_id` is nullable for legacy clients.
- `saveMessage` locks the active relationship, inserts with `ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`, reloads by ID, and verifies relationship/sender/receiver.
- The loaded text/type/audio fields are not checked against the new request before the handler broadcasts the saved row to partner connections and acknowledges the request.
- Web and App optimistically render the request body and mark `clientMessageId` failed for any server error.

## Scope rules

- Preserve identical retries and the existing DB uniqueness contract.
- A conflicting duplicate must fail before direct fanout or a successful delivery response.
- Never include the persisted payload in conflict details.
- Keep backward-compatible behavior for requests with no client message ID.

## Unresolved / deferred

- Exact client ID generation lifecycle and retry persistence across app restarts remain separate concerns.
- Real MySQL/WebSocket concurrency and client presentation need integration verification unavailable here.

## Implemented behavior observed

- Saved content is compared to the normalized retry payload: text rows compare text/type; audio rows compare type, private object key or legacy URL, and duration (omitted duration normalizes to SQL `NULL`).
- A differing payload or a saved row under another relationship returns `client_message_id_conflict`; the handler does not send the saved row to partner sockets.
- An identical payload proceeds through the existing duplicate-key path and returns the same persisted row and status.
- Web/App map the conflict code to “消息标识冲突，请重新发送” and mark the optimistic item failed; the server response contains no old body or object key.
