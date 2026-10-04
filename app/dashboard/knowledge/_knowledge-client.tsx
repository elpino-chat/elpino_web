"use client";

import { Bone } from "../../components/dashboard/DashboardSkeleton";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { ArrowLeft, CheckCircle2, FileText, Folder, Globe2, Link2, ListChecks, LoaderCircle, Search, Sparkles, Trash2, Upload, X } from "lucide-react";
import { NotionImportButton, NotionPagesList } from "./_notion-import";

export type KnowledgeView = "overview" | "articles" | "sources";
type SourceType = "text" | "url" | "sitemap" | "file" | "notion";
type KnowledgeItem = { id: string; title: string; content: string; siteId: string | null; createdAt: string; chunkCount: number; sourceType: SourceType; sourceUrl: string | null; visibleToVisitors?: boolean };
type Site = { id: string; name: string; domain: string; verifiedAt?: string | null };
type AddTab = "text" | "file";

const SOURCE_LABEL: Record<SourceType, string> = { text: "Pasted", url: "Crawled page", sitemap: "Crawled sitemap", file: "Uploaded file", notion: "Notion page" };


export function KnowledgeClient({ view }: { view: KnowledgeView }) {
  const router = useRouter();
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  // Pages and URLs are two views of the same screen: switching between them is a state change, not a navigation, so nothing reloads and
  // the search text stays. `view` only says which one the page was opened on (/dashboard/knowledge or /dashboard/knowledge/sources).
  const [tab, setTab] = useState<"articles" | "sources">(view === "sources" ? "sources" : "articles");
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
  // True while a newly verified website's first pages are being read into knowledge in the background.
  const [importing, setImporting] = useState(false);
  const importAsked = useRef(false);

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

  // A verified website with nothing in knowledge yet is due its first automatic import (a site that was
  // verified before this existed, or one whose import is still running). The server decides: it claims the
  // import once per site and says whether one is starting or has just started, so a workspace that
  // deliberately emptied its knowledge is left alone. Asked once per visit.
  useEffect(() => {
    if (loading || importAsked.current) return;
    const verified = sites.filter((site) => site.verifiedAt);
    if (items.length > 0 || verified.length === 0) return;
    importAsked.current = true;
    void Promise.all(
      verified.map((site) =>
        fetch("/api/workspace/knowledge/auto-import", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ siteId: site.id }) })
          .then((response) => (response.ok ? (response.json() as Promise<{ started?: boolean; recent?: boolean }>) : null))
          .catch(() => null),
      ),
    ).then((results) => {
      if (results.some((result) => result && (result.started || result.recent))) setImporting(true);
    });
  }, [loading, items.length, sites]);

  // While that runs, quietly re-read the list until pages show up (for up to two minutes).
  useEffect(() => {
    if (!importing) return;
    let tries = 0;
    const timer = window.setInterval(async () => {
      tries += 1;
      const data = await fetch("/api/workspace/knowledge", { cache: "no-store" }).then((response) => (response.ok ? response.json() : null)).catch(() => null) as { items?: KnowledgeItem[] } | null;
      if (data?.items?.length) {
        setItems(data.items);
        setImporting(false);
      } else if (tries >= 24) {
        setImporting(false);
      }
    }, 5000);
    return () => window.clearInterval(timer);
  }, [importing]);
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

  const pagesActive = tab !== "sources";
  function switchTab(next: "articles" | "sources") {
    setTab(next);
    // Keep the address matching the tab without navigating: a refresh or a copied link then opens the same one.
    window.history.replaceState(null, "", next === "sources" ? "/dashboard/knowledge/sources" : "/dashboard/knowledge");
  }
  const tabClass = (active: boolean) => `kn-tab ${active ? "kn-tab-active" : ""} -mb-px inline-flex h-11 shrink-0 items-center gap-2 border-b-2 text-[15px] font-medium transition`;

  return <div id="dashboard-knowledge-page" className="dashboard-knowledge-shell h-full min-h-0 overflow-hidden bg-[#262626] text-white">
    <main className="dashboard-page-surface dashboard-knowledge-main-surface h-full min-w-0 overflow-y-auto bg-[#262626] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="mx-auto w-full max-w-[1120px] px-6 pb-16 pt-7 sm:px-9 lg:px-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="kn-heading text-[30px] font-normal tracking-[-0.04em]">Knowledge</h1>
            <p className="kn-text mt-1.5 max-w-xl text-[16px] leading-7">{pagesActive ? "Create and manage the answers your AI can use." : "Add website addresses and keep their content searchable."}</p>
          </div>
          {/* Import from Notion works whether or not a website is connected, so it is in the header on both tabs. */}
          <div className="flex flex-wrap items-center gap-2.5">
            <NotionImportButton onImported={load} />
            {pagesActive && (
              <button type="button" data-tour="knowledge-add" onClick={() => openEditor()} className="kn-btn kn-btn-primary flex h-10 cursor-pointer items-center gap-2 rounded-full border px-5 text-[15px] font-medium transition">
                <FileText size={16} /> Create page
              </button>
            )}
          </div>
        </header>

        <nav role="tablist" aria-label="Knowledge sections" className="kn-tabs mt-6 flex gap-6 overflow-x-auto border-b [scrollbar-width:none]">
          <button type="button" role="tab" aria-selected={pagesActive} onClick={() => switchTab("articles")} className={tabClass(pagesActive)}>
            Pages
            {!loading && items.length > 0 && <span className="kn-count rounded-full px-2 py-0.5 text-[12px] leading-none">{items.length}</span>}
          </button>
          <button type="button" role="tab" aria-selected={!pagesActive} onClick={() => switchTab("sources")} className={tabClass(!pagesActive)}>URLs</button>
        </nav>

        {error && <p role="alert" className="mt-5 rounded-lg bg-[#fff1f1] px-4 py-3 text-[14px] font-medium text-[#a64a53]">{error}</p>}
        {importing && (
          <div role="status" className="kn-text mt-5 flex items-center gap-2.5 rounded-xl border px-4 py-3.5 text-[14.5px]">
            <LoaderCircle size={16} className="shrink-0 animate-spin" />
            <span>We&apos;re reading your website and adding its most useful pages. They&apos;ll appear here in a moment.</span>
          </div>
        )}
        {loading ? <KnowledgeSkeleton view={view === "overview" ? view : tab} /> : view === "overview" ? <Overview items={scopedItems} sites={sites} onNew={() => openEditor()} /> : tab === "articles" ? <PagesList items={filtered} sites={sites} query={query} setQuery={setQuery} onDelete={setConfirmDeleteItem} onNew={() => openEditor()} onOpen={openEditor} onToggleVisible={(item, visible) => void setArticleVisibility(item, visible)} /> : <Sources sites={sites} items={items} defaultSiteId={selectedSiteId} onReload={load} />}
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

function KnowledgeSkeleton({ view }: { view: string }) {
  if (view === "overview") {
    return (
      <div role="status" aria-busy="true" aria-label="Loading knowledge" className="grid gap-4 md:grid-cols-2">
        {[0, 1].map((card) => (
          <div key={card} className="elpino-skel-card min-h-[380px] p-5">
            <Bone className="h-4 w-36" />
            <div className="mt-6 space-y-4">
              {[0, 1, 2, 3, 4].map((row) => (
                <div key={row} className="flex items-center gap-3">
                  <Bone className="size-8 shrink-0" />
                  <div className="flex-1 space-y-2"><Bone className="h-3.5 w-3/5" /><Bone className="h-3 w-4/5" /></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div role="status" aria-busy="true" aria-label="Loading knowledge" className="mt-5">
      {view === "articles" && <Bone className="ml-auto h-10 w-full max-w-sm" />}
      <div className="mt-4 border-y border-[var(--skel-line,rgb(128_128_128/0.18))]">
        <div className="hidden grid-cols-[minmax(0,1.4fr)_110px_minmax(130px,.7fr)_120px_42px] gap-4 px-5 py-3 md:grid">
          <Bone className="h-3 w-16" /><Bone className="h-3 w-14" /><Bone className="h-3 w-20" /><Bone className="h-3 w-20" /><span />
        </div>
        {[0, 1, 2, 3, 4, 5].map((row) => (
          <div key={row} className="grid grid-cols-[minmax(0,1fr)_42px] items-center gap-4 border-t border-[var(--skel-line,rgb(128_128_128/0.18))] px-4 py-4 md:grid-cols-[minmax(0,1.4fr)_110px_minmax(130px,.7fr)_120px_42px] md:px-5">
            <div className="flex items-center gap-3">
              <Bone className="size-7 shrink-0" />
              <div className="flex-1 space-y-2"><Bone className="h-3.5 w-1/2" /><Bone className="h-3 w-3/4" /></div>
            </div>
            <Bone className="hidden h-5 w-9 md:block" />
            <Bone className="hidden h-3 w-24 md:block" />
            <Bone className="hidden h-3 w-16 md:block" />
            <Bone className="size-7" />
          </div>
        ))}
      </div>
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

function PagesList({ items, sites, query, setQuery, onDelete, onNew, onOpen, onToggleVisible }: { items: KnowledgeItem[]; sites: Site[]; query: string; setQuery: (value: string) => void; onDelete: (item: KnowledgeItem) => void; onNew: () => void; onOpen: (item: KnowledgeItem) => void; onToggleVisible: (item: KnowledgeItem, visible: boolean) => void }) {
  const sortedItems = [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="kn-field flex h-11 w-full max-w-md items-center gap-2.5 rounded-full border px-4">
          <Search size={16} className="kn-text shrink-0" aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pages" aria-label="Search pages" className="kn-input min-w-0 flex-1 bg-transparent text-[15px] outline-none" />
        </label>
        {sortedItems.length > 0 && <p className="kn-text text-[14px]">{sortedItems.length} {sortedItems.length === 1 ? "page" : "pages"}, newest first</p>}
      </div>

      {sortedItems.length ? (
        <ul className="mt-3">
          {sortedItems.map((item) => (
            <li key={item.id} className="kn-row flex flex-wrap items-center gap-x-4 gap-y-3 border-b py-4 sm:flex-nowrap">
              <button type="button" onClick={() => onOpen(item)} className="flex min-w-0 flex-1 cursor-pointer items-center gap-4 text-left">
                <span className="kn-icon flex size-11 shrink-0 items-center justify-center rounded-xl"><FileText size={19} /></span>
                <span className="min-w-0 flex-1">
                  <span className="kn-heading block truncate text-[16px] font-medium">{item.title}</span>
                  <span className="kn-text mt-0.5 block truncate text-[14px]">{item.content}</span>
                  <span className="kn-text mt-1 block truncate text-[13px]">{SOURCE_LABEL[item.sourceType] ?? "Page"} · {sites.find((site) => site.id === item.siteId)?.domain ?? "All websites"} · {new Date(item.createdAt).toLocaleDateString()}</span>
                </span>
              </button>
              <div className="flex shrink-0 items-center gap-3 pl-[60px] sm:pl-0">
                <HelpTabToggle item={item} onToggle={onToggleVisible} />
                <button type="button" aria-label={`Delete ${item.title}`} title="Delete" onClick={() => onDelete(item)} className="kn-delete flex size-10 cursor-pointer items-center justify-center rounded-full transition"><Trash2 size={17} /></button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center px-5 py-20 text-center">
          <span className="kn-icon flex size-14 items-center justify-center rounded-2xl"><FileText size={26} /></span>
          <p className="kn-heading mt-5 text-[22px] font-semibold tracking-[-0.02em]">{query.trim() ? "No pages match that search" : "No pages yet"}</p>
          <p className="kn-text mt-2 max-w-md text-[16px] leading-7">{query.trim() ? "Try a different word." : "Add the first trusted answer your AI can use. Write a page, import from Notion, or add a website address."}</p>
          {!query.trim() && <button type="button" onClick={onNew} className="kn-btn kn-btn-primary mt-6 flex h-11 cursor-pointer items-center gap-2 rounded-full border px-6 text-[15px] font-semibold transition"><FileText size={16} /> Create page</button>}
        </div>
      )}
    </div>
  );
}

function Sources({ sites, items, defaultSiteId, onReload }: { sites: Site[]; items: KnowledgeItem[]; defaultSiteId: string; onReload: () => void }) {
  const activeSiteId = defaultSiteId || sites[0]?.id || "";
  const [urlInput, setUrlInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [sitemapInput, setSitemapInput] = useState("");
  const [addingSitemap, setAddingSitemap] = useState(false);
  const [sitemapError, setSitemapError] = useState<string | null>(null);
  const [sitemapResult, setSitemapResult] = useState<{ pagesFound: number } | null>(null);
  const [urlOpen, setUrlOpen] = useState(false);
  const [sitemapOpen, setSitemapOpen] = useState(false);
  // Pages are read in the background; this is polled while any are still waiting.
  const [importing, setImporting] = useState<{ left: number; failed: { url: string; error: string }[] } | null>(null);
  const [watchImports, setWatchImports] = useState(true);

  const activeSite = sites.find((site) => site.id === activeSiteId) ?? null;
  // Notion pages belong to the workspace, not to one website.
  const notionRows = useMemo(
    () => items.filter((item) => item.sourceType === "notion").sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [items],
  );

  useEffect(() => {
    setUrlInput("");
    setSitemapInput("");
    setSitemapResult(null);
  }, [activeSiteId]);
  useEffect(() => {
    if (!watchImports) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let wasBusy = false;
    async function poll() {
      const response = await fetch("/api/workspace/knowledge/import-status", { cache: "no-store" }).catch(() => null);
      if (stopped) return;
      const data = response?.ok ? await response.json().catch(() => null) as { pending: number; active: number; failed: { url: string; error: string }[] } | null : null;
      const left = data ? data.pending + data.active : 0;
      if (data) setImporting(left || data.failed.length ? { left, failed: data.failed } : null);
      if (left > 0) { wasBusy = true; onReload(); timer = setTimeout(() => void poll(), 3000); return; }
      // Everything queued has finished: one last reload picks up the final pages.
      if (wasBusy) onReload();
      setWatchImports(false);
    }
    void poll();
    return () => { stopped = true; if (timer) clearTimeout(timer); };
    // onReload is stable enough for a poll loop; restarting on it would reset the timer every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchImports]);

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
    if (response.ok) { posthog.capture("knowledge_item_created", { source_type: "url" }); setUrlInput(""); setUrlOpen(false); onReload(); setWatchImports(true); }
    else { const data = await response.json().catch(() => ({})) as { message?: string }; setAddError(data.message ?? "That page could not be crawled."); }
    setAdding(false);
  }

  async function addSitemap() {
    if (!sitemapInput.trim() || !activeSiteId || addingSitemap) return;
    setAddingSitemap(true); setSitemapError(null); setSitemapResult(null);
    const response = await fetch("/api/workspace/knowledge/sitemap", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sitemapUrl: sitemapInput.trim(), siteId: activeSiteId }) });
    const data = await response.json().catch(() => ({})) as { message?: string; pagesFound?: number };
    if (response.ok) { posthog.capture("knowledge_item_created", { source_type: "sitemap" }); setSitemapInput(""); setSitemapResult({ pagesFound: data.pagesFound ?? 0 }); onReload(); setWatchImports(true); }
    else { setSitemapError(data.message ?? "That sitemap could not be crawled."); }
    setAddingSitemap(false);
  }

  if (sites.length === 0) {
    return (
      <div className="mt-6 flex flex-col items-center px-5 py-20 text-center">
        <span className="kn-icon flex size-14 items-center justify-center rounded-2xl"><Globe2 size={26} /></span>
        <p className="kn-heading mt-5 text-[22px] font-semibold tracking-[-0.02em]">No website connected yet</p>
        <p className="kn-text mt-2 max-w-md text-[16px] leading-7">Connect your website, then add its pages or a sitemap here and we&apos;ll read them into your knowledge.</p>
        <Link href="/dashboard/settings/tags" className="kn-btn kn-btn-primary mt-6 flex h-11 items-center gap-2 rounded-full border px-6 text-[15px] font-semibold transition">Connect website</Link>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {activeSite && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-3"><Favicon domain={activeSite.domain} size={22} /><span className="kn-heading truncate text-[17px] font-medium">{activeSite.domain}</span></span>
          <span className={`tag-badge ${activeSite.verifiedAt ? "tag-badge-verified" : "tag-badge-pending"} inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[13px] font-semibold`}>
            {activeSite.verifiedAt ? <><CheckCircle2 size={14} aria-hidden="true" /> Crawlable</> : "Not crawlable: verify the tag first"}
          </span>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2.5">
        <button type="button" onClick={() => { setAddError(null); setUrlOpen(true); }} className="kn-btn kn-btn-outline flex h-10 cursor-pointer items-center gap-2 rounded-full border px-5 text-[15px] font-medium transition"><Link2 size={16} /> Add URL</button>
        <button type="button" onClick={() => { setSitemapError(null); setSitemapResult(null); setSitemapOpen(true); }} className="kn-btn kn-btn-outline flex h-10 cursor-pointer items-center gap-2 rounded-full border px-5 text-[15px] font-medium transition"><ListChecks size={16} /> Add sitemap</button>
      </div>

      {importing && (
        <div className="kn-text mt-5 rounded-xl border px-4 py-3.5 text-[14.5px]" role="status">
          {importing.left > 0 && (
            <p className="flex items-center gap-2"><LoaderCircle size={15} className="animate-spin" /> Importing {importing.left} page{importing.left === 1 ? "" : "s"} in the background. You can leave this page.</p>
          )}
          {importing.failed.length > 0 && (
            <div className={importing.left > 0 ? "mt-2.5" : ""}>
              <p className="font-medium text-[#e5636f]">{importing.failed.length} page{importing.failed.length === 1 ? "" : "s"} could not be imported:</p>
              <ul className="mt-1 space-y-0.5 text-[13.5px]">
                {importing.failed.slice(0, 5).map((page) => <li key={page.url} className="truncate">{page.url}: {page.error}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {rows.length ? (
        <ul className="mt-5">
          {rows.map((row) => (
            <li key={row.id} className="kn-row flex items-center gap-4 border-b py-4">
              <span className="kn-icon flex size-11 shrink-0 items-center justify-center rounded-xl"><Link2 size={19} /></span>
              <span className="min-w-0 flex-1">
                <a href={row.sourceUrl ?? "#"} target="_blank" rel="noreferrer" className="kn-heading block truncate text-[15.5px] font-medium hover:underline">{row.sourceUrl ?? row.title}</a>
                <span className="kn-text mt-0.5 block text-[13.5px]">{SOURCE_LABEL[row.sourceType] ?? "Page"} · crawled {new Date(row.createdAt).toLocaleString()}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center px-5 py-16 text-center">
          <span className="kn-icon flex size-14 items-center justify-center rounded-2xl"><Link2 size={26} /></span>
          <p className="kn-heading mt-5 text-[22px] font-semibold tracking-[-0.02em]">No pages crawled yet</p>
          <p className="kn-text mt-2 max-w-md text-[16px] leading-7">Add a page address or a sitemap and we&apos;ll read it into your knowledge base.</p>
        </div>
      )}

      {urlOpen && (
        <SourceDialog
          title="Add a page"
          description={`We'll read this page and add it to your knowledge. It has to be on ${activeSite?.domain ?? "your website"}.`}
          inputId="knowledge-source-url"
          label="Page address"
          placeholder="https://example.com/help/refunds"
          value={urlInput}
          onChange={setUrlInput}
          onSubmit={() => void addUrl()}
          submitLabel="Add page"
          busy={adding}
          error={addError}
          onClose={() => setUrlOpen(false)}
        />
      )}
      {sitemapOpen && (
        <SourceDialog
          title="Add a sitemap"
          description="We'll read every page the sitemap lists, in the background. You can leave the page while it runs."
          inputId="knowledge-source-sitemap"
          label="Sitemap address"
          placeholder="https://example.com/sitemap.xml"
          value={sitemapInput}
          onChange={setSitemapInput}
          onSubmit={() => void addSitemap()}
          submitLabel="Add sitemap"
          busy={addingSitemap}
          error={sitemapError}
          success={sitemapResult ? `Found ${sitemapResult.pagesFound} page${sitemapResult.pagesFound === 1 ? "" : "s"}. Crawling now.` : null}
          onClose={() => setSitemapOpen(false)}
        />
      )}

      <NotionPagesList rows={notionRows} />
    </div>
  );
}

// One text field in a dialog, in the same style as the Import from Notion dialog: used for adding a page address or a sitemap.
function SourceDialog({
  title, description, inputId, label, placeholder, value, onChange, onSubmit, submitLabel, busy, error, success, onClose,
}: {
  title: string; description: string; inputId: string; label: string; placeholder: string; value: string; onChange: (value: string) => void;
  onSubmit: () => void; submitLabel: string; busy: boolean; error: string | null; success?: string | null; onClose: () => void;
}) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <form
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onSubmit={(event) => { event.preventDefault(); onSubmit(); }}
        className="nimp-dialog w-full max-w-[480px] overflow-hidden rounded-2xl border shadow-[0_28px_80px_rgba(0,0,0,0.4)]"
      >
        <div className="nimp-divider flex items-start justify-between gap-3 border-b px-6 py-5">
          <div>
            <h3 className="nimp-heading text-[19px] font-semibold tracking-[-0.02em]">{title}</h3>
            <p className="nimp-text mt-1 text-[14.5px] leading-6">{description}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="nimp-close flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg transition"><X size={18} /></button>
        </div>
        <div className="px-6 py-5">
          <label htmlFor={inputId} className="nimp-heading block text-[14.5px] font-medium">{label}</label>
          <div className="nimp-field mt-2 flex h-12 items-center rounded-full border px-4">
            <input id={inputId} autoFocus value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} inputMode="url" className="nimp-input min-w-0 flex-1 bg-transparent text-[15px] outline-none" />
          </div>
          {error && <p role="alert" className="mt-3 text-[14px] font-medium text-[#e5636f]">{error}</p>}
          {success && <p role="status" className="mt-3 text-[14px] font-medium text-[#2FA266]">{success}</p>}
        </div>
        <div className="nimp-divider flex items-center justify-end gap-3 border-t px-6 py-4">
          <button type="button" onClick={onClose} className="nimp-btn h-11 cursor-pointer rounded-full border px-5 text-[15px] font-medium transition">{success ? "Done" : "Cancel"}</button>
          <button type="submit" disabled={!value.trim() || busy} className="nimp-btn nimp-btn-primary flex h-11 cursor-pointer items-center gap-2 rounded-full border px-5 text-[15px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50">
            {busy && <LoaderCircle size={15} className="animate-spin" />} {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

