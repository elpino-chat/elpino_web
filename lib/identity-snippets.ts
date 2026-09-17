// Integration snippets for widget identity verification, shared by the
// dashboard settings page and the public guide so the two never drift.
// Each server example must produce a token identity-token.ts accepts: HS256,
// aud "elpino-widget", a fresh jti, integer iat/exp at most five minutes
// apart, a string sub. Optional claims are omitted rather than sent as null,
// because a null email or phone is rejected as an invalid claim.

export type ServerSnippet = { id: string; label: string; install: string; code: string };

export const SERVER_SNIPPETS: ServerSnippet[] = [
  {
    id: "node",
    label: "Node.js",
    install: "npm install jsonwebtoken",
    code: `// POST /api/chat-identity, called by the page for a logged-in user.
// Never send the secret to the browser: send only the token.
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";

app.post("/api/chat-identity", requireLogin, (req, res) => {
  // The user comes from your authenticated session, never from the request body.
  const user = req.user;
  const claims = { sub: String(user.id), jti: randomUUID() };
  if (user.email) Object.assign(claims, { email: user.email, email_verified: user.emailVerified === true });
  if (user.phone) Object.assign(claims, { phone: user.phone, phone_verified: user.phoneVerified === true });
  if (user.name) claims.name = user.name;

  const token = jwt.sign(claims, process.env.ELPINO_IDENTITY_SECRET, {
    algorithm: "HS256",
    audience: "elpino-widget",
    expiresIn: "5m",
  });
  res.set("Cache-Control", "no-store").json({ token });
});`,
  },
  {
    id: "python",
    label: "Python",
    install: "pip install pyjwt",
    code: `# POST /api/chat-identity, called by the page for a logged-in user.
import os, time, uuid
import jwt

def elpino_identity_token(user):
    now = int(time.time())
    claims = {
        "sub": str(user.id),          # stable account ID, required
        "aud": "elpino-widget",
        "jti": str(uuid.uuid4()),     # fresh for every token
        "iat": now,
        "exp": now + 300,             # five minutes at most
    }
    if user.email:
        claims["email"] = user.email
        claims["email_verified"] = bool(user.email_verified)
    if user.phone:
        claims["phone"] = user.phone
        claims["phone_verified"] = bool(user.phone_verified)
    if user.name:
        claims["name"] = user.name
    return jwt.encode(claims, os.environ["ELPINO_IDENTITY_SECRET"], algorithm="HS256")`,
  },
  {
    id: "php",
    label: "PHP",
    install: "composer require firebase/php-jwt",
    code: `<?php
// POST /api/chat-identity, called by the page for a logged-in user.
use Firebase\\JWT\\JWT;

function elpino_identity_token($user): string {
    $now = time();
    $claims = [
        'sub' => (string) $user->id,          // stable account ID, required
        'aud' => 'elpino-widget',
        'jti' => bin2hex(random_bytes(16)),   // fresh for every token
        'iat' => $now,
        'exp' => $now + 300,                  // five minutes at most
    ];
    if ($user->email) {
        $claims['email'] = $user->email;
        $claims['email_verified'] = (bool) $user->email_verified;
    }
    if ($user->phone) {
        $claims['phone'] = $user->phone;
        $claims['phone_verified'] = (bool) $user->phone_verified;
    }
    if ($user->name) $claims['name'] = $user->name;
    return JWT::encode($claims, getenv('ELPINO_IDENTITY_SECRET'), 'HS256');
}`,
  },
  {
    id: "ruby",
    label: "Ruby",
    install: "gem install jwt",
    code: `# POST /api/chat-identity, called by the page for a logged-in user.
require "jwt"
require "securerandom"

def elpino_identity_token(user)
  now = Time.now.to_i
  claims = {
    sub: user.id.to_s,              # stable account ID, required
    aud: "elpino-widget",
    jti: SecureRandom.uuid,         # fresh for every token
    iat: now,
    exp: now + 300                  # five minutes at most
  }
  claims.merge!(email: user.email, email_verified: user.email_verified == true) if user.email
  claims.merge!(phone: user.phone, phone_verified: user.phone_verified == true) if user.phone
  claims[:name] = user.name if user.name
  JWT.encode(claims, ENV.fetch("ELPINO_IDENTITY_SECRET"), "HS256")
end`,
  },
];

export const PAGE_SNIPPET = `<!-- Before the Elpino tag, on pages where the user may be logged in -->
<script>
  window.ElpinoSettings = {
    // The widget calls this whenever it needs a fresh, single-use token.
    getIdentityToken: async () => {
      const response = await fetch("/api/chat-identity", {
        method: "POST", credentials: "same-origin", cache: "no-store"
      });
      if (response.status === 401) return null; // logged out: chat as a guest
      if (!response.ok) throw new Error("Sign-in unavailable");
      return (await response.json()).token;
    }
  };
</script>`;

export const SPA_SNIPPET = `// Single-page apps: tell the widget when the login state changes.
// After login, with a fresh token from your server:
ElpinoTag.identify({ token });

// On logout or account switch, immediately:
ElpinoTag.logout();`;

// Reasons the widget logs as "[Elpino] Identity token was not accepted: <code>".
export const IDENTITY_ERRORS: Array<{ code: string; fix: string }> = [
  { code: "not_configured", fix: "Identity verification is not turned on for this workspace. Turn it on in Settings, then Identity Verification." },
  { code: "bad_signature", fix: "The token was not signed with this workspace's current secret. Check ELPINO_IDENTITY_SECRET on your server, and update it after a rotation." },
  { code: "unsupported_algorithm", fix: "Sign with HS256. Other algorithms, including none and RS256, are refused." },
  { code: "malformed", fix: "Pass the compact JWT string itself (three dot-separated parts), not a JSON object or a Bearer header." },
  { code: "invalid_audience", fix: "Set aud to exactly \"elpino-widget\"." },
  { code: "missing_expiry", fix: "Include exp as an integer Unix timestamp in seconds." },
  { code: "expired", fix: "Mint a fresh token for every request instead of caching one. Also check your server clock." },
  { code: "lifetime_too_long", fix: "exp may be at most five minutes after iat and after the current time." },
  { code: "invalid_issued_at", fix: "Include iat in seconds, not milliseconds, and keep your server clock in sync." },
  { code: "not_yet_valid", fix: "nbf is in the future. Remove it or check your server clock." },
  { code: "no_identity", fix: "Include sub, your stable account ID. An email alone is not enough." },
  { code: "invalid_claim", fix: "A claim has the wrong shape: jti must be 16 to 128 URL-safe characters, email_verified and phone_verified must be true or false, and email or phone must be omitted rather than null." },
  { code: "token_already_used", fix: "Each token works once. Return a new token from getIdentityToken every time it is called." },
];
