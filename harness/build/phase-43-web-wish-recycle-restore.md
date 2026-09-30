# Phase 43 — Web wish recycle and restore

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-WISH-001 requires soft delete, restore, a visible recycle-bin retention window, and clear permanent-delete impact.
- The server already provides relationship-authorized `DELETE /wishes/:id`, `GET /wishes/recycle`, and `POST /wishes/:id/restore` responses with `deletedAt` and `deleteExpiresAt`.
- App exposes soft delete/recovery and shows the server cleanup date; Web currently has no soft-delete action, recycle route, or restore flow.
- The server's permanent-delete endpoint deletes the `wishes` row only. The schema has no FK cascade for wish records; private-media object deletion policy is also unresolved.

## Objective

Give Web users a recoverable wish-deletion flow that shows server-provided retention timestamps without expanding irreversible deletion behavior.

## Scope

- Add typed Web API access and query mutations for existing soft-delete, deleted-list, and restore endpoints.
- Add a soft-delete action to Web wish detail with confirmation explaining that the wish moves to the recycle bin and can be restored until its server-provided deadline.
- Add a Web recycle route reachable from the wish list, with honest loading, error/retry, empty, and populated states.
- Display deleted time and server-provided cleanup deadline; offer a restore action and refresh active/recycle queries after success.
- Preserve existing server relationship authorization, retention duration, request/response shapes, and app behavior.
- Update PRD baseline and harness evidence without marking permanent delete or full PRD-WISH-001 complete.

## Non-goals

- No permanent-delete control or new deletion effect in Web.
- No changes to server endpoints, DB/schema, R2, retention duration, or automated cleanup.
- No policy choice for wish record, album-media metadata, or private object retention/deletion.
- No fake browser integration claim; use Web lint/build and static route/API checks.

## Material decisions

- Use the existing server-generated `deleteExpiresAt` as the authority for cleanup display; do not derive an alternate retention deadline in the browser.
- Soft deletion is reversible and already supported by the current server; Web confirmation states its real behavior.
- Withhold the permanent-delete button because the current endpoint removes only the parent row while related process records/media cleanup semantics are unresolved. This is not a claim that the endpoint is safe or fully compliant.
- The recycle page only offers restoration. It does not let Web users irreversibly discard shared data.

## Acceptance criteria

- Web users can move an authorized wish into the recycle bin from its detail page after confirmation.
- Web users can open the recycle bin, distinguish loading/error/empty/data states, see server timestamps, and restore a wish.
- Successful delete/restore refreshes the active wish list and recycle view; failed writes keep the current view and show an error.
- No permanent-delete action is presented in the Web UI.
- Existing API authorization/response semantics and App behavior are unchanged.
- Web lint/build and `git diff --check` pass.
- Documentation states that permanent-delete and orphan-media semantics remain unresolved.

## Verification plan

- Inspect generated API types and existing server route contracts before adding client calls.
- Run `pnpm --dir web lint`, `pnpm --dir web build`, and `git diff --check`.
- Static-review route ordering, cache invalidation, confirmation/cancel/error paths, and visibility of permanent deletion.
- Do not access a live account or assert real server/browser integration.

## Risks and limitations

- Real server authorization, browser behavior, and signed cover display were not available for integration testing.
- Server automatic expiry currently deletes the parent wish without an FK cascade; child records and private media cleanup remain unresolved.
- Web does not expose permanent deletion in this phase; current App behavior is unchanged and still needs a separate data-lifecycle review.

## Results

- Added Web API/query support for soft-deleted wish listing, soft deletion, and restore using the existing generated contract.
- Wish detail now provides a confirmed “move to recycle bin” action; successful deletion returns to the list while failures remain visible.
- Added a reachable Web recycle page with loading/error/retry/empty/data states, server-provided deleted and cleanup timestamps, approximate remaining time, and a confirmed restore action.
- Mutations refresh active and recycle queries. No permanent-delete control was added.

## Verification results

- Passed `pnpm --dir web lint`, `pnpm --dir web build`, and `git diff --check`.
- Static review matched the client methods to existing `/wishes`, `/wishes/recycle`, and `/wishes/:id/restore` contracts and confirmed server authorization was unchanged.
- No browser, API, MySQL, or signed-media integration was run. Web build emitted existing Zod Rollup annotation and large-chunk warnings.

## Handoff

Continue the PRD R1/P0 audit. Treat permanent deletion and related process-record/media cleanup as a separate issue requiring safe semantics; do not infer those semantics from this UI change.
