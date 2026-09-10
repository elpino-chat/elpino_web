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

  const token = signWsToken(companyId);
  return Response.json({ token, wsUrl: `${gatewayWsOrigin()}/rt/dashboard` });
}
