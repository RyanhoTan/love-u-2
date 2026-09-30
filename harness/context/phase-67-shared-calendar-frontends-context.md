# Phase 67 context — Shared calendar frontends

Previous goal turn is progress: Phase 66 commit `06ef067`, clean worktree, server calendar storage/
metadata plus 45 passing tests. Roadmap status matches evidence; complete P0 modules remain open.

At preflight, Web preview and Today header used browser-local dates; Couple Page edited only anniversaryDate.
anniversary query has server timeZone/todayDate metadata from Phase 66. Use that trusted reference
date for preview; timer/resume events refresh server sources rather than synthesizing new counts.
Clients must not silently apply Asia/Shanghai when a loaded relationship's custom zone is unknown.

App Mine routes to bind; bind currently navigates without calling bindCoupleSpace, and finish shows
mock names/date/520 days with placeholder unbind. Replacing this success path with real authenticated
relationship data is necessary for shared settings. Unbind/history semantics remain undecided;
do not introduce a new unbind path as part of this fix.

Plan small commits for Web, App and remaining cross-client checks. Retain the full Phase 67 scope
even when one slice passes. No env/credentials, real DB/R2/device or production reads/writes allowed.

Web implementation now reads the stored timezone in Couple Page, PATCHes only that field, invalidates
anniversary queries and refreshes profile after confirmed save. A subsequent profile-read failure is
reported as saved-but-refresh-failed, not as a failed save. Dates are not converted. Today and previews
use response todayDate; failed/missing metadata offers retry or suppresses countdown instead of guessing.

`web/src/lib/couple-calendar.ts` is pure. Form types re-export its exact preview function, while tests
import it directly to avoid coupling server-only tests to Web dependencies. Calendar/controller rules
are fixture-checked against server behavior. The hook owns browser focus/visibility listeners, guards
in-flight/obsolete refresh work, and disposes the pure boundary controller. Server responses remain
authoritative for displayed counts; refreshing does not fabricate a newly elapsed day.

Previous interrupted goal turn made real progress (Web code and 53 passing tests) but did not commit.
On continuation its original command handles were missing; no matching live build/lint process remained
before fresh verified checks. Final suite is 56/56. Browser interaction/real HTTP and account-switch
integration remain unverified; token matching before profile cache writes was statically reviewed.

Anniversary query keys now isolate user/partner IDs instead of a global result key. Binding/unbinding
and timezone writes invalidate the whole anniversary prefix. Same-pair rebind relies on those invalidations;
this fixture is not proof of every relationship-revocation/cache race. Other feature query caches need their
own session-scope audit. Today suppresses mixed timezone/day responses and refreshes both sources, with
retry when mismatched metadata remains; the mismatch predicate has a pure regression.

Next small point is App's real binding/finish/zone settings and calendar refresh. No changes to App
were made in the Web slice. Do not mark Phase 67 or the anniversary/couple/TODAY module complete yet.
