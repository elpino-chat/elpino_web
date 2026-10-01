import { NextResponse } from "next/server";
import { callGateway } from "@/app/api/auth/_lib/gateway";
import { clientIp } from "../../_lib/client-geo";
import { rateLimit } from "../../_lib/rate-limit";

export async function POST(request: Request) {
  const limited = await rateLimit(request, "demo-send-code", { limit: 5, windowMs: 10 * 60_000 });
  if (limited) return limited;
  const body = await request.json().catch(() => null);
  const email = String(body?.email ?? "").trim();
  if (!email || email.length > 254) return NextResponse.json({ error: "Enter your work email." }, { status: 400 });
  const result = await callGateway<{ ok?: boolean; error?: string; status?: string }>("/api/workspace/demo/send-code", { email, ip: clientIp(request) });
  return NextResponse.json(result, { status: result.error ? (result.status === "rate_limited" ? 429 : 400) : 200 });
}
