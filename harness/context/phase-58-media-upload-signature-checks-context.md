# Phase 58 context — media upload signature checks

## Observed baseline

- `getMediaUploadPolicy` validates `folder`, declared Content-Type, and byte length, and derives a safe extension.
- `uploadMediaBuffer` calls that metadata policy and then sends the uninspected body to R2.
- `server/test/upload-policy.test.ts` covers declared types and size only.
- `web/openapi.json` and generated `web/src/api/schemas.d.ts` explicitly state that file signatures are not checked.
- Existing common consumers use JPEG/PNG, MP4/QuickTime/3GPP/WebM, AAC/MP3/Ogg/WAV/MP4 audio; media types like AVIF/HEIC are in the server allowlist even if no current client path is known.

## Decision

- Keep the metadata allowlist unchanged and add an independent signature/container check using Node Buffer operations, avoiding a new runtime dependency.
- Check recognizable fixed signatures for image/audio formats and container brands for ISO-BMFF/EBML formats. Reject unknown or truncated headers with 415 before object storage.
- Make the boundary explicit: container signature checks do not decode payloads or determine the exact codec/stream set in generic containers.

## Format references

- [PNG specification](https://www.w3.org/TR/png-3/) defines the fixed 8-byte PNG signature and IHDR chunk.
- [WebP container specification](https://developers.google.com/speed/webp/docs/riff_container) defines the RIFF `WEBP` header and first image chunk.
- [RFC 6381](https://datatracker.ietf.org/doc/rfc6381/) describes ISO-BMFF major/compatible brands in `ftyp` boxes.
- [WebM container guidelines](https://www.webmproject.org/docs/container/) identifies `webm` as the EBML DocType and distinguishes it from general Matroska.

## Implemented behavior

- `uploadMediaBuffer` still applies `getMediaUploadPolicy` first, then calls `assertMediaSignatureMatches`, then constructs the key and performs the S3-compatible PutObject.
- All current allowlisted declarations map to a fixed-header or container-brand check. Any unknown/mismatched/truncated file receives `HttpError(415, "media content does not match declared media type")`.
- The signature parser bounds ISO-BMFF `ftyp` boxes and EBML header size to 4 KiB and WAV header chunk scanning to 4096 chunks.
- Web OpenAPI source and generated types document 415 signature mismatch and clarify that these checks do not decode the whole payload or verify codec tracks.

## Unresolved / deferred

- Full media parsing, stream/codec verification for shared containers, malformed payload decode behavior, and polyglot/malware analysis remain outside this phase.
- No HTTP/R2 integration, upload interruption, or orphan cleanup behavior is exercised.
- Generic ISO-BMFF or WebM container identification can still contain an unsupported or unexpected stream; full demux/decode verification requires a separate performance/security decision.
