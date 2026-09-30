# Phase 31 — Private voice messages in partner chat

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-CHAT-001: voice messages, truthful send states, and relationship isolation are P0.
- `PRD.md` PRD-MEMORY-001: relationship media must use controlled access URLs.
- `/upload/media` returns an object key only. Both chat clients still expect a URL.
- Phase 26–30 established private object-key writes and short-lived authorized reads for album and Wish media.

## Objective

Restore voice-message upload and playback on Web and App using private object keys, while authorizing every fresh playback URL against the message's current bound relationship.

## Material decisions

- New audio messages send `audioObjectKey`; legacy clients may continue sending `audioUrl`, but a request must contain exactly one. Persist private keys in a new nullable `audio_object_key` column and keep `audio_url` for legacy rows/clients.
- Accept only a single-segment key under `interact/<authenticated user id>/`; the server checks ownership before persisting it. Never serialize the key to a client.
- For key-backed messages, WebSocket events carry the persisted message ID but no signed URL. Clients fetch a fresh URL from an authenticated REST endpoint when the user presses play. This avoids persisting short-lived signed URLs in local chat history.
- The REST read requires the requester to be a sender or receiver and a current member of the message's still-bound relationship. Legacy URL-backed audio is returned only after the same relationship check.
- Do not backfill or delete legacy data. The new nullable column is additive. Rollback is application-only: older code ignores the new column; dropping it would discard associations and is not part of this phase.

## In scope

- Additive chat audio object-key schema and exact-one WebSocket request contract.
- Current-user object-key ownership validation, key persistence, and private audio URL refresh endpoint.
- Web/App voice upload payloads and authenticated playback-time URL refresh.
- Correct upload response contracts in App and `web/openapi.json` / generated types.
- Phase evidence and status updates in `PRD.md`, `PLANS.md`, context, and build log.

## Explicit non-goals

- Server-backed chat history, offline history synchronization, pagination, ordering redesign, WebSocket retry/deduplication redesign, or active-socket revocation after unbind.
- Object deletion, orphan cleanup, upload size/type policy, schema framework replacement, or media retention policy.
- Reworking legacy audio URLs or revoking an already-issued signed URL before its expiry.
- Deployment, real database/R2 access, or real browser/device testing.

## Acceptance criteria

- Web and App upload success submits the returned `key`, not the absent `url`; upload failures remain visibly failed and do not create a successful message.
- New keys must match the authenticated sender's `interact/<userId>/...` single-segment path. Wrong-owner, malformed, both-key-and-URL, and neither-key-nor-URL inputs are rejected.
- New rows persist `audio_object_key` and leave `audio_url` null; legacy URL writes/rows remain readable.
- WebSocket payloads do not expose private object keys or private signed URLs. Key-backed messages can be played after delivery and after the original URL TTL by refreshing on each play.
- The audio URL endpoint rejects unauthenticated requests, non-members, former/unbound relationships, non-audio messages, missing media, and unrelated message IDs; authorized active members receive either a 300-second signed URL or the legacy URL.
- Responses containing signed URLs are `Cache-Control: private, no-store`.
- `web/openapi.json` accurately describes the upload response, audio input alternatives, WebSocket fields, and audio URL endpoint; generated types match.
- Server lint/build, Web API generation/lint/build, App lint/typecheck, schema/owner matrix, and `git diff --check` pass.

## Verification plan

- Run the audio schema matrix for private key, legacy URL, both, neither, unknown fields, malformed keys, and owner-prefix collisions.
- Review the endpoint SQL authorization predicates and all callsites that serialize or play audio.
- Run `pnpm --dir server lint`, `pnpm --dir server build`, `pnpm --dir web api`, `pnpm --dir web lint`, `pnpm --dir web build`, `pnpm --dir app lint`, `pnpm --dir app exec tsc --noEmit`, and `git diff --check`.
- Do not claim database, R2, browser, device, or WebSocket integration verification without running those dependencies.

## Verification results

- Passed: `pnpm --dir web api`, `pnpm --dir server lint`, `pnpm --dir server build`, `pnpm --dir web lint`, `pnpm --dir web build`, `pnpm --dir app lint`, `pnpm --dir app exec tsc --noEmit`, and `git diff --check`.
- Passed 10 compiled schema/owner cases: private key, legacy URL, both/neither, path traversal, unknown field, matching owner, different owner, numeric-prefix collision, and extra path segment.
- Static review confirmed the playback query scopes the selected audio row to the same active bound relationship, validates both message participants against the relationship pair, requires the requester to be a sender/receiver, returns `private, no-store`, and does not expose object keys or log signing failures.
- Static review confirmed key-backed WS messages omit `audioUrl`; clients refresh by server message ID on each playback. Legacy audio URL rows continue through the authorized endpoint.

## Risks and limitations

- Additive column initialization is not equivalent to a verified production migration; preserve a backup and do not drop the column during rollback.
- A successful R2 upload followed by a failed chat-message insert can leave an orphan object; no object will be deleted in this phase.
- Issued signed URLs remain usable until their short TTL expires, including after unbind; fresh URL requests are denied after unbind.
- The existing WebSocket handshake is relationship-authorized, but live connection revocation and per-message revalidation remain a separate PRD-CHAT-001 gap.
- MySQL additive migration, R2 signing/expiry, live WebSocket delivery, browser playback, and native-device playback were not exercised. Web build retains existing Zod Rollup comment-position and >500 kB chunk warnings.

## Handoff

Complete. Continue with a separate P0 gap; this phase does not complete PRD-CHAT-001.
