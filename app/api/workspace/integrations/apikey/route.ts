import { ownerGuard } from "@/app/api/_lib/owner-guard";
import { callGateway } from "@/app/api/auth/_lib/gateway";
import { selectedWorkspaceId } from "../_lib/workspace";

export async function POST(request: Request) {
  const blocked = await ownerGuard("connect integrations");
  if (blocked) return blocked;
  const companyId = await selectedWorkspaceId();
  if (!companyId) return Response.json({ message: "Create a workspace first." }, { status: 400 });

  const body = (await request.json().catch(() => ({}))) as { provider?: string; credentials?: Record<string, string> };
  if (!body.provider?.trim()) return Response.json({ message: "provider is required" }, { status: 400 });

  const result = await callGateway<{ ok?: boolean; error?: string }>("/api/workspace/integrations/apikey", {
    companyId,
    provider: body.provider.trim(),
    credentials: body.credentials ?? {},
  });
  return Response.json(result.error ? { message: result.error } : result, { status: result.error ? 400 : 200 });
}
