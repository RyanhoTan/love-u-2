# Phase 56 context — App wish recycle read states

## Observed baseline

- `WishRecycleBin.refreshWishes` sets `loading`, requests `getDeletedWishes`, and on failure only shows a toast.
- Its `finally` clears `loading`; the retained initial empty array then satisfies the empty-bin condition and presents failure as a successful empty result.
- The screen does not have an in-page loading indicator or retry control.
- Restore and permanent-delete operations call their existing mutation APIs and then refresh the list.

## Decision

- Separate read state into loading, error, and ready, and gate both empty copy and rows on successful response.
- Keep mutation behavior and server semantics unchanged.
- Use a monotonically increasing request ID plus `useFocusEffect` cleanup to ignore responses from earlier requests or a blurred screen.

## Implemented behavior

- The recycle screen displays loading, error/retry, and ready states for `getDeletedWishes`.
- It clears prior rows while a refresh is in progress and only renders empty copy or returned rows after success.
- Monotonic request IDs prevent stale results after a retry, while focus cleanup invalidates in-flight reads on blur/unmount.
- Restore and permanent-delete mutation calls, confirmations, and success/error feedback are unchanged.

## Unresolved / deferred

- App has no configured UI test runner; behavior is verified via lint, TypeScript, and static review rather than a device.
- No live API, database, or object-storage behavior is exercised.
