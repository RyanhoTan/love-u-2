# Phase 66 context — Shared couple calendar

User confirmed one timezone per couple, initially Asia/Shanghai. Current couple-space and userinfo
duplicate UTC elapsed-time day counts, while anniversary uses server-local today/local-midnight
differences. Web preview uses browser-local today. These disagree near midnight and need one rule.

Stage 66 provides persistence, validation and server calendar semantics; Stage 67 applies the
contract to frontend settings/preview/header rollover. Existing Feb 29 yearly fallback is Feb 28;
future first occurrences must stay in their original future year. Dates remain calendar values,
not instants; changing timezone changes the definition of today, not saved dates.

Completed: couple-space, userinfo and anniversary share `server/src/couple/calendar.ts`. Lists
include one response-level todayDate/timeZone; create/update serialization obtains timezone via
live authorized relationship joins. DATE_FORMAT returns calendar strings, independent of driver
instant conversion. Partial profile PATCH preserves omitted fields and updates only its selected
still-bound relation/current member; a lookup cannot redirect the write into a later binding.

Old clients can keep sending date-only PATCH. Old Web cached profiles normalize missing metadata
to null; Phase 67 must load authoritative timezone before claiming a ready shared-calendar preview.
No notification dispatch or history/retention policy was added. Default-column migration is only
statically reviewed, not demonstrated on real MySQL. Keep the additive column on code rollback.

Use pure imports and synthetic Node/SQLite fixtures. `schema.ts` imports the real DB pool, so do
not import it in unit tests or run the initializer. Real MySQL migration/HTTP/device tests remain
unverified. Existing Node test infrastructure is used; no new dependency/framework is needed.
