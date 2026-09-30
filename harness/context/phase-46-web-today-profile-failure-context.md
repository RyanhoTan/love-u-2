# Phase 46 context — Web Today profile failure state

## Observed baseline

- AuthProvider keeps the last session user while refreshing profile and sets `profileStatus` to `loading`, `ready`, or `error`.
- TodayPage checked `loading` only. Both `idle` and `error` rendered the same fallback as a confirmed unbound profile, including the “去绑定” button and unbound hero.
- Anniversary and recent-media components are rendered only when a partner is present, so keeping the page branch on `profileStatus === "ready"` also prevents those queries on failed/unknown profile state.

## Decision

- Treat only `ready` profile data as authoritative for the relationship state. Unknown, loading, and error states must not look like “unbound”.
- Use the existing QueryError retry control and AuthProvider `refreshProfile`; do not add a separate endpoint or session behavior.

## Implemented behavior

- `idle`/`loading` now render a neutral loading message.
- `error` now renders an accessible failure and retry control. The unbound call to action and empty hero cannot render in this state.
- Bound/unbound profile content, plus anniversary and album queries, are gated behind `ready` profile data.

## Unresolved / deferred

- No Web unit-test runner or authenticated browser/server environment is configured. UI behavior is verified through build/lint and focused static review.
