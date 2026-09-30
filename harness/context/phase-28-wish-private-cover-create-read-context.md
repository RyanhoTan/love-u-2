# Phase 28 context — Wish private cover create/read

The authenticated upload handler returns `{ key }` and does not expose a public URL. The app and Web wish creation flows both read `result.url`; app then posts it as `cover`, while Web uses it for both preview and persistence. `createWishSchema.cover` accepts a URL or empty string. Wishes currently have only `cover VARCHAR(2048)`, so there is no field for a private object key.

`findWishById`, list, recycle-bin, and mutation handlers perform existing user/relationship authorization before calling `serializeWish`. A nullable `cover_object_key` column preserves old `cover` data while enabling new private writes. The serializer is async; all callsites await it, and responses containing Wish covers set `Cache-Control: private, no-store`. The response field remains named `cover`, so existing clients render it without receiving the raw object key.

Object keys use the authenticated upload path `${folder}/${userId}/...`. Create schema limits private wish covers to a well-formed `album/<userId>/<file>` key; the handler validates that the owner segment matches the authenticated user before insertion. The existing `createMediaReadUrl` signs for 300 seconds after Wish authorization; the signed URL is not persisted.

No database/R2/device integration was run. If upload succeeds but the Wish INSERT fails, the object may remain unreferenced; this phase explicitly does not delete objects. Signed links are refreshed when Web regains window focus and when App Wish screens regain focus; a screen left continuously focused beyond 300 seconds has no automatic timer renewal. Add automatic orphan cleanup/compensation only in a separate lifecycle phase after its retry and ownership semantics are designed.
