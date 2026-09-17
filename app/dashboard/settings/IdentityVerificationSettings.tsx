"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Copy, Eye, EyeOff, KeyRound, LoaderCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { CodeBlock, ServerSnippetTabs } from "@/app/components/identity/CodeBlock";
import { PAGE_SNIPPET, SPA_SNIPPET } from "@/lib/identity-snippets";

// Identity verification for the chat widget: lets a business tell the widget
// who their logged-in user is, so the AI agent can look up that person's own
// payments and connected-system records. The business's server signs a
// short-lived token with this secret; the page passes it to the tag.

type SecretState = { configured: boolean; secret: string | null };

export const IDENTITY_GUIDE_HREF = "/docs/identity-verification";

const HOW_IT_WORKS = [
  { title: "Your server signs", body: "When a logged-in user loads your site, your backend signs a short-lived token with the identity secret." },
  { title: "Your page hands it over", body: "The Elpino tag asks your page for the token and passes it to the chat. The secret never reaches the browser." },
  { title: "Elpino verifies", body: "The chat shows as verified, and the AI can look up that customer's own payments and records, and no one else's." },
];

export function IdentityVerificationSettingsPage() {
  return (
    <div className="mx-auto w-full max-w-[1120px] px-7 pb-14 pt-8 text-[#17181a] sm:px-9 lg:px-10">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E5E8EA] pb-7">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6D7D85]">Website data</p>
          <h2 className="mt-2 text-[34px] font-medium tracking-[-0.04em] text-white/90">Identity verification</h2>
          <p className="mt-2 max-w-xl text-[14px] leading-6 text-[#667069]">
            Prove who your logged-in users are, so a visitor can&apos;t chat as someone else by typing their email.
          </p>
        </div>
        <Link href={IDENTITY_GUIDE_HREF} target="_blank" className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-[#D8DDE1] px-3.5 text-[12px] font-semibold transition hover:bg-black/5">
          Read the guide <ArrowUpRight size={14} />
        </Link>
      </div>

      <section className="mt-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#687178]">How it works</p>
        <ol className="mt-3 grid gap-3 md:grid-cols-3">
          {HOW_IT_WORKS.map((step, index) => (
            <li key={step.title} className="rounded-xl border border-[#e7e8ea] p-4">
              <span className="flex size-6 items-center justify-center rounded-full bg-[#428ce5]/10 text-[11px] font-semibold text-[#428ce5]">{index + 1}</span>
              <p className="mt-3 text-[13px] font-semibold">{step.title}</p>
              <p className="mt-1 text-[12px] leading-5 text-[#687178]">{step.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-[12px] leading-5 text-[#687178]">
          Without it, anyone can type a customer&apos;s email into the chat. With it, only visitors your own login vouched for are treated as that customer. Guests can still chat as usual.
        </p>
      </section>

      <IdentitySecretCard />

      <section className="mt-8 space-y-5">
        <div>
          <p className="text-[13px] font-semibold">1. Sign a token on your server</p>
          <p className="mt-1 mb-3 text-[12px] leading-5 text-[#687178]">Add an endpoint that returns a fresh token for the logged-in user. Store the secret as <code className="font-mono">ELPINO_IDENTITY_SECRET</code>.</p>
          <ServerSnippetTabs />
        </div>
        <div>
          <p className="text-[13px] font-semibold">2. Pass it to the widget</p>
          <p className="mt-1 mb-3 text-[12px] leading-5 text-[#687178]">Add this before your Elpino tag. Logged-out visitors get <code className="font-mono">null</code> and chat as guests.</p>
          <CodeBlock title="HTML" code={PAGE_SNIPPET} />
        </div>
        <div>
          <p className="text-[13px] font-semibold">3. Single-page apps: report login and logout</p>
          <p className="mt-1 mb-3 text-[12px] leading-5 text-[#687178]">If login happens without a page reload, tell the widget.</p>
          <CodeBlock title="JavaScript" code={SPA_SNIPPET} />
        </div>
        <p className="text-[12px] leading-5 text-[#687178]">
          Not working? Open your browser console and look for <code className="font-mono">[Elpino] Identity token was not accepted</code>. The guide lists what each reason means.{" "}
          <Link href={`${IDENTITY_GUIDE_HREF}#troubleshooting`} target="_blank" className="font-medium text-[#428ce5] hover:underline">Troubleshooting</Link>
        </p>
      </section>
    </div>
  );
}

function IdentitySecretCard() {
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
    <section className="mt-8 rounded-xl border border-[#e7e8ea] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#428ce5]/10 text-[#428ce5]"><ShieldCheck size={17} /></span>
          <div>
            <h3 className="text-[14px] font-semibold">Identity secret</h3>
            <p className="mt-1 max-w-2xl text-[12px] leading-5 text-[#687178]">
              {state?.configured
                ? "On. Keep this on your server only. Anyone with it can sign in as any of your users."
                : "Off. Turn it on to generate the secret your server signs tokens with."}
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
        <div className="mt-5">
          <div className="flex flex-wrap items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-lg border border-[#e7e8ea] px-3 py-2 font-mono text-[12px]">{revealed ? state.secret : masked}</code>
            <button type="button" onClick={() => setRevealed((value) => !value)} aria-label={revealed ? "Hide secret" : "Show secret"} className="flex size-9 items-center justify-center rounded-lg border border-[#e7e8ea] text-[#687178] hover:text-[#17181a]">{revealed ? <EyeOff size={14} /> : <Eye size={14} />}</button>
            <button type="button" onClick={() => void copySecret(state.secret!)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#e7e8ea] px-3 text-[12px] font-medium">{copied ? <Check size={14} /> : <Copy size={14} />}Copy</button>
            {confirmRotate ? (
              <>
                <button type="button" disabled={busy} onClick={() => void createOrRotate()} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#A64A53] px-3 text-[12px] font-medium text-white disabled:opacity-50">{busy ? <LoaderCircle size={14} className="animate-spin" /> : <RefreshCw size={14} />}Rotate now</button>
                <button type="button" onClick={() => setConfirmRotate(false)} className="h-9 rounded-lg px-3 text-[12px] font-medium text-[#687178]">Cancel</button>
              </>
            ) : (
              <button type="button" onClick={() => setConfirmRotate(true)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#e7e8ea] px-3 text-[12px] font-medium"><RefreshCw size={14} />Rotate</button>
            )}
          </div>
          {confirmRotate && (
            <p className="mt-2 text-[11px] leading-4 text-[#A64A53]">Rotating signs out every visitor using a token made with the current secret. Update your server first.</p>
          )}
        </div>
      )}
    </section>
  );
}
