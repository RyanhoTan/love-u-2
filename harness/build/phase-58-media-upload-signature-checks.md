# Phase 58 — Verify uploaded media signatures

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-MEMORY-001 requires uploaded media to be type-checked and rejects illegal media declarations.
- `harness/build/phase-45-media-upload-policy.md` explicitly left file signatures uninspected; current `getMediaUploadPolicy` trusts the client `Content-Type`, and `uploadMediaBuffer` sends the body to R2 after metadata/size checks only.
- Server unit tests already cover the declared-MIME allowlist without accessing external services.
- Current upload consumers declare JPEG/PNG, common ISO-BMFF video/audio, WebM, Ogg, WAV, MP3, and AAC media.

## Objective

Reject obviously mismatched or malformed media headers before any object-store write, while preserving the existing folder/MIME/size allowlist.

## Scope

- Add dependency-free signature/container-header checks for every currently allowlisted MIME type.
- Return the existing safe 415 error class for a body whose recognized signature does not match its declared type.
- Run the check in `uploadMediaBuffer` before `PutObjectCommand` is sent.
- Add deterministic unit tests for accepted signatures, mismatched declarations, malformed/truncated headers, aliases, and parameterized MIME values.
- Update the upload OpenAPI description and generated Web API types, plus the PRD capability summary.

## Non-goals

- No change to allowed folders, MIME types, object keys, size limit, success response, client upload flows, or authorization.
- No full media decoding, codec/track validation, malware scanning, decompression, thumbnailing, cleanup, or object-store integration.
- ISO-BMFF and EBML checks validate recognized container brands/doc type only; they do not prove the exact codec or stream set.
- No new dependencies, device, live API, credentials, database, or R2 access.

## Material decisions

- Preserve the existing declared MIME allowlist and reject a mismatch before external I/O; do not silently rewrite the declared media type.
- Keep signature validation separate from the metadata/size policy so each guarantee remains explicit and independently testable.
- Signature checks are a format-identification boundary, not a complete parser or malware defense; record this limitation rather than claiming full file validity.

## Acceptance criteria

- Every MIME currently allowed by `getMediaUploadPolicy` has a positive header/container test.
- Obvious cross-format mismatches and truncated/unknown headers throw `HttpError` status 415.
- `uploadMediaBuffer` runs the check before the R2 `PutObjectCommand`; the existing folder namespace and response stay unchanged.
- Parameter normalization and MIME aliases continue to behave as before.
- OpenAPI and generated types no longer claim no signature check; they disclose that container/codec parsing remains incomplete.
- `pnpm --dir server test`, `pnpm --dir server lint`, `pnpm --dir server build`, `pnpm --dir web api`, `pnpm --dir web lint`, `pnpm --dir web build`, and `git diff --check` pass.
- No external R2 or live service is accessed.

## Verification plan

- Unit-test each allowlisted media type through the policy and signature helpers; assert mismatch and short/malformed inputs fail closed.
- Statically inspect the upload order to prove validation completes before `r2Client.send(PutObjectCommand)`.
- Run the server and Web checks listed in acceptance.
- Do not access R2, credentials, a live API, database, or user data.

## Results

- Added dependency-free header/container recognition for all 24 MIME aliases currently accepted by the upload policy.
- Uploads with mismatched, unrecognized, truncated, or over-complex container headers now fail with safe 415 before `PutObjectCommand` is sent.
- ISO-BMFF extended-size `ftyp`, compatible brands, WebM EBML DocType, RIFF/WEBP, RIFF/WAVE `fmt ` chunks, BMP DIB headers, PNG IHDR, and common audio/image signatures are handled.
- Added parser size/count limits to bound work on untrusted ISO-BMFF, EBML, and RIFF/WAVE headers.
- OpenAPI and generated Web types now describe the new 415 mismatch behavior and the limit of header-only identification; PRD status reflects the implementation.
- Passed `pnpm --dir server test` (17 tests), `pnpm --dir server lint`, `pnpm --dir server build`, `pnpm --dir web api`, `pnpm --dir web lint`, `pnpm --dir web build`, and `git diff --check`.
- Static review confirmed signature validation occurs before object-key generation and before the R2 `PutObjectCommand`; existing authentication, namespace, size limit, and `{ key }` response are unchanged.
- No live API, R2, credentials, database, device, or user data was accessed.

## Handoff

Continue the active PRD R1/P0 audit. Preserve external object-store, full decoder/track, and integration gaps as unresolved.
