# Phase 32 — Revoke partner chat sockets after unbind

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-CHAT-001: unbound users cannot continue sending or subscribing to relationship messages.
- Phase 31 confirmed the audio playback endpoint checks current bound membership, but existing WebSocket connections are not revoked when the HTTP unbind transaction commits.
- `server/src/router_handler/couple.ts` commits an `unbound` relationship status while the WS connection registry is maintained in `server/src/ws/partnerChat.ts`.

## Objective

After a relationship is unbound, stop already-open chat connections from sending or processing read events, close local sockets as part of the successful unbind flow, and stop clients from reconnecting to an unbound room.

## Material decisions

- The committed relationship row is authoritative. Revalidate its bound state and exact member pair before handling every inbound WebSocket payload.
- After the unbind transaction commits, close in-process sockets for that relationship using a dedicated application close code. Do not close before commit, so a rolled-back unbind does not disconnect a valid couple.
- Serialize message inserts with unbind by taking a locking read of the exact bound relationship row in the same transaction as the insert. A stale client-message id must not relay a row belonging to another relationship.
- Periodically revalidate still-open connections as a fallback for sockets hosted by another server process or an unbind performed outside the current process. Retain the existing 30-second heartbeat interval; do not introduce a new service or dependency.
- Clients stop automatic reconnect on the relationship-revoked close code. A later screen re-entry / new authenticated connection may establish only the user's then-current relationship.
- Do not alter or delete chat history or decide post-unbind historical data ownership in this phase.

## In scope

- Current relationship revalidation for message and read events.
- Safe close of local relationship sockets after successful database commit and periodic stale-relationship cleanup.
- Web/App close-code handling to stop retry loops and show a clear disconnected state.
- Phase documentation and build evidence.

## Explicit non-goals

- Historical chat retrieval, deletion/export, or relationship-history ownership policy.
- Distributed pub/sub, push notifications, multi-region session registries, reconnect redesign, or retry delivery guarantees.
- Database schema changes, deployments, or external service writes.

## Acceptance criteria

- Once an unbind transaction commits, the same-process sockets for that relationship are closed; if the unbind occurred elsewhere, periodic revalidation closes stale sockets within the existing heartbeat window.
- Every new text/audio/read payload on an existing socket is rejected unless its relationship is still bound and both connection users are still the row's two members.
- Message insertion and unbind serialize on the relationship row so a message cannot be inserted into the old room after unbind commits.
- Failed/rolled-back unbind leaves valid sockets untouched.
- Revocation uses a documented close code; both clients stop reconnecting on that code and surface an honest disconnected state.
- A reconnect after unbind is rejected by the existing handshake. A new relationship uses a distinct relationship id and cannot inherit the old socket.
- No chat history rows are deleted or reassigned.
- Server lint/build, Web lint/build, App lint/typecheck, SQL/connection-scope review, and `git diff --check` pass.

## Verification plan

- Review transaction ordering and connection cleanup callsites.
- Run unit-like checks for close-code handling helpers if a stable seam exists; otherwise perform static branch review and record that live WS integration is unavailable.
- Run `pnpm --dir server lint`, `pnpm --dir server build`, `pnpm --dir web lint`, `pnpm --dir web build`, `pnpm --dir app lint`, `pnpm --dir app exec tsc --noEmit`, and `git diff --check`.
- Do not claim real DB rollback, live WS, cross-process, or client-device verification without those environments.

## Verification results

- Passed `pnpm --dir server lint`, `pnpm --dir server build`, `pnpm --dir web lint`, `pnpm --dir web build`, `pnpm --dir app lint`, `pnpm --dir app exec tsc --noEmit`, and `git diff --check`.
- Static review confirms unbind closes sockets only after the database commit; the rollback path does not call the close helper.
- Every inbound payload checks the current relationship status and exact member pair. Message insertion uses a locking read of that bound relationship row in the same transaction as insertion; pending-message and read-receipt queries are also scoped to a currently bound relationship.
- Existing connections are checked once per relationship on the existing 30-second heartbeat. Same-process revocation is immediate after commit; remote processes rely on the periodic check.
- App and Web stop automatic reconnect on close code `4003`. App surfaces the revoked state and permits one connection attempt on screen re-entry, without retrying indefinitely if the relationship remains unbound.
- Web build retains pre-existing Zod Rollup comment-position and large-chunk warnings.

## Risks and limitations

- Local unbind closes sockets immediately only in the process that handles the request. Other processes rely on the bounded periodic DB check because no cross-process event bus is configured.
- An event already in flight at the instant of unbind may race the close; the active relationship guard and authenticated media refresh prevent later sends/reads from relying on stale socket state.
- No historical chat data is deleted or made newly accessible by this phase; product ownership/retention decisions remain open.
- Real MySQL locking/rollback races, WebSocket close delivery, cross-process timing, and browser/native device behavior were not exercised. The 30-second remote-process bound assumes the heartbeat DB check succeeds. An event already in flight may race with unbind; post-unbind payloads are rejected after revalidation.

## Handoff

Complete only the live-connection authorization boundary. Continue other PRD-CHAT-001 gaps independently; this phase does not complete chat history/reliability acceptance.
