"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ExternalLink, LoaderCircle, MessageCircle, Phone, RotateCcw, ShieldAlert } from "lucide-react";

type Site = { id: string; name: string | null; domain: string; publicKey: string; allowLocalhost: boolean };

// The widget's loader reads its site key from the script tag, so it is added once the workspace's own key is known.
// A site that is not yet allowed on localhost is shown the one-click fix instead of a widget that would be refused.
export default function DevWidgetClient() {
  const [site, setSite] = useState<Site | null>(null);
  const [state, setState] = useState<"loading" | "none" | "ready" | "error">("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/workspace/sites", { cache: "no-store" });
      const data = (await response.json()) as { sites?: Site[]; message?: string };
      if (!response.ok) { setState("error"); setMessage(data.message ?? "Could not load your website tags."); return; }
      const first = data.sites?.[0] ?? null;
      setSite(first);
      setState(first ? "ready" : "none");
    } catch {
      setState("error");
      setMessage("Could not reach the dashboard API. Is the stack running?");
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  // The widget loads only for a site that allows localhost.
  useEffect(() => {
    if (!site?.allowLocalhost) return;
    if (document.querySelector("script[data-elpino-dev-widget]")) return;
    const script = document.createElement("script");
    script.src = "/tag.js";
    script.async = true;
    script.dataset.siteKey = site.publicKey;
    script.setAttribute("data-site-key", site.publicKey);
    script.setAttribute("data-elpino-dev-widget", "true");
    document.body.appendChild(script);
  }, [site]);

  async function allowLocalhost() {
    if (!site || saving) return;
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/workspace/sites/${encodeURIComponent(site.id)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ allowLocalhost: true }),
      });
      const data = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) { setMessage(data.message ?? "Could not allow localhost."); return; }
      // The loader cannot be unloaded or reconfigured, so start the page again with the site allowed.
      window.location.reload();
    } finally {
      setSaving(false);
    }
  }

  // A brand-new visitor: forgets the widget's saved visitor and conversation, so the next message starts a chat
  // as someone the team has never seen.
  function resetVisitor() {
    for (const store of [window.localStorage, window.sessionStorage]) {
      try {
        for (const key of Object.keys(store)) if (key.startsWith("elpino")) store.removeItem(key);
      } catch { /* storage unavailable */ }
    }
    window.location.reload();
  }

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-[#1c1c1e]">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <p className="inline-flex items-center gap-2 rounded-full bg-[#fff4d6] px-3 py-1 text-[12px] font-semibold text-[#8a5a00]">
          <ShieldAlert size={13} /> Development only. This page does not exist in production.
        </p>
        <h1 className="mt-4 text-[28px] font-semibold tracking-[-0.02em]">Acme Co. (a pretend customer website)</h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-6 text-[#5b616b]">
          This page stands in for your customer's site. The chat bubble in the corner is your real widget, talking to your real local
          backend and your real workspace, so you can chat here and answer in the dashboard.
        </p>

        <section className="mt-8 rounded-2xl border border-[#e3e5e8] bg-white p-5">
          <h2 className="text-[15px] font-semibold">Widget status</h2>
          {state === "loading" && <p className="mt-3 flex items-center gap-2 text-[14px] text-[#5b616b]"><LoaderCircle size={15} className="animate-spin" /> Looking up your website tag…</p>}
          {state === "error" && <p className="mt-3 text-[14px] text-[#c0392b]">{message}</p>}
          {state === "none" && (
            <p className="mt-3 text-[14px] leading-6 text-[#5b616b]">
              Your workspace has no website tag yet. Add one in <Link className="underline" href="/dashboard/settings">Settings</Link> (any domain is fine), then come back.
            </p>
          )}
          {state === "ready" && site && (
            <div className="mt-3 space-y-3 text-[14px]">
              <p className="text-[#5b616b]">Workspace tag: <span className="font-medium text-[#1c1c1e]">{site.domain}</span> <span className="ml-1 font-mono text-[12px]">{site.publicKey}</span></p>
              {site.allowLocalhost ? (
                <p className="flex items-center gap-2 font-medium text-[#1f8a4c]"><CheckCircle2 size={16} /> Allowed on localhost. The widget is loaded in the bottom-right corner.</p>
              ) : (
                <div className="rounded-xl bg-[#fff8e6] p-4">
                  <p className="leading-6 text-[#6b4a00]">This tag only accepts its real domain, so the widget would be refused here. Allow localhost for it (a setting for local testing, the same one in Settings).</p>
                  <button type="button" onClick={() => void allowLocalhost()} disabled={saving} className="mt-3 inline-flex h-9 items-center gap-2 rounded-full bg-[#111] px-4 text-[13px] font-semibold text-white disabled:opacity-60">
                    {saving ? <LoaderCircle size={14} className="animate-spin" /> : null} Allow localhost for this tag
                  </button>
                </div>
              )}
              {message && <p className="text-[#c0392b]">{message}</p>}
            </div>
          )}
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { icon: <MessageCircle size={18} />, title: "1. Chat as a visitor", body: "Open the bubble and send a message. With no AI model key set locally the AI hands the chat to the team straight away, which is a handy way to test the handoff." },
            { icon: <ExternalLink size={18} />, title: "2. Answer in the dashboard", body: "Open the inbox in another tab. The chat is under Unassigned and All conversations. Press Join chat to take it and reply." },
            { icon: <Phone size={18} />, title: "3. Call the visitor", body: "Once you have joined, press the phone icon in the chat header. This page's widget rings; Accept to talk (allow the microphone in both tabs)." },
          ].map((step) => (
            <div key={step.title} className="rounded-2xl border border-[#e3e5e8] bg-white p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1f2f4]">{step.icon}</span>
              <h3 className="mt-3 text-[14.5px] font-semibold">{step.title}</h3>
              <p className="mt-1.5 text-[13.5px] leading-6 text-[#5b616b]">{step.body}</p>
            </div>
          ))}
        </section>

        <div className="mt-6 flex flex-wrap gap-3">
          <a href="/dashboard/inbox" target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full bg-[#111] px-5 text-[13.5px] font-semibold text-white">
            <ExternalLink size={15} /> Open the dashboard inbox in a new tab
          </a>
          <button type="button" onClick={resetVisitor} className="inline-flex h-10 items-center gap-2 rounded-full border border-[#d5d8dc] bg-white px-5 text-[13.5px] font-semibold">
            <RotateCcw size={15} /> Start as a new visitor
          </button>
        </div>

        <p className="mt-8 max-w-2xl text-[13px] leading-6 text-[#7a808a]">
          The demo conversations in your inbox (Maria, Jim and the others) are made-up customers with no browser behind them, so they can't be
          called. A chat started from this page is a real visitor, and it can.
        </p>
      </div>
    </main>
  );
}
