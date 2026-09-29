# Phase 30 — Wish record private media

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-WISH-001: wishes support process records and media as shared memories.
- `/upload/media` returns `{ key }`; the Wish record Web/App creation forms currently consume a missing `url` property.
- `album_media` already stores `object_key` for private media but Wish record creation writes only legacy `url`.
- Phase 27 established relationship-authorized 300-second signed reads and `Cache-Control: private, no-store`.

## Objective

Restore Wish record image/video attachments by writing private object keys and returning short-lived media URLs only after Wish and record authorization.

## Material decisions

- Create requests accept exactly one of `objectKey` or legacy `url`; new Web/App clients send only `objectKey`. Legacy URL writes and reads remain compatible.
- Reuse `album_media.object_key` for attachment media. Add nullable `thumbnail_object_key` for private video previews; keep the legacy `thumbnail_url` untouched for old rows.
- Validate key structure in schema and current uploader ownership after resolving the authorized Wish. Store empty legacy `url` for key-backed rows; never serialize object keys.
- Media reads join authorized record ids to the exact Wish and its scope (`relationship_id`, or creator for a private Wish) before signing `object_key` and `thumbnail_object_key` for 300 seconds.
- Generate private video thumbnails from a short-lived signed source read URL and store the returned thumbnail object key. Do not persist signed URLs.
- Web record composition previews local blob URLs and revokes them; App keeps local picked asset URIs for draft preview. Neither local URI is sent to the record API.
- No object deletion, orphan cleanup, retry compensation, or existing record edit/delete behavior in this phase.

## In scope

- Additive nullable thumbnail object-key column; Wish record media request schema and server insert/read serializers.
- OpenAPI request/response types and Web/App record upload flows.
- Relationship/creator scoping of Wish record media reads and owner validation for new keys.
- Update PRD, PLANS, phase context, and build log.

## Explicit non-goals

- Real MySQL/R2 integration, browser/device runs, deployment, or storage cleanup.
- Chat/story media migration, Wish record editing/deletion, upload limits, or a new video transcoding strategy.

## Acceptance criteria

- New image/video writes persist object keys, not local URIs/public URLs; wrong-owner/malformed keys and request payloads containing both/neither URL/key are rejected.
- Old URL request payloads and old stored URL media still work.
- Authorized Wish record reads return signed media and signed private thumbnails; they do not expose object keys or sign media attached to a different Wish/scope.
- Web/App can attach media, preview before save, receive honest failure feedback, and refresh via existing Wish records focus/window behavior.
- `pnpm --dir server lint/build`, `pnpm --dir web api/lint/build`, `pnpm --dir app lint/exec tsc --noEmit`, schema/owner matrix, and `git diff --check` pass.

## Verification and limitations

- Verification: `pnpm --dir web api`; `pnpm --dir server lint`; `pnpm --dir server build`; `pnpm --dir web lint`; `pnpm --dir web build`; `pnpm --dir app lint`; `pnpm --dir app exec tsc --noEmit`; `git diff --check` — all passed.
- 11 schema/owner cases passed, including old URL, private key, exactly-one input, malformed values, uploader match, different owner, and numeric-prefix collision.
- Static review confirmed serializer outputs only URL/type/thumbnail fields; query joins media to the exact Wish's records, checks relation id, and limits former/unbound relationship reads to creator-owned rows.
- Database additive ALTER, R2 signing/expiry, FFmpeg reading a signed source URL, and native/browser rendering remain unverified.
- Upload or thumbnail objects may be orphaned after record failure; existing media objects are not deleted.

## Handoff

Complete; ready for independent commit. Next, continue remaining PRD R1/P0 gaps in order of risk and evidence.
