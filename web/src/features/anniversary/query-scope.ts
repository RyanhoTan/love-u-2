export function anniversaryQueryKey(
  userId: number | null | undefined,
  partnerId: number | null | undefined,
) {
  // Public identity IDs, never tokens, separate cached data across sessions/partners.
  return ["anniversaries", userId ?? null, partnerId ?? null] as const;
}
