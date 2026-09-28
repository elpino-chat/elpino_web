import { cookies } from "next/headers";
import { normalizeEmail, verifyAuthToken } from "../_lib/auth-store";
import { callGateway } from "../_lib/gateway";
import { invalidateSessionState } from "../_lib/session-version";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const session = token ? verifyAuthToken(token) : null;

  // Revoke this device's session server-side so the token stops validating even
  // if someone copied it — real logout, not just a cookie clear — while the
  // user's other signed-in devices stay signed in. (Tokens minted before device
  // sessions existed have no sid; for those only the cookie is cleared.)
  if (session?.email && session.sid) {
    const email = normalizeEmail(session.email);
    await callGateway("/api/auth/sessions/revoke", { email, sessionId: session.sid }).catch(() => undefined);
    invalidateSessionState(email, session.sid);
  }

  cookieStore.delete("auth_token");
  return Response.json({ ok: true });
}
