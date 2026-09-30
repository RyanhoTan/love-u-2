# Phase 40 context — Acknowledge partner chat delivery

## Observed baseline

- Phase 34 persists `delivered_at` when `ws.send` accepts a message for an open recipient socket, and the Web/App UI labels that state “已送达”.
- A successful socket write does not prove the recipient runtime received or processed the frame.
- Pending replay likewise marks messages delivered immediately after send acceptance, so a dropped frame is not retried.
- `read` is an independent receiver event and currently also persists `delivered_at` and `read_at`.
- History status is based on `delivered_at`/`read_at`; an additive nullable `delivery_attempted_at` can preserve an honest pending-vs-offline distinction.

## Scope rules

- Only an authenticated recipient on the exact active relationship may acknowledge a server message ID.
- `delivered_at` follows client acknowledgement, not server socket acceptance. `delivery_attempted_at` records an accepted transport attempt without claiming receipt.
- Replays remain idempotent at the existing message row and clients already merge by server message ID.
- The receiver acknowledges when it processes a current-relationship message event, even when the chat view is not active; read status remains tied to the existing read event.
- New clients request protocol version 1 in the upgrade URL and send acknowledgements only after `ready.deliveryAckVersion === 1`; old servers remain compatible. New servers preserve old behavior for sockets that do not negotiate the capability.

## Unresolved / deferred

- The app may process an event and acknowledge before asynchronous local history persistence completes. Server history remains the recovery source.
- No cross-process pub/sub exists to deliver live sender receipts across server instances; the DB state remains authoritative.
- During the rolling upgrade window, legacy sockets deliberately retain the prior transport-acceptance meaning of sent/delivered.
- Network/device/database integration is unavailable; tests will cover pure state/schema behavior and static authorization review only.

## Implemented behavior

- New clients include `deliveryAck=1` and require `deliveryAckVersion: 1` in `ready` before sending receipt events. Old clients omit the capability and retain the prior transport-acceptance fallback; old servers omit the version and therefore receive no new event from updated clients.
- The server marks `delivery_attempted_at` after a message is accepted by a negotiated recipient socket. Only a scoped client receipt sets `delivered_at`; read receipts continue to set delivered/read timestamps.
- A receipt is scoped to the authenticated socket user as receiver, its partner as sender, the socket's relationship ID, and a currently bound relationship with those same members.
- Pending replay stays eligible until `delivered_at` is persisted. History reports unconfirmed attempts as `sending`; unattempted messages as `partner_offline`.
- No database migration, paired-client flow, dropped-frame recovery, or cross-process live sender notification was exercised.
