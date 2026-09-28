import { callGateway } from "./gateway";

/**
 * Resolves a user's current session epoch (tokenVersion) so requireSession can
 * reject tokens minted before a logout / "sign out everywhere".
 *
 * A short-TTL in-memory cache keeps this from adding a gateway round-trip to
 * every authenticated request — revocation therefore propagates within at most
 * CACHE_TTL_MS. On a gateway error this returns null and authenticated route
 * handlers fail closed because revocation state cannot be verified.
 */

const CACHE_TTL_MS = 30_000;
const cache = new Map<string, { version: number; expiresAt: number }>();

export async function currentTokenVersion(email: string): Promise<number | null> {
  const now = Date.now();
  const cached = cache.get(email);
  if (cached && cached.expiresAt > now) return cached.version;

  try {
    const res = await callGateway<{ version?: number; error?: string }>(
      `/api/auth/session-version?email=${encodeURIComponent(email)}`,
    );
    if (typeof res.version !== "number") return null;
    cache.set(email, { version: res.version, expiresAt: now + CACHE_TTL_MS });
    return res.version;
  } catch {
    return null;
  }
}

/** Drops the cached version so the next check re-fetches immediately (used right after a logout). */
export function invalidateTokenVersion(email: string): void {
  cache.delete(email);
}

/**
 * Like currentTokenVersion, plus whether this token's device session is still
 * live (not signed out from the Security page). Cached per email+sid for the
 * same short TTL, so revoking a device takes effect within CACHE_TTL_MS.
 * Returns null when it cannot be verified, so callers fail closed.
 */
const stateCache = new Map<string, { version: number; sessionActive: boolean; expiresAt: number }>();

export async function currentSessionState(email: string, sid: string): Promise<{ version: number; sessionActive: boolean } | null> {
  const key = `${email}|${sid}`;
  const now = Date.now();
  const cached = stateCache.get(key);
  if (cached && cached.expiresAt > now) return cached;

  try {
    const res = await callGateway<{ version?: number; sessionActive?: boolean }>(
      `/api/auth/session-version?email=${encodeURIComponent(email)}&sid=${encodeURIComponent(sid)}`,
    );
    if (typeof res.version !== "number") return null;
    const entry = { version: res.version, sessionActive: res.sessionActive !== false, expiresAt: now + CACHE_TTL_MS };
    stateCache.set(key, entry);
    return entry;
  } catch {
    return null;
  }
}

/** Forgets a device's cached state so a revoke is felt on the very next request from this server. */
export function invalidateSessionState(email: string, sid: string): void {
  stateCache.delete(`${email}|${sid}`);
}
