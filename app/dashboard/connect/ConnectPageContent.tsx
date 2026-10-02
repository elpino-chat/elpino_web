"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import posthog from "posthog-js";
import { Check, CheckCircle2, ChevronRight, CreditCard, ExternalLink, KeyRound, ListTodo, LoaderCircle, Lock, MessageSquareText, Search, ShieldCheck, ShoppingBag, Sparkles, Unplug, Users, X } from "lucide-react";
import { RazorpayIcon, StripeIcon, TrelloIcon } from "@/app/components/ConnectorIcons";
import { McpServers } from "./McpServers";
import { AiPermissions } from "./AiPermissions";

// metadata is provider-specific: Asana's workspace name, or an MCP server's
// name, URL and tool approvals (see McpServers).
type Integration = { provider: string; authType: string; status: string; connectedAt: string; metadata?: ({ workspaceGid?: string; workspaceName?: string } & Record<string, unknown>) | null };
type ApiKeyProvider = "stripe" | "razorpay" | "trello" | "cashfree" | "paystack" | "shopify" | "woocommerce" | "hubspot";
type Category = "All tools" | "Ticketing" | "Payments" | "Stores" | "CRM";

// plain: an address, not a secret, so it is shown as typed.
const API_KEY_FIELDS: Record<ApiKeyProvider, { key: string; label: string; placeholder?: string; plain?: boolean }[]> = {
  stripe: [{ key: "secretKey", label: "Secret key", placeholder: "sk_live_…" }],
  razorpay: [{ key: "keyId", label: "Key ID", placeholder: "rzp_live_…" }, { key: "keySecret", label: "Key secret" }],
  trello: [{ key: "apiKey", label: "API key" }, { key: "token", label: "Token" }],
  // Cashfree's Payment Gateway API authenticates with these two headers —
  // labelled the way their own dashboard (Developers > API Keys) does, so
  // whatever the user copies from there maps directly onto these fields.
  cashfree: [{ key: "clientId", label: "Client ID (App ID)", placeholder: "TEST1234…" }, { key: "clientSecret", label: "Client secret" }],
  // Paystack only needs the secret key for server-side lookups — the public
  // key is for their client-side checkout widget, not used here.
  paystack: [{ key: "secretKey", label: "Secret key", placeholder: "sk_live_…" }],
  // A custom app's Admin API token (Settings > Apps > Develop apps), with read_orders and write_orders.
  shopify: [{ key: "shopDomain", label: "Store address", placeholder: "your-store.myshopify.com", plain: true }, { key: "accessToken", label: "Admin API access token", placeholder: "shpat_…" }],
  // WooCommerce > Settings > Advanced > REST API, with Read/Write permission.
  woocommerce: [{ key: "siteUrl", label: "Store address", placeholder: "https://shop.example.com", plain: true }, { key: "consumerKey", label: "Consumer key", placeholder: "ck_…" }, { key: "consumerSecret", label: "Consumer secret", placeholder: "cs_…" }],
  // A private app token (Settings > Integrations > Private apps) with contacts read and write.
  hubspot: [{ key: "accessToken", label: "Private app access token", placeholder: "pat-…" }],
};

const CONNECTION_DETAILS: Record<ApiKeyProvider, { summary: string; uses: string[]; note: string }> = {
  stripe: {
    summary: "Bring relevant Stripe context into billing conversations so your team can answer customers without switching tabs.",
    uses: ["Find a customer from their conversation details", "View recent payments and payment status", "Add billing context to support responses"],
    note: "Use a restricted key with read access to customers and payments.",
  },
  razorpay: {
    summary: "Give support agents the payment context they need while responding to Razorpay customers.",
    uses: ["Match customers to payment records", "View recent transaction status", "Investigate billing questions faster"],
    note: "Only provide credentials for the account you want this workspace to access.",
  },
  trello: {
    summary: "Turn follow-up requests from support conversations into Trello cards for the right team.",
    uses: ["Create cards from customer conversations", "Include the issue summary and conversation link", "Keep follow-up work visible to your team"],
    note: "The token should have access only to the boards your support team uses.",
  },
  cashfree: {
    summary: "Bring Indian payment and settlement history into customer conversations so your team can answer without switching tabs.",
    uses: ["Find an order or payment from a conversation", "View settlement and refund status", "Add billing context to support responses"],
    note: "Find these under Developers > API Keys in your Cashfree dashboard. We verify them against Cashfree before saving.",
  },
  paystack: {
    summary: "Understand a customer's African payment activity while you're already talking to them.",
    uses: ["Look up a transaction from a conversation", "Check payment and refund status", "Add billing context to support responses"],
    note: "Use a secret key with read access. We verify it against Paystack before saving.",
  },
  shopify: {
    summary: "Let the AI answer order questions from your live Shopify store: where an order is, tracking, what was ordered.",
    uses: ["Look up a verified customer's orders, status and tracking", "Cancel an order that hasn't shipped, if you allow it below", "Fix the shipping address before it ships, if you allow it below"],
    note: "Create a custom app under Settings > Apps > Develop apps with read_orders (and write_orders for cancellations and address changes). We verify the token against your store before saving.",
  },
  woocommerce: {
    summary: "Let the AI answer order questions from your WooCommerce store, including Shipment Tracking numbers.",
    uses: ["Look up a verified customer's orders, status and tracking", "Cancel an order that hasn't shipped, if you allow it below", "Fix the shipping address before it ships, if you allow it below"],
    note: "Create keys under WooCommerce > Settings > Advanced > REST API with Read/Write permission. We verify them against your store before saving.",
  },
  hubspot: {
    summary: "Save visitors who want to buy as leads in HubSpot, with what they asked for, so sales can follow up.",
    uses: ["Create or update the contact from the visitor's details", "Attach a note with their needs, team size and timeline", "Never overwrite a lead status your team already set"],
    note: "Create a private app under Settings > Integrations > Private apps with crm.objects.contacts.read and .write. We verify the token before saving.",
  },
};

function MonogramIcon({ letter, color }: { letter: string; color: string }) {
  return <span className="dashboard-connect-badge-letter flex size-full items-center justify-center rounded-[13px] text-sm font-black text-white" style={{ backgroundColor: color }}>{letter}</span>;
}

// Brandfetch-backed logo, with the hand-drawn icon as a fallback for
// whatever Brandfetch doesn't have a match for. The URL this resolves to is
// always a locally cached file (see /api/workspace/integrations/logo) — the
// first request for a name downloads and caches it server-side, everything
// after that is served from the cache with no external call at all.
function ConnectorLogo({ name, fallback }: { name: string; fallback: React.ReactNode }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setUrl(null);
    setFailed(false);
    fetch(`/api/workspace/integrations/logo?name=${encodeURIComponent(name)}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { url?: string } | null) => {
        if (cancelled) return;
        if (data?.url) setUrl(data.url);
        else setFailed(true);
      })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [name]);

  if (failed || !url) return <>{fallback}</>;
  return <img src={url} alt={`${name} logo`} className="size-full object-contain" onError={() => setFailed(true)} />;
}

type CatalogItem = { id: string; label: string; description: string; category: Exclude<Category, "All tools">; eyebrow: string; icon: () => React.ReactNode }
  & ({ kind: "oauth"; provider: string; startHref: string } | { kind: "apikey"; provider: ApiKeyProvider } | { kind: "soon" });

const CATALOG: CatalogItem[] = [
  { id: "asana", label: "Asana", eyebrow: "Create tasks", description: "Turn customer conversations into trackable work for your product and operations teams.", category: "Ticketing", icon: () => <ListTodo size={24} color="#f06a6a" />, kind: "oauth", provider: "asana", startHref: "/api/integrations/asana" },
  { id: "trello", label: "Trello", eyebrow: "Create cards", description: "Send follow-ups to the right board without leaving the support conversation.", category: "Ticketing", icon: () => <TrelloIcon className="size-7" />, kind: "apikey", provider: "trello" },
  { id: "stripe", label: "Stripe", eyebrow: "Payment context", description: "Give your team instant access to customer payment history during billing conversations.", category: "Payments", icon: () => <StripeIcon className="size-7" />, kind: "apikey", provider: "stripe" },
  { id: "razorpay", label: "Razorpay", eyebrow: "Payment context", description: "Look up transactions and resolve payment questions with the full story in view.", category: "Payments", icon: () => <RazorpayIcon className="size-7" />, kind: "apikey", provider: "razorpay" },
  { id: "cashfree", label: "Cashfree", eyebrow: "Payments & settlements", description: "Bring Indian payment and settlement history into customer conversations.", category: "Payments", icon: () => <MonogramIcon letter="C" color="#00a7c7" />, kind: "apikey", provider: "cashfree" },
  { id: "paystack", label: "Paystack", eyebrow: "Payment context", description: "Understand African payment activity while supporting your customers.", category: "Payments", icon: () => <MonogramIcon letter="P" color="#0ba4c8" />, kind: "apikey", provider: "paystack" },
  { id: "shopify", label: "Shopify", eyebrow: "Orders & tracking", description: "Answer where-is-my-order, tracking and cancellation questions from your live store.", category: "Stores", icon: () => <MonogramIcon letter="S" color="#5e8e3e" />, kind: "apikey", provider: "shopify" },
  { id: "woocommerce", label: "WooCommerce", eyebrow: "Orders & tracking", description: "Look up orders, status and Shipment Tracking numbers from your WooCommerce store.", category: "Stores", icon: () => <MonogramIcon letter="W" color="#7f54b3" />, kind: "apikey", provider: "woocommerce" },
  { id: "hubspot", label: "HubSpot", eyebrow: "Sales leads", description: "Save visitors who want to buy as HubSpot leads, with what they asked for.", category: "CRM", icon: () => <MonogramIcon letter="H" color="#ff7a59" />, kind: "apikey", provider: "hubspot" },
];
const CATEGORIES: Category[] = ["All tools", "Ticketing", "Payments", "Stores", "CRM"];

export function ConnectPageContent() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [openProvider, setOpenProvider] = useState<ApiKeyProvider | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [view, setView] = useState<"explore" | "connected">("explore");
  const [category, setCategory] = useState<Category>("All tools");
  const [query, setQuery] = useState("");

  async function loadIntegrations() {
    try {
      const response = await fetch("/api/workspace/integrations", { cache: "no-store" });
      const data = (await response.json()) as { integrations?: Integration[] };
      setIntegrations(data.integrations ?? []);
    } catch { setIntegrations([]); } finally { setLoading(false); }
  }

  useEffect(() => {
    void loadIntegrations();
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connected");
    const error = params.get("integration_error");
    if (connected) setBanner({ kind: "success", text: `${connected[0].toUpperCase()}${connected.slice(1)} is ready to use.` });
    else if (error) setBanner({ kind: "error", text: `Connection failed: ${error.replaceAll("_", " ")}` });
    if (connected || error) window.history.replaceState(null, "", window.location.pathname);
  }, []);

  async function disconnect(provider: string) {
    setDisconnecting(provider);
    const response = await fetch(`/api/workspace/integrations/${encodeURIComponent(provider)}`, { method: "DELETE" }).catch(() => null);
    if (!response?.ok) setBanner({ kind: "error", text: "We couldn’t disconnect that tool. Try again." });
    else posthog.capture("integration_disconnected", { provider });
    await loadIntegrations();
    setDisconnecting(null);
  }

  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATALOG.filter((item) => {
      const connected = integrations.some((row) => row.provider === item.id);
      return (view === "explore" || connected) && (category === "All tools" || item.category === category) && (!q || `${item.label} ${item.description} ${item.category}`.toLowerCase().includes(q));
    });
  }, [category, integrations, query, view]);

  return (
    <main className="dashboard-connect-page min-h-full bg-[#262626] text-white antialiased">
      <div className="mx-auto w-full max-w-[1320px] px-4 pb-16 pt-7 sm:px-10 lg:px-12">
        <header className="flex flex-col gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-normal uppercase tracking-[0.16em] text-white/40">Integrations</p>
            <h1 className="mt-2 text-3xl font-normal tracking-[-0.03em] text-white/95">Connect</h1>
            <p className="mt-2 max-w-xl text-sm text-white/45">Connect tools for ticket follow-up, payments, store orders, your CRM and your own MCP servers.</p>
          </div>
          <Link href="/dashboard/connect/prechat-form" className="flex h-10 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 text-left transition hover:bg-white/[0.07]">
            <MessageSquareText size={16} className="text-white/55" />
            <span><span className="block text-xs font-medium text-white/85">Pre-chat form</span><span className="block text-[10px] text-white/40">Edit visitor questions</span></span>
            <ChevronRight size={14} className="ml-2 text-white/35" />
          </Link>
        </header>

        {banner && <div className={`mt-5 flex items-center justify-between rounded-lg border px-3.5 py-2.5 text-xs ${banner.kind === "success" ? "border-[#428ce5]/25 bg-[#428ce5]/10 text-[#91c4ff]" : "border-red-500/20 bg-red-500/10 text-red-300"}`}><span className="flex items-center gap-2">{banner.kind === "success" && <Check size={14} strokeWidth={2.5} />}{banner.text}</span><button type="button" aria-label="Dismiss" onClick={() => setBanner(null)} className="rounded-md p-1 hover:bg-white/5"><X size={14} /></button></div>}

        <section className="mt-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div><h2 className="text-base font-medium text-white/90">Connector library</h2>{!loading && <p className="mt-1 text-xs text-white/40">{integrations.length} connected</p>}</div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Sized to content (not stretched) even when it's alone on its
                  own row below sm — a flex-col parent stretches children to
                  fill the row by default, which would otherwise leave this
                  pill's own background dead space to the right of its two
                  short buttons. */}
              <div className="connect-view-toggle flex w-fit self-start rounded-lg border border-white/20 p-1 sm:self-auto">{(["explore", "connected"] as const).map((item) => <button key={item} type="button" onClick={() => setView(item)} aria-pressed={view === item} className={`rounded-md px-3.5 py-1.5 text-xs font-medium capitalize transition ${view === item ? "connect-view-on" : "connect-view-off"}`}>{item}{item === "connected" && integrations.length > 0 ? ` · ${integrations.length}` : ""}</button>)}</div>
              <label className="flex h-9 w-full items-center gap-2 rounded-lg border border-white/10 bg-white/[0.045] px-3 transition focus-within:border-white/20 sm:w-auto sm:min-w-[220px]"><Search size={14} className="text-white/35" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search connectors" className="min-w-0 flex-1 bg-transparent text-[13px] text-white/90 outline-none placeholder:text-white/35" />{query && <button type="button" aria-label="Clear search" onClick={() => setQuery("")}><X size={13} /></button>}</label>
            </div>
          </div>
          <div className="mt-5 flex gap-1.5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{CATEGORIES.map((item) => { const Icon = item === "Ticketing" ? ListTodo : item === "Payments" ? CreditCard : item === "Stores" ? ShoppingBag : item === "CRM" ? Users : Sparkles; return <button key={item} type="button" onClick={() => setCategory(item)} className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-normal transition ${category === item ? "border-white/20 bg-white/10 text-white" : "border-white/10 text-white/45 hover:bg-white/[0.05] hover:text-white/75"}`}><Icon size={13} />{item}</button>; })}</div>

          {loading ? <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-[210px] animate-pulse rounded-xl border border-white/10 bg-white/[0.03]" />)}</div> : visibleItems.length === 0 ? (
            <div className="mt-4 flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-dashed border-white/15 p-8 text-center"><span className="flex size-10 items-center justify-center rounded-lg bg-white/5 text-white/40"><Search size={18} /></span><h3 className="mt-3 text-sm font-medium text-white/85">{view === "connected" ? "No connected tools here" : "No tools found"}</h3><p className="mt-1 max-w-sm text-xs text-white/40">{view === "connected" ? "Explore the library and connect your first tool." : "Try a different search or category."}</p>{view === "connected" && <button type="button" onClick={() => { setView("explore"); setCategory("All tools"); }} className="mt-4 rounded-lg bg-white px-4 py-2 text-xs font-medium text-[#202020]">Explore connectors</button>}</div>
          ) : <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{visibleItems.map((item) => {
            const connection = integrations.find((row) => row.provider === item.id);
            const connected = Boolean(connection);
            return <article key={item.id} className={`flex min-h-[210px] flex-col rounded-xl border p-4 transition ${connected ? "border-[#428ce5]/30 bg-[#428ce5]/[0.06]" : "border-white/10 bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.045]"}`}>
              <div className="flex items-start justify-between gap-4"><span className="flex size-10 items-center justify-center overflow-hidden rounded-lg bg-white p-2 shadow-sm"><ConnectorLogo name={item.label} fallback={item.icon()} /></span>{connected ? <span className="inline-flex items-center gap-1.5 rounded-full bg-[#428ce5]/15 px-2 py-1 text-[10px] font-medium text-[#91c4ff]"><span className="size-1.5 rounded-full bg-[#428ce5]" />Connected</span> : item.kind === "soon" ? <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-white/30">Coming soon</span> : null}</div>
              <div className="mt-4"><p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/35">{item.eyebrow}</p><h3 className="mt-1 text-base font-medium text-white/90">{item.label}</h3><p className="mt-1.5 line-clamp-2 text-xs leading-5 text-white/45">{connected && connection?.metadata?.workspaceName ? `Connected to ${connection.metadata.workspaceName}.` : item.description}</p></div>
              <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-3"><span className="inline-flex items-center gap-1.5 text-[10px] text-white/30"><ShieldCheck size={12} />Encrypted</span>{connected ? <button type="button" disabled={disconnecting === item.id} onClick={() => void disconnect(item.id)} className="inline-flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-300 disabled:opacity-40">{disconnecting === item.id ? <LoaderCircle size={13} className="animate-spin" /> : <Unplug size={13} />}Disconnect</button> : item.kind === "soon" ? <span className="text-xs text-white/30">In development</span> : item.kind === "oauth" ? <a href={item.startHref} className="inline-flex items-center gap-1.5 text-xs font-medium text-white/80 hover:text-white">Connect <ExternalLink size={13} /></a> : <button type="button" onClick={() => setOpenProvider(item.provider)} className="inline-flex items-center gap-1 text-xs font-medium text-white/80 hover:text-white">Connect <ChevronRight size={14} /></button>}</div>
            </article>;
          })}</div>}
        </section>

        <AiPermissions integrations={integrations} notify={setBanner} />

        <McpServers integrations={integrations} loading={loading} disconnecting={disconnecting} onDisconnect={(provider) => void disconnect(provider)} onChanged={loadIntegrations} notify={setBanner} />
      </div>
      {openProvider && <ApiKeyDialog provider={openProvider} onClose={() => setOpenProvider(null)} onConnected={(provider) => { posthog.capture("integration_connected", { provider }); setOpenProvider(null); setBanner({ kind: "success", text: "Connection saved and ready to use." }); void loadIntegrations(); }} />}
    </main>
  );
}

function ApiKeyDialog({ provider, onClose, onConnected }: { provider: ApiKeyProvider; onClose: () => void; onConnected: (provider: ApiKeyProvider) => void }) {
  const fields = API_KEY_FIELDS[provider];
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const label = CATALOG.find((item) => item.id === provider)?.label ?? provider;
  const details = CONNECTION_DETAILS[provider];
  const canSubmit = fields.every((field) => values[field.key]?.trim());
  useEffect(() => { const handler = (event: KeyboardEvent) => { if (event.key === "Escape" && !saving) onClose(); }; window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler); }, [onClose, saving]);
  async function submit() {
    if (!canSubmit || saving) return;
    setSaving(true); setError(null);
    const response = await fetch("/api/workspace/integrations/apikey", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ provider, credentials: values }) }).catch(() => null);
    if (response?.ok) onConnected(provider); else { const data = response ? await response.json().catch(() => ({})) as { message?: string } : {}; setError(data.message ?? "Could not save these credentials."); setSaving(false); }
  }
  const catalogItem = CATALOG.find((item) => item.id === provider);
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[3px]" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose(); }}>
    <aside role="dialog" aria-modal="true" aria-labelledby="connect-dialog-title" className="connect-dialog w-full max-w-[500px] overflow-hidden rounded-[14px] border border-[var(--cd-border)] bg-[var(--cd-bg)] text-[var(--cd-text)] shadow-[0_28px_80px_rgba(0,0,0,0.5)]">
      <div className="flex items-start justify-between gap-4 px-6 pb-5 pt-6">
        <div className="flex items-center gap-3.5">
          <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--cd-border)] bg-white p-2.5"><ConnectorLogo name={label} fallback={catalogItem ? catalogItem.icon() : <KeyRound size={18} />} /></span>
          <div>
            <p className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--cd-muted)]"><Lock size={11} />Secure connection</p>
            <h2 id="connect-dialog-title" className="mt-0.5 text-[22px] font-normal tracking-[-0.03em]">Connect {label}</h2>
          </div>
        </div>
        <button type="button" aria-label="Close" onClick={onClose} className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[var(--cd-border)] text-[var(--cd-muted)] transition hover:bg-[var(--cd-surface-2)] hover:text-[var(--cd-text)]"><X size={16} /></button>
      </div>
      <div className="max-h-[68vh] overflow-y-auto border-t border-[var(--cd-border)] px-6 py-6 [scrollbar-width:thin]">
        <p className="text-[14px] leading-6 text-[var(--cd-muted)]">{details.summary}</p>
        <div className="mt-5 rounded-[10px] border border-[var(--cd-border)] p-4">
          <p className="text-[12px] font-medium text-[var(--cd-muted)]">How Elpino will use it</p>
          <ul className="mt-3 space-y-2.5">{details.uses.map((use) => <li key={use} className="flex items-start gap-2.5 text-[13px] leading-5"><CheckCircle2 size={16} className="mt-px shrink-0 text-[var(--cd-good)]" />{use}</li>)}</ul>
        </div>
        <div className="mt-6 space-y-4">{fields.map((field) => <label key={field.key} className="block text-[13px] font-medium">{field.label}<div className="relative mt-2"><KeyRound size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--cd-muted)]" /><input autoFocus={field === fields[0]} type={field.plain ? "text" : "password"} value={values[field.key] ?? ""} onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))} placeholder={field.placeholder} autoComplete="off" className="connect-dialog-input h-11 w-full rounded-[10px] border border-[var(--cd-border)] bg-transparent pl-10 pr-3 text-[14px] font-normal outline-none transition placeholder:text-[var(--cd-muted)] focus:border-[var(--cd-text)]" /></div></label>)}</div>
        <p className="mt-3 text-[12px] leading-5 text-[var(--cd-muted)]">{details.note}</p>
        <div className="mt-5 flex items-start gap-3 rounded-[10px] bg-[var(--cd-surface-2)] p-3.5 text-[12.5px] leading-5 text-[var(--cd-muted)]"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-[var(--cd-good)]" /><span><strong className="font-medium text-[var(--cd-text)]">Encrypted and private.</strong> Credentials are encrypted before storage and are never displayed after you connect.</span></div>
        {error && <p className="mt-4 rounded-[10px] bg-[var(--cd-bad-bg)] p-3 text-[13px] font-medium text-[var(--cd-bad)]">{error}</p>}
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-[var(--cd-border)] px-6 py-4"><p className="hidden text-[12px] text-[var(--cd-muted)] sm:block">You can disconnect at any time.</p><div className="ml-auto flex gap-2"><button type="button" onClick={onClose} className="h-10 rounded-full border border-[var(--cd-border)] px-5 text-[13px] font-medium transition hover:bg-[var(--cd-surface-2)]">Cancel</button><button type="button" disabled={!canSubmit || saving} onClick={() => void submit()} className="inline-flex h-10 min-w-32 items-center justify-center gap-2 rounded-full bg-[var(--cd-ink)] px-5 text-[13px] font-medium text-[var(--cd-ink-text)] transition hover:opacity-85 disabled:opacity-35">{saving && <LoaderCircle size={14} className="animate-spin" />}Connect {label}</button></div></div>
    </aside>
  </div>;
}
