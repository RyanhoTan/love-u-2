# Phase 54 context — App Favorites list states

## Observed baseline

- Favorites has three inner tabs and conditionally mounts only the selected Stories, Photos, or Videos grid.
- Each grid starts with an empty array and a loading flag, catches a failed GET only to toast, then clears loading; the empty copy is shown whether the read succeeded or failed.
- Switching to another subtab unmounts the previous component, but its pending request has no cleanup guard.

## Decision

- Model loading, error, and ready states separately for each independent GET.
- Use accessible visible errors with retry; leave existing success-empty text untouched and reachable only from ready state.
- Invalidate pending requests on retry and effect cleanup so a late response after subtab navigation cannot call stale state setters.

## Implemented behavior

- Each grid now uses `loading | ready | error`, with accessible loading/error/retry UI.
- Existing empty copy is only reachable from `ready` after its GET returns successfully (including a successful empty/filter-empty result).
- Request IDs suppress superseded retry results; effect cleanup invalidates a pending request when a different Favorites subtab unmounts the grid.
- The story/photo/video APIs, media filters, routes, and viewers are unchanged.

## Unresolved / deferred

- App has no configured UI test runner; interaction will be checked with lint, TypeScript, and static review, not on-device testing.
- No live service, database, or R2 behavior is exercised.
