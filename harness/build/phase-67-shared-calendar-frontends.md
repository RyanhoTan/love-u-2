# Phase 67 — Apply shared calendar rules in App and Web

## Status and authorization

In progress. Active PRD R1/P0 Goal and confirmed per-couple timezone policy; depends on completed
Phase 66 (`06ef067`). PRD-DAY-001, PRD-TODAY-001 and PRD-COUPLE-001.

## Scope and small-commit sequence

1. Web: show/edit the stored timezone in Couple Space with validated partial PATCH, honest pending/
   error states, and no reset of existing calendar dates. Derive new/edit previews from authoritative
   response todayDate, not browser-local today; show the shared date in Today. Refresh calendar
   sources at the selected zone's midnight and browser resume/focus; invalidate after settings save.
2. App: show/edit the stored timezone in a real relationship screen. Its current finish screen has
   hardcoded names/date/day count and bind button only navigates; replace these with authenticated
   binding and relationship responses before treating that screen as ready. Keep calendar inputs
   date-only. Refresh home/list/relationship data on focus, resume and zone-day rollover.
3. Both: select the next upcoming anniversary by nextOccurrenceDate and shared today; past once-only
   dates must not masquerade as today's upcoming event. Explain unavailable calendar metadata rather
   than assuming default Beijing for a potentially customized relationship.
4. Verify pure calendar/preview/next-day scheduling contracts against server fixtures using existing
   Node tests (no new framework); run affected lint/typecheck/build and review failure/cleanup paths.

Each independent completed small point gets its own Conventional Commit. The full stage remains
open until both clients satisfy the scope; a Web-only commit is not a completed P0 module.

## Non-goals

No notification delivery, real MySQL/R2/API writes, deployment, production/credential access,
new unbind/history/retention policy, or unrelated visual redesign. Existing server auth/schema/API
contract stays authoritative; only pure test infrastructure may be extended for frontend fixtures.

## Acceptance

- Either bound partner can edit timezone using authenticated partial PATCH; only confirmed server
  success replaces displayed settings. Invalid values, requests in progress and save/load failures
  are visible; a date-only edit and timezone-only edit preserve the other field.
- Web form previews use the list response's timezone/today metadata and match server occurrence
  rules for midnight, DST, leap-day, future first annual date and invalid/missing input cases.
- Both homes use real shared-calendar dates/counts and the earliest non-past nextOccurrenceDate;
  lists retain past records with honest labels. No mock relationship success screen remains.
- Day-boundary timers honor the saved zone (including DST), stop on cleanup, and refresh after
  resume/focus. Failed refresh offers retry, not a fabricated count or success.
- Existing server tests and affected client lint/typecheck/build pass; actual device/HTTP/migration
  coverage remains separately recorded and cannot be replaced by pure helper tests.

## Compatibility and recovery

Older cached Web user records may lack calendar metadata; wait/retry authoritative reads instead
of overwriting an unknown timezone. Date values stay unchanged. Rollback client code without
dropping the server timezone column. No new dependency, DB alteration, or external write is needed.

## Web implementation slice — 2026-09-30

Implemented Web timezone settings/partial save, server-date new/edit previews and Today header,
upcoming-by-date selection with past labels, and server refresh at the saved zone's next midnight/
resume/focus. Missing metadata does not silently become Beijing. The profile refresh rechecks the
same session token before caching, so added background reads cannot restore a logged-out session.

Eleven pure fixtures cover server rule agreement, selected-zone boundaries, DST 23/25-hour scheduling,
past/future annual dates, invalid/missing input, weekday formatting, resume/disposed callbacks, identity/
partner query keys and homepage/anniversary calendar matching. Results are not combined when reference
dates/zones differ; the view offers synchronization/retry. Query keys contain public IDs, never tokens.
Full server suite passed 56/56 across 17 suites; focused Web fixtures passed under TZ=UTC and
TZ=America/New_York. Server lint/build and Web lint/build passed (existing build warnings remain).
Tests import only pure frontend files, not Web Zod/React/config; server tests do not require Web
dependencies. No new test framework was introduced.

This is implementation/static/pure-regression evidence, not browser interaction, actual HTTP,
device or MySQL evidence. The full stage remains In progress: App binding/real relationship/settings
and home/list rollover are still absent, and full cross-client/module acceptance has not been met.
