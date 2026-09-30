# Phase 50 context — App album story read states

## Observed baseline

- Story list and detail both had loading indicators.
- On list/detail request failure, each handler showed a toast and stopped loading, but did not store an error state.
- The list then displayed “还没有时光故事”; detail showed “这个故事里还没有媒体”, both backed only by the initial empty arrays rather than a successful empty response.

## Decision

- Add accessible error and retry branches while keeping the existing success-empty states.
- Use request sequencing and focus cleanup in both screens so late results cannot overwrite newer state after retries or navigation.

## Implemented behavior

- Story list and detail each keep a loading state and display an accessible error/retry state when their existing GET request fails.
- Only successful empty responses render the no-story/no-media messages.
- Request IDs and focus cleanup suppress stale list/detail responses.

## Unresolved / deferred

- No App unit-test runner or device integration environment is configured.
- Story create, favorite, and media-viewing behaviors are outside this phase.
