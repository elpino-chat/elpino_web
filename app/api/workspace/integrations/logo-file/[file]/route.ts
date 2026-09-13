import { fetchGatewayRaw } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

// Pure passthrough of the cached logo bytes workspace-service already
// downloaded and saved — this never calls Brandfetch itself.
export async function GET(_request: Request, context: { params: Promise<{ file: string }> }) {
  const session = await requireSession();
  if (!session) return new Response(null, { status: 401 });

  const { file } = await context.params;
  const upstream = await fetchGatewayRaw(`/api/workspace/integrations/logo-file/${encodeURIComponent(file)}`);
  if (!upstream.ok) return new Response(null, { status: upstream.status });

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "application/octet-stream",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
