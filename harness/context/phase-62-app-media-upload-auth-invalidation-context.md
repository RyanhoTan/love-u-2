# Phase 62 context — App upload authentication

App `requestWithAuth` handles a 401 by removing the stored session only if it still contains
the rejected token, then notifying the auth provider, which independently checks its in-memory
token. This protects a newer login from a delayed response.

The album and wish media upload functions were exceptions: they built authenticated raw
`fetch` requests directly and surfaced a generic upload failure without invalidating a stale
session. The album helper is used for album/story media and partner-chat audio; the wish helper
is used for wish covers and record attachments. Phase 62 routes only those authenticated API
requests through a shared raw-response helper. Fetching the local file URI remains unauthenticated
and unchanged.

The App package currently has no configured test runner; static source review, lint, and
TypeScript validation are the available checks for this isolated client change.
