import { callGateway } from "../../_lib/gateway";
import { getAuthRedirectBaseUrl } from "../../_lib/redirect-url";

// Always responds the same way regardless of whether the email has an
// account — the response itself must not become an enumeration oracle.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: string };
  if (typeof body.email === "string" && body.email.trim()) {
    // Public origin, not request.url's — on Cloud Run that resolves to the
    // container's internal bind address, which would put "localhost" (or
    // worse) into the reset link inside the email.
    const origin = getAuthRedirectBaseUrl(request);
    await callGateway("/api/auth/password/forgot", { email: body.email.trim(), origin }).catch(() => undefined);
  }
  return Response.json({ ok: true });
}
