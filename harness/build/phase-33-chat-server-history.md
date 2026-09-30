# Phase 33 — Server-backed partner chat history

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-CHAT-001 requires persisted history and explainable ordering across real-time/reconnect paths.
- The WebSocket server persists messages and replays undelivered messages, but there is no HTTP history endpoint.
- Web and App restore messages from device-local storage only; already delivered history is unavailable to a new device or after local cache loss.
- Phase 32 establishes that only a currently bound relationship may receive chat events; historical ownership after unbind remains undecided.

## Objective

Allow a current relationship member to load server-persisted messages on any authenticated device, in stable chronological pages, while keeping private audio keys private and preserving the current local/offline experience.

## Material decisions

- Require the caller's exact `relationshipId` and verify it is still bound with the caller and other participant as the row's two members. A new relationship must not receive a previous relationship's history.
- Use `beforeId` as an exclusive message-id cursor, with a bounded default/max page size. Query newest-first for pagination and return each page oldest-first.
- `nextBeforeId` points to the oldest returned server message only when older messages remain. Keep server IDs as strings in the API.
- Include persisted delivery/read status for the requester. Set a self-authored local message ID to `clientMessageId` when present and also include the server ID, so it merges with the optimistic/local copy.
- Include legacy audio URLs for compatibility, but never return a private `audioObjectKey` or generate a new signed URL in history. Key-backed playback continues through the per-message authorized URL endpoint.
- On WebSocket ready, load the latest page and merge it with local cache/live events by server identity; expose an explicit “load earlier messages” action for subsequent pages.
- No history access after unbind, no row deletion/reassignment, no export/retention policy, no schema migration, and no change to offline push/retry semantics.

## Acceptance criteria

- The endpoint rejects malformed relationship IDs, cursors, and page limits.
- Only the caller who is one of the exact participants of the exact currently bound relationship can read that relationship's page.
- Unbound, mismatched, and stale relationship IDs return a non-disclosing not-found response.
- Pages are stable, do not overlap across exclusive cursors, and are returned in ascending server message ID order; statuses reflect persisted delivery/read columns.
- Private object keys and newly generated signed URLs are never included; playback still uses the authorized audio URL API.
- Web/App load the latest server page, can request earlier pages, and merge pages with local/realtime messages without duplicates or losing an optimistic client's identity.
- Server lint/build, Web API generation/lint/build, App lint/typecheck, and `git diff --check` pass.

## Verification plan

- Review query authorization, participant predicates, cursor bounds, ordering, and private-field serialization.
- Run compiled route parameter/serialization cases if a dependency-free seam can be exposed; otherwise record static review limitations.
- Run `pnpm --dir server lint`, `pnpm --dir server build`, `pnpm --dir web api`, `pnpm --dir web lint`, `pnpm --dir web build`, `pnpm --dir app lint`, `pnpm --dir app exec tsc --noEmit`, and `git diff --check`.
- Do not claim MySQL paging, live race, or device scroll behavior without the integration environment.

## Verification results

- Passed `pnpm --dir server lint`, `pnpm --dir server build`, `pnpm --dir web api`, `pnpm --dir web lint`, `pnpm --dir web build`, `pnpm --dir app lint`, `pnpm --dir app exec tsc --noEmit`, and `git diff --check`.
- A 15-case compiled helper matrix passed for accepted/rejected query integers, private-key audio omission, legacy URL compatibility, and persisted delivery/read status mapping.
- Static review confirms the message query is constrained to the exact active relationship pair, uses exclusive `id < beforeId` pagination, fetches one extra row for `hasMore`, and returns selected rows oldest-first. Both clients merge by local/client identity and sort persisted messages by server ID; realtime and optimistic messages remain merged.
- Web build retains the existing Zod Rollup annotation and >500 kB chunk warnings.

## Risks and limitations

- Pagination and ordering for persisted messages use auto-increment message IDs; optimistic messages without a server ID use their local timestamp until the server ID is known.
- A read concurrent with unbind may complete at the boundary; each page request after the committed unbind is rejected. This phase does not change history visibility/retention policy after unbind.
- Real MySQL query plans, transaction timing, and browser/native scroll anchoring require integration tests unavailable in this workspace.
- The first page is the newest 50 messages; older history is available by explicit pagination. No real DB, browser, or mobile device was available to verify SQL execution, cross-process races, or scroll anchoring.

## Handoff

Complete current-relationship server-backed pagination and client loading only. Continue other PRD-CHAT-001 reliability items independently.
