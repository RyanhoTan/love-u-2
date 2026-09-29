# Phase 34 context — Accurate partner chat delivery states

## Observed baseline

- `partner_chat_messages` stores nullable `delivered_at` and `read_at`.
- `sendJson` currently silently skips any socket not `OPEN` and returns no indication to callers.
- Direct send marks a message delivered when the partner connection array is non-empty, regardless of socket state, then always tells the sender `sent`.
- Offline pending replay loops through selected messages and calls `markMessagesDelivered` for every row even if the receiver socket closes before or during send.
- Both client message types include `sent` and `partner_offline`; history status is derived from database columns. App/Web UI currently display read/offline/failure but not sent.

## Scope rules

- Keep persisted offline messages available for later replay.
- `sent`/`delivered_at` represent successful handoff to an open relationship socket only; no application-level acknowledgement is claimed.
- Use persisted status on retries so idempotency does not downgrade a sent message.
- Preserve active relationship filtering on delivery writes.

## Unresolved / deferred

- True receiver-device acknowledgement, notification behavior, background delivery, and exactly-once transport remain future reliability work.
- Live DB/WebSocket/network conditions and paired-client UI validation are unavailable.

## Implemented behavior observed

- `sendJson` now returns false for non-open or synchronously failing sockets and true when `ws.send` accepts a payload on an open socket.
- Direct sends mark `delivered_at` only if at least one current-relationship recipient socket accepts the message; otherwise sender receives `partner_offline`, unless the idempotently loaded row was already delivered.
- Pending replay records only accepted message IDs for delivery updates, and then sends a `sent` delivery event to connected same-process sender sockets.
- Delivery updates require a still-bound relationship and exact sender/receiver pair. Web and App render `sent` as “已送达” while retaining offline/read/failed states.
- Database/WebSocket/device integration remains untested; an open-socket send does not prove the receiving UI rendered the message.
