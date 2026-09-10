"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ChevronDown, Filter, FileText, Folder, Globe2, Link2, LayoutDashboard, ListChecks, LoaderCircle, RefreshCw, Search, Sparkles, Trash2, Upload, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type KnowledgeView = "overview" | "articles" | "sources";
type SourceType = "text" | "url" | "sitemap" | "file";
type KnowledgeItem = { id: string; title: string; content: string; siteId: string | null; createdAt: string; chunkCount: number; sourceType: SourceType; sourceUrl: string | null };
type Site = { id: string; name: string; domain: string; verifiedAt?: string | null };
type AddTab = "text" | "file";

const SOURCE_LABEL: Record<SourceType, string> = { text: "Pasted", url: "Crawled page", sitemap: "Crawled sitemap", file: "Uploaded file" };

// Colors are our own palette, not any third-party brand's — "Docs" uses a
// blue document glyph in the spirit of a docs product, not a reproduction
// of any specific logo.
const nav = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, color: "#A78BFA" },
  { id: "articles", label: "Docs", icon: FileText, color: "#4C9AFF" },
  { id: "sources", label: "Page links", icon: Link2, color: "#3ECF6A" },
] as const;

export function KnowledgeClient({ view }: { view: KnowledgeView }) {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [addTab, setAddTab] = useState<AddTab>("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [siteId, setSiteId] = useState("");
  const [pendingFile, setPendingFile] = useState<{ name: string; base64: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetEditor() {
    setTitle(""); setContent(""); setSiteId(selectedSiteId); setPendingFile(null); setError(null); setAddTab("text");
  }

  function openEditor() {
    setSiteId(selectedSiteId);
    setEditorOpen(true);
  }

  function load() {
    setLoading(true);
    Promise.all([
      fetch("/api/workspace/knowledge", { cache: "no-store" }).then((response) => response.ok ? response.json() : { items: [] }),
      fetch("/api/workspace/sites", { cache: "no-store" }).then((response) => response.ok ? response.json() : { sites: [] }),
    ]).then(([knowledge, website]) => {
      const loadedSites = (website as { sites?: Site[] }).sites ?? [];
      setItems((knowledge as { items?: KnowledgeItem[] }).items ?? []);
      setSites(loadedSites);
      // Show a real domain by default instead of an aggregate "all sites"
      // view — falls back to the first connected site until the user picks
      // a different one.
      setSelectedSiteId((current) => (current && loadedSites.some((site) => site.id === current)) ? current : (loadedSites[0]?.id ?? ""));
    }).catch(() => setError("Knowledge could not be loaded.")).finally(() => setLoading(false));
  }

  useEffect(load, []);
  // Mirrors the backend's search scoping: a selected domain shows its own
  // articles plus every workspace-wide article (siteId null), since those
  // are exactly what the AI draws on when answering for that domain.
  const scopedItems = useMemo(() => (selectedSiteId ? items.filter((item) => item.siteId === selectedSiteId || item.siteId === null) : items), [items, selectedSiteId]);
  const filtered = useMemo(() => scopedItems.filter((item) => `${item.title} ${item.content}`.toLowerCase().includes(query.trim().toLowerCase())), [scopedItems, query]);

  async function createArticle() {
    if (!title.trim() || !content.trim() || saving) return;
    setSaving(true); setError(null);
    const response = await fetch("/api/workspace/knowledge", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: title.trim(), content: content.trim(), siteId: siteId || undefined }) });
    if (response.ok) { setEditorOpen(false); resetEditor(); load(); }
    else { const data = await response.json().catch(() => ({})) as { message?: string }; setError(data.message ?? "Article could not be saved."); }
    setSaving(false);
  }

  function handleFileChosen(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
      setPendingFile({ name: file.name, base64 });
    };
    reader.onerror = () => setError("Couldn't read that file.");
    reader.readAsDataURL(file);
  }

  async function uploadFile() {
    if (!pendingFile || saving) return;
    setSaving(true); setError(null);
    const response = await fetch("/api/workspace/knowledge/file", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ fileName: pendingFile.name, fileBase64: pendingFile.base64, siteId: siteId || undefined, title: title.trim() || undefined }) });
    if (response.ok) { setEditorOpen(false); resetEditor(); load(); }
    else { const data = await response.json().catch(() => ({})) as { message?: string }; setError(data.message ?? "That file could not be processed."); }
    setSaving(false);
  }

  async function removeArticle(id: string) {
    const response = await fetch(`/api/workspace/knowledge/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (response.ok) setItems((current) => current.filter((item) => item.id !== id));
  }

  return <div className="flex h-full min-h-0 overflow-hidden text-[#17181a]">
    <KnowledgeSidebar view={view} sites={sites} selectedSiteId={selectedSiteId} setSelectedSiteId={setSelectedSiteId} />
    <main className="dashboard-page-surface dashboard-knowledge-main-surface m-0.5 ml-1 min-w-0 flex-1 overflow-y-auto rounded-xl border border-black/20 bg-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="w-full px-8 pb-16 pt-9 sm:px-10 lg:px-12">
        <Toolbar loading={loading} />
        {error && <p className="mt-4 rounded-lg bg-[#fff1f1] px-3 py-2 text-[11px] font-medium text-[#a64a53]">{error}</p>}
        {loading ? <div className="flex min-h-[420px] items-center justify-center text-[12px] text-[#7b858a]"><LoaderCircle size={15} className="mr-2 animate-spin" /> Loading knowledge</div> : view === "overview" ? <Overview items={scopedItems} sites={sites} onNew={openEditor} /> : view === "articles" ? <Articles items={filtered} sites={sites} query={query} setQuery={setQuery} onDelete={removeArticle} onNew={openEditor} /> : <Sources sites={sites} items={items} defaultSiteId={selectedSiteId} onReload={load} />}
      </div>
    </main>
    {editorOpen && (
      <AddContentPanel
        addTab={addTab} setAddTab={setAddTab}
        title={title} setTitle={setTitle}
        content={content} setContent={setContent}
        siteId={siteId} setSiteId={setSiteId} sites={sites}
        pendingFile={pendingFile} onFileChosen={handleFileChosen}
        saving={saving} error={error}
        onClose={() => { setEditorOpen(false); resetEditor(); }}
        onSubmitText={() => void createArticle()}
        onSubmitFile={() => void uploadFile()}
      />
    )}
  </div>;
}

const ADD_TABS: { id: AddTab; label: string; description: string; icon: typeof FileText; color: string }[] = [
  { id: "text", label: "Paste text", description: "Write an answer yourself.", icon: FileText, color: "#4C9AFF" },
  { id: "file", label: "Upload file", description: "PDF, Word, text, or Markdown.", icon: Upload, color: "#A78BFA" },
];

function AddContentPanel({
  addTab, setAddTab,
  title, setTitle,
  content, setContent,
  siteId, setSiteId, sites,
  pendingFile, onFileChosen,
  saving, error,
  onClose,
  onSubmitText, onSubmitFile,
}: {
  addTab: AddTab; setAddTab: (tab: AddTab) => void;
  title: string; setTitle: (value: string) => void;
  content: string; setContent: (value: string) => void;
  siteId: string; setSiteId: (value: string) => void; sites: Site[];
  pendingFile: { name: string; base64: string } | null; onFileChosen: (event: React.ChangeEvent<HTMLInputElement>) => void;
  saving: boolean; error: string | null;
  onClose: () => void;
  onSubmitText: () => void; onSubmitFile: () => void;
}) {
  const [chosen, setChosen] = useState(false);

  const canSubmit =
    addTab === "text" ? Boolean(title.trim() && content.trim()) :
    Boolean(pendingFile);

  function submit() {
    if (addTab === "text") onSubmitText();
    else onSubmitFile();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <aside role="dialog" aria-modal="true" aria-label="Add knowledge content" className="dashboard-knowledge-add-panel flex max-h-[88vh] w-full max-w-[560px] flex-col overflow-hidden rounded-[24px] border border-[#dfe3e6] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.24)]">
        <div className="flex items-start justify-between px-7 py-6">
          <div>
            {chosen && (
              <button type="button" aria-label="Back" onClick={() => setChosen(false)} className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg text-[#5f686d] hover:bg-[#f1f2f3]"><ArrowLeft size={16} /></button>
            )}
            <h2 className="text-[21px] font-semibold tracking-[-0.03em]">Add to knowledge</h2>
            <p className="mt-1 text-[12px] text-[#737d83]">Give your AI accurate answers from content your team controls.</p>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-[#f1f2f3]"><X size={17} /></button>
        </div>

        {!chosen ? (
          <div className="flex flex-row gap-3 p-7">
            {ADD_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => { setAddTab(tab.id); setChosen(true); }}
                  className="flex flex-1 flex-col items-start gap-2.5 rounded-2xl border border-[#dce1e4] p-5 text-left transition hover:border-[#8f989e] hover:bg-[#f7f8f8]"
                >
                  <Icon size={22} color={tab.color} />
                  <span className="text-[13px] font-semibold">{tab.label}</span>
                  <span className="text-[11px] leading-4 text-[#7b858a]">{tab.description}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto px-7 py-6">
              {addTab === "text" && (
                <>
                  <label className="block text-[12px] font-semibold">Title
                    <input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Refund and cancellation policy" className="mt-2 h-11 w-full rounded-xl border border-[#dce1e4] px-3.5 text-[13px] outline-none focus:border-[#8f989e]" />
                  </label>
                  <label className="mt-5 block text-[12px] font-semibold">Content
                    <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write a clear, complete answer…" className="mt-2 min-h-[240px] w-full resize-none rounded-xl border border-[#dce1e4] p-3.5 text-[13px] leading-6 outline-none focus:border-[#8f989e]" />
                  </label>
                </>
              )}

              {addTab === "file" && (
                <>
                  <label className="block text-[12px] font-semibold">Title
                    <input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Defaults to the file name" className="mt-2 h-11 w-full rounded-xl border border-[#dce1e4] px-3.5 text-[13px] outline-none focus:border-[#8f989e]" />
                  </label>
                  <label className="mt-5 block text-[12px] font-semibold">File</label>
                  <label className="mt-2 flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#c7cdd1] text-center hover:bg-[#f7f8f8]">
                    <Upload size={20} className="text-[#8a9297]" />
                    <span className="text-[12.5px] font-medium">{pendingFile ? pendingFile.name : "Click to choose a file"}</span>
                    <span className="text-[10.5px] text-[#9aa1a6]">.pdf, .docx, .txt, or .md — max 5MB</span>
                    <input type="file" accept=".pdf,.docx,.txt,.md" hidden onChange={onFileChosen} />
                  </label>
                </>
              )}

              <label className="mt-5 block text-[12px] font-semibold">Website scope
                <select value={siteId} onChange={(event) => setSiteId(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[#dce1e4] bg-white px-3.5 text-[13px] outline-none">
                  <option value="">All websites</option>
                  {sites.map((site) => <option key={site.id} value={site.id}>{site.name} — {site.domain}</option>)}
                </select>
              </label>

              {error && <p className="mt-4 rounded-lg bg-[#fff1f1] px-3 py-2 text-[11px] font-medium text-[#a64a53]">{error}</p>}

              <div className="mt-5 rounded-xl bg-[#f5f7f8] p-4 text-[11px] leading-5 text-[#68737a]">
                <Sparkles size={15} className="mb-2 text-[#6b58c8]" />
                {addTab === "text" && "Use direct language and include the exceptions your support team should know."}
                {addTab === "file" && "PDFs and Word docs are converted to plain text before your AI can search them."}
              </div>
            </div>

            <div className="flex gap-3 px-7 py-5">
              <button type="button" onClick={onClose} className="h-10 flex-1 rounded-lg border border-[#dce1e4] text-[12px] font-semibold">Cancel</button>
              <button type="button" disabled={!canSubmit || saving} onClick={submit} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-[#17191b] text-[12px] font-semibold text-white disabled:opacity-40">
                {saving && <LoaderCircle size={14} className="animate-spin" />} Add to knowledge
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function Favicon({ domain, size = 20 }: { domain?: string | null; size?: number }) {
  const [failed, setFailed] = useState(false);

  if (!domain || failed) {
    return (
      <span className="flex shrink-0 items-center justify-center rounded-full bg-[#fff1e8] text-[#e2711d]" style={{ width: size, height: size }}>
        <Globe2 size={Math.round(size * 0.6)} />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-full"
      onError={() => setFailed(true)}
    />
  );
}

function KnowledgeSidebar({
  view, sites, selectedSiteId, setSelectedSiteId,
}: {
  view: KnowledgeView; sites: Site[]; selectedSiteId: string; setSelectedSiteId: (id: string) => void;
}) {
  const [domainOpen, setDomainOpen] = useState(false);
  const selected = sites.find((site) => site.id === selectedSiteId) ?? null;

  return (
    <div className="dashboard-secondary-sidebar my-0.5 ml-0.5 flex h-[calc(100%_-_4px)] w-[220px] shrink-0 flex-col overflow-hidden rounded-xl border border-black/20 max-lg:w-[190px] max-md:hidden">
      <div className="min-h-0 flex-1 px-4 pt-3">
        <Popover open={domainOpen} onOpenChange={setDomainOpen}>
          <PopoverTrigger className="flex w-full items-center gap-2 rounded-md border border-[#dde3e6] bg-transparent px-3 py-1.5 text-left hover:bg-black/[0.03]">
            <Favicon domain={selected?.domain} />
            <span className="min-w-0 flex-1 truncate text-[15px] text-[#17181a]">{selected ? selected.domain : "No website connected"}</span>
            <ChevronDown size={14} className="shrink-0 text-[#9aa1a6]" />
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[260px]">
            <p className="px-2.5 pb-1.5 pt-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#8a9298]">Domains</p>
            <div className="max-h-[260px] overflow-y-auto">
              {sites.length === 0 && <p className="px-2.5 py-3 text-[12px] text-[#8a9298]">No websites connected yet.</p>}
              {sites.map((site) => {
                const active = site.id === selectedSiteId;
                return (
                  <button
                    key={site.id}
                    type="button"
                    onClick={() => { setSelectedSiteId(site.id); setDomainOpen(false); }}
                    className={`flex h-11 w-full items-center gap-2.5 rounded-lg px-2.5 text-left ${active ? "bg-[#f0f2f3]" : "hover:bg-[#f7f8f8]"}`}
                  >
                    <Favicon domain={site.domain} size={28} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-semibold text-[#17181a]">{site.domain}</span>
                      <span className="block truncate text-[10.5px] text-[#7b858c]">{site.name}</span>
                    </span>
                    {active && <Check size={14} className="shrink-0 text-[#11120f]" />}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        <p className="mb-2 mt-5 px-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#74787c]">Library</p>
        <nav className="space-y-0.5">
          {nav.map(({ id, label, icon: Icon, color }) => (
            <Link
              key={id}
              href={id === "overview" ? "/dashboard/knowledge" : `/dashboard/knowledge/${id}`}
              aria-current={view === id ? "page" : undefined}
              className={`flex h-9 items-center gap-2.5 rounded-md px-2.5 text-[13px] ${view === id ? "dashboard-secondary-nav-active bg-[#eeeeee] font-medium" : "hover:bg-[#f0f0f0]"}`}
            >
              <Icon size={16} color={color} className="shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

function Toolbar({ loading }: { loading: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e8ea] pb-4">
      <button type="button" className="flex h-9 items-center gap-2 rounded-full border border-[#dde3e6] px-3.5 text-[12.5px] font-medium text-[#3c4245] hover:bg-[#f7f8f8]">
        <Filter size={13} /> Filters
      </button>
      {loading && (
        <span className="flex items-center gap-1.5 text-[12px] text-[#9aa1a6]">
          <RefreshCw size={12} className="animate-spin" /> Refreshing…
        </span>
      )}
    </div>
  );
}

function DashboardCard({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <article className="flex min-h-[380px] flex-col overflow-hidden rounded-2xl border border-[#e5e8ea] bg-white">
      <div className="flex items-center justify-between border-b border-[#eef0f2] px-5 py-4">
        <h3 className="text-[14px] font-semibold text-[#17181a]">{title}</h3>
        {action}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </article>
  );
}

function Overview({ items, sites, onNew }: { items: KnowledgeItem[]; sites: Site[]; onNew: () => void }) {
  return (
    <div className="mt-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <DashboardCard title="Recent" action={<Link href="/dashboard/knowledge/articles" className="text-[11px] font-semibold text-[#337bc9]">View all →</Link>}>
          {items.length === 0 ? (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center px-5 text-center">
              <ListChecks size={20} className="text-[#c3c9cd]" />
              <p className="mt-3 text-[12.5px] text-[#8a9297]">Nothing added yet.</p>
            </div>
          ) : (
            <ul>
              {items.slice(0, 6).map((item) => (
                <li key={item.id} className="flex items-center gap-3 border-b border-[#f0f2f3] px-5 py-3.5 last:border-0">
                  <ListChecks size={15} className="shrink-0 text-[#5f696f]" />
                  <p className="min-w-0 truncate text-[13px] text-[#2b2923]">
                    {item.title} <span className="text-[#9aa1a6]">· in {sites.find((site) => site.id === item.siteId)?.name ?? "All websites"}</span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>

        <DashboardCard title="Sources">
          {sites.length === 0 ? (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center px-5 text-center">
              <Globe2 size={20} className="text-[#c3c9cd]" />
              <p className="mt-3 text-[12.5px] text-[#8a9297]">No websites connected yet.</p>
            </div>
          ) : (
            <ul>
              {sites.map((site) => (
                <li key={site.id} className="flex items-center gap-3 border-b border-[#f0f2f3] px-5 py-3.5 last:border-0">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#eaf6ef] text-[#2f8054]"><Globe2 size={12} /></span>
                  <p className="min-w-0 truncate text-[13px] text-[#2b2923]">
                    {site.name} <span className="text-[#9aa1a6]">· in {site.domain}</span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>

        <DashboardCard title="Quick add">
          <div className="flex h-full min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#e5e8ea] text-[#8a9297]"><Sparkles size={18} /></span>
            <p className="mt-4 max-w-[220px] text-[12.5px] leading-5 text-[#68737a]">Paste text or upload a file to teach your AI something new.</p>
            <button type="button" onClick={onNew} className="mt-4 h-9 rounded-lg bg-[#17191b] px-4 text-[12px] font-semibold text-white hover:bg-black">Add content</button>
          </div>
        </DashboardCard>
      </div>

      <DashboardCard title="Folders">
        {sites.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-10 text-center">
            <Folder size={44} className="text-[#e5e8ea]" strokeWidth={1.3} />
            <p className="mt-4 text-[13px] font-semibold text-[#3c4245]">No folders yet</p>
            <p className="mt-1 max-w-xs text-[11.5px] leading-5 text-[#8a9297]">Connect a website to group its knowledge into a folder automatically.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 lg:grid-cols-4">
            {sites.map((site) => (
              <Link
                key={site.id}
                href="/dashboard/knowledge/sources"
                className="flex flex-col items-start gap-2 rounded-xl border border-[#eef0f2] p-4 hover:border-[#dde3e6] hover:bg-[#fafbfb]"
              >
                <Folder size={22} className="text-[#8a9297]" />
                <span className="truncate text-[12.5px] font-semibold text-[#2b2923]">{site.name}</span>
                <span className="text-[10.5px] text-[#9aa1a6]">{items.filter((item) => item.siteId === site.id).length} articles</span>
              </Link>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}

function Articles({ items, sites, query, setQuery, onDelete, onNew }: { items: KnowledgeItem[]; sites: Site[]; query: string; setQuery: (value: string) => void; onDelete: (id: string) => void; onNew: () => void }) {
  return <div className="mt-6"><div className="flex h-11 items-center gap-2 rounded-xl border border-[#dde3e6] bg-[#f8f9f9] px-3.5"><Search size={15} className="text-[#8b9499]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your knowledge…" className="min-w-0 flex-1 bg-transparent text-[13px] outline-none" /></div><div className="mt-4 overflow-hidden rounded-2xl border border-[#dde3e6]"><div className="grid grid-cols-[minmax(0,1.4fr)_110px_minmax(110px,.6fr)_100px_42px] bg-[#f5f6f7] px-5 py-3 text-[10px] font-bold uppercase tracking-[.08em] text-[#7b858a]"><span>Article</span><span>Source</span><span>Scope</span><span>Created</span><span /></div>{items.length ? items.map((item) => <div key={item.id} className="grid grid-cols-[minmax(0,1.4fr)_110px_minmax(110px,.6fr)_100px_42px] items-center border-t border-[#eceeef] px-5 py-4"><div className="min-w-0"><p className="truncate text-[13px] font-semibold">{item.title}</p><p className="mt-1 truncate text-[10.5px] text-[#7b858a]">{item.content}</p></div><span className="truncate text-[11px] text-[#5f696f]">{item.sourceUrl ? <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#337bc9] hover:underline"><Link2 size={11} />{SOURCE_LABEL[item.sourceType]}</a> : SOURCE_LABEL[item.sourceType]}</span><span className="truncate text-[11px] text-[#5f696f]">{sites.find((site) => site.id === item.siteId)?.domain ?? "All websites"}</span><span className="text-[11px] text-[#7b858a]">{new Date(item.createdAt).toLocaleDateString()}</span><button type="button" aria-label={`Delete ${item.title}`} onClick={() => void onDelete(item.id)} className="flex h-8 w-8 items-center justify-center rounded-md text-[#8a9297] hover:bg-[#fff0f0] hover:text-[#b04750]"><Trash2 size={14} /></button></div>) : <Empty onNew={onNew} />}</div></div>;
}

function Sources({ sites, items, defaultSiteId, onReload }: { sites: Site[]; items: KnowledgeItem[]; defaultSiteId: string; onReload: () => void }) {
  const [activeSiteId, setActiveSiteId] = useState(defaultSiteId);
  const [urlInput, setUrlInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    if (sites.length === 0) return;
    if (!sites.some((site) => site.id === activeSiteId)) setActiveSiteId(defaultSiteId || sites[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sites]);

  const activeSite = sites.find((site) => site.id === activeSiteId) ?? null;
  const rows = useMemo(
    () =>
      items
        .filter((item) => item.siteId === activeSiteId && (item.sourceType === "url" || item.sourceType === "sitemap"))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [items, activeSiteId],
  );

  async function addUrl() {
    if (!urlInput.trim() || !activeSiteId || adding) return;
    setAdding(true); setAddError(null);
    const response = await fetch("/api/workspace/knowledge/url", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url: urlInput.trim(), siteId: activeSiteId }) });
    if (response.ok) { setUrlInput(""); onReload(); }
    else { const data = await response.json().catch(() => ({})) as { message?: string }; setAddError(data.message ?? "That page could not be crawled."); }
    setAdding(false);
  }

  if (sites.length === 0) {
    return (
      <div className="mt-7 flex min-h-[330px] flex-col items-center justify-center rounded-2xl border border-[#dde3e6] text-center">
        <Upload size={21} className="text-[#98a0a5]" />
        <p className="mt-3 text-[14px] font-semibold">No sources connected</p>
        <Link href="/dashboard/connect" className="mt-4 rounded-md bg-[#17191b] px-4 py-2.5 text-[12px] font-semibold text-white">Connect a website</Link>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex gap-1 overflow-x-auto border-b border-[#e5e8ea]">
        {sites.map((site) => (
          <button
            key={site.id}
            type="button"
            onClick={() => setActiveSiteId(site.id)}
            className={`flex shrink-0 items-center gap-2 rounded-t-lg px-3.5 pb-3 text-[12.5px] font-semibold ${activeSiteId === site.id ? "border-b-2 border-[#17191b] text-black" : "text-[#8a9297] hover:text-black"}`}
          >
            <Favicon domain={site.domain} size={15} /> {site.domain}
          </button>
        ))}
      </div>

      {activeSite && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold ${activeSite.verifiedAt ? "bg-[#eaf6ef] text-[#28784e]" : "bg-[#fff4e5] text-[#a06a1c]"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${activeSite.verifiedAt ? "bg-[#2FA266]" : "bg-[#D89831]"}`} />
            {activeSite.verifiedAt ? "Crawlable" : "Not crawlable — verify the tag first"}
          </span>
          <span className="text-[11px] text-[#8a9297]">{rows.length} page link{rows.length === 1 ? "" : "s"}</span>
        </div>
      )}

      <div className="mt-3 flex h-11 items-center gap-2 rounded-xl border border-[#dde3e6] bg-[#f8f9f9] px-3.5">
        <Link2 size={14} className="shrink-0 text-[#8b9499]" />
        <input
          value={urlInput}
          onChange={(event) => setUrlInput(event.target.value)}
          onKeyDown={(event) => { if (event.key === "Enter") void addUrl(); }}
          placeholder="https://example.com/help/refunds"
          className="min-w-0 flex-1 bg-transparent text-[13px] outline-none"
        />
        <button type="button" disabled={!urlInput.trim() || adding} onClick={() => void addUrl()} className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-[#17191b] px-3 text-[11.5px] font-semibold text-white disabled:opacity-40">
          {adding && <LoaderCircle size={12} className="animate-spin" />} Add URL
        </button>
      </div>
      {addError && <p className="mt-2 rounded-lg bg-[#fff1f1] px-3 py-2 text-[11px] font-medium text-[#a64a53]">{addError}</p>}

      <div className="mt-4 overflow-hidden rounded-2xl border border-[#dde3e6]">
        <div className="grid grid-cols-[minmax(0,1.6fr)_110px_110px_160px] bg-[#f5f6f7] px-5 py-3 text-[10px] font-bold uppercase tracking-[.08em] text-[#7b858a]">
          <span>URL</span><span>Status</span><span>Crawlable</span><span>Last crawl</span>
        </div>
        {rows.length ? rows.map((row) => (
          <div key={row.id} className="grid grid-cols-[minmax(0,1.6fr)_110px_110px_160px] items-center border-t border-[#eceeef] px-5 py-4">
            <a href={row.sourceUrl ?? "#"} target="_blank" rel="noreferrer" className="truncate text-[12.5px] text-[#337bc9] hover:underline">{row.sourceUrl ?? row.title}</a>
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#eaf6ef] px-2 py-0.5 text-[10.5px] font-semibold text-[#28784e]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2FA266]" /> Crawled
            </span>
            <span className="text-[11px] text-[#5f696f]">{activeSite?.verifiedAt ? "Yes" : "No"}</span>
            <span className="text-[11px] text-[#7b858a]">{new Date(row.createdAt).toLocaleString()}</span>
          </div>
        )) : (
          <div className="flex min-h-[220px] flex-col items-center justify-center px-5 text-center">
            <Link2 size={20} className="text-[#a0a7ab]" />
            <p className="mt-3 text-[13px] font-semibold">No page links yet</p>
            <p className="mt-1 max-w-xs text-[11px] leading-5 text-[#7b858a]">Add a URL above and we'll crawl it into your knowledge base.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Empty({ onNew }: { onNew: () => void }) { return <div className="flex min-h-[260px] flex-col items-center justify-center px-5 text-center"><FileText size={22} className="text-[#a0a7ab]" /><p className="mt-3 text-[13px] font-semibold">Your knowledge base is empty</p><p className="mt-1 max-w-xs text-[11px] leading-5 text-[#7b858a]">Add the first trusted answer your AI can use.</p><button type="button" onClick={onNew} className="mt-4 rounded-md border border-[#d9dee1] px-3.5 py-2 text-[11px] font-semibold">Create article</button></div>; }
