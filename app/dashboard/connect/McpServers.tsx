"use client";

import { useEffect, useMemo, useState } from "react";
import posthog from "posthog-js";
import { AlertTriangle, Globe, KeyRound, LoaderCircle, Lock, Plus, RefreshCw, Server, Trash2, Unplug, X } from "lucide-react";

// Customer-connected MCP servers: add one, then choose exactly which of its
// tools the AI agent may call. Nothing reaches the agent until it is switched
// on here, and the backend re-checks that list on every call.

export type McpTool = { name: string; exposedName: string; title?: string; description: string; readOnly: boolean; destructive: boolean; supported: boolean; enabled: boolean };
export type McpMetadata = {
  kind: "mcp";
  slug: string;
  name: string;
  displayUrl: string;
  authType: "none" | "bearer" | "headers";
  access?: "verified" | "public";
  serverName?: string;
  serverVersion?: string;
  tools: McpTool[];
  discoveredAt: string;
};
type Row = { provider: string; status: string; connectedAt: string; metadata?: unknown };
type Banner = { kind: "success" | "error"; text: string };
type Access = "verified" | "public";

const MAX_SERVERS = 5;
const MAX_ENABLED_TOOLS = 15;
const MAX_HEADERS = 10;

const inputClass = "h-10 w-full rounded-lg border border-white/10 bg-[#222324] px-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#428ce5]/60 focus:ring-2 focus:ring-[#428ce5]/10";

function mcpServers(integrations: Row[]) {
  return integrations
    .filter((row) => row.provider.startsWith("mcp:"))
    .map((row) => ({ row, meta: row.metadata as McpMetadata | null }))
    .filter((server): server is { row: Row; meta: McpMetadata } => server.meta?.kind === "mcp");
}

async function readMessage(response: Response | null, fallback: string) {
  if (!response) return fallback;
  const data = (await response.json().catch(() => ({}))) as { message?: string };
  return data.message ?? fallback;
}

function useEscape(onClose: () => void, busy: boolean) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => { if (event.key === "Escape" && !busy) onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, busy]);
}

export function McpServers({ integrations, loading, disconnecting, onDisconnect, onChanged, notify }: {
  integrations: Row[];
  loading: boolean;
  disconnecting: string | null;
  onDisconnect: (provider: string) => void;
  onChanged: () => Promise<void>;
  notify: (banner: Banner) => void;
}) {
  const servers = useMemo(() => mcpServers(integrations), [integrations]);
  const [adding, setAdding] = useState(false);
  const [managing, setManaging] = useState<string | null>(null);
  const managed = servers.find((server) => server.meta.slug === managing)?.meta ?? null;

  return (
    <section className="mt-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-medium text-white/90">Custom MCP servers</h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-white/40">Let the AI agent query your own systems in real time. Connect an MCP server, then choose exactly which of its tools the agent may use.</p>
        </div>
        <button type="button" disabled={servers.length >= MAX_SERVERS} onClick={() => setAdding(true)} className="inline-flex h-9 w-fit items-center gap-1.5 rounded-lg bg-[#f5f5f5] px-3.5 text-xs font-medium text-[#202020] transition hover:bg-[#e6e6e6] disabled:opacity-35">
          <Plus size={14} />Add MCP server
        </button>
      </div>

      {loading ? (
        <div className="mt-4 h-[120px] animate-pulse rounded-xl border border-white/10 bg-white/[0.03]" />
      ) : servers.length === 0 ? (
        <div className="mt-4 flex min-h-[140px] flex-col items-center justify-center rounded-xl border border-dashed border-white/15 p-6 text-center">
          <span className="flex size-10 items-center justify-center rounded-lg bg-white/5 text-white/40"><Server size={18} /></span>
          <h3 className="mt-3 text-sm font-medium text-white/85">No MCP servers yet</h3>
          <p className="mt-1 max-w-sm text-xs text-white/40">Any server that speaks MCP over HTTPS works: order status, inventory, account lookups and more.</p>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {servers.map(({ row, meta }) => {
            const enabled = meta.tools.filter((tool) => tool.enabled).length;
            const changesData = meta.tools.some((tool) => tool.enabled && !tool.readOnly);
            return (
              <article key={row.provider} className="flex min-h-[180px] flex-col rounded-xl border border-[#428ce5]/30 bg-[#428ce5]/[0.06] p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/70"><Server size={18} /></span>
                  <AccessBadge access={meta.access ?? "verified"} />
                </div>
                <div className="mt-3 min-w-0">
                  <h3 className="truncate text-base font-medium text-white/90">{meta.name}</h3>
                  <p className="mt-0.5 truncate font-mono text-[11px] text-white/40" title={meta.displayUrl}>{meta.displayUrl}</p>
                  <p className="mt-2 text-xs text-white/55">
                    {enabled} of {meta.tools.length} tools enabled
                    {changesData && <span className="ml-2 inline-flex items-center gap-1 text-amber-300/80"><AlertTriangle size={11} />can change data</span>}
                  </p>
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-3">
                  <button type="button" onClick={() => setManaging(meta.slug)} className="text-xs font-medium text-white/80 hover:text-white">Manage tools</button>
                  <button type="button" disabled={disconnecting === row.provider} onClick={() => onDisconnect(row.provider)} className="inline-flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-300 disabled:opacity-40">
                    {disconnecting === row.provider ? <LoaderCircle size={13} className="animate-spin" /> : <Unplug size={13} />}Disconnect
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {adding && (
        <AddMcpDialog
          onClose={() => setAdding(false)}
          onConnected={async (meta) => {
            posthog.capture("integration_connected", { provider: "mcp", tools: meta.tools.length });
            setAdding(false);
            await onChanged();
            setManaging(meta.slug);
            notify({ kind: "success", text: `${meta.name} is connected. Review which tools the agent may use.` });
          }}
        />
      )}
      {managed && (
        <McpToolsDialog
          key={managed.slug}
          initial={managed}
          onClose={() => setManaging(null)}
          onSaved={async (meta) => {
            setManaging(null);
            await onChanged();
            notify({ kind: "success", text: `Tool access for ${meta.name} saved.` });
          }}
        />
      )}
    </section>
  );
}

function AccessBadge({ access }: { access: Access }) {
  return access === "public"
    ? <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[10px] font-medium text-white/65"><Globe size={11} />Any visitor</span>
    : <span className="inline-flex items-center gap-1 rounded-full bg-[#428ce5]/15 px-2 py-1 text-[10px] font-medium text-[#91c4ff]"><Lock size={11} />Verified customers</span>;
}

function AddMcpDialog({ onClose, onConnected }: { onClose: () => void; onConnected: (meta: McpMetadata) => void | Promise<void> }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [authType, setAuthType] = useState<McpMetadata["authType"]>("bearer");
  const [token, setToken] = useState("");
  const [headers, setHeaders] = useState<{ name: string; value: string }[]>([{ name: "", value: "" }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEscape(onClose, saving);

  const filledHeaders = headers.filter((header) => header.name.trim() && header.value);
  const canSubmit = name.trim() && /^https:\/\//i.test(url.trim())
    && (authType === "none" || (authType === "bearer" ? token.trim() : filledHeaders.length > 0));

  async function submit() {
    if (!canSubmit || saving) return;
    setSaving(true);
    setError(null);
    const auth = authType === "none" ? { type: "none" }
      : authType === "bearer" ? { type: "bearer", token: token.trim() }
      : { type: "headers", headers: Object.fromEntries(filledHeaders.map((header) => [header.name.trim(), header.value])) };
    const response = await fetch("/api/workspace/integrations/mcp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      // No access field: new servers take the backend's safe default,
      // verified customers only.
      body: JSON.stringify({ name: name.trim(), url: url.trim(), auth }),
    }).catch(() => null);
    if (response?.ok) {
      const data = (await response.json()) as { metadata: McpMetadata };
      await onConnected(data.metadata);
    } else {
      setError(await readMessage(response, "Could not connect to this server."));
      setSaving(false);
    }
  }

  return (
    <Dialog title="Add MCP server" eyebrow="Custom connection" icon={<Server size={18} />} onClose={onClose} busy={saving}
      footer={<>
        <p className="hidden text-[10px] text-white/30 sm:block">We list its tools before saving.</p>
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-xs font-medium text-white/50 hover:bg-white/5 hover:text-white">Cancel</button>
          <button type="button" disabled={!canSubmit || saving} onClick={() => void submit()} className="inline-flex min-w-28 items-center justify-center gap-2 rounded-lg bg-[#f5f5f5] px-4 py-2 text-xs font-medium text-[#202020] transition hover:bg-[#e6e6e6] disabled:opacity-35">
            {saving && <LoaderCircle size={14} className="animate-spin" />}{saving ? "Connecting…" : "Connect"}
          </button>
        </div>
      </>}>
      <div className="space-y-4">
        <label className="block text-xs font-medium text-white/75">Name
          <input autoFocus value={name} maxLength={60} onChange={(event) => setName(event.target.value)} placeholder="Orders API" className={`mt-2 ${inputClass}`} />
        </label>
        <label className="block text-xs font-medium text-white/75">Server URL
          <input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://mcp.yourcompany.com/mcp" inputMode="url" name="mcp-server-url" autoComplete="url" data-1p-ignore data-lpignore="true" className={`mt-2 font-mono ${inputClass}`} />
          <span className="mt-1.5 block text-[11px] font-normal text-white/35">Streamable HTTP endpoint. Must be HTTPS and reachable from the internet.</span>
        </label>

        <div>
          <p className="text-xs font-medium text-white/75">Authentication</p>
          <div className="mt-2 flex w-fit rounded-lg border border-white/10 bg-white/[0.035] p-1">
            {([["bearer", "Bearer token"], ["headers", "Custom headers"], ["none", "None"]] as const).map(([value, label]) => (
              <button key={value} type="button" onClick={() => setAuthType(value)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${authType === value ? "bg-white/10 text-white" : "text-white/45 hover:text-white/80"}`}>{label}</button>
            ))}
          </div>
          {authType === "bearer" && (
            <div className="relative mt-3">
              <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
              {/* new-password, not off: browsers ignore off on password fields and would
                  autofill a saved site login here (and its username into the URL). */}
              <input type="password" value={token} onChange={(event) => setToken(event.target.value)} placeholder="Token" name="mcp-bearer-token" autoComplete="new-password" data-1p-ignore data-lpignore="true" className={`${inputClass} pl-9`} />
            </div>
          )}
          {authType === "headers" && (
            <div className="mt-3 space-y-2">
              {headers.map((header, index) => (
                <div key={index} className="flex gap-2">
                  <input value={header.name} onChange={(event) => setHeaders((current) => current.map((item, i) => i === index ? { ...item, name: event.target.value } : item))} placeholder="X-Api-Key" autoComplete="off" data-1p-ignore data-lpignore="true" className={`${inputClass} w-2/5 font-mono`} />
                  <input type="password" value={header.value} onChange={(event) => setHeaders((current) => current.map((item, i) => i === index ? { ...item, value: event.target.value } : item))} placeholder="Value" autoComplete="new-password" data-1p-ignore data-lpignore="true" className={`${inputClass} flex-1`} />
                  <button type="button" aria-label="Remove header" disabled={headers.length === 1} onClick={() => setHeaders((current) => current.filter((_, i) => i !== index))} className="flex size-10 shrink-0 items-center justify-center rounded-lg text-white/40 hover:bg-white/5 hover:text-white disabled:opacity-30"><Trash2 size={14} /></button>
                </div>
              ))}
              {headers.length < MAX_HEADERS && <button type="button" onClick={() => setHeaders((current) => [...current, { name: "", value: "" }])} className="inline-flex items-center gap-1 text-xs font-medium text-white/60 hover:text-white"><Plus size={13} />Add header</button>}
            </div>
          )}
          {authType === "none" && <p className="mt-3 text-[11px] text-white/35">Only for servers that expose nothing private.</p>}
        </div>

        <p className="text-[11px] leading-4 text-white/35">Credentials are encrypted before storage and never shown again. Tools that describe themselves as read-only start enabled; everything else starts off until you switch it on.</p>
        {error && <p className="rounded-lg bg-red-500/10 p-3 text-xs font-medium text-red-300">{error}</p>}
      </div>
    </Dialog>
  );
}

function McpToolsDialog({ initial, onClose, onSaved }: { initial: McpMetadata; onClose: () => void; onSaved: (meta: McpMetadata) => void | Promise<void> }) {
  const [meta, setMeta] = useState(initial);
  const [enabled, setEnabled] = useState(() => new Set(initial.tools.filter((tool) => tool.enabled).map((tool) => tool.name)));
  const [busy, setBusy] = useState<"save" | "refresh" | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEscape(onClose, busy !== null);

  const atLimit = enabled.size >= MAX_ENABLED_TOOLS;
  const enabledChangesData = meta.tools.filter((tool) => enabled.has(tool.name) && !tool.readOnly);

  function toggle(tool: McpTool) {
    setEnabled((current) => {
      const next = new Set(current);
      if (next.has(tool.name)) next.delete(tool.name);
      else if (tool.supported && next.size < MAX_ENABLED_TOOLS) next.add(tool.name);
      return next;
    });
  }

  async function refresh() {
    setBusy("refresh");
    setError(null);
    const response = await fetch(`/api/workspace/integrations/mcp/${encodeURIComponent(meta.slug)}/refresh`, { method: "POST" }).catch(() => null);
    if (response?.ok) {
      const data = (await response.json()) as { metadata: McpMetadata };
      setMeta(data.metadata);
      setEnabled(new Set(data.metadata.tools.filter((tool) => tool.enabled).map((tool) => tool.name)));
    } else {
      setError(await readMessage(response, "Could not reach this server."));
    }
    setBusy(null);
  }

  async function save() {
    setBusy("save");
    setError(null);
    const response = await fetch(`/api/workspace/integrations/mcp/${encodeURIComponent(meta.slug)}/tools`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      // access is omitted, so the server's stored setting is kept.
      body: JSON.stringify({ enabled: [...enabled] }),
    }).catch(() => null);
    if (response?.ok) {
      const data = (await response.json()) as { metadata: McpMetadata };
      await onSaved(data.metadata);
    } else {
      setError(await readMessage(response, "Could not save tool access."));
      setBusy(null);
    }
  }

  return (
    <Dialog title={meta.name} eyebrow="Tool access" icon={<Server size={18} />} onClose={onClose} busy={busy !== null} wide
      footer={<>
        <button type="button" disabled={busy !== null} onClick={() => void refresh()} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-white/60 hover:bg-white/5 hover:text-white disabled:opacity-40">
          <RefreshCw size={13} className={busy === "refresh" ? "animate-spin" : ""} />Refresh tools
        </button>
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-xs font-medium text-white/50 hover:bg-white/5 hover:text-white">Cancel</button>
          <button type="button" disabled={busy !== null} onClick={() => void save()} className="inline-flex min-w-24 items-center justify-center gap-2 rounded-lg bg-[#f5f5f5] px-4 py-2 text-xs font-medium text-[#202020] transition hover:bg-[#e6e6e6] disabled:opacity-35">
            {busy === "save" && <LoaderCircle size={14} className="animate-spin" />}Save
          </button>
        </div>
      </>}>
      <p className="font-mono text-[11px] text-white/40">{meta.displayUrl}{meta.serverName ? ` · ${meta.serverName}${meta.serverVersion ? ` ${meta.serverVersion}` : ""}` : ""}</p>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-xs font-medium text-white/75">Tools</p>
        <p className={`text-[11px] ${atLimit ? "text-amber-300/80" : "text-white/40"}`}>{enabled.size} of {MAX_ENABLED_TOOLS} max enabled</p>
      </div>
      {meta.tools.length === 0 ? (
        <p className="mt-2 rounded-lg border border-dashed border-white/15 p-4 text-center text-xs text-white/40">This server did not list any tools.</p>
      ) : (
        <ul className="mt-2 divide-y divide-white/[0.06] overflow-hidden rounded-xl border border-white/10">
          {meta.tools.map((tool) => {
            const on = enabled.has(tool.name);
            const blocked = !tool.supported || (!on && atLimit);
            return (
              <li key={tool.name} className={`flex items-start gap-3 p-3 ${on ? "bg-white/[0.03]" : ""}`}>
                <button type="button" role="switch" aria-checked={on} aria-label={`Allow ${tool.title ?? tool.name}`} disabled={blocked} onClick={() => toggle(tool)}
                  className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition disabled:opacity-30 ${on ? "bg-[#428ce5]" : "bg-white/15"}`}>
                  <span className={`absolute top-0.5 size-4 rounded-full bg-[#f5f5f5] transition-all ${on ? "left-[18px]" : "left-0.5"}`} />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-xs text-white/85">{tool.name}</span>
                    {!tool.supported ? <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/50">Unsupported input</span>
                      : tool.readOnly ? <span className="rounded bg-[#428ce5]/15 px-1.5 py-0.5 text-[10px] text-[#91c4ff]">Read-only</span>
                      : <span className="inline-flex items-center gap-1 rounded bg-amber-400/10 px-1.5 py-0.5 text-[10px] text-amber-300/90"><AlertTriangle size={10} />Can change data</span>}
                  </div>
                  {(tool.title || tool.description) && <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-white/45">{tool.description || tool.title}</p>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-2 text-[10px] leading-4 text-white/30">Read-only labels come from the server itself. Only enable tools you trust the agent to call during live chats.</p>

      {enabledChangesData.length > 0 && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-400/[0.08] p-3 text-[11px] leading-4 text-amber-200/80">
          <AlertTriangle size={15} className="shrink-0" />
          <span>{enabledChangesData.length === 1 ? "1 enabled tool" : `${enabledChangesData.length} enabled tools`} can change data. The agent only calls these for verified customers who explicitly ask for that action.</span>
        </div>
      )}
      {error && <p className="mt-4 rounded-lg bg-red-500/10 p-3 text-xs font-medium text-red-300">{error}</p>}
    </Dialog>
  );
}

function Dialog({ title, eyebrow, icon, onClose, busy, wide, footer, children }: {
  title: string;
  eyebrow: string;
  icon: React.ReactNode;
  onClose: () => void;
  busy: boolean;
  wide?: boolean;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
      <aside role="dialog" aria-modal="true" aria-labelledby="mcp-dialog-title" className={`w-full ${wide ? "max-w-[600px]" : "max-w-[520px]"} overflow-hidden rounded-2xl border border-white/10 bg-[#292a2b] text-white shadow-[0_24px_70px_rgba(0,0,0,0.5)]`}>
        <div className="flex items-start justify-between border-b border-white/10 px-6 py-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#428ce5]/10 text-[#5ca5fa] ring-1 ring-[#428ce5]/20">{icon}</span>
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/35">{eyebrow}</p>
              <h2 id="mcp-dialog-title" className="mt-0.5 truncate text-lg font-medium">{title}</h2>
            </div>
          </div>
          <button type="button" aria-label="Close" disabled={busy} onClick={onClose} className="flex size-8 items-center justify-center rounded-lg text-white/45 hover:bg-white/5 hover:text-white disabled:opacity-40"><X size={16} /></button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-6 [scrollbar-width:thin]">{children}</div>
        <div className="flex items-center justify-between gap-2 border-t border-white/10 px-6 py-4">{footer}</div>
      </aside>
    </div>
  );
}
