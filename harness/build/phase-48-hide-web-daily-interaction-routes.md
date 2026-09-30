# Phase 48 — Remove hidden Web daily-interaction routes

## Status

`Complete`

## Source inputs

- `PRD.md` states that Today Status and One Line are not exposed until they have a real persistence and visibility flow.
- `web/src/routes/today.tsx` still registered `/status` and `/sentence` placeholder pages with “完成” and “留下” header actions, despite no real handlers or backing API.
- The authenticated application router already has a wildcard route that redirects unknown paths to `/`.

## Objective

Ensure old/deep-linked Web routes cannot imply that the unfinished daily interaction features are usable.

## Scope

- Remove only the `/status` and `/sentence` placeholder route entries from `todayRoutes`.
- Keep the Today homepage route and generic placeholder component used by other domains.
- Confirm direct unknown paths reach the existing root wildcard fallback.
- Update PRD and harness evidence.

## Non-goals

- No P1 status/One Line implementation, persistence, API, or database changes.
- No changes to mobile routes or generic placeholders for real nested flows in other domains.
- No new routing dependency or test framework.

## Material decisions

- A deep link to an unavailable feature should follow the existing unknown-route fallback rather than show an actionable-looking placeholder page.
- Keep the shared `page()` helper and `PlaceholderPage` because other routes still use them.

## Acceptance criteria

- `todayRoutes` registers only the Today homepage; there are no `status` or `sentence` entries.
- No “完成”/“留下” placeholder actions remain on the Web Today routes.
- Existing authenticated wildcard redirects unknown paths to `/`.
- Web lint/build and `git diff --check` pass; no status/One Line implementation is introduced.

## Verification plan

- Remove only the two route objects and unused imports.
- Run `pnpm --dir web lint` and `pnpm --dir web build`.
- Run a targeted `rg` check against `web/src/routes/today.tsx` and statically verify the wildcard fallback in `web/src/routes/index.tsx`.
- Do not access a browser, API, or external service.

## Results

- Removed the `/status` and `/sentence` entries and their unused route descriptor imports from `todayRoutes`.
- Kept the Today homepage and all shared placeholder infrastructure used by other domains.
- Unknown paths still resolve through the authenticated router's existing redirect to `/`.

## Verification results

- `rg` found no status/sentence route or “完成”/“留下” placeholder action in `web/src/routes/today.tsx`.
- Static route review confirmed the catch-all `{ path: "*", element: <Navigate to="/" replace /> }` remains registered.
- Passed `pnpm --dir web lint`, `pnpm --dir web build`, and `git diff --check`.
- Web build retains existing Zod/Rollup comment-position and >500 kB chunk warnings.
- No live browser, API, or external service was accessed.

## Handoff

Continue with independent PRD R1/P0 gaps; status and One Line remain intentionally unimplemented pending R2.
