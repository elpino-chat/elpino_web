"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Eye, EyeOff, KeyRound, LoaderCircle, RefreshCw, ShieldCheck } from "lucide-react";

// Identity verification for the chat widget: lets a business tell the widget
// who their logged-in user is, so the AI agent can look up that person's own
// payments and connected-system records. The business's server signs a
// short-lived token with this secret; the page passes it to the tag.

type SecretState = { configured: boolean; secret: string | null };

const SERVER_SNIPPET = `// On your server, when rendering a page for a logged-in user.
// Never send the secret to the browser: send only the token.
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";

// Load user from your authenticated server session, never request parameters.
// Return 401 when logged out; set Cache-Control: no-store on the response.

const elpinoIdentityToken = jwt.sign(
  {
    sub: String(user.id), // required stable account ID
    jti: randomUUID(),    // fresh for every token; one use only
    email: user.email,
    email_verified: user.emailVerified === true,
    phone: user.phone,   // optional, e.g. "+919876543210"
    phone_verified: user.phoneVerified === true,
    name: user.name,     // optional
  },
  process.env.ELPINO_IDENTITY_SECRET,
  { algorithm: "HS256", audience: "elpino-widget", expiresIn: "5m" },
);`;

const PAGE_SNIPPET = `<!-- Before the Elpino tag, on pages where the user is logged in -->
<script>
  window.ElpinoSettings = {
    // Your same-origin endpoint authenticates the current login session.
    getIdentityToken: async () => {
      const response = await fetch("/api/chat-identity", {
        method: "POST", credentials: "same-origin", cache: "no-store"
      });
      if (response.status === 401) return null;
      if (!response.ok) throw new Error("Sign-in unavailable");
      return (await response.json()).token;
    }
  };
</script>

<!-- Or after login in a single-page app -->
<script>
  ElpinoTag.identify({ token: tokenFromYourServer });
  // and on logout:
  ElpinoTag.logout();
</script>`;

export function IdentityVerificationCard() {
  const [state, setState] = useState<SecretState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [confirmRotate, setConfirmRotate] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/workspace/identity-secret", { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json().catch(() => ({}))) as Partial<SecretState> & { message?: string };
        if (cancelled) return;
        if (!response.ok) setError(data.message ?? "Could not load identity verification settings.");
        else setState({ configured: Boolean(data.configured), secret: data.secret ?? null });
      })
      .catch(() => { if (!cancelled) setError("Could not load identity verification settings."); });
    return () => { cancelled = true; };
  }, []);

  async function createOrRotate() {
    setBusy(true);
    setError(null);
    const response = await fetch("/api/workspace/identity-secret", { method: "POST" }).catch(() => null);
    const data = response ? ((await response.json().catch(() => ({}))) as Partial<SecretState> & { message?: string }) : {};
    if (response?.ok && data.secret) {
      setState({ configured: true, secret: data.secret });
      setRevealed(true);
    } else {
      setError(data.message ?? "Could not update the secret. Try again.");
    }
    setConfirmRotate(false);
    setBusy(false);
  }

  async function copy(label: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      window.setTimeout(() => setCopied((current) => (current === label ? null : current)), 1500);
    } catch {
      setError("Copy failed. Select the text and copy it manually.");
    }
  }

  const masked = state?.secret ? `${state.secret.slice(0, 9)}${"•".repeat(24)}` : "";

  return (
    <section className="mt-8 rounded-xl border border-[#e7e8ea] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#428ce5]/10 text-[#428ce5]"><ShieldCheck size={17} /></span>
          <div>
            <h2 className="text-[14px] font-semibold">Identity verification</h2>
            <p className="mt-1 max-w-2xl text-[12px] leading-5 text-[#687178]">
              Tell the chat widget who your logged-in user is. Verified customers can ask about their own payments, refunds and records in your connected systems, and the AI looks up only that person&apos;s data.
            </p>
          </div>
        </div>
        {state && !state.configured && (
          <button type="button" disabled={busy} onClick={() => void createOrRotate()} className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg bg-[#202020] px-3.5 text-[12px] font-medium text-white disabled:opacity-50">
            {busy ? <LoaderCircle size={14} className="animate-spin" /> : <KeyRound size={14} />}Turn on
          </button>
        )}
      </div>

      {!state && !error && <p className="mt-4 flex items-center gap-2 text-[12px] text-[#687178]"><LoaderCircle size={14} className="animate-spin" />Loading</p>}
      {error && <p role="alert" className="mt-4 rounded-lg bg-[#FFF2F2] px-3 py-2 text-[12px] font-medium text-[#A64A53]">{error}</p>}

      {state?.configured && state.secret && (
        <div className="mt-5 space-y-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#687178]">Identity secret</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-lg border border-[#e7e8ea] px-3 py-2 font-mono text-[12px]">{revealed ? state.secret : masked}</code>
              <button type="button" onClick={() => setRevealed((value) => !value)} aria-label={revealed ? "Hide secret" : "Show secret"} className="flex size-9 items-center justify-center rounded-lg border border-[#e7e8ea] text-[#687178] hover:text-[#17181a]">{revealed ? <EyeOff size={14} /> : <Eye size={14} />}</button>
              <button type="button" onClick={() => void copy("secret", state.secret!)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#e7e8ea] px-3 text-[12px] font-medium">{copied === "secret" ? <Check size={14} /> : <Copy size={14} />}Copy</button>
              {confirmRotate ? (
                <>
                  <button type="button" disabled={busy} onClick={() => void createOrRotate()} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#A64A53] px-3 text-[12px] font-medium text-white disabled:opacity-50">{busy ? <LoaderCircle size={14} className="animate-spin" /> : <RefreshCw size={14} />}Rotate now</button>
                  <button type="button" onClick={() => setConfirmRotate(false)} className="h-9 rounded-lg px-3 text-[12px] font-medium text-[#687178]">Cancel</button>
                </>
              ) : (
                <button type="button" onClick={() => setConfirmRotate(true)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#e7e8ea] px-3 text-[12px] font-medium"><RefreshCw size={14} />Rotate</button>
              )}
            </div>
            <p className="mt-2 text-[11px] leading-4 text-[#687178]">
              {confirmRotate
                ? "Rotating signs out every visitor using a token made with the current secret. Update your server first."
                : "Keep this on your server only, for example as ELPINO_IDENTITY_SECRET. Anyone with it can sign in as any of your users."}
            </p>
          </div>

          <Snippet title="1. Sign a token on your server" code={SERVER_SNIPPET} copied={copied === "server"} onCopy={() => void copy("server", SERVER_SNIPPET)} />
          <Snippet title="2. Pass it to the widget" code={PAGE_SNIPPET} copied={copied === "page"} onCopy={() => void copy("page", PAGE_SNIPPET)} />
          <p className="text-[11px] leading-4 text-[#687178]">
            Tokens require HS256, the elpino-widget audience, a unique jti, an issued-at time and a stable sub account ID. They expire within five minutes and can be used once. The callback requests a fresh token when needed. Only attest email or phone ownership after your login system has verified it. Typed contact details never verify an account.
          </p>
        </div>
      )}
    </section>
  );
}

function Snippet({ title, code, copied, onCopy }: { title: string; code: string; copied: boolean; onCopy: () => void }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-medium">{title}</p>
        <button type="button" onClick={onCopy} className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#687178] hover:text-[#17181a]">{copied ? <Check size={13} /> : <Copy size={13} />}Copy</button>
      </div>
      <pre className="mt-2 overflow-x-auto rounded-lg bg-[#17181a] p-3 font-mono text-[11px] leading-5 text-[#e7e8ea]">{code}</pre>
    </div>
  );
}
