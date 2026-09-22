import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || (process.env.NODE_ENV === "development" ? "http://127.0.0.1:4000" : "https://api.elpino.chat");

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "A valid request body is required." }, { status: 400 });

  try {
    const response = await fetch(`${GATEWAY_URL}/api/docs/ask`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(request.headers.get("x-forwarded-for") ? { "x-forwarded-for": request.headers.get("x-forwarded-for")! } : {}),
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });
    const payload = await response.json().catch(() => ({ error: "The documentation assistant returned an invalid response." }));
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json({ error: "The documentation assistant is temporarily unavailable." }, { status: 502 });
  }
}
