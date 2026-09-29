# Phase 29 — Wish private cover update/clear

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-WISH-001 requires editable wish fields including an optional cover.
- Phase 28 added `wishes.cover_object_key`, authenticated-owner checks on create, signed cover reads, and the additive legacy URL strategy.
- Wish PATCH is strict and currently has no cover field; both current edit surfaces omit cover management.

## Objective

Allow a user to replace or clear a Wish cover from Web and App while preserving current Wish relationship authorization and private object-key reads.

## Material decisions

- `coverObjectKey` omitted means leave the cover unchanged; a valid string replaces it; explicit `null` clears it.
- Replacing with an object key sets `cover_object_key` and clears legacy `cover`; clearing sets both columns to SQL `NULL`. No signed/public URL is accepted for new edits.
- Replacement keys must use `album/<userId>/<file>` shape and match the authenticated user. The existing PATCH write authorization remains mandatory.
- Upload precedes PATCH. If PATCH fails after upload, an unreferenced object can remain. Clearing/replacing does not delete prior R2 objects; media cleanup/compensation is explicitly deferred.
- Both clients preserve local selection after a failed save and show the error; successful App navigation returns to detail, which refetches its signed URL.

## In scope

- Strict Wish update schema, key ownership validation, and atomic update of legacy/private cover columns.
- OpenAPI and generated request types.
- Web Wish detail replacement and clear actions with private upload key submission.
- App Wish edit form cover preview, replacement upload, explicit clear, and save feedback.
- Update PRD, PLANS, phase context, and build log.

## Explicit non-goals

- R2 deletion, orphan cleanup, upload compensation, or storage lifecycle redesign.
- Wish record media, story/chat media, cover editing in the create form after creation, or a new image crop workflow.
- Database cleanup/backfill, real DB/R2 integration, browser/device tests, push, or deployment.

## Acceptance criteria

- PATCH with omitted `coverObjectKey` does not change either cover column; string replaces the key and clears the legacy URL; null clears both columns.
- Malformed key or another user's key is rejected; existing relationship/write authorization remains in the conditional UPDATE.
- Read response returns a short-lived signed `cover` for the replacement, and returns an empty cover after clear without exposing a key.
- Web and App can replace and clear; preview remains usable; failures remain visible and do not report success.
- `pnpm --dir server lint/build`, `pnpm --dir web api/lint/build`, `pnpm --dir app lint/exec tsc --noEmit`, schema matrix, and `git diff --check` pass.

## Verification and limitations

- Verification: `pnpm --dir web api`; `pnpm --dir server lint`; `pnpm --dir server build`; `pnpm --dir web lint`; `pnpm --dir web build`; `pnpm --dir app lint`; `pnpm --dir app exec tsc --noEmit`; `git diff --check` — all passed.
- Schema/ownership matrix passed for legacy create URL; PATCH unchanged, replacement key, clear null, malformed folder, traversal, unknown field, and empty object; matching, different, and prefix-collision owners.
- Static review confirmed omitted cover adds no SQL assignments, string replacement and null clearing update both relevant columns, and UPDATE still embeds the existing Wish relationship authorization predicate.
- Real SQL NULL behavior, R2 upload/signed-read behavior, and browser/device interaction remain unverified.
- Old uploaded objects and failed-update uploads remain uncollected by design.

## Handoff

Complete; ready for independent commit. Next P0 gaps remain in Wish records/media or other R1 requirements; select based on the PRD and current evidence.
