// Tiny typed fetch client for the yunto backend (server/ on :3001).
const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";
const TOKEN_KEY = "yunto_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export async function api<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(BASE + path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
  });
  if (!res.ok) throw new Error(`API ${res.status} ${path}`);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function login(email: string, password: string) {
  const r = await api<{ token: string; user: unknown }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(r.token);
  return r;
}

/** Ensure a session exists — auto-login as the seeded admin for the demo. */
export async function ensureSession() {
  if (getToken()) return;
  try {
    await login("admin@yunto.com", "password123");
  } catch {
    /* backend may be offline; screens fall back to their local sample data */
  }
}
