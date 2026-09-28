import { cookies } from "next/headers";
import { normalizeEmail, verifyAuthToken } from "@/app/api/auth/_lib/auth-store";
import { currentSessionState, currentTokenVersion } from "@/app/api/auth/_lib/session-version";

export async function requireSession(): Promise<{ email: string; name?: string; userId: string; sid?: string } | null> {
  const token = (await cookies()).get("auth_token")?.value;
  const session = token ? verifyAuthToken(token) : null;
  if (!session?.email) return null;

  // Reject tokens minted before the user's current session epoch. A missing
  // version means revocation could not be verified, so authenticated APIs fail
  // closed instead of accepting a possibly revoked token.
  const email = normalizeEmail(session.email);
  if (session.sid) {
    // Device-session token: also require that this device hasn't been signed out.
    const state = await currentSessionState(email, session.sid);
    if (!state || !state.sessionActive || state.version !== (session.sv ?? 0)) return null;
  } else {
    const current = await currentTokenVersion(email);
    if (current === null || current !== (session.sv ?? 0)) return null;
  }

  return { email: session.email, name: session.name, userId: email, sid: session.sid };
}
