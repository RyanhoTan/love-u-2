# Phase 65 — Isolate explicitly assigned album relationships

## Status

Complete. Authorized by the active PRD R1/P0 Goal.

## Evidence and objective

`buildAlbumScope` currently uses `relationship_id = ? OR created_by_user_id IN (?, ?)`.
A row explicitly assigned to another relationship can therefore be read by a current partner
merely because its creator is one of the current partners. The same scope controls album media,
stories, legacy Wish media, and the media-ID signing endpoint. Story favorite writes check a
scoped read, but their final UPDATE uses only the story ID.

PRD-MEMORY-001, PRD-COUPLE-001, and PRD 10.1 require relationship isolation. Close the explicit
cross-relationship leak and recheck authorization in the executing SQL.

## Scope and decisions

- Centralize media/story/legacy-Wish-record SQL predicates in a pure helper with fixed column
  identifiers, bound parameters, and no config/credentials/DB-client imports.
- For bound users, permit the current relationship ID; retain the existing creator fallback
  only for NULL relationship IDs. Explicitly assigned other relationship IDs never qualify.
- Require the selected relationship still to be bound and contain the authenticated user when
  reads or favorite writes execute. An unbound scope must still have no active relationship.
- Preserve the existing unbound creator-only steady-state behavior pending the historical-data
  product policy. Do not migrate/delete records or change ownership.
- Route every album read, legacy media query, media-ID URL read, and favorite UPDATE through the
  appropriate predicate. Do not use text replacement to qualify SQL identifiers.
- Exercise the exact generated predicates with synthetic SQLite tables using Node's built-in
  in-memory database, without adding dependencies. This is SQL behavior evidence, not MySQL
  integration or transaction-concurrency proof.

## Non-goals

No history retention/deletion/rebinding policy, schema migration, object-store operation, new
client UI, pagination, signed-URL TTL change, upload authorization change, or live service access.

## Acceptance and verification

1. Both current partners read current-relationship records; outsiders and current partners
   reading another explicitly assigned relationship receive no rows/no signing authorization.
2. Existing NULL-relationship creator fallback and unbound owner behavior remain visible;
   tests distinguish these from explicitly assigned historical relationship records.
3. A previously built scope rejects rows after unbinding, removal of the caller's membership,
   or binding an initially unbound caller; media/story/legacy alias variants all obey the rule.
4. Favorite UPDATE includes the same executing authorization predicate and changes no protected
   row after revocation. If the post-write scoped read finds no story, return the existing 404
   not-found response rather than internal-error/success.
5. Existing REST auth runs before building a scope; response fields, legacy URL support, signing
   TTL, and `private, no-store` remain unchanged. No raw key or private fixture data is logged.
6. Focused regression tests, full server tests, server lint/build, and `git diff --check` pass.

## Compatibility and recovery

No data is rewritten. Correctly assigned current records and unassigned legacy records retain
their behavior; only unauthorized explicit other-relationship access is removed. Reverting this
commit restores code only (and reopens the access defect); no schema rollback is required.
Real MySQL, R2, HTTP, device, and concurrency behavior remain unverified.

## Verification result

- Red: the helper first mirrored the original predicate. Focused tests ran and failed 5/6,
  including returning fixture media ID 3 (relationship 10) to current relationship 20.
- Green: the helper now uses correlated `EXISTS` with live relation/member state and permits
  creator sharing only for NULL rows. A live-member-change test also confirms it does not use
  cached partner IDs for the fallback.
- All media/story/legacy-Wish query sites and `GET /media/:id/url` use the appropriate predicate.
  Post-create media reads now use the predicate before signing; no matching row returns 404.
  Favorite UPDATE uses its story predicate, with a 404 if post-write authorization finds no row.
- Passed `pnpm --dir server test`: 35/35 across 14 suites (7 SQL-scope cases).
- Passed `pnpm --dir server lint`, `pnpm --dir server build`, and `git diff --check`.
- Reviewed all album/media routes for authentication before scope construction, query aliases,
  placeholder order, bound parameters, private key serialization, and existing TTL/cache headers.
- No client/API field shape changed, and the existing OpenAPI response contracts remain compatible.
  No MySQL, R2, HTTP server, browser, device, credentials, `.env`, or user data was accessed.
- The SQL fixture requires a Node runtime with `node:sqlite` (workspace: 22.23.2) and emits the
  existing experimental module warning. It does not establish MySQL transaction semantics or
  whether a previously issued URL can still be used for its remaining 300-second validity.
