import { callGateway } from "../../_lib/gateway";
import { jsonError } from "../../_lib/auth-store";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string };
  if (!body.email?.trim()) {
    return jsonError("Email is required");
  }

  let result: {
    ok?: boolean;
    error?: string;
    exists?: boolean;
    existing?: boolean;
    accountExists?: boolean;
  };

  try {
    result = await callGateway<typeof result>("/api/auth/email/send-verification", body);
  } catch (error) {
    console.error("[Auth] Verification service unavailable", error);
    return jsonError(
      "Email verification is temporarily unavailable. Please try again shortly.",
      503,
    );
  }

  if (result.exists || result.existing || result.accountExists) {
    return jsonError("An account already exists for this email", 409);
  }

  if (!result.ok) {
    const message = result.error ?? "Could not send verification code";
    const isExistingAccount = /already|exists|registered/i.test(message);
    return jsonError(message, isExistingAccount ? 409 : 400);
  }

  return Response.json({ success: true });
}
