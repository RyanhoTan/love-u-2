# Phase 32 context — Revoke partner chat sockets after unbind

## Observed baseline

- `unbindCoupleSpace` starts a DB transaction, finds the current `bound` relationship, updates that exact row to `unbound`, commits, and returns success.
- `setupPartnerChat` accepts a socket only when `findActiveRelationshipByUserId` finds a bound relationship. It then stores socket/user/partner/relationship ids in a process-local map.
- After the handshake, inbound WS payloads currently use the captured relationship id without checking that the relationship row is still bound. The 30-second heartbeat only checks socket liveness.
- The server has one startup call site for `setupPartnerChat`; no distributed event/pub-sub infrastructure or process-shared socket registry is configured.
- Both clients automatically reconnect closed sockets while their auth token remains present. They currently do not special-case a relationship-revoked close code.
- Historical chat is persisted in MySQL and cached locally; this phase changes neither.

## Scope rules

- Close local sockets only after the unbind transaction successfully commits.
- Before processing any new text/audio/read event, check that the captured relationship remains `bound` and its exact two users still match the connection's captured users.
- Use a dedicated WebSocket close code for relationship revocation. Clients must not enter a rapid reconnect loop after that code.
- Periodic checks protect against unbinds handled by a different process; absent pub/sub, the existing heartbeat interval bounds that delay.
- Never delete or reassign messages during unbind handling.

## Unresolved / deferred

- Multi-process deployment topology and any future shared connection registry/event bus are unknown. Current guarantee is immediate for the handling process and bounded by one heartbeat for remote processes.
- The exact retention/export/visibility policy for historical chat after unbind remains a PRD product decision and is not needed to prevent live access.
- Real MySQL rollback races, simultaneous unbind/message writes, WS close delivery, and two-process behavior require integration tests unavailable in this workspace.

## Implemented behavior observed

- The unbind handler calls the local socket-close helper only after `connection.commit()` succeeds.
- Existing sockets are grouped by relationship; local unbind closes the group with application close code `4003` and reason `relationship_unbound`.
- Each incoming payload re-queries the captured relationship and exact member pair before handling. A stale group is closed; a DB authorization-check error closes it with a server-error code.
- Message insertion locks the exact currently-bound relationship row in the same transaction. Pending-message and read-receipt queries are additionally filtered to bound relationships.
- The existing heartbeat checks each relationship group at most once per 30-second tick, covering sockets on other processes when their DB check succeeds.
- Web and App clients stop reconnecting on `4003`; App shows the revoked/disconnected state and allows one attempt when the screen is re-entered, without a retry loop if still unbound.
- Workspace lint/build/typecheck and whitespace checks pass. No real database, WebSocket server, second process, browser, or device was available for integration testing.
