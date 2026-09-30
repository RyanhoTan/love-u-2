# Phase 35 — Reject conflicting partner chat idempotency keys

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-CHAT-001 requires retries/reconnects not to create duplicate messages.
- The `partner_chat_messages` schema enforces `UNIQUE(sender_id, client_message_id)` and `saveMessage` loads the row returned by `ON DUPLICATE KEY UPDATE`.
- The saved row is checked against relationship/sender/receiver, but its content is not compared to the repeated payload. A sender can therefore retain optimistic content different from the historical row broadcast to the partner.

## Objective

Make repeated client message IDs idempotent only for the same canonical message payload. Reject conflicting reuse before the saved message is relayed, and return a stable error code the client can present honestly.

## Material decisions

- Keep `(sender_id, client_message_id)` as the uniqueness scope; no schema migration.
- Compare normalized text or audio payload fields exactly as they are persisted. Optional audio duration is normalized to SQL `NULL` when omitted; private key and legacy URL forms remain mutually exclusive per the existing schema validation.
- An identical retry returns the original row and existing delivery state. A different message type/text/audio key/audio URL/duration or a saved row belonging to another relationship is an idempotency conflict.
- The conflict response reveals no saved message body or object key, and the server must not broadcast the saved row on that conflicting request.
- Requests without `clientMessageId` retain existing behavior; requiring the field or changing its generation policy is out of scope.

## Acceptance criteria

- Same ID + same canonical text is accepted as a retry and does not create another row.
- Same ID + changed text or message type is rejected with a stable `client_message_id_conflict` error code.
- Same audio ID + same key/legacy URL/duration is accepted; changing any persisted audio field is rejected.
- A supplied empty/whitespace client ID is rejected; omitting the optional ID remains backward compatible.
- Reuse colliding with a row from another relationship never returns or broadcasts that old row.
- Web/App mark the optimistic request failed and display a clear localized retry instruction for the conflict.
- No private audio key, old body, or relationship data is included in the conflict payload.
- Server lint/build, Web lint/build, App lint/typecheck, and `git diff --check` pass.

## Verification plan

- Exercise pure payload-comparison cases for same/mismatched text, message type, private key, legacy URL, and optional duration.
- Review transaction rollback behavior on the conflicting duplicate and ensure no message broadcast occurs after the conflict branch.
- Run affected workspace checks; do not claim the unique index/transaction race on real MySQL without integration DB tests.

## Verification results

- Passed `pnpm --dir server lint`, `pnpm --dir server build`, `pnpm --dir web api`, `pnpm --dir web lint`, `pnpm --dir web build`, `pnpm --dir app lint`, `pnpm --dir app exec tsc --noEmit`, and `git diff --check`.
- A compiled 14-case payload/schema matrix passed for identical and conflicting text, message-type mismatch, private object-key mismatch, duration mismatch, legacy URL match/mismatch, optional duration normalization, and empty/whitespace client IDs.
- Static review confirms the duplicate row is checked before commit and before the caller performs recipient fanout; relationship/sender/receiver mismatch for the same client ID yields the same generic conflict, without including stored content.
- Web build retains the existing Zod Rollup annotation and >500 kB chunk warnings.

## Risks and limitations

- MySQL duplicate-key behavior, concurrent retry serialization, and actual WebSocket error delivery are not exercised without a live DB/server.
- Repeated requests with omitted client IDs are still separate inserts; client implementations currently generate IDs, while older/third-party clients remain compatible.
- Identical retry/no-extra-row behavior relies on the existing unique index and was not exercised against a real MySQL instance.

## Handoff

Complete payload-consistent idempotency only. Continue delivery acknowledgement and offline retry guarantees as separate PRD-CHAT-001 work.
