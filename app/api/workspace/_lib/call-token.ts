import { createHmac } from "node:crypto";

// A tiny HMAC-signed token (not a full JWT) that lets one teammate's browser open the signalling socket of one
// call, after workspace-service has accepted the call. Verified on the gateway with the same WS_TOKEN_SECRET —
// see apps/gateway/src/realtime/call-token.util.ts, which this mirrors. It names the call and the teammate, so
// it opens nothing else, and it is only good for a few minutes.
const TOKEN_TTL_MS = 5 * 60 * 1000;

export function signCallToken(claims: { callId: string; userId: string; companyId: string }): string {
  const secret = process.env.WS_TOKEN_SECRET;
  if (!secret) throw new Error("WS_TOKEN_SECRET is not configured");
  const payload = Buffer.from(JSON.stringify({ kind: "call", ...claims, exp: Date.now() + TOKEN_TTL_MS })).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${signature}`;
}
