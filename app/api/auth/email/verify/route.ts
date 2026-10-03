import { callGateway } from "../../_lib/gateway";
import { jsonError, setSignupProofCookie } from "../../_lib/auth-store";

type VerifyResult = { email?: string; error?: string };

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; otp?: string };

  let result: VerifyResult;
  try {
    result = await callGateway<VerifyResult>("/api/auth/email/verify", body);
  } catch (error) {
    console.error("[Auth] Verification service unavailable", error);
    return jsonError(
      "Email verification is temporarily unavailable. Please try again shortly.",
      503,
    );
  }
  if (!result.email) {
    return jsonError(result.error ?? "Invalid or expired code", 400);
  }

  await setSignupProofCookie(result.email);

  // No session cookie yet — the account isn't created until the user sets a
  // name and password in the next step (see /api/auth/complete-profile).
  return Response.json({ email: result.email });
}
