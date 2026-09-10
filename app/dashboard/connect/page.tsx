"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ListTodo, LoaderCircle, Plus, Search, X } from "lucide-react";
import { RazorpayIcon, StripeIcon, TrelloIcon } from "@/app/components/ConnectorIcons";

type Integration = { provider: string; authType: string; status: string; connectedAt: string };
type ApiKeyProvider = "stripe" | "razorpay" | "trello";

const API_KEY_FIELDS: Record<ApiKeyProvider, { key: string; label: string; placeholder?: string }[]> = {
  stripe: [{ key: "secretKey", label: "Secret key", placeholder: "sk_live_…" }],
  razorpay: [
    { key: "keyId", label: "Key ID", placeholder: "rzp_live_…" },
    { key: "keySecret", label: "Key secret" },
  ],
  trello: [
    { key: "apiKey", label: "API key" },
    { key: "token", label: "Token" },
  ],
};

type Category = "All" | "Tickets" | "Payments";
const CATEGORIES: Category[] = ["All", "Tickets", "Payments"];

// A plain colored-letter badge for a provider with no downloaded brand
// asset yet, rather than guessing at a logo from memory — matches this
// app's existing ConnectorLogo fallback convention (see
// app/components/ConnectorLogo.tsx) instead of inventing new artwork.
function MonogramIcon({ letter, bg }: { letter: string; bg: string }) {
  return (
    <span className="flex h-full w-full items-center justify-center rounded-lg text-[13px] font-bold text-white" style={{ backgroundColor: bg }}>
      {letter}
    </span>
  );
}

type CatalogItem = {
  id: string;
  label: string;
  description: string;
  category: Category;
  icon: () => React.ReactNode;
} & ({ kind: "oauth"; provider: string; startHref: string } | { kind: "apikey"; provider: ApiKeyProvider } | { kind: "soon" });

const CATALOG: CatalogItem[] = [
  {
    id: "asana",
    label: "Asana",
    description: "Turn a support conversation into a tracked task for your team.",
    category: "Tickets",
    icon: () => <ListTodo size={19} color="#F06A6A" />,
    kind: "oauth",
    provider: "asana",
    startHref: "/api/integrations/asana",
  },
  {
    id: "trello",
    label: "Trello",
    description: "Raise a card on a board when a ticket needs follow-up.",
    category: "Tickets",
    icon: () => <TrelloIcon className="h-6 w-6" />,
    kind: "apikey",
    provider: "trello",
  },
  {
    id: "stripe",
    label: "Stripe",
    description: "Look up a customer's payment history while handling billing tickets.",
    category: "Payments",
    icon: () => <StripeIcon className="h-6 w-6" />,
    kind: "apikey",
    provider: "stripe",
  },
  {
    id: "razorpay",
    label: "Razorpay",
    description: "Look up a customer's payment history while handling billing tickets.",
    category: "Payments",
    icon: () => <RazorpayIcon className="h-6 w-6" />,
    kind: "apikey",
    provider: "razorpay",
  },
  {
    id: "cashfree",
    label: "Cashfree",
    description: "Look up Indian payment/settlement history while handling billing tickets.",
    category: "Payments",
    icon: () => <MonogramIcon letter="C" bg="#00B8D9" />,
    kind: "soon",
  },
  {
    id: "paystack",
    label: "Paystack",
    description: "Look up African payment history while handling billing tickets.",
    category: "Payments",
    icon: () => <MonogramIcon letter="P" bg="#00C3F7" />,
    kind: "soon",
  },
];

export default function ConnectPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [openProvider, setOpenProvider] = useState<ApiKeyProvider | null>(null);
  const [banner, setBanner] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [tab, setTab] = useState<"catalog" | "connected">("catalog");
  const [category, setCategory] = useState<Category>("All");
  const [query, setQuery] = useState("");

  function loadIntegrations() {
    fetch("/api/workspace/integrations", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { integrations?: Integration[] }) => setIntegrations(data.integrations ?? []))
      .catch(() => setIntegrations([]));
  }

  useEffect(() => {
    loadIntegrations();

    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connected");
    const error = params.get("integration_error");
    if (connected) setBanner({ kind: "success", text: `${connected[0].toUpperCase()}${connected.slice(1)} connected.` });
    else if (error) setBanner({ kind: "error", text: `Could not connect: ${error.replaceAll("_", " ")}` });
    if (connected || error) window.history.replaceState(null, "", "/dashboard/connect");
  }, []);

  async function disconnect(provider: string) {
    await fetch(`/api/workspace/integrations/${encodeURIComponent(provider)}`, { method: "DELETE" });
    loadIntegrations();
  }

  const connectedCount = integrations.length;

  const filteredCatalog = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATALOG.filter((item) => {
      const categoryOk = category === "All" || item.category === category;
      const queryOk = !q || item.label.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
      return categoryOk && queryOk;
    });
  }, [category, query]);

  const connectedItems = useMemo(
    () => CATALOG.filter((item) => item.kind !== "soon" && integrations.some((row) => row.provider === item.id)),
    [integrations],
  );

  return (
    <main className="dashboard-connect-page min-h-full bg-[#121214] font-sans text-white/90 antialiased">
      <section className="mx-auto flex w-full max-w-[1180px] flex-col px-5 py-8 sm:px-8">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">Integrations</p>
            <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-white/95">Connect</h1>
            <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-white/50">
              Connect the tools your team already uses to raise tickets or look up billing while handling a conversation.
            </p>
          </div>
        </header>

        {banner && (
          <div
            className={`mt-6 flex items-center justify-between rounded-xl border px-4 py-3 text-xs font-medium ${
              banner.kind === "success" ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300" : "border-red-500/25 bg-red-500/10 text-red-300"
            }`}
          >
            {banner.text}
            <button type="button" onClick={() => setBanner(null)} className="ml-3 shrink-0 text-white/40 hover:text-white/80"><X size={13} /></button>
          </div>
        )}

        <div className="relative mt-6">
          <Search size={16} strokeWidth={2.2} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search connectors"
            className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-11 pr-9 text-sm text-white/90 outline-none transition placeholder:text-white/40 focus:border-white/20 focus:bg-white/[0.05]"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/90">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
              <button
                type="button"
                onClick={() => setTab("catalog")}
                className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${tab === "catalog" ? "bg-white text-black" : "text-white/60 hover:text-white/90"}`}
              >
                Catalog
              </button>
              <button
                type="button"
                onClick={() => setTab("connected")}
                className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${tab === "connected" ? "bg-white text-black" : "text-white/60 hover:text-white/90"}`}
              >
                Connected
                {connectedCount > 0 && <span className={`ml-1.5 ${tab === "connected" ? "text-slate-500" : "text-white/40"}`}>{connectedCount}</span>}
              </button>
            </div>
            <p className="mt-2 text-xs text-white/50">
              {tab === "catalog" ? "Connect tools to raise tickets or look up billing." : "Tools your inbox currently has access to."}
            </p>
          </div>
        </div>

        {tab === "catalog" && (
          <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  category === cat ? "bg-white font-semibold text-black" : "text-white/50 hover:bg-white/5 hover:text-white/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <section className="mt-6">
          {tab === "connected" ? (
            connectedItems.length === 0 ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-white/5 text-white/40 ring-1 ring-white/10">
                  <Plus size={22} />
                </div>
                <h3 className="mt-4 text-base font-semibold text-white">Nothing connected yet</h3>
                <p className="mt-1.5 max-w-md text-xs leading-relaxed text-white/50">Connect a tool from the catalog to get started.</p>
                <button type="button" onClick={() => setTab("catalog")} className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-5 text-xs font-bold text-black transition hover:opacity-90">
                  Browse catalog <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {connectedItems.map((item) => {
                  const row = integrations.find((entry) => entry.provider === item.id);
                  const connectedDate = row ? new Date(row.connectedAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) : null;
                  return (
                    <article key={item.id} className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-white/20">
                      <div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="flex size-11 items-center justify-center overflow-hidden rounded-xl bg-white/5 p-2 ring-1 ring-white/10">{item.icon()}</span>
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/60">
                            <span className="size-1.5 rounded-full bg-emerald-400" /> Connected
                          </span>
                        </div>
                        <h3 className="mt-3 text-base font-semibold text-white">{item.label}</h3>
                        <p className="mt-1 text-xs text-white/50">{row?.authType === "oauth" ? "OAuth" : "API credentials"}</p>
                        {connectedDate && <p className="mt-1.5 text-[11px] text-white/40">Connected on {connectedDate}</p>}
                      </div>
                      <div className="mt-4 flex items-center justify-end border-t border-white/10 pt-3">
                        <button type="button" onClick={() => void disconnect(item.id)} className="text-xs font-semibold text-red-400 transition hover:text-red-300 hover:underline">
                          Disconnect
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )
          ) : filteredCatalog.length === 0 ? (
            <p className="py-16 text-center text-sm text-white/50">No connectors found matching &quot;{query}&quot;.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCatalog.map((item) => {
                const connectedRow = item.kind !== "soon" ? integrations.find((row) => row.provider === item.id) : undefined;
                const isConnected = Boolean(connectedRow);
                return (
                  <article
                    key={item.id}
                    className={`group flex min-h-[210px] flex-col justify-between rounded-2xl border p-4 backdrop-blur-sm transition-all duration-200 ${
                      isConnected
                        ? "border-emerald-500/30 bg-gradient-to-b from-emerald-500/[0.06] to-emerald-500/[0.02]"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-2 shadow-md ring-1 ring-white/20">{item.icon()}</span>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            isConnected
                              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                              : item.kind === "soon"
                                ? "border border-white/10 bg-white/5 text-white/30"
                                : "border border-white/10 bg-white/5 text-white/40"
                          }`}
                        >
                          {isConnected ? "Connected" : item.kind === "soon" ? "Coming soon" : "Not connected"}
                        </span>
                      </div>
                      <h3 className="mt-3.5 text-base font-bold tracking-tight text-white">{item.label}</h3>
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-white/60">{item.description}</p>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/10 pt-3">
                      {item.kind === "soon" ? (
                        <button type="button" disabled className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 px-3 text-xs font-semibold text-white/30">
                          <Plus size={12} /> Coming soon
                        </button>
                      ) : isConnected ? (
                        <button type="button" onClick={() => void disconnect(item.id)} className="ml-auto rounded-xl px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/10">
                          Disconnect
                        </button>
                      ) : item.kind === "oauth" ? (
                        <a href={item.startHref} className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-xl bg-white px-3 text-xs font-bold text-black transition hover:opacity-90">
                          Connect with {item.label}
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setOpenProvider(item.provider)}
                          className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-xl bg-white px-3 text-xs font-bold text-black transition hover:opacity-90"
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>

      {openProvider && (
        <ApiKeyDialog
          provider={openProvider}
          onClose={() => setOpenProvider(null)}
          onConnected={() => { setOpenProvider(null); loadIntegrations(); }}
        />
      )}
    </main>
  );
}

function ApiKeyDialog({ provider, onClose, onConnected }: { provider: ApiKeyProvider; onClose: () => void; onConnected: () => void }) {
  const fields = API_KEY_FIELDS[provider];
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const label = CATALOG.find((item) => item.id === provider)?.label ?? provider;
  const canSubmit = fields.every((field) => values[field.key]?.trim());

  async function submit() {
    if (!canSubmit || saving) return;
    setSaving(true);
    setError(null);
    const response = await fetch("/api/workspace/integrations/apikey", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ provider, credentials: values }),
    });
    if (response.ok) onConnected();
    else {
      const data = (await response.json().catch(() => ({}))) as { message?: string };
      setError(data.message ?? "Could not save credentials.");
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <aside role="dialog" aria-modal="true" aria-label={`Connect ${label}`} className="flex w-full max-w-[420px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#161618] shadow-2xl">
        <div className="flex items-start justify-between border-b border-white/10 p-5">
          <div>
            <h2 className="text-base font-bold text-white">Connect {label}</h2>
            <p className="mt-1 text-xs text-white/50">Credentials are encrypted before they&apos;re stored.</p>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="flex size-8 shrink-0 items-center justify-center rounded-xl text-white/40 transition hover:bg-white/10 hover:text-white">
            <X size={16} />
          </button>
        </div>
        <div className="flex flex-col gap-3.5 p-5">
          {fields.map((field) => (
            <label key={field.key} className="block text-xs font-semibold text-white/80">
              {field.label}
              <input
                autoFocus={field === fields[0]}
                type="password"
                value={values[field.key] ?? ""}
                onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}
                placeholder={field.placeholder}
                autoComplete="off"
                className="mt-2 h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3.5 text-xs text-white outline-none focus:border-white/30"
              />
            </label>
          ))}
          {error && <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-medium text-red-300">{error}</p>}
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-white/10 bg-white/[0.02] p-4">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-xs font-semibold text-white/60 hover:bg-white/5 hover:text-white">Cancel</button>
          <button type="button" disabled={!canSubmit || saving} onClick={() => void submit()} className="flex items-center gap-2 rounded-xl bg-white px-5 py-2 text-xs font-bold text-black transition hover:opacity-90 disabled:opacity-40">
            {saving && <LoaderCircle size={14} className="animate-spin" />} Connect
          </button>
        </div>
      </aside>
    </div>
  );
}
