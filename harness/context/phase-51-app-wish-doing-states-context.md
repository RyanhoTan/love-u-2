# Phase 51 context — App wish doing-page states

## Observed baseline

- `app/app/home/wish-list/[id]/doing.tsx` loaded the wish and records on focus, but modeled no request status.
- On failure it emitted a toast and left the screen rendering the fallback title “一起去看海”, the “doing” tag, and “暂无记录，快去添加第一条吧。”
- The “结束愿望” and “添加记录” actions were visible before any successful response.
- Phase 49's memory page already uses loading/error/ready state, an error retry, a request sequence, and focus cleanup for the same API.

## Decision

- Gate the doing-page content and wish-specific actions on a successful `getWishRecords` response.
- Show a retryable error for a valid ID and a back action for an invalid ID.
- Prevent older requests from overwriting newer retry or navigation state.

## Implemented behavior

- The screen short-circuits to a loading view until `getWishRecords` succeeds.
- A failed read shows its error and a retry button without the wish title, empty-record message, finish button, or add-record button.
- An invalid ID shows a back action rather than a retry loop or fabricated Wish content.
- A monotonically increasing request ID and focus cleanup ignore stale responses from earlier requests.
- The successful records, media viewers, and finish API call are unchanged.

## Unresolved / deferred

- App has no configured UI test runner; interaction will be validated through lint, TypeScript, and static review rather than a device.
- Real API, database, and media URL behavior remain unverified in this phase.
