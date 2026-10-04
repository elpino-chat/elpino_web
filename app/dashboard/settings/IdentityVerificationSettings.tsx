"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Copy, Eye, EyeOff, KeyRound, LoaderCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { Switch } from "@/components/ui/switch";

// Identity verification for the chat widget: lets a business tell the widget
// who their logged-in user is, so the AI agent can look up that person's own
// payments and connected-system records. The business's server signs a
// short-lived token with this secret; the page passes it to the tag.
//
// The cards and buttons share the .tag-* styles of the Website page (see globals.css), scoped to .identity-page as well.

type SecretState = { configured: boolean; secret: string | null };

export const IDENTITY_GUIDE_HREF = "/docs/identity-verification";

const STEPS: [string, string][] = [
  ["Your server signs a token", "When a customer logs in, your server creates a short-lived token signed with the secret above."],
  ["Your page hands it to Elpino", "Pass the token to $elpino on the page. No separate endpoint is needed. Call logout when the customer signs out."],
  ["The AI knows who they are", "Signed-in customers are recognised, so the AI can look up their own payments and records. Guests can still chat, with no access to accounts."],
];

export function IdentityVerificationSettingsPage() {
  const [expanded, setExpanded] = useState(false);
  // Whether the workspace already has an identity secret. The switch has to start from this, not from "off",
  // or a refresh makes a feature that is on look switched off.
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/workspace/identity-secret", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { configured?: boolean } | null) => { if (!cancelled && data?.configured) setExpanded(true); })
      .catch(() => undefined)
      .finally(() => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="identity-page mx-auto w-full max-w-[1120px] px-7 pb-14 pt-8 sm:px-9 lg:px-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="tag-heading text-[30px] font-normal tracking-[-0.04em]">Identity verification</h2>
          <p className="tag-paragraph mt-2 max-w-xl text-[16px] leading-7">Prove who your logged-in customers are, so no one can chat as someone else just by typing their email.</p>
        </div>
      </header>

      <section className="tag-card mt-8 rounded-2xl border p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <span className="tag-card-icon flex size-12 shrink-0 items-center justify-center rounded-xl"><ShieldCheck size={22} /></span>
            <div className="min-w-0">
              <p className="tag-heading text-[19px] font-semibold tracking-[-0.02em]">Verify signed-in customers</p>
              <p className="tag-paragraph mt-0.5 max-w-xl text-[15px] leading-6">Let the AI safely look up a logged-in customer&apos;s own payments and records.</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {loaded && (
              <span className={`${expanded ? "tag-badge tag-badge-verified" : "id-badge-off"} inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[14px] font-semibold`}>
                {expanded ? <><Check size={14} aria-hidden="true" /> On</> : "Off"}
              </span>
            )}
            <Switch checked={expanded} disabled={!loaded} onCheckedChange={setExpanded} aria-label="Turn identity verification on" className="shrink-0" />
          </div>
        </div>

        {loaded && expanded && <IdentitySecretBlock />}
      </section>

      <div className="mt-4 flex justify-end">
        <Link href={IDENTITY_GUIDE_HREF} target="_blank" className="tag-btn flex h-10 shrink-0 items-center gap-2 rounded-full border px-5 text-[15px] font-medium transition">
          Read the guide <ArrowUpRight size={16} />
        </Link>
      </div>

      {loaded && expanded && (
        <section data-tour="identity-setup" className="tag-card mt-6 rounded-2xl border p-6 sm:p-7">
          <h3 className="tag-heading text-[19px] font-semibold tracking-[-0.02em]">How it works</h3>
          <ol className="mt-5 space-y-6">
            {STEPS.map(([title, detail], index) => (
              <li key={title} className="flex gap-4">
                <span className="tag-heading flex size-8 shrink-0 items-center justify-center rounded-full border border-current text-[14px] font-semibold" aria-hidden="true">{index + 1}</span>
                <div className="min-w-0">
                  <p className="tag-heading text-[16px] font-semibold">{title}</p>
                  <p className="tag-paragraph mt-1 text-[15px] leading-6">{detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

function IdentitySecretBlock() {
  const [state, setState] = useState<SecretState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [confirmRotate, setConfirmRotate] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/workspace/identity-secret", { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json().catch(() => ({}))) as Partial<SecretState> & { message?: string };
        if (cancelled) return;
        if (!response.ok) {
          setError(data.message ?? "Could not load identity verification settings.");
          return;
        }
        const loaded = { configured: Boolean(data.configured), secret: data.secret ?? null };
        setState(loaded);
        if (!loaded.configured) void createOrRotate();
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

  async function copySecret(secret: string) {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Copy failed. Select the text and copy it manually.");
    }
  }

  const masked = state?.secret ? `${state.secret.slice(0, 9)}${"•".repeat(24)}` : "";

  return (
    <div data-tour="identity-secret" className="tag-card-actions mt-6 border-t pt-6">
      <div className="flex items-center gap-2.5">
        <KeyRound size={18} className="tag-heading" aria-hidden="true" />
        <h3 className="tag-heading text-[17px] font-semibold tracking-[-0.01em]">Identity secret</h3>
      </div>
      <p className="tag-paragraph mt-1.5 max-w-2xl text-[15px] leading-6">
        {state?.configured
          ? "Keep this on your server only. Anyone who has it can sign in as any of your users."
          : "Generating the secret your server signs tokens with…"}
      </p>

      {!state && !error && <p className="tag-paragraph mt-4 flex items-center gap-2 text-[15px]"><LoaderCircle size={15} className="animate-spin" />Loading</p>}
      {error && <p role="alert" className="mt-4 rounded-xl bg-[#FFF2F2] px-4 py-3 text-[14px] font-medium text-[#A64A53]">{error}</p>}

      {state?.configured && state.secret && (
        <div className="mt-5">
          <code className="id-secret block min-w-0 truncate rounded-xl border px-4 py-3 font-mono text-[14px]">{revealed ? state.secret : masked}</code>
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <button type="button" onClick={() => setRevealed((value) => !value)} className="tag-btn inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border px-5 text-[14px] font-medium transition">
              {revealed ? <EyeOff size={16} /> : <Eye size={16} />}{revealed ? "Hide" : "Show"}
            </button>
            <button type="button" onClick={() => void copySecret(state.secret!)} className="tag-btn inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border px-5 text-[14px] font-medium transition">
              {copied ? <Check size={16} /> : <Copy size={16} />}{copied ? "Copied" : "Copy"}
            </button>
            {confirmRotate ? (
              <>
                <button type="button" disabled={busy} onClick={() => void createOrRotate()} className="tag-btn tag-btn-danger inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border px-5 text-[14px] font-medium transition disabled:cursor-not-allowed disabled:opacity-50">
                  {busy ? <LoaderCircle size={16} className="animate-spin" /> : <RefreshCw size={16} />}Rotate now
                </button>
                <button type="button" onClick={() => setConfirmRotate(false)} className="tag-paragraph inline-flex h-10 cursor-pointer items-center rounded-full px-3 text-[14px] font-medium underline-offset-4 hover:underline">Cancel</button>
              </>
            ) : (
              <button type="button" onClick={() => setConfirmRotate(true)} className="tag-btn inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border px-5 text-[14px] font-medium transition">
                <RefreshCw size={16} />Rotate
              </button>
            )}
          </div>
          {confirmRotate && (
            <p className="mt-3 text-[14px] leading-6 text-[#D9777F]">Rotating signs out every visitor using a token made with the current secret. Update your server first.</p>
          )}
        </div>
      )}
    </div>
  );
}
