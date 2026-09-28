import { callGateway } from "../../_lib/gateway";
import { jsonError, setAuthCookie } from "../../_lib/auth-store";
import { startSession } from "../../_lib/sessions";

type LoginResult = {
  identity?: { email: string; name?: string; needsOnboarding?: boolean; tokenVersion?: number };
  error?: string;
  needsVerification?: boolean;
};

// OTP is only required at registration; a returning user with a verified
// password signs in directly, no re-verification per login.
export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };

  const result = await callGateway<LoginResult>("/api/auth/login", body);
  if (!result.identity) {
    if (result.needsVerification) {
      return Response.json(
        { message: result.error ?? "Please verify your email first.", needsVerification: true },
        { status: 403 },
      );
    }
    // The gateway answers { error: "Unauthorized" } when it rejects this site's internal secret;
    // that is a deployment problem, not something the visitor did wrong.
    if (result.error === "Unauthorized") {
      return jsonError("Sign-in is temporarily unavailable. Please try again in a few minutes.", 503);
    }
    return jsonError(result.error ?? "The email or password you entered may be incorrect.", 401);
  }

  const jwt = await startSession(result.identity);
  await setAuthCookie(jwt);
  return Response.json({
    email: result.identity.email,
    user: { name: result.identity.name },
    isNew: Boolean(result.identity.needsOnboarding),
  });
}
