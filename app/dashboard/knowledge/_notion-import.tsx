"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import posthog from "posthog-js";
import { Check, LoaderCircle, Search, X } from "lucide-react";

type NotionPage = { id: string; title: string; url: string; lastEdited: string };
type PagesResponse = { connected?: boolean; pages?: NotionPage[]; nextCursor?: string | null; message?: string };
type ImportResponse = { imported?: { id: string; title: string }[]; failed?: { id: string; error: string }[]; message?: string };
export type NotionRow = { id: string; title: string; sourceUrl: string | null; createdAt: string };

const MAX_PER_IMPORT = 10;

// The shared Notion logo file has an opaque white background, so it shows as a box on dark
// surfaces. This one is transparent; the dark theme flips it to white (see globals.css).
function NotionMark({ className = "size-3.5" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/connector-logos/notion-transparent.webp" alt="" aria-hidden="true" className={`knowledge-notion-mark ${className} object-contain`} />;
}

export function NotionImportButton({ onImported }: { onImported: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [pages, setPages] = useState<NotionPage[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ done: number; failed: { id: string; error: string }[] } | null>(null);

  async function load(query: string, cursor?: string) {
    setLoading(true); setError(null);
    const params = new URLSearchParams();
    if (query.trim()) params.set("query", query.trim());
    if (cursor) params.set("cursor", cursor);
    const response = await fetch(`/api/workspace/knowledge/notion/pages?${params.toString()}`, { cache: "no-store" }).catch(() => null);
    const data = response ? await response.json().catch(() => ({})) as PagesResponse : {};
    if (!response?.ok) setError(data.message ?? "Could not reach Notion.");
    else {
      setConnected(data.connected !== false);
      setPages((current) => (cursor ? [...current, ...(data.pages ?? [])] : data.pages ?? []));
      setNextCursor(data.nextCursor ?? null);
    }
    setLoading(false);
  }

  function openDialog() {
    setOpen(true);
    setResult(null); setSelected(new Set()); setSearch("");
    void load("");
  }

  function closeDialog() {
    if (importing) return;
    setOpen(false);
  }

  // Esc closes the dialog (unless an import is running).
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !importing) setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, importing]);

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else if (next.size < MAX_PER_IMPORT) next.add(id);
      return next;
    });
  }

  async function importSelected() {
    if (!selected.size || importing) return;
    setImporting(true); setError(null);
    const response = await fetch("/api/workspace/knowledge/notion/import", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ pageIds: [...selected] }) }).catch(() => null);
    const data = response ? await response.json().catch(() => ({})) as ImportResponse : {};
    if (!response?.ok) setError(data.message ?? "Could not import from Notion.");
    else {
      const failed = data.failed ?? [];
      const done = data.imported?.length ?? 0;
      if (done) { posthog.capture("knowledge_item_created", { source_type: "notion", count: done }); onImported(); }
      setResult({ done, failed });
      setSelected(new Set(failed.map((item) => item.id)));
    }
    setImporting(false);
  }

  const titleById = new Map(pages.map((page) => [page.id, page.title]));

  return (
    <>
      <button type="button" onClick={openDialog} className="knowledge-notion-trigger kn-btn kn-btn-outline flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full border px-5 text-[15px] font-medium transition">
        <NotionMark className="size-[18px]" /> Import from Notion
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDialog(); }}>
          <div role="dialog" aria-modal="true" aria-label="Import from Notion" className="nimp-dialog flex max-h-[min(720px,calc(100dvh-32px))] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl border shadow-[0_28px_80px_rgba(0,0,0,0.4)]">
            <div className="nimp-divider flex shrink-0 items-start justify-between gap-3 border-b px-6 py-5">
              <div className="flex items-center gap-3.5">
                <span className="nimp-icon flex size-11 shrink-0 items-center justify-center rounded-xl"><NotionMark className="size-6" /></span>
                <div>
                  <h3 className="nimp-heading text-[19px] font-semibold tracking-[-0.02em]">Import from Notion</h3>
                  <p className="nimp-text mt-0.5 text-[14px]">Choose the pages to add to your knowledge.</p>
                </div>
              </div>
              <button type="button" onClick={closeDialog} aria-label="Close" className="nimp-close flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg transition"><X size={18} /></button>
            </div>

            {connected === false ? (
              <div className="flex flex-col items-center px-6 py-12 text-center">
                <p className="nimp-heading text-[17px] font-semibold">Connect Notion first</p>
                <p className="nimp-text mt-1.5 max-w-sm text-[14.5px] leading-6">Link your Notion workspace, then come back and pick the pages to import.</p>
                <Link href="/dashboard/settings/setup-integration" className="nimp-btn nimp-btn-primary mt-5 flex h-11 items-center rounded-full border px-6 text-[15px] font-semibold transition">Connect Notion</Link>
              </div>
            ) : (
              <>
                <div className="shrink-0 px-6 pb-3 pt-5">
                  <form onSubmit={(event) => { event.preventDefault(); void load(search); }} className="nimp-field flex h-11 items-center gap-2.5 rounded-full border px-4">
                    <Search size={15} className="nimp-text shrink-0" aria-hidden="true" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search your Notion pages"
                      aria-label="Search Notion pages"
                      className="nimp-input min-w-0 flex-1 bg-transparent text-[14.5px] outline-none"
                    />
                  </form>
                </div>

                <div className="min-h-[180px] flex-1 overflow-y-auto px-3 pb-2">
                  {loading && !pages.length ? (
                    <p className="nimp-text flex items-center gap-2 px-3 py-6 text-[14.5px]"><LoaderCircle size={15} className="animate-spin" /> Loading pages…</p>
                  ) : pages.length ? (
                    <ul>
                      {pages.map((page) => {
                        const checked = selected.has(page.id);
                        return (
                          <li key={page.id}>
                            <label className="nimp-row flex cursor-pointer items-center gap-3.5 rounded-xl px-3 py-2.5">
                              <input type="checkbox" checked={checked} onChange={() => toggle(page.id)} className="sr-only" />
                              <span className={`nimp-box flex size-5 shrink-0 items-center justify-center rounded-md border ${checked ? "nimp-box-on" : ""}`} aria-hidden="true">{checked && <Check size={13} strokeWidth={3} />}</span>
                              <span className="min-w-0 flex-1">
                                <span className="nimp-heading block truncate text-[15px] font-medium">{page.title}</span>
                                {page.lastEdited && <span className="nimp-text block text-[13px]">Edited {new Date(page.lastEdited).toLocaleDateString()}</span>}
                              </span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="nimp-text px-3 py-6 text-[14.5px] leading-6">{search.trim() ? "No pages match that search." : "No pages found. In Notion, open a page, choose ••• → Connections and add your Elpino connection."}</p>
                  )}
                  {nextCursor && (
                    <button type="button" disabled={loading} onClick={() => void load(search, nextCursor)} className="nimp-text mx-3 my-2 flex h-10 cursor-pointer items-center gap-2 text-[14px] font-medium underline underline-offset-4 disabled:opacity-50">
                      {loading && <LoaderCircle size={14} className="animate-spin" />} Load more
                    </button>
                  )}
                </div>

                {(error || result) && (
                  <div className="shrink-0 space-y-1 px-6 pb-3 text-[14px]">
                    {error && <p role="alert" className="font-medium text-[#e5636f]">{error}</p>}
                    {result && result.done > 0 && <p className="font-medium text-[#2FA266]">Imported {result.done} page{result.done === 1 ? "" : "s"}.</p>}
                    {result?.failed.map((item) => <p key={item.id} className="font-medium text-[#e5636f]">{titleById.get(item.id) ?? "A page"}: {item.error}</p>)}
                  </div>
                )}

                <div className="nimp-divider flex shrink-0 items-center gap-3 border-t px-6 py-4">
                  <p className="nimp-text mr-auto text-[14px]">{selected.size ? `${selected.size} selected${selected.size >= MAX_PER_IMPORT ? ` (max ${MAX_PER_IMPORT})` : ""}` : `Up to ${MAX_PER_IMPORT} at a time`}</p>
                  <button type="button" onClick={closeDialog} disabled={importing} className="nimp-btn h-11 cursor-pointer rounded-full border px-5 text-[15px] font-medium transition disabled:cursor-not-allowed disabled:opacity-50">{result ? "Done" : "Cancel"}</button>
                  <button type="button" disabled={!selected.size || importing} onClick={() => void importSelected()} className="nimp-btn nimp-btn-primary flex h-11 cursor-pointer items-center gap-2 rounded-full border px-5 text-[15px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50">
                    {importing && <LoaderCircle size={15} className="animate-spin" />} {importing ? "Importing…" : selected.size ? `Import ${selected.size} page${selected.size === 1 ? "" : "s"}` : "Import"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function NotionPagesList({ rows }: { rows: NotionRow[] }) {
  if (!rows.length) return null;
  return (
    <div className="mt-6">
      <p className="flex items-center gap-1.5 pb-2 text-[12px] font-normal text-white/45"><NotionMark /> Imported from Notion</p>
      <div className="overflow-hidden border-y border-white/10">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center justify-between gap-4 border-t border-white/10 px-4 py-3 first:border-t-0 hover:bg-white/[0.025] md:px-5">
            {row.sourceUrl
              ? <a href={row.sourceUrl} target="_blank" rel="noreferrer" className="min-w-0 truncate text-[12.5px] text-white/80 hover:text-white hover:underline">{row.title}</a>
              : <span className="min-w-0 truncate text-[12.5px] text-white/80">{row.title}</span>}
            <span className="shrink-0 text-[11px] text-white/45">{new Date(row.createdAt).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-white/40">To refresh a page after editing it in Notion, import it again. Imported pages stay private until you show them to visitors in Pages.</p>
    </div>
  );
}
