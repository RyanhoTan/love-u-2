# Phase 31 context — Private voice messages in partner chat

## Observed baseline

- `server/src/router_handler/upload.ts` writes private objects and returns `{ key }`; it intentionally does not return a public URL.
- Web `web/src/features/partner-chat/use-partner-chat.ts` reads `uploaded.url` and sends it as `audioUrl`. App `app/app/home/(tabs)/interact.tsx` also reads `upload.url` before calling the chat hook. The Web OpenAPI upload response incorrectly still includes `url`.
- `server/src/ws/partnerChat.ts` accepts and stores only `audio_url`; key-backed private voice cannot currently be registered.
- `partner_chat_messages` has `audio_url` but no object-key column. Schema setup adds missing nullable columns, so a new nullable key column is an additive compatibility change.
- WebSocket connection setup requires a currently bound relationship. Pending and live message serialization currently uses `audio_url` directly. The clients persist chat history locally, so storing signed URLs from WS would leave expired links in local history.
- `server/src/router_handler/upload.ts` exports `createMediaReadUrl`, which already signs R2 object keys for 300 seconds.
- Existing media reads set `Cache-Control: private, no-store`; use the same rule for the chat audio URL endpoint.
- `web/src/api/client.ts` and `app/app/shared/api-client.ts` provide authenticated request helpers. App's `requestWithAuth` accepts a token override.
- The existing WS handler does not revalidate or revoke an established connection after relationship unbind. This phase's playback endpoint can enforce current relationship state, but does not close that independent socket gap.

## Scope rules

- New writes use `audio_object_key`; legacy `audio_url` remains untouched for compatibility.
- A private audio read must identify a specific stored audio message, confirm the requester is its sender/receiver, and join it to that same currently bound relationship with the requester as a member.
- Never return `audio_object_key`; only an authorized endpoint may return a short-lived URL. Do not store the URL in DB or write it into local chat history.
- Never remove or rewrite existing chat rows or R2 objects as part of this work.

## Unresolved / deferred

- Production migration execution, backup/restore, and database topology are not available here.
- R2 upload, signed URL expiry, actual playback in browsers/devices, and live multi-client delivery require integration credentials/devices and remain unavailable.
- A signed URL already issued remains valid until expiry after unbind. Active WS connection revocation, full chat history sync, offline/order semantics, and deduplication remain separate P0 review items.
- Existing schema initialization runs on service startup. A real deployment must verify the additive ALTER in its target database before release.
