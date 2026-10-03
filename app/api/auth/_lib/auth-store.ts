import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const tokenTtlSeconds = 60 * 60 * 24 * 7;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function base64url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

export function signAuthToken(payload: { email: string; name?: string; tokenVersion?: number; sid?: string }) {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) {
    throw new Error("AUTH_JWT_SECRET is missing");
  }

  const now = Math.floor(Date.now() / 1000);
  const body = {
    email: payload.email,
    name: payload.name,
    // Session epoch this token was minted at; checked against the user's current
    // epoch so a logout/"sign out everywhere" can revoke it server-side.
    sv: payload.tokenVersion ?? 0,
    // Per-device session id (user_sessions row). Absent on tokens minted before
    // device sessions existed, which then stay valid until they expire.
    ...(payload.sid ? { sid: payload.sid } : {}),
    iat: now,
    exp: now + tokenTtlSeconds,
  };
  const encodedHeader = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const encodedBody = base64url(JSON.stringify(body));
  const signature = createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedBody}`)
    .digest("base64url");

  return `${encodedHeader}.${encodedBody}.${signature}`;
}

export function verifyAuthToken(token: string) {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) return null;

  const [encodedHeader, encodedBody, signature] = token.split(".");
  if (!encodedHeader || !encodedBody || !signature) return null;

  try {
    const header = JSON.parse(Buffer.from(encodedHeader, "base64url").toString("utf8")) as {
      alg?: string;
      typ?: string;
    };
    if (header.alg !== "HS256" || header.typ !== "JWT") return null;
  } catch {
    return null;
  }

  const expected = createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedBody}`)
    .digest("base64url");
  const sig = Buffer.from(signature);
  const exp = Buffer.from(expected);
  if (sig.length !== exp.length || !timingSafeEqual(sig, exp)) return null;

  let payload: { email?: string; name?: string; sv?: number; sid?: string; exp?: number };
  try {
    payload = JSON.parse(Buffer.from(encodedBody, "base64url").toString("utf8")) as {
      email?: string;
      name?: string;
      sv?: number;
      sid?: string;
      exp?: number;
    };
  } catch {
    return null;
  }

  if (!payload.email || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }
  return payload;
}

export async function setAuthCookie(jwt: string) {
  const cookieStore = await cookies();
  cookieStore.set("auth_token", jwt, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: tokenTtlSeconds,
  });
}

export function jsonError(message: string, status = 400) {
  return Response.json({ message }, { status });
}

export function sanitizeReturnPath(value: string | null | undefined, fallback = "/dashboard") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }
  try {
    const parsed = new URL(value, "https://elpino.local");
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

// Proof that an email address passed the emailed-code check, carried in a
// short-lived httpOnly cookie. complete-profile requires it, so a password can
// only be set for an address whose owner just verified it. The "signup-proof"
// prefix is part of the signed text, so it can never be confused with a session JWT.
const signupProofTtlSeconds = 15 * 60;
const signupProofCookie = "signup_proof";

function signupProofSignature(email: string, exp: number) {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) throw new Error("AUTH_JWT_SECRET is missing");
  return createHmac("sha256", secret).update(`signup-proof.${email}.${exp}`).digest("base64url");
}

export async function setSignupProofCookie(email: string) {
  const normalized = normalizeEmail(email);
  const exp = Math.floor(Date.now() / 1000) + signupProofTtlSeconds;
  const cookieStore = await cookies();
  cookieStore.set(signupProofCookie, `${exp}.${signupProofSignature(normalized, exp)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/auth",
    maxAge: signupProofTtlSeconds,
  });
}

export async function hasSignupProof(email: string) {
  const cookieStore = await cookies();
  const value = cookieStore.get(signupProofCookie)?.value;
  if (!value) return false;
  const [expRaw, signature] = value.split(".");
  const exp = Number(expRaw);
  if (!signature || !Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;
  try {
    const expected = Buffer.from(signupProofSignature(normalizeEmail(email), exp));
    const provided = Buffer.from(signature);
    return expected.length === provided.length && timingSafeEqual(expected, provided);
  } catch {
    return false;
  }
}

export async function clearSignupProofCookie() {
  const cookieStore = await cookies();
  cookieStore.set(signupProofCookie, "", { httpOnly: true, path: "/api/auth", maxAge: 0 });
}
