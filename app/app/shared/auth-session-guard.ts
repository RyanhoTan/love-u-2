export function shouldInvalidateAuthSession(
  storedToken: string | null,
  rejectedToken: string,
) {
  return Boolean(storedToken) && storedToken === rejectedToken;
}
