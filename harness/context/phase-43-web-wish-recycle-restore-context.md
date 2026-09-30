# Phase 43 context — Web wish recycle and restore

## Observed baseline

- `web/src/api/wish.ts` only reads, creates, updates wishes and creates records; it does not call the existing deleted-list, soft-delete, or restore endpoints.
- `web/src/pages/wishes-page/` has list/create/detail pages but no recycle page or delete control.
- `server/src/router_handler/wish.ts` already returns `deletedAt` and `deleteExpiresAt`, scopes deleted-list and mutations to the current authorized wish, and retains soft-deleted wishes for 30 days.
- App's recycle page supports restore and permanent delete, while Web has no recycle navigation.
- `permanentlyDeleteWish` deletes only the wish row. `wish_records` has no FK cascade, and media object cleanup is not defined.

## Decisions

- Implement only reversible soft-delete/recovery in Web, using existing service semantics and server deadlines.
- Do not expose Web permanent deletion until child-record and private-media impact is clarified and implemented safely.
- Keep server authorization, retention and schema untouched.

## Implemented behavior

- Web wish detail submits the existing soft-delete endpoint only after confirmation and returns to the active wish list on success.
- The recycle page reads the server's deleted-wish response, formats its deleted/cleanup timestamps locally, and presents restore with confirmation.
- Delete and restore invalidate the active wish list and recycle query; delete also clears stale detail/record cache entries.
- The Web UI deliberately does not offer permanent deletion.

## Unresolved / deferred

- Whether permanent deletion should remove associated wish records, album-media metadata, and private objects.
- Whether automatic expiry cleanup should be transactional and include associated records/media.
- Real browser/server integration and signed-cover load behavior.
