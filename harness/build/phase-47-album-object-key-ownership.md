# Phase 47 — Enforce exact album media ownership keys

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-MEMORY-001 requires relationship-scoped private media and ownership checks.
- `server/src/router_handler/album.ts` checked that the object key contained the caller ID as any path segment and did not contain a `..` segment. It did not require the expected `album/<userId>/` namespace.
- `server/src/media/objectKey.ts` already provided a shared prefix check for Wish media, but did not reject dot or empty suffix path segments.
- Server uploads generate new album objects under `album/<authenticatedUserId>/...`; chat audio uses the separate `interact/<userId>/...` namespace.

## Objective

Require exact album namespace ownership for new album-media and story writes, preventing callers from attaching object keys outside their own album folder.

## Scope

- Strengthen the shared album object-key predicate to require the exact `album/<userId>/` prefix.
- Reject empty, `.` and `..` path segments after the owner prefix.
- Replace the album router's duplicate weak check with the shared predicate.
- Add database-free positive and negative ownership tests.

## Non-goals

- No changes to relationship membership authorization, media reads, signed URL behavior, storage layout, or database schema.
- No deletion, migration, repair of existing stored keys, or behavior change for `interact` chat media.
- No live DB/R2/account access, new dependency, or API/OpenAPI shape change.

## Material decisions

- A media key is album-owned only when it starts with the exact current-user path prefix, including the trailing slash; matching the user ID in a different path segment is insufficient.
- Object-store keys are treated as slash-separated paths for this policy; empty and dot-navigation segments are rejected even though object storage keys are opaque strings.
- Existing Wish writes reuse the same helper and are expected to pass because uploaded object keys already follow this namespace.

## Acceptance criteria

- `album/<userId>/<filename>` is accepted for the matching user.
- Other folders, another user's prefix, user-ID prefix collisions, user ID elsewhere in a key, and `.`/`..`/empty suffix segments are rejected.
- Both album-media creation and story-media creation use the shared exact predicate.
- Existing Wish ownership checks continue to use the shared helper.
- Server tests, lint, build, and `git diff --check` pass; no DB/API behavior is otherwise changed.

## Verification plan

- Add focused tests first and observe failure for the currently accepted malformed namespace.
- Run `pnpm --dir server test`, `pnpm --dir server lint`, and `pnpm --dir server build`.
- Statically inspect every shared-helper consumer and both album writes.
- Do not access DB, R2, credentials, accounts, or external services.

## Results

- The shared album-key predicate now requires the exact `album/<userId>/` prefix and rejects empty, `.` and `..` suffix segments.
- Both album-media and story-media creation now use that shared predicate; Wish cover and record checks continue to reuse it.
- No read path, relationship authorization query, database row, or object was changed.

## Verification results

- The new test first failed on `album/17/../18/photo.jpg` under the prior prefix-only predicate.
- Passed `pnpm --dir server test` (14 tests including three ownership cases), `pnpm --dir server lint`, `pnpm --dir server build`, and `git diff --check`.
- Static review confirmed album media and story writes call the assertion before database writes and Wish callers continue to share the predicate.
- No DB, R2, credentials, account, or external service was accessed.

## Risks and limitations

- The pure predicate tests and handler review do not replace database/object-store integration tests.
- Existing persisted object keys are not audited or migrated; this stricter rule applies to new writes.

## Handoff

Continue with independent PRD R1/P0 gaps. Existing stored media and external storage behavior remain unverified.
