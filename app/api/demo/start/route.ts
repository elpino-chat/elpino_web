import { NextResponse } from "next/server";
import { callGateway } from "@/app/api/auth/_lib/gateway";
import { rateLimit } from "../../_lib/rate-limit";

export async function POST(request: Request) {
  const limited = await rateLimit(request, "demo-start", { limit: 10, windowMs: 10 * 60_000 });
  if (limited) return limited;
  const body = await request.json().catch(() => null);
  const token = String(body?.token ?? "");
  const domain = String(body?.domain ?? "").trim();
  if (!token || !domain || domain.length > 300) return NextResponse.json({ error: "Enter your website address." }, { status: 400 });
  const result = await callGateway<{ siteKey?: string; domain?: string; error?: string; status?: string }>("/api/workspace/demo/start", { token, domain });
  return NextResponse.json(result, { status: result.error ? (result.status === "expired" ? 401 : result.status === "rate_limited" ? 429 : 400) : 200 });
}
