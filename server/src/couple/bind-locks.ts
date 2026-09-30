export async function acquireCoupleBindingLocks(
  userIds: readonly number[],
  lockUser: (userId: number) => Promise<void>,
) {
  const lockOrder = [...new Set(userIds)].sort((left, right) => left - right);

  for (const userId of lockOrder) {
    await lockUser(userId);
  }
}
