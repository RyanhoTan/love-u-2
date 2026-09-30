# Phase 55 context — App wish record creation states

## Observed baseline

- `CreateRecord` requests the target wish once with `getWishById`.
- The catch handler only emits a toast and `finally` clears `loadingWish`.
- The wish card then shows fallback copy and the record editor, media picker, and save action remain available without a confirmed target summary.
- Draft restoration is keyed to the route wish ID and can remain unchanged if the form is gated until target loading succeeds.

## Decision

- Treat target-wish read success as a precondition to displaying the editor, while leaving server-side authorization on record creation unchanged.
- Expose a visible retry for valid IDs; provide back navigation for invalid IDs.
- Suppress stale wish results after retry or navigation.

## Implemented behavior

- The route now shows loading/error/retry before showing any record editor fields.
- The wish card uses only the successful `getWishById` response; the fallback title and hard-coded “planning” status are no longer used.
- The save handler additionally refuses to run unless the target wish is confirmed, while the server-side POST authorization remains authoritative.
- Draft restoration, media upload, and record payload are unchanged and become visible after successful wish loading.
- A request sequence and effect cleanup suppress stale responses after retry or unmount/route change.

## Unresolved / deferred

- App has no configured UI test runner; behavior will be checked through lint, TypeScript, and static review rather than a device.
- No live API, media upload, database, or R2 behavior is exercised.
