import { NextResponse } from "next/server";
import { callGateway } from "../../auth/_lib/gateway";
import { rateLimit } from "../../_lib/rate-limit";

// Called from the /unsubscribe page when someone confirms they want to stop the weekly summary.
// The signed token in the email link is the only credential, so there is no session check.
export async function POST(request: Request) {
  const limited = await rateLimit(request, "email-unsubscribe", { limit: 10, windowMs: 60_000 });
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token.trim() : "";
  if (!token) return NextResponse.json({ error: "This unsubscribe link is invalid." }, { status: 400 });

  try {
    const result = await callGateway<{ ok?: boolean; error?: string }>("/api/workspace/email/unsubscribe", { token });
    if (!result.ok) return NextResponse.json({ error: result.error ?? "This unsubscribe link is invalid." }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not reach the service. Please try again." }, { status: 502 });
  }
}
