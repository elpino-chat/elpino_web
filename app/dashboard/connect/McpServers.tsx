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
    <section className="mcp-root mt-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="mcp-h text-[22px] font-semibold tracking-[-0.02em]">Custom MCP servers</h2>
          <p className="mcp-t mt-1 max-w-2xl text-[15px] leading-6">Let your AI query your own systems in real time. You choose which tools it may use.</p>
        </div>
        <button type="button" disabled={servers.length >= MAX_SERVERS} onClick={() => setAdding(true)} className="mcp-btn flex h-11 w-fit shrink-0 cursor-pointer items-center gap-2 rounded-full border px-5 text-[15px] font-medium transition disabled:cursor-not-allowed disabled:opacity-40">
          <Plus size={16} /> Add MCP server
        </button>
      </div>

      {loading ? (
        <div className="mcp-card mt-5 h-[140px] animate-pulse rounded-2xl border" />
      ) : servers.length === 0 ? (
        <div className="mcp-card mt-5 flex min-h-[220px] flex-col items-center justify-center rounded-2xl border p-8 text-center">
          <span className="mcp-icon flex size-12 items-center justify-center rounded-xl"><Server size={22} /></span>
          <h3 className="mcp-h mt-4 text-[17px] font-semibold">No MCP servers yet</h3>
          <p className="mcp-t mt-1.5 max-w-sm text-[14.5px] leading-6">Any server that speaks MCP over HTTPS works: order status, inventory, account lookups and more.</p>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {servers.map(({ row, meta }) => {
            const enabled = meta.tools.filter((tool) => tool.enabled).length;
            const changesData = meta.tools.some((tool) => tool.enabled && !tool.readOnly);
            return (
              <article key={row.provider} className="mcp-card flex min-h-[200px] flex-col rounded-2xl border p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="mcp-icon flex size-11 shrink-0 items-center justify-center rounded-xl"><Server size={20} /></span>
                  <AccessBadge access={meta.access ?? "verified"} />
                </div>
                <div className="mt-4 min-w-0">
                  <h3 className="mcp-h truncate text-[17px] font-semibold">{meta.name}</h3>
                  <p className="mcp-t mt-0.5 truncate font-mono text-[13px]" title={meta.displayUrl}>{meta.displayUrl}</p>
                  <p className="mcp-t mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14.5px]">
                    {enabled} of {meta.tools.length} tools enabled
                    {changesData && <span className="mcp-warn inline-flex items-center gap-1 text-[13.5px] font-medium"><AlertTriangle size={13} />Can change data</span>}
                  </p>
                </div>
                <div className="mcp-divide mt-auto flex items-center justify-between gap-2 border-t pt-4">
                  <button type="button" onClick={() => setManaging(meta.slug)} className="mcp-btn h-10 cursor-pointer rounded-full border px-5 text-[14.5px] font-medium transition">Manage tools</button>
                  <button type="button" disabled={disconnecting === row.provider} onClick={() => onDisconnect(row.provider)} className="mcp-danger inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full px-3 text-[14.5px] font-medium transition disabled:opacity-40">
                    {disconnecting === row.provider ? <LoaderCircle size={14} className="animate-spin" /> : <Unplug size={14} />}Disconnect
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
  return (
    <span className="mcp-chip inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12.5px] font-medium">
      {access === "public" ? <Globe size={12} /> : <Lock size={12} />}
      {access === "public" ? "Any visitor" : "Verified customers"}
    </span>
  );
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
    <Dialog title="Add MCP server" icon={<Server size={20} />} onClose={onClose} busy={saving}
      footer={<>
        <p className="mcp-t hidden text-[13.5px] sm:block">We list its tools before saving.</p>
        <div className="flex gap-2.5">
          <button type="button" onClick={onClose} className="mcp-btn h-11 cursor-pointer rounded-full border px-5 text-[15px] font-medium transition">Cancel</button>
          <button type="button" disabled={!canSubmit || saving} onClick={() => void submit()} className="mcp-primary inline-flex h-11 min-w-28 cursor-pointer items-center justify-center gap-2 rounded-full border px-5 text-[15px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50">
            {saving && <LoaderCircle size={15} className="animate-spin" />}{saving ? "Connecting…" : "Connect"}
          </button>
        </div>
      </>}>
      <div className="space-y-5">
        <label className="mcp-h block text-[15px] font-medium">Name
          <input autoFocus value={name} maxLength={60} onChange={(event) => setName(event.target.value)} placeholder="Orders API" className="mcp-input mt-2 h-11 w-full rounded-xl border px-4 text-[15px] outline-none" />
        </label>
        <label className="mcp-h block text-[15px] font-medium">Server URL
          <input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://mcp.yourcompany.com/mcp" inputMode="url" name="mcp-server-url" autoComplete="url" data-1p-ignore data-lpignore="true" className="mcp-input mt-2 h-11 w-full rounded-xl border px-4 font-mono text-[14.5px] outline-none" />
          <span className="mcp-t mt-1.5 block text-[13.5px] font-normal">Streamable HTTP endpoint. Must be HTTPS and reachable from the internet.</span>
        </label>

        <div>
          <p className="mcp-h text-[15px] font-medium">Authentication</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {([["bearer", "Bearer token"], ["headers", "Custom headers"], ["none", "None"]] as const).map(([value, label]) => (
              <button key={value} type="button" aria-pressed={authType === value} onClick={() => setAuthType(value)} className={`mcp-pill h-9 cursor-pointer rounded-full border px-4 text-[14px] font-medium transition ${authType === value ? "mcp-pill-on" : ""}`}>{label}</button>
            ))}
          </div>
          {authType === "bearer" && (
            <div className="relative mt-3">
              <KeyRound size={15} className="mcp-t absolute left-4 top-1/2 -translate-y-1/2" />
              {/* new-password, not off: browsers ignore off on password fields and would
                  autofill a saved site login here (and its username into the URL). */}
              <input type="password" value={token} onChange={(event) => setToken(event.target.value)} placeholder="Token" name="mcp-bearer-token" autoComplete="new-password" data-1p-ignore data-lpignore="true" className="mcp-input h-11 w-full rounded-xl border pl-10 pr-4 text-[15px] outline-none" />
            </div>
          )}
          {authType === "headers" && (
            <div className="mt-3 space-y-2">
              {headers.map((header, index) => (
                <div key={index} className="flex gap-2">
                  <input value={header.name} onChange={(event) => setHeaders((current) => current.map((item, i) => i === index ? { ...item, name: event.target.value } : item))} placeholder="X-Api-Key" autoComplete="off" data-1p-ignore data-lpignore="true" className="mcp-input h-11 w-2/5 rounded-xl border px-4 font-mono text-[14px] outline-none" />
                  <input type="password" value={header.value} onChange={(event) => setHeaders((current) => current.map((item, i) => i === index ? { ...item, value: event.target.value } : item))} placeholder="Value" autoComplete="new-password" data-1p-ignore data-lpignore="true" className="mcp-input h-11 min-w-0 flex-1 rounded-xl border px-4 text-[15px] outline-none" />
                  <button type="button" aria-label="Remove header" disabled={headers.length === 1} onClick={() => setHeaders((current) => current.filter((_, i) => i !== index))} className="mcp-close flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl disabled:cursor-not-allowed disabled:opacity-30"><Trash2 size={15} /></button>
                </div>
              ))}
              {headers.length < MAX_HEADERS && <button type="button" onClick={() => setHeaders((current) => [...current, { name: "", value: "" }])} className="mcp-link inline-flex cursor-pointer items-center gap-1.5 text-[14px] font-medium hover:underline"><Plus size={14} />Add header</button>}
            </div>
          )}
          {authType === "none" && <p className="mcp-t mt-3 text-[13.5px]">Only for servers that expose nothing private.</p>}
        </div>

        <p className="mcp-t text-[13.5px] leading-5">Credentials are encrypted before storage and never shown again. Tools that describe themselves as read-only start enabled; everything else starts off until you switch it on.</p>
        {error && <p role="alert" className="mcp-error text-[14px] font-medium">{error}</p>}
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
    <Dialog title={meta.name} icon={<Server size={20} />} onClose={onClose} busy={busy !== null} wide
      footer={<>
        <button type="button" disabled={busy !== null} onClick={() => void refresh()} className="mcp-link inline-flex h-10 cursor-pointer items-center gap-2 text-[14.5px] font-medium hover:underline disabled:opacity-40">
          <RefreshCw size={14} className={busy === "refresh" ? "animate-spin" : ""} />Refresh tools
        </button>
        <div className="flex gap-2.5">
          <button type="button" onClick={onClose} className="mcp-btn h-11 cursor-pointer rounded-full border px-5 text-[15px] font-medium transition">Cancel</button>
          <button type="button" disabled={busy !== null} onClick={() => void save()} className="mcp-primary inline-flex h-11 min-w-24 cursor-pointer items-center justify-center gap-2 rounded-full border px-5 text-[15px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50">
            {busy === "save" && <LoaderCircle size={15} className="animate-spin" />}Save
          </button>
        </div>
      </>}>
      <p className="mcp-t font-mono text-[13px]">{meta.displayUrl}{meta.serverName ? ` · ${meta.serverName}${meta.serverVersion ? ` ${meta.serverVersion}` : ""}` : ""}</p>

      <div className="mt-5 flex items-center justify-between">
        <h3 className="mcp-h text-[15px] font-semibold">Tools</h3>
        <p className={`text-[13.5px] ${atLimit ? "mcp-warn font-medium" : "mcp-t"}`}>{enabled.size} of {MAX_ENABLED_TOOLS} max enabled</p>
      </div>
      {meta.tools.length === 0 ? (
        <p className="mcp-box mcp-t mt-2 rounded-xl border p-5 text-center text-[14.5px]">This server did not list any tools.</p>
      ) : (
        <ul className="mcp-box mt-2 overflow-hidden rounded-2xl border">
          {meta.tools.map((tool) => {
            const on = enabled.has(tool.name);
            const blocked = !tool.supported || (!on && atLimit);
            return (
              <li key={tool.name} className="mcp-divide flex items-start gap-3.5 border-t p-4 first:border-t-0">
                <button type="button" role="switch" aria-checked={on} aria-label={`Allow ${tool.title ?? tool.name}`} disabled={blocked} onClick={() => toggle(tool)}
                  className={`mcp-switch relative mt-0.5 h-6 w-11 shrink-0 cursor-pointer rounded-full transition disabled:cursor-not-allowed disabled:opacity-30 ${on ? "mcp-switch-on" : ""}`}>
                  <span className={`mcp-knob absolute top-0.5 size-5 rounded-full transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="mcp-h font-mono text-[14px] font-medium">{tool.name}</span>
                    {!tool.supported ? <span className="mcp-chip rounded-full border px-2 py-0.5 text-[12px]">Unsupported input</span>
                      : tool.readOnly ? <span className="mcp-chip rounded-full border px-2 py-0.5 text-[12px]">Read-only</span>
                      : <span className="mcp-chip mcp-warn inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[12px] font-medium"><AlertTriangle size={11} />Can change data</span>}
                  </div>
                  {(tool.title || tool.description) && <p className="mcp-t mt-1 line-clamp-2 text-[14px] leading-5">{tool.description || tool.title}</p>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mcp-t mt-3 text-[13.5px] leading-5">Read-only labels come from the server itself. Only enable tools you trust the agent to call during live chats.</p>

      {enabledChangesData.length > 0 && (
        <div className="mcp-box mt-4 flex items-start gap-2.5 rounded-xl border p-4 text-[14px] leading-5">
          <AlertTriangle size={16} className="mcp-warn mt-0.5 shrink-0" />
          <span className="mcp-t">{enabledChangesData.length === 1 ? "1 enabled tool" : `${enabledChangesData.length} enabled tools`} can change data. The agent only calls these for verified customers who explicitly ask for that action.</span>
        </div>
      )}
      {error && <p role="alert" className="mcp-error mt-4 text-[14px] font-medium">{error}</p>}
    </Dialog>
  );
}

function Dialog({ title, icon, onClose, busy, wide, footer, children }: {
  title: string;
  icon: React.ReactNode;
  onClose: () => void;
  busy: boolean;
  wide?: boolean;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
      <aside role="dialog" aria-modal="true" aria-labelledby="mcp-dialog-title" className={`mcp-dialog flex max-h-[min(720px,calc(100dvh-32px))] w-full ${wide ? "max-w-[620px]" : "max-w-[540px]"} flex-col overflow-hidden rounded-2xl border shadow-[0_28px_80px_rgba(0,0,0,0.4)]`}>
        <div className="mcp-divide flex shrink-0 items-start justify-between gap-3 border-b px-6 py-5">
          <div className="flex min-w-0 items-center gap-3.5">
            <span className="mcp-icon flex size-11 shrink-0 items-center justify-center rounded-xl">{icon}</span>
            <h2 id="mcp-dialog-title" className="mcp-h truncate text-[19px] font-semibold tracking-[-0.02em]">{title}</h2>
          </div>
          <button type="button" aria-label="Close" disabled={busy} onClick={onClose} className="mcp-close flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg transition disabled:opacity-40"><X size={18} /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 [scrollbar-width:thin]">{children}</div>
        <div className="mcp-divide flex shrink-0 items-center justify-between gap-3 border-t px-6 py-4">{footer}</div>
      </aside>
    </div>
  );
}
