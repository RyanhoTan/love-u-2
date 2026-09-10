export function displayName(user: {
  username: string;
  nickname: string | null;
}) {
  return user.nickname?.trim() || user.username;
}

export function formatAnniversaryDot(date: string | null | undefined) {
  if (!date) {
    return null;
  }

  return date.replace(/-/g, ".");
}
