"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { ArrowDownUp, ArrowLeft, Check, ChevronDown, FileText, Folder, Globe2, Link2, ListChecks, LoaderCircle, RefreshCw, Search, Sparkles, Trash2, Upload, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMobileDrawer } from "@/app/components/dashboard/mobile-drawer-context";

export type KnowledgeView = "overview" | "articles" | "sources";
type SourceType = "text" | "url" | "sitemap" | "file";
type KnowledgeItem = { id: string; title: string; content: string; siteId: string | null; createdAt: string; chunkCount: number; sourceType: SourceType; sourceUrl: string | null; visibleToVisitors?: boolean };
type Site = { id: string; name: string; domain: string; verifiedAt?: string | null };
type AddTab = "text" | "file";

const SOURCE_LABEL: Record<SourceType, string> = { text: "Pasted", url: "Crawled page", sitemap: "Crawled sitemap", file: "Uploaded file" };

// Colors are our own palette, not any third-party brand's — "Docs" uses a
// blue document glyph in the spirit of a docs product, not a reproduction
// of any specific logo.
const nav = [
  { id: "articles", label: "Pages", icon: FileText },
  { id: "sources", label: "URLs", icon: Link2 },
] as const;

export function KnowledgeClient({ view }: { view: KnowledgeView }) {
  const router = useRouter();
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
  const [addTab, setAddTab] = useState<AddTab>("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [siteId, setSiteId] = useState("");
  const [pendingFile, setPendingFile] = useState<{ name: string; base64: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Deleting a knowledge article used to fire the moment the trash icon was
  // clicked, with nothing to undo it once the AI stopped drawing on it — a
  // stray click cost real content. This gates it behind an explicit choice.
  const [confirmDeleteItem, setConfirmDeleteItem] = useState<KnowledgeItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  function resetEditor() {
    setTitle(""); setContent(""); setSiteId(selectedSiteId); setPendingFile(null); setError(null); setAddTab("text");
  }

  function openEditor(item?: KnowledgeItem) {
    router.push(item ? `/dashboard/knowledge/page/${encodeURIComponent(item.id)}` : "/dashboard/knowledge/new");
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
    if (response.ok) { posthog.capture("knowledge_item_created", { source_type: "text" }); setEditorOpen(false); resetEditor(); load(); }
    else { const data = await response.json().catch(() => ({})) as { message?: string }; setError(data.message ?? "Article could not be saved."); }
    setSaving(false);
  }

  async function savePage() {
    if (!editingItem) return void createArticle();
    if (!title.trim() || !content.trim() || saving) return;
    setSaving(true); setError(null);
    const response = await fetch(`/api/workspace/knowledge/${encodeURIComponent(editingItem.id)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: title.trim(), content: content.trim(), siteId: siteId || null }) });
    if (response.ok) { setEditorOpen(false); setEditingItem(null); resetEditor(); load(); }
    else { const data = await response.json().catch(() => ({})) as { message?: string }; setError(data.message ?? "Page could not be saved."); }
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
    if (response.ok) { posthog.capture("knowledge_item_created", { source_type: "file" }); setEditorOpen(false); resetEditor(); load(); }
    else { const data = await response.json().catch(() => ({})) as { message?: string }; setError(data.message ?? "That file could not be processed."); }
    setSaving(false);
  }

  // "Help tab" switch: whether visitors can find and read this page in the
  // widget. Optimistic, and put back if the save fails.
  async function setArticleVisibility(item: KnowledgeItem, visible: boolean) {
    setItems((current) => current.map((row) => (row.id === item.id ? { ...row, visibleToVisitors: visible } : row)));
    const response = await fetch(`/api/workspace/knowledge/${encodeURIComponent(item.id)}/visibility`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ visible }),
    }).catch(() => null);
    if (!response?.ok) setItems((current) => current.map((row) => (row.id === item.id ? { ...row, visibleToVisitors: !visible } : row)));
  }

  async function removeArticle(id: string) {
    const response = await fetch(`/api/workspace/knowledge/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (response.ok) {
      posthog.capture("knowledge_item_deleted");
      setItems((current) => current.filter((item) => item.id !== id));
    }
  }

  async function confirmDelete() {
    if (!confirmDeleteItem || deleting) return;
    setDeleting(true);
    try {
      await removeArticle(confirmDeleteItem.id);
      setConfirmDeleteItem(null);
    } finally {
      setDeleting(false);
    }
  }

  const pageCopy = view === "overview"
    ? ["Knowledge", "Keep trusted answers, documents, and sources connected to your AI."]
    : view === "articles"
      ? ["Pages", "Create and manage the answers your AI can use."]
      : ["URLs", "Add website URLs and keep their content searchable."];

  return <div id="dashboard-knowledge-page" className="dashboard-knowledge-shell flex h-full min-h-0 overflow-hidden bg-[#262626] text-white">
    <KnowledgeSidebar view={view} items={items} sites={sites} selectedSiteId={selectedSiteId} setSelectedSiteId={setSelectedSiteId} onOpen={openEditor} />
    <main className="dashboard-page-surface dashboard-knowledge-main-surface min-w-0 flex-1 overflow-y-auto bg-[#262626] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="mx-auto w-full max-w-[1320px] px-6 pb-16 pt-7 sm:px-10 lg:px-12">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-normal uppercase tracking-[0.16em] text-white/40">Knowledge</p>
            <h1 className="mt-2 text-3xl font-normal tracking-[-0.03em] text-white/95">{pageCopy[0]}</h1>
            <p className="mt-2 text-sm text-white/45">{pageCopy[1]}</p>
          </div>
          <button type="button" onClick={() => view === "sources" ? document.getElementById("knowledge-source-url")?.focus() : openEditor()} className="dashboard-knowledge-add-button flex h-9 items-center gap-2 rounded-lg bg-white/90 px-4 text-xs font-normal text-[#202020] transition hover:bg-white">
            {view === "sources" ? <Link2 size={15} /> : <FileText size={15} />} {view === "sources" ? "Add URL" : "Create page"}
          </button>
        </div>
        {view !== "sources" && <Toolbar loading={loading} />}
        {error && <p className="mt-4 rounded-lg bg-[#fff1f1] px-3 py-2 text-[11px] font-medium text-[#a64a53]">{error}</p>}
        {loading ? <div className="flex min-h-[420px] items-center justify-center text-[12px] text-white/45"><LoaderCircle size={15} className="mr-2 animate-spin" /> Loading knowledge</div> : view === "overview" ? <Overview items={scopedItems} sites={sites} onNew={() => openEditor()} /> : view === "articles" ? <PagesTable items={filtered} sites={sites} query={query} setQuery={setQuery} onDelete={setConfirmDeleteItem} onNew={() => openEditor()} onOpen={openEditor} onToggleVisible={(item, visible) => void setArticleVisibility(item, visible)} /> : <Sources sites={sites} items={items} defaultSiteId={selectedSiteId} onReload={load} />}
      </div>
    </main>
    {editorOpen && (
      <AddContentPanel
        editingItem={editingItem}
        addTab={addTab} setAddTab={setAddTab}
        title={title} setTitle={setTitle}
        content={content} setContent={setContent}
        siteId={siteId} setSiteId={setSiteId} sites={sites}
        pendingFile={pendingFile} onFileChosen={handleFileChosen}
        saving={saving} error={error}
        onClose={() => { setEditorOpen(false); setEditingItem(null); resetEditor(); }}
        onSubmitText={() => void savePage()}
        onSubmitFile={() => void uploadFile()}
      />
    )}
    {confirmDeleteItem && (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
        role="presentation"
        onMouseDown={(event) => { if (event.target === event.currentTarget && !deleting) setConfirmDeleteItem(null); }}
      >
        <div role="dialog" aria-modal="true" aria-label="Delete page" className="w-full max-w-[420px] rounded-2xl border border-white/10 bg-[#262626] p-6 text-white shadow-[0_24px_70px_rgba(0,0,0,0.5)]">
          <h3 className="text-[17px] font-semibold">Delete &quot;{confirmDeleteItem.title}&quot;?</h3>
          <p className="mt-2 text-[13px] leading-6 text-white/55">
            Your AI will no longer be able to answer from this page. This can&apos;t be undone.
          </p>
          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={deleting}
              onClick={() => setConfirmDeleteItem(null)}
              className="flex h-10 items-center rounded-lg border border-white/15 px-4 text-[13px] font-semibold hover:bg-white/5 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={() => void confirmDelete()}
              className="flex h-10 items-center gap-2 rounded-lg bg-[#c0454e] px-4 text-[13px] font-semibold text-white hover:bg-[#a83b43] disabled:opacity-60"
            >
              {deleting ? <LoaderCircle size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete
            </button>
          </div>
        </div>
      </div>
    )}
  </div>;
}

const ADD_TABS: { id: AddTab; label: string; description: string; icon: typeof FileText; color: string }[] = [
  { id: "text", label: "Paste text", description: "Write an answer yourself.", icon: FileText, color: "#4C9AFF" },
  { id: "file", label: "Upload file", description: "PDF, Word, text, or Markdown.", icon: Upload, color: "#A78BFA" },
];

function AddContentPanel({
  editingItem,
  addTab, setAddTab,
  title, setTitle,
  content, setContent,
  siteId, setSiteId, sites,
  pendingFile, onFileChosen,
  saving, error,
  onClose,
  onSubmitText, onSubmitFile,
}: {
  editingItem: KnowledgeItem | null;
  addTab: AddTab; setAddTab: (tab: AddTab) => void;
  title: string; setTitle: (value: string) => void;
  content: string; setContent: (value: string) => void;
  siteId: string; setSiteId: (value: string) => void; sites: Site[];
  pendingFile: { name: string; base64: string } | null; onFileChosen: (event: React.ChangeEvent<HTMLInputElement>) => void;
  saving: boolean; error: string | null;
  onClose: () => void;
  onSubmitText: () => void; onSubmitFile: () => void;
}) {
  const [chosen, setChosen] = useState(true);

  const canSubmit =
    addTab === "text" ? Boolean(title.trim() && content.trim()) :
    Boolean(pendingFile);

  function submit() {
    if (addTab === "text") onSubmitText();
    else onSubmitFile();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <aside role="dialog" aria-modal="true" aria-label="Knowledge page editor" className="dashboard-knowledge-add-panel flex h-full w-full flex-col overflow-hidden bg-[#262626] text-white">
        <div className="flex items-start justify-between px-7 py-6">
          <div>
            {chosen && (
              <button type="button" aria-label="Back" onClick={() => setChosen(false)} className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg text-[#5f686d] hover:bg-[#f1f2f3]"><ArrowLeft size={16} /></button>
            )}
            <h2 className="text-[21px] font-normal tracking-[-0.03em]">{editingItem ? "Edit page" : "New page"}</h2>
            <p className="mt-1 text-[12px] text-white/45">Write freely. Saved content becomes available to your AI.</p>
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
            <div className="min-h-0 w-full max-w-[900px] flex-1 self-center overflow-y-auto px-7 py-8">
              {addTab === "text" && (
                <>
                  <label className="block text-[12px] font-semibold">Title
                    <input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Untitled page" className="mt-2 h-16 w-full border-0 border-b border-white/10 bg-transparent px-0 text-3xl font-normal outline-none placeholder:text-white/25" />
                  </label>
                  <label className="mt-5 block text-[12px] font-semibold">Content
                    <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Start writing…" className="mt-2 min-h-[52vh] w-full resize-none border-0 bg-transparent px-0 py-3 text-[15px] leading-7 text-white/85 outline-none placeholder:text-white/25" />
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
                {saving && <LoaderCircle size={14} className="animate-spin" />} {editingItem ? "Save changes" : "Create page"}
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
  view, items, sites, selectedSiteId, setSelectedSiteId, onOpen,
}: {
  view: KnowledgeView; items: KnowledgeItem[]; sites: Site[]; selectedSiteId: string; setSelectedSiteId: (id: string) => void; onOpen: (item: KnowledgeItem) => void;
}) {
  const [domainOpen, setDomainOpen] = useState(false);
  const selected = sites.find((site) => site.id === selectedSiteId) ?? null;
  const { open, setOpen } = useMobileDrawer();

  return (
    <>
      {/* Kept mounted (not `hidden`) below md so the slide has something to
          animate — see SpacePanel.tsx for the same trick and why. */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setOpen(false)}
      />
      <div
        id="dashboard-knowledge-sidebar"
        className={`dashboard-secondary-sidebar dashboard-knowledge-sidebar fixed inset-y-0 left-0 z-50 flex h-full w-72 shrink-0 flex-col overflow-hidden border-r border-white/10 bg-[#262626] shadow-[8px_0_30px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-in-out md:static md:z-auto md:w-[210px] md:translate-x-0 md:shadow-none lg:w-[230px] ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
      <div className="min-h-0 flex-1 px-4 pt-3">
        <p className="mb-3 px-1 text-sm font-normal text-white/45">Knowledge</p>
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

        <p className="mb-2 mt-5 px-1 text-[11px] font-normal text-white/40">Library</p>
        <nav className="space-y-0.5">
          {nav.map(({ id, label, icon: Icon }) => {
            const active = id === "articles" ? view === "articles" || view === "overview" : view === id;
            return (
            <Link
              key={id}
              href={id === "articles" ? "/dashboard/knowledge" : `/dashboard/knowledge/${id}`}
              aria-current={active ? "page" : undefined}
              className={`flex h-10 items-center gap-2.5 rounded-lg px-3 text-[13px] font-normal transition ${active ? "dashboard-secondary-nav-active text-white/90" : "text-white/60 hover:text-white"}`}
            >
              <Icon size={16} className="shrink-0" />
              {label}
            </Link>
          );})}
        </nav>
        <div className="my-4 border-t border-white/10" />
        <p className="mb-2 px-1 text-[11px] font-normal text-white/40">Recent</p>
        <div className="space-y-0.5">
          {items.slice(0, 6).map((item) => (
            <button key={item.id} type="button" onClick={() => onOpen(item)} className="flex h-9 w-full min-w-0 items-center gap-2 rounded-lg px-3 text-left text-[13px] font-normal text-white/60 transition hover:bg-white/[0.06] hover:text-white/90">
              <FileText size={15} className="shrink-0" /><span className="truncate">{item.title}</span>
            </button>
          ))}
          {items.length === 0 && <p className="px-3 py-2 text-[12px] text-white/35">No recent pages</p>}
        </div>
      </div>
      </div>
    </>
  );
}

function Toolbar({ loading }: { loading: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e8ea] pb-4">
      <span className="flex h-9 items-center gap-2 text-[12px] text-white/50"><ArrowDownUp size={13} /> Last modified</span>
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
    <article className="flex min-h-[380px] flex-col overflow-hidden rounded-xl border border-[#e5e8ea] bg-white">
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

// Shown / Hidden in the widget's Help tab. A button, not a checkbox: the row
// itself opens the editor, so this stops the click from reaching it.
function HelpTabToggle({ item, onToggle }: { item: KnowledgeItem; onToggle: (item: KnowledgeItem, visible: boolean) => void }) {
  const visible = Boolean(item.visibleToVisitors);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={visible}
      title={visible ? "Visitors can read this in the widget's Help tab" : "Only the AI uses this page"}
      onClick={(event) => { event.stopPropagation(); onToggle(item, !visible); }}
      className="flex items-center gap-2 text-[12px] text-white/60 hover:text-white/85"
    >
      <span className={`relative h-4 w-7 shrink-0 rounded-full transition ${visible ? "bg-[#35b92c]" : "bg-white/15"}`}>
        <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${visible ? "left-3.5" : "left-0.5"}`} />
      </span>
      {visible ? "Shown" : "Hidden"}
    </button>
  );
}

function PagesTable({ items, sites, query, setQuery, onDelete, onNew, onOpen, onToggleVisible }: { items: KnowledgeItem[]; sites: Site[]; query: string; setQuery: (value: string) => void; onDelete: (item: KnowledgeItem) => void; onNew: () => void; onOpen: (item: KnowledgeItem) => void; onToggleVisible: (item: KnowledgeItem, visible: boolean) => void }) {
  const sortedItems = [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return (
    <div className="mt-5">
      <div className="ml-auto flex h-10 w-full max-w-sm items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3.5">
        <Search size={15} className="text-white/40" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pages" className="min-w-0 flex-1 bg-transparent text-[13px] text-white/90 outline-none placeholder:text-white/35" />
      </div>
      <div className="mt-4 overflow-hidden border-y border-white/10">
        {/* A 5-column grid has no honest way to fit a phone screen — below md
            this becomes a stacked card list instead, same tap-to-open and
            delete behavior either way. */}
        <div className="md:hidden">
          {sortedItems.length ? sortedItems.map((item) => (
            <div key={item.id} role="button" tabIndex={0} onClick={(event) => { if (!(event.target as HTMLElement).closest("button")) onOpen(item); }} onKeyDown={(event) => { if (event.key === "Enter") onOpen(item); }} className="flex cursor-pointer items-start gap-3 border-t border-white/10 px-4 py-3.5 transition first:border-t-0 hover:bg-white/[0.025]">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-white/50"><FileText size={15} /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-white/90">{item.title}</p>
                <p className="mt-0.5 truncate text-[11px] text-white/40">{sites.find((site) => site.id === item.siteId)?.domain ?? "All websites"} · {new Date(item.createdAt).toLocaleDateString()}</p>
                <div className="mt-2"><HelpTabToggle item={item} onToggle={onToggleVisible} /></div>
              </div>
              <button type="button" aria-label={`Delete ${item.title}`} onClick={(event) => { event.stopPropagation(); onDelete(item); }} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white/40 hover:bg-white/10 hover:text-red-300"><Trash2 size={14} /></button>
            </div>
          )) : <Empty onNew={onNew} />}
        </div>
        <div className="hidden md:block">
          <div className="grid grid-cols-[minmax(0,1.4fr)_110px_minmax(130px,.7fr)_120px_42px] px-5 py-3 text-[12px] font-normal text-white/45">
            <span>Name</span><span title="Whether visitors can read this in the widget's Help tab">Help tab</span><span>Attached to</span><span>Last modified</span><span />
          </div>
          {sortedItems.length ? sortedItems.map((item) => (
            <div key={item.id} role="button" tabIndex={0} onClick={(event) => { if (!(event.target as HTMLElement).closest("button")) onOpen(item); }} onKeyDown={(event) => { if (event.key === "Enter") onOpen(item); }} className="grid cursor-pointer grid-cols-[minmax(0,1.4fr)_110px_minmax(130px,.7fr)_120px_42px] items-center border-t border-white/10 px-5 py-4 transition hover:bg-white/[0.025]">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-white/50"><FileText size={15} /></span>
                <div className="min-w-0"><p className="truncate text-[13px] font-medium text-white/90">{item.title}</p><p className="mt-0.5 truncate text-[10.5px] text-white/35">{item.content}</p></div>
              </div>
              <HelpTabToggle item={item} onToggle={onToggleVisible} />
              <span className="truncate text-[12px] text-white/60">{sites.find((site) => site.id === item.siteId)?.domain ?? "All websites"}</span>
              <span className="text-[12px] text-white/45">{new Date(item.createdAt).toLocaleDateString()}</span>
              <button type="button" aria-label={`Delete ${item.title}`} onClick={(event) => { event.stopPropagation(); onDelete(item); }} className="flex h-8 w-8 items-center justify-center rounded-md text-white/40 hover:bg-white/10 hover:text-red-300"><Trash2 size={14} /></button>
            </div>
          )) : <Empty onNew={onNew} />}
        </div>
      </div>
    </div>
  );
}

function Sources({ sites, items, defaultSiteId, onReload }: { sites: Site[]; items: KnowledgeItem[]; defaultSiteId: string; onReload: () => void }) {
  const activeSiteId = defaultSiteId || sites[0]?.id || "";
  const [urlInput, setUrlInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const activeSite = sites.find((site) => site.id === activeSiteId) ?? null;
  const baseUrl = activeSite ? (() => {
    try { return `${new URL(/^https?:\/\//i.test(activeSite.domain) ? activeSite.domain : `https://${activeSite.domain}`).origin}/`; }
    catch { return `https://${activeSite.domain.replace(/^\/+|\/+$/g, "")}/`; }
  })() : "";

  useEffect(() => {
    setUrlInput("");
  }, [baseUrl]);
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
    const fullUrl = `${baseUrl}${urlInput.trim().replace(/^\/+/, "")}`;
    const response = await fetch("/api/workspace/knowledge/url", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url: fullUrl, siteId: activeSiteId }) });
    if (response.ok) { posthog.capture("knowledge_item_created", { source_type: "url" }); setUrlInput(""); onReload(); }
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
      {activeSite && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <span className="flex min-w-0 items-center gap-2 text-[13px] text-white/75"><Favicon domain={activeSite.domain} size={18} /><span className="truncate">{activeSite.domain}</span></span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10.5px] font-normal text-white/65">
            <span className={`h-1.5 w-1.5 rounded-full ${activeSite.verifiedAt ? "bg-[#2FA266]" : "bg-[#D89831]"}`} />
            {activeSite.verifiedAt ? "Crawlable" : "Not crawlable — verify the tag first"}
          </span>
        </div>
      )}

      <div className="knowledge-url-input mt-4 flex flex-col gap-2.5 rounded-lg border border-white/10 bg-white/[0.025] p-3 transition focus-within:border-white/25 focus-within:bg-white/[0.04] sm:min-h-14 sm:flex-row sm:items-center sm:gap-0 sm:p-0 sm:px-4">
        <div className="flex min-w-0 items-center">
          <Link2 size={15} className="shrink-0 text-white/40" />
          <span className="ml-2 max-w-[55%] shrink-0 truncate text-[13px] text-white/55 sm:max-w-[35%] sm:border-r sm:border-white/10 sm:pr-2.5">{baseUrl}</span>
          <input
            id="knowledge-source-url"
            value={urlInput}
            onChange={(event) => setUrlInput(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter") void addUrl(); }}
            placeholder="help/refunds"
            aria-label="Page path"
            className="min-w-0 flex-1 bg-transparent px-2.5 text-[13px] text-white/90 outline-none placeholder:text-white/30"
          />
        </div>
        <button type="button" disabled={!urlInput.trim() || adding} onClick={() => void addUrl()} className="knowledge-source-add flex h-9 w-full shrink-0 items-center justify-center gap-1.5 rounded-md text-[12.5px] font-normal disabled:opacity-40 sm:h-8 sm:w-fit sm:justify-start sm:px-3 sm:text-[11.5px]">
          {adding && <LoaderCircle size={12} className="animate-spin" />} Add page
        </button>
      </div>
      {addError && <p className="mt-2 rounded-lg bg-[#fff1f1] px-3 py-2 text-[11px] font-medium text-[#a64a53]">{addError}</p>}

      <div className="mt-6 overflow-hidden border-y border-white/10">
        {/* A 4-column grid has no honest way to fit a phone screen — below md
            this becomes a stacked card list instead. */}
        <div className="md:hidden">
          {rows.length ? rows.map((row) => (
            <div key={row.id} className="flex flex-col gap-1.5 border-t border-white/10 px-4 py-3.5 transition first:border-t-0 hover:bg-white/[0.025]">
              <a href={row.sourceUrl ?? "#"} target="_blank" rel="noreferrer" className="truncate text-[12.5px] text-white/80 hover:text-white hover:underline">{row.sourceUrl ?? row.title}</a>
              <span className="flex items-center gap-2.5 text-[11px] text-white/45">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10.5px] font-normal text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2FA266]" /> Crawled
                </span>
                {new Date(row.createdAt).toLocaleDateString()}
              </span>
            </div>
          )) : (
            <div className="flex min-h-[220px] flex-col items-center justify-center px-5 text-center">
              <Link2 size={20} className="text-[#a0a7ab]" />
              <p className="mt-3 text-[13px] font-semibold">No page links yet</p>
              <p className="mt-1 max-w-xs text-[11px] leading-5 text-[#7b858a]">Add a URL above and we'll crawl it into your knowledge base.</p>
            </div>
          )}
        </div>
        <div className="hidden md:block">
          <div className="grid grid-cols-[minmax(0,1.6fr)_110px_110px_160px] px-5 py-3 text-[12px] font-normal text-white/45">
            <span>URL</span><span>Status</span><span>Crawlable</span><span>Last crawl</span>
          </div>
          {rows.length ? rows.map((row) => (
            <div key={row.id} className="grid grid-cols-[minmax(0,1.6fr)_110px_110px_160px] items-center border-t border-white/10 px-5 py-4 transition hover:bg-white/[0.025]">
              <a href={row.sourceUrl ?? "#"} target="_blank" rel="noreferrer" className="truncate text-[12.5px] text-white/80 hover:text-white hover:underline">{row.sourceUrl ?? row.title}</a>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10.5px] font-normal text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2FA266]" /> Crawled
              </span>
              <span className="text-[11px] text-white/60">{activeSite?.verifiedAt ? "Yes" : "No"}</span>
              <span className="text-[11px] text-white/45">{new Date(row.createdAt).toLocaleString()}</span>
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
    </div>
  );
}

function Empty({ onNew }: { onNew: () => void }) { return <div className="flex min-h-[260px] flex-col items-center justify-center px-5 text-center"><FileText size={22} className="text-[#a0a7ab]" /><p className="mt-3 text-[13px] font-semibold">Your knowledge base is empty</p><p className="mt-1 max-w-xs text-[11px] leading-5 text-[#7b858a]">Add the first trusted answer your AI can use.</p><button type="button" onClick={onNew} className="mt-4 rounded-md border border-[#d9dee1] px-3.5 py-2 text-[11px] font-semibold">Create article</button></div>; }
