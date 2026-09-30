# Phase 40 — Acknowledge partner chat delivery

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-CHAT-001 requires truthful sending, offline, delivered, and read states.
- Phase 34 intentionally defined `sent` as `ws.send` accepting bytes into an open server socket, not a receiver acknowledgement.
- `server/src/ws/partnerChat.ts` currently writes `delivered_at` after server-side send acceptance and notifies the sender immediately.
- `partner_chat_messages` already persists `delivered_at`; the current additive schema facility supports adding a nullable timestamp without rewriting existing rows.
- Web and App both receive message events and already send an independent read event when appropriate; delivery must be acknowledged even when the recipient is not actively viewing the chat.

## Objective

For clients that negotiate protocol version 1, report a message as delivered only after the authenticated recipient processes its WebSocket message and acknowledges that server message ID. Keep unconfirmed messages eligible for replay after reconnect while preserving old-client compatibility.

## Scope

- Add nullable `delivery_attempted_at` to partner chat messages so history distinguishes a client acknowledgement still pending from no delivery attempt/offline.
- Add strict WebSocket client acknowledgement payload `{ type: "delivered", messageId }`.
- Negotiate protocol support in the WebSocket URL and advertise it in the `ready` event; new clients send acknowledgements only when the server advertises the feature.
- Accept an acknowledgement only for a message addressed to the socket user in the socket's active relationship while the relationship remains bound and has the same two members.
- Set `delivered_at` only after that validation; return a sender delivery event to currently connected same-process sender sockets.
- After direct send or pending replay, persist an attempt timestamp and report `sending` until acknowledged. Do not mark pending replay rows delivered merely because `ws.send` accepted bytes.
- Have Web and App acknowledge each current-relationship message event; continue sending the existing read event independently.
- Update WebSocket OpenAPI schemas and generated types; update App's local server event types.
- Add no-database tests for accepted/rejected acknowledgement payload shapes and delivery state decisions.

## Non-goals

- No changes to read receipts, content persistence/idempotency, auth or relationship creation/unbind policy.
- No cross-process presence/pub-sub, push notifications, exactly-once delivery, or durable local outbox.
- No retry UI or schema changes to old messages beyond an additive nullable column.
- No live database, WebSocket server, browser, device, production credential, or external service access.

## Material decisions

- For negotiated version-1 clients, a message is `sent`/delivered only after the server receives a valid recipient acknowledgement; an open server-side socket alone means `sending`, not delivered. Legacy sockets keep the previous transport-acceptance behavior.
- `delivery_attempted_at IS NOT NULL AND delivered_at IS NULL` means `sending`; both timestamps null means `partner_offline`; `read_at` remains the strongest status. Existing `delivered_at` rows stay delivered.
- A valid `read` event continues to write both `delivered_at` and `read_at`, since reading necessarily proves receipt.
- The acknowledgement contains a server message ID only. The socket's authenticated user and current relationship provide the authorization scope; the server does not trust client-supplied sender or relationship IDs.
- New Web/App clients request acknowledgement support and require the server's `ready.deliveryAckVersion` before sending ACKs. This keeps a new client compatible with an older server.
- Sockets that do not negotiate the feature retain the previous transport-acceptance semantics. This prevents an older mobile client from replaying the same message on every reconnect while a store update is pending.
- Delivery acknowledgement is idempotent. Replayed messages may be acknowledged more than once without changing content or creating duplicate rows.
- The additive timestamp defaults to null for existing rows. Old server binaries ignore it; clients sending the new event require a server with this phase deployed first. Rollback does not require deleting data or dropping the column.

## Acceptance criteria

- For a negotiated version-1 recipient, accepting a message at the WebSocket layer without a client acknowledgement leaves `delivered_at` null and reports `sending` when the recipient socket was open.
- No open recipient socket reports `partner_offline`; a later accepted attempt reports `sending`.
- Only the exact current relationship recipient can acknowledge the message; other users, relationships, senders, or unbound relationships cannot advance delivery state.
- A valid acknowledgement writes/retains `delivered_at` and notifies same-process sender connections as `sent`; a duplicate acknowledgement is harmless.
- A message that is not acknowledged remains eligible for pending replay; a message that is already delivered is not replayed.
- History distinguishes `sending`, `partner_offline`, `sent`, and `read`; Web/App parse the expanded status and acknowledge live events only for the currently displayed relationship.
- New clients do not send acknowledgement events to older servers; older clients do not enter unacknowledged replay mode on the new server.
- Server test/lint/build, Web API generation/lint/build, App lint/typecheck, and `git diff --check` pass.
- No claim of paired-device, dropped-frame, cross-instance, or real DB verification is made.

## Verification plan

- Add deterministic server tests for valid/invalid acknowledgement schemas and the delivery status matrix.
- Run `pnpm --dir server test`, `pnpm --dir server lint`, `pnpm --dir server build`.
- Run `pnpm --dir web api`, then Web lint/build and App lint/direct TypeScript check.
- Review additive migration compatibility, acknowledgement SQL authorization predicates, send/replay/ack/read ordering, and OpenAPI generated diff.
- Run `git diff --check`; do not access live databases or WebSocket infrastructure.

## Results

- Added the nullable `delivery_attempted_at` schema field. The existing schema initializer adds it to existing tables without rewriting old rows; previous `delivered_at` values continue to represent delivered messages.
- Added strict, positive safe-integer acknowledgement payload validation and SQL updates that require the exact sender/receiver pair, relationship ID, and still-bound relationship. Duplicate acknowledgements are idempotent.
- New Web/App clients negotiate delivery acknowledgement version 1 and send a receipt only when the server advertises support. Server-side direct and replay sends remain `sending` until a valid receipt; unacknowledged messages remain replayable. Legacy clients without negotiation keep transport-acceptance behavior, and updated clients remain compatible with old servers that omit the capability field.
- History exposes `sending` separately from `partner_offline`; Web and App apply delivery receipts by client or server message ID without regressing `sent`/`read`, and Web now displays the pending state.
- Updated the WebSocket OpenAPI contract and generated types; clarified the chat implementation status in `PRD.md`.

## Verification results

- Passed: `pnpm --dir server test` (4 tests across invite and delivery suites).
- Passed: `pnpm --dir server lint` and `pnpm --dir server build`.
- Passed: `pnpm --dir web api`, `pnpm --dir web lint`, and `pnpm --dir web build`.
- Passed: `pnpm --dir app lint` and `pnpm --dir app exec tsc --noEmit`.
- Passed: OpenAPI JSON parse and `git diff --check`.
- Static security review confirmed acknowledgements cannot set delivery for another user, relationship, or unbound relationship. No real MySQL, WebSocket, browser, or device integration was run.

## Risks and limitations

- Sender delivery events are process-local because there is no cross-process presence/pub-sub service. The database timestamp is authoritative and a later history load reflects it, but a sender connected to a different process may not see the live receipt immediately.
- During rolling client upgrades, explicitly non-negotiated legacy sockets still use transport-acceptance semantics; strict receiver acknowledgement applies to clients that negotiate version 1.
- A client acknowledgement proves the recipient runtime processed the message event, not that a human saw it or that the message was durably stored on that device. `read_at` remains the separate user-visible read signal.
- No MySQL migration or real WebSocket/device integration is available in this environment.

## Handoff

Continue PRD-CHAT-001 review for audio restart recovery and cross-process delivery notification as separate work; preserve deferred relationship data-retention decisions.
