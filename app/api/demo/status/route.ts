import { NextResponse } from "next/server";
import { callGateway } from "@/app/api/auth/_lib/gateway";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  if (!token) return NextResponse.json({ error: "Missing token." }, { status: 400 });
  const result = await callGateway<{ error?: string; status?: string }>(`/api/workspace/demo/status?token=${encodeURIComponent(token)}`);
  return NextResponse.json(result, { status: result.error ? 401 : 200, headers: { "cache-control": "no-store" } });
}
