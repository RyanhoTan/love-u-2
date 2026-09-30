# Phase 33 context — Server-backed partner chat history

## Observed baseline

- `partner_chat_messages` stores text/audio rows, sender and receiver, `relationship_id`, `sent_at`, `delivered_at`, and `read_at`.
- New private audio rows store `audio_object_key`; the existing playback REST handler authorizes the message against a current bound relationship and message participation.
- WebSocket ready replays only rows with `delivered_at IS NULL`; it does not replay delivered history.
- Web and App maintain up to 3,000 locally cached messages under a relationship-scoped storage key. There is no REST history request on ready.
- Unbind changes relationship status, and Phase 32 closes/revalidates live connections. Historical post-unbind ownership is explicitly unresolved.

## Scope rules

- A history request must bind together authenticated user, exact relationship ID, bound status, exact pair membership, and queried message participants.
- Use a stable exclusive `beforeId` cursor; return ascending results for display.
- Serialize only message data needed by the client. Never expose private audio keys or mint key-backed signed URLs in a history response; keep legacy `audio_url` rows compatible.
- Clients merge server pages with current messages by server ID while preserving local `clientMessageId` identity for a user's optimistic sends.

## Unresolved / deferred

- Historical message ownership, deletion/export, and visibility after unbind remain a product decision; this endpoint intentionally makes no new access available once unbound.
- Real DB, browser, native-device and scroll-anchor integration tests are unavailable in this workspace.

## Implemented behavior observed

- `GET /partner-chat/messages` requires `relationshipId`, optionally accepts an exclusive `beforeId` and a `1..100` `limit` (default 50), and sends `Cache-Control: private, no-store`.
- The handler checks that the caller is a member of that exact bound relationship, then constrains message sender/receiver to the relationship's two users. An unbound or stale relationship ID returns 404.
- Pages are queried by descending auto-increment ID with a `limit + 1` probe, reversed to chronological server-ID order, and expose `nextBeforeId` only when more rows remain.
- Key-backed audio history never includes `audio_object_key`; legacy `audio_url` remains for compatibility. Private playback is still refreshed through the existing per-message authorization endpoint.
- Both clients request the newest page after WebSocket ready and provide “load earlier messages” / retry controls. Local cache, server pages, optimistic sends, and real-time messages are merged without replacing a client's own optimistic ID.
