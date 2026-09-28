"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, LoaderCircle } from "lucide-react";

type KnowledgeItem = { id: string; title: string; content: string; siteId: string | null };
type Site = { id: string; name: string; domain: string };

export function KnowledgePageEditor({ pageId }: { pageId?: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [siteId, setSiteId] = useState("");
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(Boolean(pageId));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/workspace/knowledge", { cache: "no-store" }).then((response) => response.json()),
      fetch("/api/workspace/sites", { cache: "no-store" }).then((response) => response.json()),
    ]).then(([knowledge, website]) => {
      const loadedSites = (website as { sites?: Site[] }).sites ?? [];
      setSites(loadedSites);
      if (pageId) {
        const item = ((knowledge as { items?: KnowledgeItem[] }).items ?? []).find((entry) => entry.id === pageId);
        if (!item) { setError("Page not found."); return; }
        setTitle(item.title); setContent(item.content); setSiteId(item.siteId ?? "");
      }
    }).catch(() => setError("Page could not be loaded.")).finally(() => setLoading(false));
  }, [pageId]);

  async function save() {
    if (!title.trim() || !content.trim() || saving) return;
    setSaving(true); setSaved(false); setError(null);
    const response = await fetch(pageId ? `/api/workspace/knowledge/${encodeURIComponent(pageId)}` : "/api/workspace/knowledge", {
      method: pageId ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: title.trim(), content: content.trim(), siteId: siteId || null }),
    });
    const data = await response.json().catch(() => ({})) as { message?: string };
    if (response.ok) {
      setSaved(true);
      if (!pageId) router.replace("/dashboard/knowledge");
    } else setError(data.message ?? "Page could not be saved.");
    setSaving(false);
  }

  return (
    <main className="dashboard-knowledge-editor flex h-full min-h-0 flex-col overflow-hidden bg-[#262626] text-white">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-3 sm:h-16 sm:px-5">
        <button type="button" onClick={() => router.push("/dashboard/knowledge")} className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-white/60 hover:bg-white/[0.06] hover:text-white/90 sm:gap-2">
          <ArrowLeft size={16} /> <span className="hidden sm:inline">Pages</span>
        </button>
        <div className="flex items-center gap-2 sm:gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-xs text-white/50">
              <Check size={14} /> <span className="hidden sm:inline">Saved</span>
            </span>
          )}
          <button type="button" disabled={!title.trim() || !content.trim() || saving} onClick={() => void save()} className="knowledge-editor-save flex h-9 items-center gap-2 rounded-md px-3 text-[13px] disabled:opacity-40 sm:px-4 sm:text-sm">
            {saving && <LoaderCircle size={14} className="animate-spin" />} {pageId ? "Save changes" : "Create page"}
          </button>
        </div>
      </header>
      {loading ? (
        <div className="flex flex-1 items-center justify-center text-sm text-white/45"><LoaderCircle size={16} className="mr-2 animate-spin" /> Loading page</div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-12">
          <article className="mx-auto max-w-[820px]">
            <input autoFocus value={title} onChange={(event) => { setTitle(event.target.value); setSaved(false); }} placeholder="Untitled page" className="w-full bg-transparent text-[26px] font-normal tracking-[-0.03em] text-white/95 outline-none placeholder:text-white/25 sm:text-4xl sm:tracking-[-0.035em]" />
            {/* Scope only means something with 2+ websites; with one, "All websites" and that site are the same. */}
            {sites.length > 1 ? (
              <div className="mt-8 flex items-center gap-3 border-y border-white/10 py-3">
                <span className="text-xs text-white/40">Attached to</span>
                <select value={siteId} onChange={(event) => { setSiteId(event.target.value); setSaved(false); }} className="min-w-0 max-w-[65%] rounded-md border border-white/10 bg-[#262626] px-2.5 py-1.5 text-xs text-white/70 outline-none sm:max-w-none">
                  <option value="">All websites</option>
                  {sites.map((site) => <option key={site.id} value={site.id}>{site.name} — {site.domain}</option>)}
                </select>
              </div>
            ) : (
              <div className="mt-6 border-b border-white/10" />
            )}
            {error && <p className="mt-5 rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">{error}</p>}
            <textarea value={content} onChange={(event) => { setContent(event.target.value); setSaved(false); }} placeholder="Start writing…" className="mt-6 min-h-[58vh] w-full resize-none bg-transparent text-[16px] leading-8 text-white/85 outline-none placeholder:text-white/25" />
          </article>
        </div>
      )}
    </main>
  );
}
