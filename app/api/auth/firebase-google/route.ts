import { callGateway } from "../_lib/gateway";
import { sanitizeReturnPath, setAuthCookie, signAuthToken } from "../_lib/auth-store";

type OAuthResult = {
  identity?: { email: string; name?: string; needsOnboarding?: boolean; tokenVersion?: number };
  error?: string;
};

// Backs the Google sign-in popup (see lib/firebase-client.ts and
// AuthFlow.tsx's handleGoogleLogin): the browser already completed the
// Google OAuth flow via Firebase and holds an ID token, so there is no
// redirect/callback pair here like the old server-driven flow — just one
// POST to verify it and start the session.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { idToken?: string; returnTo?: string };
  if (!body.idToken?.trim()) {
    return Response.json({ error: "idToken is required" }, { status: 400 });
  }

  let result: OAuthResult;
  try {
    result = await callGateway<OAuthResult>("/api/auth/oauth/google", { idToken: body.idToken.trim() });
  } catch (error) {
    console.error("firebase google oauth: gateway unreachable", error);
    return Response.json({ error: "Could not reach the sign-in service. Please try again." }, { status: 502 });
  }

  if (!result.identity) {
    return Response.json({ error: result.error ?? "Google sign-in failed" }, { status: 401 });
  }

  let jwt: string;
  try {
    jwt = signAuthToken(result.identity);
  } catch {
    return Response.json({ error: "Signed in with Google, but couldn't start your session. Please try again." }, { status: 500 });
  }
  await setAuthCookie(jwt);

  const destination = result.identity.needsOnboarding ? "/onboarding" : sanitizeReturnPath(body.returnTo);
  return Response.json({ destination });
}
