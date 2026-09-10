import { createHmac } from "node:crypto";

// A tiny HMAC-signed token (not a full JWT) authorizing the dashboard's
// live-view WebSocket to subscribe to one company's visitor room. Verified
// on the gateway side with the same WS_TOKEN_SECRET — see
// apps/gateway/src/realtime/ws-token.util.ts, which this mirrors.
const TOKEN_TTL_MS = 5 * 60 * 1000;

export function signWsToken(companyId: string): string {
  const secret = process.env.WS_TOKEN_SECRET;
  if (!secret) throw new Error("WS_TOKEN_SECRET is not configured");
  const payload = Buffer.from(JSON.stringify({ companyId, exp: Date.now() + TOKEN_TTL_MS })).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${signature}`;
}
