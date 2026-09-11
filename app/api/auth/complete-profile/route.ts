import { callGateway } from "../_lib/gateway";
import { jsonError, setAuthCookie, signAuthToken } from "../_lib/auth-store";

type CompleteProfileResult = {
  identity?: { email: string; name?: string; needsOnboarding?: boolean; tokenVersion?: number };
  error?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; name?: string; password?: string };
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email) {
    return jsonError("Email is required", 400);
  }
  if (!name) {
    return jsonError("Name is required", 400);
  }
  if (password.length < 8) {
    return jsonError("Password must be at least 8 characters", 400);
  }

  let result: CompleteProfileResult;
  try {
    result = await callGateway<CompleteProfileResult>("/api/auth/complete-profile", { email, name, password });
  } catch (error) {
    console.error("[Auth] Profile service unavailable", error);
    return jsonError("Could not save your details. Please try again shortly.", 503);
  }

  if (!result.identity) {
    return jsonError(result.error ?? "Could not save your details", 400);
  }

  // Account now exists with a password — this is where the session actually starts.
  const jwt = signAuthToken(result.identity);
  await setAuthCookie(jwt);

  return Response.json({
    email: result.identity.email,
    user: { name: result.identity.name },
    isNew: Boolean(result.identity.needsOnboarding),
  });
}
