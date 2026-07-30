import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

/**
 * Typed fetch client for the Yunto backend.
 *
 * Mirrors web/src/api/client.ts, with one structural difference: the web keeps
 * the JWT in localStorage (synchronous) while native uses the Keychain /
 * Keystore via SecureStore, which is async. The token is therefore cached in
 * memory after the first read so request paths stay fast.
 */

const TOKEN_KEY = "yunto_token";

/**
 * API origin. Override per build with EXPO_PUBLIC_API_URL; falls back to the
 * deployed instance so a fresh checkout runs against something real.
 */
export const BASE: string =
  process.env.EXPO_PUBLIC_API_URL ??
  (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl ??
  "http://13.233.112.94/api";

let cachedToken: string | null | undefined;

export async function getToken(): Promise<string | null> {
  if (cachedToken !== undefined) return cachedToken;
  try {
    cachedToken = await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    // SecureStore is unavailable on web/simulator edge cases — fail open to
    // logged-out rather than crashing the app on boot.
    cachedToken = null;
  }
  return cachedToken;
}

export async function setToken(t: string): Promise<void> {
  cachedToken = t;
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, t);
  } catch {
    /* keep the in-memory token so the session still works this launch */
  }
}

export async function clearToken(): Promise<void> {
  cachedToken = null;
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    /* already gone */
  }
}

export class ApiError extends Error {
  constructor(public status: number, public path: string, message?: string) {
    super(message ?? `API ${status} ${path}`);
    this.name = "ApiError";
  }
}

export async function api<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const res = await fetch(BASE + path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
  });

  if (!res.ok) {
    // A rejected token means the session is over; drop it so the router can
    // bounce to /login instead of retrying with a credential that cannot work.
    if (res.status === 401) await clearToken();
    let detail = "";
    try {
      detail = ((await res.json()) as { error?: string }).error ?? "";
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, path, detail || undefined);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function login(email: string, password: string) {
  const r = await api<{ token: string; user: unknown }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  await setToken(r.token);
  return r;
}

export async function logout() {
  await clearToken();
}
