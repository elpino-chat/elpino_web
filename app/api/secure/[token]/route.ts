import { callGateway } from "@/app/api/auth/_lib/gateway";

// Customer-facing. There is no session here — the token in the path is the
// whole of the authorisation, which is why it is 32 bytes of randomness and
// why both handlers below refuse a link that has already been used.
//
// Nothing here is cached: a cached description would leak the label after the
// link is spent, and a cached submission response is meaningless.

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await callGateway<{ label?: string; expiresAt?: string; error?: string }>(
    `/api/workspace/secure/public/${encodeURIComponent(token)}`,
  ).catch(() => null);

  if (!result || result.error || !result.label) {
    return Response.json(
      { message: result?.error ?? "This link is not valid." },
      { status: 404, headers: { "cache-control": "no-store" } },
    );
  }
  return Response.json(
    { label: result.label, expiresAt: result.expiresAt },
    { headers: { "cache-control": "no-store" } },
  );
}

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const body = (await request.json().catch(() => ({}))) as { secret?: string };
  if (!body.secret?.trim()) {
    return Response.json({ message: "Nothing was submitted." }, { status: 400 });
  }

  const result = await callGateway<{ ok?: boolean; error?: string }>(
    `/api/workspace/secure/public/${encodeURIComponent(token)}`,
    { secret: body.secret },
  ).catch(() => null);

  if (!result || result.error) {
    return Response.json(
      { message: result?.error ?? "Could not submit this." },
      { status: 400, headers: { "cache-control": "no-store" } },
    );
  }
  return Response.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
