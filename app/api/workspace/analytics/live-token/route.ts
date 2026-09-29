import { callGateway } from "@/app/api/auth/_lib/gateway";
import { selectedWorkspaceId } from "../_lib/workspace";
import { signWsToken } from "../_lib/ws-token";

// Gateway WS origin mirrors the HTTP gateway origin resolution in
// app/api/auth/_lib/gateway.ts, just with the ws(s) scheme instead of http(s).
function gatewayWsOrigin() {
  const httpUrl =
    process.env.NEXT_PUBLIC_GATEWAY_URL ||
    (process.env.NODE_ENV === "development" ? "http://localhost:4000" : "https://api.elpino.chat");
  return httpUrl.replace(/^http/, "ws");
}

export async function GET() {
  const companyId = await selectedWorkspaceId();
  if (!companyId) return Response.json({ message: "Create a workspace first." }, { status: 400 });

  // The live feed is analytics data too. The plan check lives behind the realtime endpoint, so ask it
  // rather than duplicating the rule here — otherwise a plan without analytics could still stream visitors.
  const gate = await callGateway<{ upgradeRequired?: true; error?: string }>(
    `/api/workspace/analytics/realtime?companyId=${encodeURIComponent(companyId)}`,
  ).catch(() => null);
  if (gate?.upgradeRequired) {
    return Response.json({ message: gate.error ?? "Visitor analytics is not included on your current plan.", upgradeRequired: true }, { status: 403 });
  }

  const token = signWsToken(companyId);
  return Response.json({ token, wsUrl: `${gatewayWsOrigin()}/rt/dashboard` });
}
