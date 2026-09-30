# Phase 49 context — App wish memory states

## Observed baseline

- The memory page invokes `getWishRecords` when focused but has no request status.
- On failure, it emits a toast and retains `wish = null` and `records = []`; the normal gallery then renders a fallback cover, “回忆相册”, zero stats, and “暂无记录”.
- Even after a successful empty response, the summary used `wish.updatedAt` as “最近一次记录”, although that timestamp may reflect an unrelated wish edit.
- Existing App Wish detail/edit screens render explicit loading and retryable error screens.

## Decision

- Gate the full memory gallery and empty state on a successful response, with a retryable error view on failure.
- Use request sequencing and focus cleanup to avoid stale responses repainting a page after a later request/navigation.

## Implemented behavior

- `loading` and `error` short-circuit the normal gallery; error includes a retry action.
- A request sequence plus focus cleanup drops responses from older requests.
- The summary's latest-record date comes from `records` only; a successful empty result does not use wish `updatedAt` as a record date.

## Unresolved / deferred

- No App unit-test runner is configured; interaction is verified through lint, TypeScript, and static review rather than a device.
- The Share and Ellipsis toolbar actions still show “敬请期待”; they are outside this failure-state phase.
