# Phase 48 context — hidden Web daily-interaction routes

## Observed baseline

- Today homepage has no links to `/status` or `/sentence`, and the PRD says those features are not exposed.
- `todayRoutes` nevertheless registers both URLs as generic placeholders. The route descriptors add “完成” and “留下” buttons with no working business flow.
- `web/src/routes/index.tsx` includes an authenticated `path: "*"` redirect to `/` after domain routes.

## Decision

- Remove the two obsolete route entries so direct/old URLs fall through to the existing wildcard redirect.
- Keep shared placeholder infrastructure for other route placeholders outside these hidden P1 features.

## Implemented behavior

- `todayRoutes` keeps only the actual Today homepage; unknown old paths are handled by the existing `/` fallback.
- The shared `page()` helper remains because other route modules still use the generic placeholder component.

## Unresolved / deferred

- No live browser navigation test is available; route fallback is verified from the route tree and Web build.
- Status and One Line remain intentionally unimplemented pending their real PRD R2 flow.
