# Phase 66 — Store shared couple timezone and derive calendar counts

## Status and authorization

Complete. Active PRD R1/P0 Goal; user selected one stored shared timezone per couple,
initially Asia/Shanghai. PRD-DAY-001, PRD-COUPLE-001, PRD-TODAY-001.

## Scope

- Add non-null `couple_relationships.time_zone`, default Asia/Shanghai, via the existing additive
  schema mechanism; preserve all date-only values and existing data.
- Accept a validated named timezone or UTC in the existing couple-space PATCH. Make its fields
  optional but require at least one; date-only PATCH stays compatible and does not reset timezone.
- Constrain the final update to the selected still-bound relation and authenticated member.
- Unify relationship day counts and anniversary occurrence/countdown calculations around one
  timezone-derived calendar date per response; day differences use UTC calendar ordinals (not
  elapsed local-midnight hours). Keep existing Feb 29 → Feb 28 non-leap-year behavior.
- Include shared timezone/calendar-date metadata in couple-space, userinfo couple summary, and
  anniversary lists; read anniversary timezone through its authorized relationship join.
- Read database DATE columns as YYYY-MM-DD strings so driver instant conversions cannot shift
  the saved date under a separately configured DB timezone.
- Update OpenAPI/generated types, App API types, and Web cached-user normalization.
- Use isolated calendar/schema and synthetic in-memory SQL tests, with no env/DB/R2 access.

## Non-goals and continuation

Frontend settings, local preview/header calculations and live date rollover are Phase 67, already
authorized. No notification service, deployment, live migration, production data or history policy.
Neither this stage nor helper tests alone establishes full PRD-DAY acceptance or a mergeable module.

## Acceptance

1. Stored/new relationships default to Asia/Shanghai. Partial updates preserve omitted fields;
   invalid timezones/dates and empty updates are rejected. Another user or revoked relationship
   cannot be changed by the final SQL, even if lookup previously succeeded.
2. Equal instants produce the selected timezone's calendar date. Calendar differences and
   counts agree across UTC, Shanghai, New York DST, leap-day/year-end and same-day cases.
3. All three server count sources use the shared helper; date-only input values are not converted
   between timezones. A future first yearly occurrence must not be reported before its start date.
4. Existing authenticated handlers and private resource checks remain intact. Client DTO types and
   API contract reflect additive metadata and the compatible partial PATCH.
5. Server tests/lint/build, Web API generation/lint/build, App lint/typecheck and diff check pass.

## Schema compatibility and recovery

The existing schema initializer will add `time_zone VARCHAR(64) NOT NULL DEFAULT 'Asia/Shanghai'`
when missing, and new-table SQL uses the same definition. Existing dates and relationship IDs
are unchanged; old clients omit timezone and keep their existing date PATCH semantics. A deployed
old schema must be upgraded before the new server reads the column. No live initializer is run
here; MySQL DDL locking, old-row defaults and real auth/API behavior still need safe integration.

Before real deployment, back up relationship rows/schema and verify the migration on a disposable
copy. Code rollback can retain the additive column and its saved values; do not drop it or reverse
calendar dates. This change does not authorize production migration or deployment.

## Results and limits

- Shared calendar/schema and exact production profile UPDATE passed 10 focused cases; full server
  suite passed 45/45 across 16 suites. Calendar cases separately passed 6/6 under TZ=UTC and
  TZ=America/New_York, including selected-zone midnight, DST, leap-day and future annual starts.
- Server lint/build, Web API generation/lint/build, App lint/typecheck and diff check passed.
  Web build retains existing Zod annotation and >500 kB chunk warnings; no build error occurred.
- Static review confirms both table definitions/defaults and startup schema-before-listen ordering;
  no MySQL initializer ran. Synthetic SQLite is not MySQL migration/concurrency/HTTP evidence.
- No env/credentials, real DB/R2, user data, device, push or deployment was accessed. Phase 67 and
  real integration remain open; the complete anniversary/TODAY module is not declared accepted.
