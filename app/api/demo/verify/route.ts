import { NextResponse } from "next/server";
import { callGateway } from "@/app/api/auth/_lib/gateway";
import { rateLimit } from "../../_lib/rate-limit";

export async function POST(request: Request) {
  const limited = await rateLimit(request, "demo-verify", { limit: 15, windowMs: 10 * 60_000 });
  if (limited) return limited;
  const body = await request.json().catch(() => null);
  const email = String(body?.email ?? "").trim();
  const code = String(body?.code ?? "").trim();
  if (!email || !/^\d{6}$/.test(code)) return NextResponse.json({ error: "Enter the 6-digit code." }, { status: 400 });
  const result = await callGateway<{ token?: string; domainHint?: string; error?: string; status?: string }>("/api/workspace/demo/verify", { email, code });
  return NextResponse.json(result, { status: result.error ? (result.status === "rate_limited" ? 429 : 400) : 200 });
}
