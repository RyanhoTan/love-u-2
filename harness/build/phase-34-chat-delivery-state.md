# Phase 34 — Accurate partner chat delivery states

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-CHAT-001 requires distinct sending, failure, offline, delivered, and read states.
- Chat messages already persist `delivered_at` and `read_at`, and offline messages are replayed when a recipient connects.
- The send handler currently returns `sent` even when no recipient connection exists. Pending replay marks every queried row delivered even when its socket is no longer open. Web/App do not render the `sent` state.

## Objective

Make the sender's offline/delivered state and persisted delivery timestamp match whether the message was submitted to an open recipient socket for the same active relationship, and display that state in both clients.

## Material decisions

- `sent` means accepted for send by an open recipient WebSocket; it is not an end-user render/read acknowledgement. `read` remains a distinct persisted/read-receipt state.
- `partner_offline` means no open recipient WebSocket accepted the send at that attempt; the message remains persisted and eligible for pending replay.
- When retrying an existing idempotency key, persisted `delivered_at` takes precedence over current partner presence; do not regress a previously delivered message to offline.
- The send helper reports synchronous socket-send acceptance and handles a socket that has closed before the send attempt. Pending replay marks only rows for which send was accepted.
- `delivered_at` updates remain constrained to a currently bound relationship. No new delivery-ack protocol, queue, notification, schema migration, or retry policy is introduced.

## Acceptance criteria

- A persisted message sent while no recipient socket is open gets `partner_offline`; the sender receives that state.
- A recipient open socket accepting the payload yields `sent` and sets/retains `delivered_at`.
- A duplicate client message id does not regress a prior `delivered_at` to offline; cross-relationship reuse remains rejected by the existing saved-row identity check.
- Pending replay updates `delivered_at` only for messages actually submitted to an open socket; closed sockets leave them pending for a later connection.
- Delivery timestamp updates require the message's relationship to remain bound.
- Web and App visibly render `sent` as sent/delivered while preserving `partner_offline`, `read`, and `failed` distinctions.
- Server lint/build, Web lint/build, App lint/typecheck, and `git diff --check` pass.

## Verification plan

- Review message insert/retry status, direct send, offline replay, and read-receipt transitions.
- Exercise a pure delivery-state decision matrix if a stable helper seam exists; otherwise document the static review.
- Run affected workspace checks. Do not claim live WebSocket or real multi-client delivery without integration devices.

## Verification results

- Passed `pnpm --dir server lint`, `pnpm --dir server build`, `pnpm --dir web lint`, `pnpm --dir web build`, `pnpm --dir app lint`, `pnpm --dir app exec tsc --noEmit`, and `git diff --check`.
- A compiled four-case delivery decision matrix passed for no prior delivery/no open socket, active socket acceptance, and prior persisted delivery during an offline retry.
- Static review confirms pending replay marks only rows for which `sendJson` accepted a payload on an open socket; persisted delivery writes require the exact relationship to remain bound with the same two members. Replay notifies connected same-process sender sockets after delivery state is persisted.
- Web build retains the existing Zod Rollup annotation and >500 kB chunk warnings.

## Risks and limitations

- `ws.send` acceptance means bytes were queued by the server library for an open socket, not that the remote app rendered them; a client acknowledgement protocol is deferred.
- No real WebSocket server, database, or paired devices are available to exercise dropped network frames or app backgrounding.
- A direct open-socket send is reported `sent` even if the subsequent database status update fails; the persistence failure is logged and a later history read may still show the prior status. Sender updates from pending replay reach only sender sockets in the same process because no cross-process presence/pub-sub service exists.

## Handoff

Complete delivery-state consistency only. Continue duplicate-message and end-to-end retry guarantees as separate PRD-CHAT-001 work.
