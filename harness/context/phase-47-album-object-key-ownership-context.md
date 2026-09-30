# Phase 47 context — album object-key ownership

## Observed baseline

- Album media creation and story creation shared a local assertion that only rejected `..` and required the caller's ID to appear in any path segment.
- That predicate accepted keys such as `interact/<userId>/voice.webm` and `other/<owner>/.../<userId>/file`, despite album uploads using `album/<userId>/...`.
- Wish media already uses `isAlbumObjectKeyOwnedByUser`, which checks the expected prefix but did not reject dot-navigation or empty suffix segments.

## Decision

- Use the shared exact prefix predicate for Album and Story writes and reject malformed suffix segments there so all upload consumers share the same ownership rule.
- Leave reads of already-persisted media and the relationship authorization checks unchanged.

## Implemented behavior

- `isAlbumObjectKeyOwnedByUser` requires the exact current-user album namespace, then rejects empty, `.` and `..` suffix segments.
- Album media and story media creation use the shared predicate; Wish cover and process-record writes keep the same shared guard.

## Unresolved / deferred

- No DB/R2 integration test is configured; tests validate the pure ownership predicate and code review confirms handler call sites.
- Existing database keys are not migrated or audited by this phase.
