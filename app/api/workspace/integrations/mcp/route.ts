import { callGateway } from "@/app/api/auth/_lib/gateway";
import { selectedWorkspaceId } from "../_lib/workspace";

// Connecting runs tool discovery against the customer's server straight away,
// so a wrong URL or rejected token comes back here as a readable message.
export async function POST(request: Request) {
  const companyId = await selectedWorkspaceId();
  if (!companyId) return Response.json({ message: "Create a workspace first." }, { status: 400 });

  const body = (await request.json().catch(() => ({}))) as { name?: unknown; url?: unknown; auth?: unknown; access?: unknown };
  if (typeof body.name !== "string" || !body.name.trim() || typeof body.url !== "string" || !body.url.trim()) {
    return Response.json({ message: "A name and server URL are required." }, { status: 400 });
  }

  const result = await callGateway<{ ok?: boolean; error?: string; provider?: string; metadata?: unknown }>("/api/workspace/integrations/mcp", {
    companyId,
    name: body.name.trim(),
    url: body.url.trim(),
    auth: body.auth,
    access: body.access,
  });
  return Response.json(result.error ? { message: result.error } : result, { status: result.error ? 400 : 200 });
}
