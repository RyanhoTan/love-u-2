# Phase 65 context — Album relationship isolation

Album scope was broader than Wish scope: the creator fallback was not limited to unassigned
records. A current couple (users 1 and 3, relationship 20) could see user 1's explicitly assigned
relationship 10 records with former partner 2. Media-ID signing imports the same scope.

This stage changes access predicates, not historical ownership: assigned relationship IDs must
match the active relation; existing NULL-row creator fallback and unbound creator reads stay
compatible pending PRD section 13 decisions. SQL also checks current bound/member state at
execution. Favorite UPDATE must include that predicate, not rely on a preliminary read.

The workspace runs Node 22.23.2 with the built-in experimental `node:sqlite` module available.
Synthetic in-memory tables can execute the production SQL predicates without importing config,
opening MySQL, reading `.env`, or using R2. SQLite covers boolean/NULL/EXISTS/parameter behavior,
not MySQL transaction isolation, drivers, endpoint wiring, or signing validity.

## Implementation evidence

- `server/src/media/albumScope.ts` generates separate predicates using only fixed media, story,
  and legacy-Wish column identifiers. Live membership comes from the correlated relationship
  row, not the prefetched partner IDs. All values use placeholders.
- `album.ts` and `media.ts` use the helper for every data read, including media creation's
  post-insert read before signing. Favorite writes reuse the same alias-safe story predicate.
- Regression tests execute real in-memory SQL for current/old/unrelated relationships, NULL
  fallback, a missing selected relation, nonmembership, revocation, unbound-to-bound change,
  and authorized/unauthorized favorite writes. Initial old behavior failed five cases;
  final server suite is 35/35 with lint/build passing.
- Existing unbound owner access still includes the owner's explicitly assigned old rows;
  NULL rows still share with the current pair. Do not misstate this as a resolved archive or
  retention policy. The fix prevents current partners from seeing explicitly other-relation
  records through the creator fallback.
