import AsyncStorage from "@react-native-async-storage/async-storage";
import BRAND from "@brand";
import { shouldInvalidateAuthSession } from "./auth-session-guard";

export const AUTH_STORAGE_KEY = BRAND.storage.authSession;
export const LEGACY_AUTH_STORAGE_KEY = "love-u-auth-session";

let authStorageMutationQueue: Promise<void> = Promise.resolve();
const authInvalidationListeners = new Set<(token: string) => void>();

function enqueueAuthStorageMutation<T>(operation: () => Promise<T>) {
  const result = authStorageMutationQueue.then(operation, operation);
  authStorageMutationQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

export async function getStoredAuthToken() {
  const storedSession =
    (await AsyncStorage.getItem(AUTH_STORAGE_KEY)) ??
    (await AsyncStorage.getItem(LEGACY_AUTH_STORAGE_KEY));

  if (!storedSession) {
    return null;
  }

  try {
    const session = JSON.parse(storedSession) as { token?: unknown };
    return typeof session.token === "string" && session.token
      ? session.token
      : null;
  } catch {
    return null;
  }
}

export function persistStoredAuthSession(token: string, user: unknown) {
  const session = JSON.stringify({ token, user });
  return enqueueAuthStorageMutation(async () => {
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, session);
    await AsyncStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
  });
}

export function removeStoredAuthSession() {
  return enqueueAuthStorageMutation(() =>
    AsyncStorage.multiRemove([AUTH_STORAGE_KEY, LEGACY_AUTH_STORAGE_KEY]),
  );
}

export function removeStoredAuthSessionIfTokenMatches(rejectedToken: string) {
  return enqueueAuthStorageMutation(async () => {
    const storedToken = await getStoredAuthToken();
    if (!shouldInvalidateAuthSession(storedToken, rejectedToken)) {
      return false;
    }

    await AsyncStorage.multiRemove([AUTH_STORAGE_KEY, LEGACY_AUTH_STORAGE_KEY]);
    return true;
  });
}

export function subscribeToAuthInvalidation(listener: (token: string) => void) {
  authInvalidationListeners.add(listener);
  return () => {
    authInvalidationListeners.delete(listener);
  };
}

export function notifyAuthInvalidation(token: string) {
  for (const listener of authInvalidationListeners) {
    try {
      listener(token);
    } catch {
      // A listener failure must not replace the original API error.
    }
  }
}
