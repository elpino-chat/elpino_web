import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

// Brand logos are global, not workspace-scoped data — this only exists to
// keep the Brandfetch client ID server-side. The actual caching (fetch once,
// serve the cached file on every later request) happens in workspace-service.
export async function GET(request: Request) {
  const session = await requireSession();
  if (!session) return Response.json({ error: "Unauthenticated" }, { status: 401 });

  const name = new URL(request.url).searchParams.get("name") ?? "";
  if (!name.trim()) return Response.json({ error: "name is required" }, { status: 400 });

  const result = await callGateway<{ url?: string; error?: string }>(`/api/workspace/integrations/logo?name=${encodeURIComponent(name.trim())}`);
  if (!result.url) return Response.json({ error: result.error ?? "No logo found" }, { status: 404 });
  return Response.json({ url: result.url });
}
