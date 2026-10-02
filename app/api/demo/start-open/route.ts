import { NextResponse } from "next/server";
import { callGateway } from "@/app/api/auth/_lib/gateway";
import { clientIp } from "../../_lib/client-geo";
import { rateLimit } from "../../_lib/rate-limit";

export async function POST(request: Request) {
  const limited = await rateLimit(request, "demo-start-open", { limit: 30, windowMs: 10 * 60_000 });
  if (limited) return limited;
  const body = await request.json().catch(() => null);
  const domain = String(body?.domain ?? "").trim();
  if (!domain || domain.length > 300) return NextResponse.json({ error: "Enter your website address." }, { status: 400 });
  const result = await callGateway<{ token?: string; siteKey?: string; domain?: string; error?: string; status?: string }>("/api/workspace/demo/start-open", { domain, ip: clientIp(request) });
  return NextResponse.json(result, { status: result.error ? (result.status === "rate_limited" ? 429 : 400) : 200 });
}
