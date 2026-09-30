# Phase 27 context — Private album signed reads

Phase 26 has corrected writes: `/upload/media` returns `{key}`, album media/story create schemas require `objectKey`, and writes persist that key with a blank legacy `url`. The UI still consumes `media.url` / `story.coverUrl`, so these newly written records render blank. `server/src/router_handler/media.ts` already has `GET /media/:id/url`; it authorizes via `buildAlbumScope`, signs the key for 300 seconds, and sends `Cache-Control: private, no-store`. It also supports converting old R2 public URLs back to an object key for that endpoint.

The existing album media GET has a relationship scope query but serializes the legacy URL. Story list queries scope the story rows; cover media joins need to be confirmed not to cross that scope. Story detail reads story media with `source_id` alone after loading a scoped story; add explicit relationship/creator scope to the media query. Album serializers are called by GET and create/favorite mutation responses, so any async signature change must be followed at every callsite and every response carrying a signed URL must be non-cacheable.

The mobile album and story upload paths currently submit `getThumbnailUri(...)`, a device-local `file://` value, as `thumbnailUrl`. That value is not a cross-device thumbnail and must not be returned for a private `object_key` row. No thumbnail object-key schema or video thumbnail generation is in scope. App story pages can use a static cover for video cover media and play the signed URL from the existing video viewer.

Keep legacy album `url` data and synthetic wish-record media compatible, do not migrate Wish/Chat in this phase, and never serialize raw `object_key` or a permanent R2 public URL. No real DB/R2 credentials or client device are authorized/available; record those integration limitations explicitly.

## Phase 27 implementation and verification

- `serializeAlbumMedia` and `serializeAlbumStory` now asynchronously sign `object_key` only after handlers have queried authorized records. Raw object keys are not included in response DTOs; key-backed rows suppress stored local thumbnail URIs.
- Album media/story reads and create/favorite responses carrying signed URLs set `Cache-Control: private, no-store`. URLs use the existing 300-second `createMediaReadUrl` behavior and are never written back to MySQL.
- Story count/cover joins and story detail media rows now enforce the active relationship/creator boundary in SQL. The story DTO includes nullable `coverMediaType` so App uses a static cover instead of treating a signed video URL as an image.
- App story list/location/detail refresh on navigation focus, which obtains fresh signed links after returning to a screen; Web TanStack Query follows window-focus refetch behavior. This does not add an in-screen expiry timer.
- App album/story uploads no longer send device-local thumbnail URIs. Photo media uses the signed primary URL; video cards have a play placeholder and the existing viewer opens the signed URL.
- Server lint/build, Web API generation/lint/build, App lint/typecheck, and `git diff --check` pass. Web build retains the existing Zod annotation and large-chunk warnings.
- Album/story lists are unpaginated, so each authorized read signs all returned object-key media; revisit pagination or on-demand signing as media volume grows.
- No live database, R2, browser, or device was used; actual signature validity, expiry after 300 seconds, and cross-user access were not integration-tested.
