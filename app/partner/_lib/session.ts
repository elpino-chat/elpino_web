import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

// Partner sessions are separate from workspace logins: their own cookie, their own token format (two parts, so it
// can never pass as a workspace JWT) and a key derived for this purpose only.
export const PARTNER_COOKIE = "elpino_partner";
const TTL_SECONDS = 30 * 24 * 60 * 60;

function key() {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) throw new Error("AUTH_JWT_SECRET is missing");
  return createHmac("sha256", secret).update("elpino-partner-session").digest();
}

const sign = (body: string) => createHmac("sha256", key()).update(body).digest("base64url");

export function signPartnerSession(partnerId: string) {
  const body = Buffer.from(JSON.stringify({ pid: partnerId, exp: Math.floor(Date.now() / 1000) + TTL_SECONDS })).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifyPartnerSession(token: string | undefined): string | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature || token.split(".").length !== 2) return null;
  let expected: string;
  try { expected = sign(body); } catch { return null; }
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as { pid?: unknown; exp?: unknown };
    if (typeof payload.pid !== "string" || typeof payload.exp !== "number" || payload.exp < Date.now() / 1000) return null;
    return payload.pid;
  } catch {
    return null;
  }
}

export async function currentPartnerId() {
  return verifyPartnerSession((await cookies()).get(PARTNER_COOKIE)?.value);
}

export async function setPartnerSession(partnerId: string) {
  (await cookies()).set(PARTNER_COOKIE, signPartnerSession(partnerId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TTL_SECONDS,
  });
}

export async function clearPartnerSession() {
  (await cookies()).delete(PARTNER_COOKIE);
}
