# Phase 57 context — App wish-list read states

## Observed baseline

- `refreshWishes` requests `getWishes`, then replaces the list on success.
- On failure it only shows a toast; existing rows remain in component state and remain selectable after a focus refresh fails.
- The bulk-delete handler consumes the current selected IDs and does not verify that they came from a successful current list load.
- Category scenes render only wish rows and otherwise remain blank; there is no explicit empty-category state.

## Decision

- Represent list reads as loading/error/ready and clear rows and selections at the start of each refresh.
- Hide category scenes until the current read succeeds; only successful reads can show category-specific empty feedback.
- Guard bulk deletion by successful read state in addition to retaining the existing UI affordance checks.
- Invalidate in-flight responses after a newer request or screen blur/unmount.

## Implemented behavior

- The list now displays loading, error/retry, and ready states; category tabs are mounted only after a successful read.
- Refresh clears old rows, selected IDs, edit mode, and map visibility before requesting current server data.
- Successful empty categories render a short category-specific message.
- A sequence guard suppresses older responses, and focus cleanup invalidates requests on blur/unmount.
- The bulk-delete handler requires a ready list; a confirmation opened for a prior list version is rejected if another request starts before confirmation. Existing DELETE calls and confirmation copy are unchanged.

## Unresolved / deferred

- App has no configured UI test runner; behavior is verified via lint, TypeScript, and static review rather than a device.
- No live API or database behavior is exercised.
