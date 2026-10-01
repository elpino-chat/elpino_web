"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, Lock, PackageX, RotateCcw } from "lucide-react";

type Permissions = {
  aiRefunds: { enabled: boolean; maxDays: number; limits: Record<string, number> };
  aiOrderActions: { enabled: boolean };
  isOwner: boolean;
};

const PAYMENT_PROVIDERS = ["stripe", "razorpay"];
const STORE_PROVIDERS = ["shopify", "woocommerce"];

function Toggle({ checked, disabled, onChange, label }: { checked: boolean; disabled?: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition disabled:opacity-40 ${checked ? "bg-[#428ce5]" : "bg-white/15"}`}
    >
      <span className={`absolute top-0.5 size-4 rounded-full bg-white transition ${checked ? "left-[18px]" : "left-0.5"}`} />
    </button>
  );
}

// What the AI agent may do by itself with money and orders. Lookups need only a verified customer;
// these switches cover the actions that change something, and the server re-checks every limit
// (signed-in customer, the refund window and amount, one action per conversation) on each call.
export function AiPermissions({ integrations, notify }: { integrations: { provider: string }[]; notify: (banner: { kind: "success" | "error"; text: string }) => void }) {
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [saving, setSaving] = useState<"refunds" | "orders" | null>(null);
  const [currency, setCurrency] = useState("INR");
  const [amount, setAmount] = useState("");
  const [maxDays, setMaxDays] = useState("14");

  useEffect(() => {
    fetch("/api/workspace/ai-permissions", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: Permissions | null) => {
        if (!data) return;
        setPermissions(data);
        setMaxDays(String(data.aiRefunds.maxDays));
        const [first] = Object.entries(data.aiRefunds.limits);
        if (first) { setCurrency(first[0]); setAmount(String(first[1])); }
      })
      .catch(() => undefined);
  }, []);

  const hasPayments = integrations.some((row) => PAYMENT_PROVIDERS.includes(row.provider));
  const hasStore = integrations.some((row) => STORE_PROVIDERS.includes(row.provider));
  if (!permissions || (!hasPayments && !hasStore)) return null;
  const locked = !permissions.isOwner;

  async function save(kind: "refunds" | "orders", body: unknown) {
    setSaving(kind);
    const response = await fetch("/api/workspace/ai-permissions", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
    const data = response ? ((await response.json().catch(() => ({}))) as Partial<Permissions> & { message?: string }) : {};
    if (response?.ok && data.aiRefunds && data.aiOrderActions) {
      setPermissions({ ...permissions!, aiRefunds: data.aiRefunds, aiOrderActions: data.aiOrderActions });
      notify({ kind: "success", text: "AI permissions saved." });
    } else {
      notify({ kind: "error", text: data.message ?? "Could not save AI permissions." });
    }
    setSaving(null);
  }

  function saveRefunds(enabled: boolean) {
    const code = currency.trim().toUpperCase();
    const limit = Number(amount);
    const limits = code && Number.isFinite(limit) && limit > 0 ? { [code]: limit } : {};
    if (enabled && !Object.keys(limits).length) {
      notify({ kind: "error", text: "Set the largest amount the AI may refund before turning refunds on." });
      return;
    }
    void save("refunds", { aiRefunds: { enabled, maxDays: Number(maxDays), limits } });
  }

  const input = "h-8 rounded-md border border-white/10 bg-[#222324] px-2 text-xs text-white outline-none focus:border-[#428ce5]/60 disabled:opacity-40";
  return (
    <section className="mt-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-base font-medium text-white/90">What the AI may do on its own</h2>
          <p className="mt-1 max-w-2xl text-xs text-white/40">Looking things up only needs a verified customer. These actions also need the customer signed in on your site, and the AI must confirm with them first. Anything outside these limits goes to your team.</p>
        </div>
        {locked && <span className="inline-flex shrink-0 items-center gap-1.5 text-[11px] text-white/40"><Lock size={12} />Only the owner can change these</span>}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {hasPayments && (
          <article className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3"><span className="flex size-9 items-center justify-center rounded-lg bg-white/5 text-white/60"><RotateCcw size={16} /></span><div><h3 className="text-sm font-medium text-white/90">Refunds</h3><p className="mt-1 text-xs leading-5 text-white/45">Refund a completed payment in full when your refund policy allows it. One per conversation.</p></div></div>
              {saving === "refunds" ? <LoaderCircle size={16} className="animate-spin text-white/50" /> : <Toggle label="Allow AI refunds" checked={permissions.aiRefunds.enabled} disabled={locked} onChange={saveRefunds} />}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/55">
              <span>Up to</span>
              <input aria-label="Currency" value={currency} maxLength={3} disabled={locked} onChange={(event) => setCurrency(event.target.value.toUpperCase())} className={`${input} w-14 uppercase`} />
              <input aria-label="Largest refund" inputMode="decimal" value={amount} disabled={locked} onChange={(event) => setAmount(event.target.value)} placeholder="Amount" className={`${input} w-24`} />
              <span>within</span>
              <input aria-label="Refund window in days" inputMode="numeric" value={maxDays} disabled={locked} onChange={(event) => setMaxDays(event.target.value)} className={`${input} w-14`} />
              <span>days of payment</span>
              {!locked && <button type="button" disabled={saving !== null} onClick={() => saveRefunds(permissions.aiRefunds.enabled)} className="ml-auto rounded-md border border-white/10 px-2.5 py-1 text-[11px] text-white/70 hover:bg-white/5">Save limits</button>}
            </div>
          </article>
        )}
        {hasStore && (
          <article className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3"><span className="flex size-9 items-center justify-center rounded-lg bg-white/5 text-white/60"><PackageX size={16} /></span><div><h3 className="text-sm font-medium text-white/90">Order changes</h3><p className="mt-1 text-xs leading-5 text-white/45">Cancel an order that hasn&apos;t shipped, or fix its shipping address before it ships. The store is re-checked live before each change.</p></div></div>
              {saving === "orders" ? <LoaderCircle size={16} className="animate-spin text-white/50" /> : <Toggle label="Allow AI order changes" checked={permissions.aiOrderActions.enabled} disabled={locked} onChange={(enabled) => void save("orders", { aiOrderActions: { enabled } })} />}
            </div>
          </article>
        )}
      </div>
    </section>
  );
}
