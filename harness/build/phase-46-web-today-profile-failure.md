# Phase 46 — Keep Web Today profile failures distinct

## Status

`Complete`

## Source inputs

- `PRD.md` PRD-TODAY-001 requires explicit loading, failure, unbound, and bound states.
- `web/src/features/auth/context.tsx` exposes `profileStatus` as `idle | loading | ready | error` and a `refreshProfile` retry function.
- `web/src/pages/today-page/index.tsx` treated only `loading` specially; both `idle` and `error` fell through to the unbound view and empty couple card.

## Objective

Make Web Today show real bound/unbound content only after profile loading succeeds, and show a recoverable failure instead of implying the user is unbound when the profile request fails.

## Scope

- Render loading for `idle` and `loading` profile states.
- Render a visible error with retry backed by existing `refreshProfile` for `error`.
- Render bound/unbound home content only for `ready`.
- Keep existing couple, anniversary, album, and profile API behavior unchanged.

## Non-goals

- No changes to authentication/session invalidation, profile API, or relationship rules.
- No stale-profile fallback, new retry policy, new dependencies, or test framework.
- No App changes, network calls outside the existing profile request, or browser/account integration.

## Material decisions

- An unknown/loading/error profile must not be interpreted as an authoritative unbound relationship.
- The existing shared `QueryError` component supplies a visible retry action; successful retry returns through the provider's existing `ready` state.
- If profile refresh receives 401, existing auth invalidation behavior remains authoritative and routes the user through normal authentication handling.

## Acceptance criteria

- `idle` and `loading` do not show the “去绑定” CTA or the empty/unbound couple hero.
- `error` shows an accessible failure state with a working retry action and no unbound/bound claims.
- Only `ready` profile data decides whether to render the real bound or unbound view.
- A successful retry reveals the refreshed actual relationship state; a failed retry remains visibly failed.
- Web lint/build and `git diff --check` pass; no auth/API contract changed.

## Verification plan

- Run `pnpm --dir web lint` and `pnpm --dir web build`.
- Statically review all four profile statuses, retry behavior, and suppression of relationship-dependent anniversary/media queries unless the loaded profile is bound.
- No live browser, API account, or external service is accessed.

## Results

- Web Today now shows a loading status while the profile is idle/loading and the real bound/unbound home only when the profile reaches `ready`.
- Profile request failure shows the shared accessible error/retry control. It no longer renders the unbound CTA or unbound couple hero.
- Retry uses the existing `refreshProfile`; the provider's successful refresh returns the page to the normal ready branch. Relationship-dependent anniversary and media queries remain below the ready gate and only mount for a bound relationship.

## Verification results

- Passed `pnpm --dir web lint`, `pnpm --dir web build`, and `git diff --check`.
- Static review covered `idle`, `loading`, `error`, and `ready`, successful retry behavior, and the bound-only anniversary/media sections.
- Web build retains existing Zod/Rollup comment-position and >500 kB chunk warnings.
- No live browser, API, account, or external service was accessed.

## Risks and limitations

- Web has no configured unit-test runner; visual behavior and retry interaction were not exercised in an authenticated browser.
- A failed retry remains on the visible error state; 401 behavior remains delegated to the existing session invalidation flow.

## Handoff

Continue with independent PRD R1/P0 gaps; do not infer that a profile fetch failure means the user has no relationship.
