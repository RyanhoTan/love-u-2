# Phase 45 — Enforce media upload policy

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-MEMORY-001 requires validation of media upload type and size; PRD security requirements state that uploads must be limited and errors must not expose internal paths.
- `server/src/app.ts` already parsed raw uploads with a 100 MiB cap, but the body-parser `entity.too.large` error fell through to a generic 500.
- `server/src/router_handler/upload.ts` previously accepted arbitrary folders and content types and derived the object-key extension from the client filename.
- Existing callers use `album` for images/videos and `interact` for audio. Wish thumbnail generation writes a JPEG through the same server helper.

## Objective

Enforce a narrow server-side declared-MIME and folder policy while preserving existing upload consumers, private object-key behavior, and the existing 100 MiB request limit.

## Scope

- Allow only `album` and `interact` upload folders.
- Allow a fixed image/video MIME list for `album` and audio MIME list for `interact`.
- Normalize media type parameters/case for policy lookup and store the normalized allowlisted media type.
- Derive object extensions from the folder/MIME allowlist; do not use `x-file-name` to create object keys.
- Reject empty buffers and oversized buffers at the shared upload helper.
- Reuse a single 100 MiB constant for the Express raw body parser and map `entity.too.large` to a safe 413 response.
- Update the OpenAPI source and generated Web types for folder values and validation errors.

## Non-goals

- No file-signature/magic-byte inspection. MIME validation remains based on the client-declared Content-Type.
- No client UI changes, media compression, resumable upload, upload progress, rate limiting, R2 calls, or cleanup/deletion policy.
- No changes to authorization or to the `{ key }` success response. The upload key remains namespaced under the authenticated user ID.
- No narrower size limit than the existing 100 MiB parser cap.

## Material decisions

- Reject unknown folders with 400, folder/MIME mismatches with 415, empty bodies with 400, and bodies over 100 MiB with 413.
- Continue accepting the media types used by existing App/Web callers, including WebM audio with codec parameters, while keeping `album` and `interact` separated by media category.
- Stop deriving the object extension from the filename. Existing clients may continue sending `x-file-name`, but it is no longer required or trusted by the server.
- Declare MIME sniffing as unresolved; this phase does not claim that file bytes match the declared content type.

## Acceptance criteria

- Only `album` and `interact` are accepted as upload folders.
- `album` accepts supported image/video MIME types; `interact` accepts supported audio MIME types; category mismatch returns 415.
- MIME parameters and casing do not change the selected safe extension.
- Empty bodies return 400; bodies above 100 MiB return 413; exactly 100 MiB remains accepted by the policy helper.
- The HTTP raw parser uses the same 100 MiB constant and maps parser overflow to a safe 413 JSON error.
- Object keys use a policy-derived extension and retain the existing `${folder}/${userId}/...` ownership namespace.
- Existing internal thumbnail upload remains supported as `album` + `image/jpeg`.
- OpenAPI and generated Web types describe the folders and 400/413/415 responses.
- Server tests, lint, build, Web lint/build, and `git diff --check` pass.

## Verification plan

- Add unit tests for accepted folder/MIME pairs, normalized MIME parameters, rejected folders/types, empty/over-limit sizes, and the exact configured cap.
- Run `pnpm --dir server test`, `pnpm --dir server lint`, and `pnpm --dir server build`.
- Regenerate the Web OpenAPI types and run `pnpm --dir web lint` and `pnpm --dir web build`.
- Statically review all `uploadMediaBuffer` callers, parser ordering/error mapping, key ownership namespace, and API documentation.
- Do not access R2, credentials, a live API, or user data.

## Results

- Server upload helper now validates folder, client-declared MIME category, and buffer size before issuing a PutObject request.
- Safe extensions and stored Content-Type come from the allowlist. Client-supplied filenames are no longer read by the handler.
- Express raw parsing and helper validation share the 100 MiB constant; oversized parser errors now return 413 instead of generic 500.
- OpenAPI and generated Web types now document the allowed folders, 100 MiB limit, declared-MIME limitation, and error statuses.

## Verification results

- Passed `pnpm --dir server test` (11 tests, including five upload-policy cases), `pnpm --dir server lint`, `pnpm --dir server build`, `pnpm --dir web api`, `pnpm --dir web lint`, `pnpm --dir web build`, and `git diff --check`.
- Static review confirmed all shared-helper callers, safe extension selection, per-user key prefix, private `{ key }` response, and parser overflow mapping.
- No R2, live API, credentials, browser, database, or user data was accessed; no push or deployment occurred.

## Risks and limitations

- MIME acceptance is based only on the HTTP Content-Type declaration; a malicious client can mislabel file bytes. Signature inspection remains a separate security improvement.
- Unit tests cover policy behavior but not Express parser execution or object-store success/interruption. Those require isolated HTTP/R2 integration coverage.
- This work does not solve upload/database partial failures or orphan object cleanup.

## Handoff

Continue with independent PRD R1/P0 requirements. Keep real R2/HTTP integration and unresolved media lifecycle behavior visible; do not infer a cleanup or ownership policy.
