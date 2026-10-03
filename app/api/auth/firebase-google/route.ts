import { callGateway } from "../_lib/gateway";
import { sanitizeReturnPath, setAuthCookie } from "../_lib/auth-store";
import { startSession } from "../_lib/sessions";

type OAuthResult = {
  identity?: { email: string; name?: string; needsOnboarding?: boolean; tokenVersion?: number };
  error?: string;
  twoFactorRequired?: boolean;
};

// Backs the Google sign-in popup (see lib/firebase-client.ts and
// AuthFlow.tsx's handleGoogleLogin): the browser already completed the
// Google OAuth flow via Firebase and holds an ID token, so there is no
// redirect/callback pair here like the old server-driven flow — just one
// POST to verify it and start the session.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { idToken?: string; returnTo?: string; code?: string };
  if (!body.idToken?.trim()) {
    return Response.json({ error: "idToken is required" }, { status: 400 });
  }

  let result: OAuthResult;
  try {
    result = await callGateway<OAuthResult>("/api/auth/oauth/google", { idToken: body.idToken.trim(), code: typeof body.code === "string" ? body.code : undefined });
  } catch (error) {
    console.error("firebase google oauth: gateway unreachable", error);
    return Response.json({ error: "Could not reach the sign-in service. Please try again." }, { status: 502 });
  }

  if (!result.identity) {
    if (result.twoFactorRequired) {
      return Response.json({ error: result.error ?? "Enter your authentication code.", twoFactorRequired: true }, { status: 401 });
    }
    return Response.json({ error: result.error ?? "Google sign-in failed" }, { status: 401 });
  }

  let jwt: string;
  try {
    jwt = await startSession(result.identity);
  } catch {
    return Response.json({ error: "Signed in with Google, but couldn't start your session. Please try again." }, { status: 500 });
  }
  await setAuthCookie(jwt);

  const returnTo = sanitizeReturnPath(body.returnTo);
  // The WordPress connect flow never needs the onboarding wizard — every
  // account already gets a workspace auto-created lazily on first use (see
  // ensureDefaultOrganization in auth-service), and /connect/wordpress
  // itself creates/reuses the real site from the WordPress install's URL.
  const skipsOnboarding = returnTo.startsWith("/connect/wordpress");
  const destination = result.identity.needsOnboarding && !skipsOnboarding
    ? (returnTo !== "/dashboard" ? `/onboarding?next=${encodeURIComponent(returnTo)}` : "/onboarding")
    : returnTo;
  return Response.json({ destination });
}
