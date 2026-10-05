"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Check, FileText, UploadCloud, FileType2, FileCode2, Globe, MessageCircle, Plus, X, Loader2, AlertCircle, ArrowUpRight } from "lucide-react";

type Source = { id: string; title: string; sourceType: string; sourceUrl?: string; content?: string; siteId?: string };
type CrawlPage = { url: string; title?: string; state: "waiting" | "reading" | "summarizing" | "saved" | "failed"; error?: string };
type Crawl = { siteId: string; state: "queued" | "running" | "completed" | "failed"; pages: CrawlPage[]; error?: string };
type ImportStatus = { pending: number; active: number; failed: { url: string; error: string }[]; crawls: Crawl[]; pages?: (CrawlPage & { siteId: string })[] };
type Kind = "website" | "file" | "qa";
const field = "mt-2 h-12 w-full rounded-[11px] border border-black/20 bg-white px-3.5 text-[15px] font-normal outline-none transition placeholder:text-black/30 hover:border-black/40 focus:border-black focus:ring-4 focus:ring-black/[0.06]";

export function TrainingStep({ websiteUrl, siteId, siteError, onContinue }: { websiteUrl: string; siteId: string | null; siteError: string | null; onContinue: () => void }) {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [kind, setKind] = useState<Kind | null>(null);
  const [url, setUrl] = useState(websiteUrl);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [status, setStatus] = useState<ImportStatus>({ pending: 0, active: 0, failed: [], crawls: [] });
  const [preview, setPreview] = useState<Source | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [domainInput, setDomainInput] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const panel = useRef<HTMLDialogElement>(null);
  const crawl = status.crawls.find(item => item.siteId === siteId);
  const importing = status.pending + status.active > 0;
  const websiteSources = sources.filter(source => source.siteId === siteId && ["url", "sitemap"].includes(source.sourceType));
  const pages: CrawlPage[] = [...(crawl?.pages ?? [])];
  for (const source of websiteSources) {
    if (source.sourceUrl && !pages.some(page => page.url === source.sourceUrl)) pages.push({ url: source.sourceUrl, title: source.title, state: "saved" });
  }
  for (const queued of status.pages ?? []) {
    if (queued.siteId !== siteId) continue;
    const existing = pages.findIndex(page => page.url === queued.url);
    if (existing >= 0) pages[existing] = queued;
    else pages.push(queued);
  }
  for (const failed of status.failed) {
    if (!pages.some(page => page.url === failed.url)) pages.push({ url: failed.url, state: "failed", error: failed.error });
  }

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const [statusResponse, sourcesResponse] = await Promise.all([
          fetch("/api/workspace/knowledge/import-status", { cache: "no-store" }),
          fetch("/api/workspace/knowledge", { cache: "no-store" }),
        ]);
        const [data, articles] = await Promise.all([statusResponse.json(), sourcesResponse.json()]);
        if (!statusResponse.ok || data.message) throw new Error(data.message ?? "Could not load crawl progress.");
        if (!sourcesResponse.ok || articles.message) throw new Error(articles.message ?? "Could not load knowledge.");
        if (active) { setStatus(data); setSources(articles.items ?? []); setLoading(false); }
      } catch (err) { if (active) setError(err instanceof Error ? err.message : "Could not load progress."); }
      finally { if (active) { setLoading(false); } if (active) timer = setTimeout(poll, 2500); }
    };
    void poll();
    return () => { active = false; clearTimeout(timer); };
  }, []);

  useEffect(() => {
    if (kind) panel.current?.showModal();
    else panel.current?.close();
  }, [kind]);

  async function load() {
    const response = await fetch("/api/workspace/knowledge", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok || data.message) throw new Error(data.message ?? "Could not load your resources.");
    setSources(data.items ?? []);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError(null); setNotice(null);
    try {
      let endpoint = "/api/workspace/knowledge";
      let body: Record<string, string>;
      if (kind === "website") {
        const parsed = new URL(/^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`);
        if (!["https:", "http:"].includes(parsed.protocol)) throw new Error("Enter a valid website address.");
        endpoint += "/url";
        body = { url: parsed.toString(), ...(siteId ? { siteId } : {}) };
      } else if (kind === "file") {
        if (!file) throw new Error("Choose a file first.");
        if (file.size > 5 * 1024 * 1024) throw new Error("Choose a file smaller than 5 MB.");
        const fileBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result).split(",")[1]);
          reader.onerror = () => reject(new Error("Could not read this file."));
          reader.readAsDataURL(file);
        });
        endpoint += "/file";
        body = { fileName: file.name, fileBase64 };
      } else {
        if (!question.trim() || !answer.trim()) throw new Error("Add both a question and an answer.");
        body = { title: question.trim(), content: `Question: ${question.trim()}\nAnswer: ${answer.trim()}` };
      }
      const response = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok || data.error || data.message) throw new Error(data.message ?? data.error ?? "Could not save this resource.");
      if (kind === "file") setKind(null); else setAddOpen(false);
      setFile(null); setQuestion(""); setAnswer("");
      setNotice(data.queued ? "Page queued. It will be saved to knowledge after processing." : "Resource saved. You can add more now or continue.");
      await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save this resource."); }
    finally { setBusy(false); }
  }

  async function retry(pageUrl?: string) {
    if (!siteId || busy) return;
    setBusy(true); setError(null); setNotice(null);
    try {
      const response = await fetch(pageUrl ? "/api/workspace/knowledge/url" : "/api/workspace/knowledge/website", {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ siteId, url: pageUrl ?? websiteUrl, ...(pageUrl ? {} : { force: true }) }),
      });
      const data = await response.json();
      if (!response.ok || data.error || data.message) throw new Error(data.message ?? data.error ?? "Could not retry.");
      setNotice("Retrying — this can take a few seconds.");
      await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not retry."); }
    finally { setBusy(false); }
  }

  const suggestion = (() => { try { return new URL(/^https?:\/\//i.test(websiteUrl) ? websiteUrl : `https://${websiteUrl}`).hostname; } catch { return ""; } })();

  async function importSite(raw: string) {
    if (!siteId || busy || !raw.trim()) return;
    setBusy(true); setError(null); setNotice(null);
    try {
      const parsed = new URL(/^https?:\/\//i.test(raw.trim()) ? raw.trim() : `https://${raw.trim()}`);
      const response = await fetch("/api/workspace/knowledge/website", {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ siteId, url: parsed.toString(), force: true }),
      });
      const data = await response.json();
      if (!response.ok || data.error || data.message) throw new Error(data.message ?? data.error ?? "Could not start importing.");
      setDomainInput("");
      setNotice("Import started — pages will appear below as they’re read.");
      await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not start importing."); }
    finally { setBusy(false); }
  }

  const friendly = (message?: string) => !message ? "Something went wrong." : /abort|timeout|timed out/i.test(message) ? "The page took too long to respond. Check the address and try again." : message.replace(/^Could not reach that page \((.*)\)$/i, "Couldn’t reach this page ($1).");

  const qaItems = sources.filter(source => source.sourceType === "text");
  const savedPages = pages.filter(page => page.state === "saved").length;
  const failedPages = pages.filter(page => page.state === "failed").length;
  const allFailed = !importing && pages.length > 0 && savedPages === 0 && failedPages > 0;
  const progress = pages.length > 0 ? Math.round((savedPages / pages.length) * 100) : 0;
  const crawlFailed = crawl?.state === "failed" || allFailed;
  const autoReading = !crawlFailed && (importing || (pages.length === 0 && !!siteId && sources.length === 0));
  const headline = loading ? "Checking your knowledge…"
    : sources.length > 0 ? `${sources.length} ${sources.length === 1 ? "resource" : "resources"} ready for your AI`
    : autoReading ? "Reading your website…"
    : crawlFailed ? "We couldn’t read your website yet"
    : "No knowledge added yet";
  const subline = importing ? `We’re adding your best pages automatically${pages.length ? ` · ${savedPages} of ${pages.length} read` : ""}. Keep going — add more below.`
    : autoReading ? "We’re starting with your most useful pages. This takes a minute."
    : crawlFailed ? "Retry from Website pages, or add a file or answers instead."
    : sources.length > 0 ? "Add more below, or continue — you can always add more later."
    : "Add a source below so your AI has something to answer from.";
  const websiteChip = importing ? `Reading ${savedPages}/${pages.length || "…"}` : websiteSources.length > 0 ? `${websiteSources.length} imported` : crawl?.state === "failed" || allFailed ? "Needs attention" : "Preparing…";
  const cards = [
    { id: "website" as const, accent: "bg-blue-50 text-blue-600 ring-blue-100", label: "Website pages", description: "Import answers from your site or help center.", icon: Globe, count: websiteSources.length },
    { id: "file" as const, accent: "bg-amber-50 text-amber-600 ring-amber-100", label: "Files", description: "Upload guides, product sheets or support docs.", icon: FileText, count: sources.filter(s => s.sourceType === "file").length },
    { id: "qa" as const, accent: "bg-violet-50 text-violet-600 ring-violet-100", label: "Questions & answers", description: "Write clear answers to your most common questions.", icon: MessageCircle, count: sources.filter(s => s.sourceType === "text").length },
  ];
  const panelTitle = kind === "website" ? "Website pages" : kind === "file" ? "Upload a file" : "Questions & answers";

  return (
    <section className="mx-auto w-full max-w-[660px]">
      <h1 className="text-balance text-xl font-normal leading-[1.12] tracking-[-0.03em]">Give your AI the answers it needs</h1>
      <p className="mt-2 text-lg leading-relaxed text-black/55">Add a little knowledge about your business so Elpino can answer your visitors’ questions accurately.</p>

      {/* Live summary */}
      <div className="mt-8 flex items-center gap-3 rounded-xl bg-black/[0.03] px-4 py-3" aria-live="polite">
        <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${sources.length > 0 ? "bg-emerald-100 text-emerald-700" : "bg-black/5 text-black/40"}`}>
          {importing ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-black/80">
            {headline}
          </p>
          <p className="truncate text-xs text-black/50">{subline}</p>
        </div>
        {importing && pages.length > 0 && (
          <div className="hidden w-24 sm:block" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Website import progress">
            <div className="h-1.5 overflow-hidden rounded-full bg-black/10"><div className="h-full rounded-full bg-emerald-600 transition-all duration-500" style={{ width: `${Math.max(progress, 8)}%` }} /></div>
          </div>
        )}
      </div>

      {/* Sources */}
      <div className="mt-5 grid gap-3">
        {cards.map(card => (
          <button key={card.id} type="button" disabled={busy} onClick={() => { setKind(card.id); setPreview(null); setError(null); setNotice(null); }}
            className="group flex w-full items-center gap-4 rounded-xl border border-black/10 bg-white p-4 text-left shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition hover:border-black/25 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/10 disabled:opacity-50">
            <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ring-1 ${card.accent}`}><card.icon size={20} /></span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-base font-medium text-[#111214]">{card.label}</span>
                {card.id === "website" ? (
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${crawl?.state === "failed" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
                    {importing && <Loader2 size={11} className="animate-spin" />}{websiteChip}
                  </span>
                ) : card.count > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"><Check size={11} />{card.count} added</span>
                )}
              </span>
              <span className="mt-0.5 block text-sm leading-relaxed text-black/50">{card.description}</span>
            </span>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-black/10 text-black/55 transition group-hover:border-black group-hover:bg-black group-hover:text-white">
              {card.id === "website" ? <ArrowUpRight size={16} /> : <Plus size={16} />}
            </span>
          </button>
        ))}
      </div>

      {(error || siteError) && !kind && <p role="alert" className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700"><AlertCircle size={16} className="mt-0.5 shrink-0" />{error ?? siteError}</p>}
      {notice && !kind && <p role="status" className="mt-4 flex items-start gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700"><Check size={16} className="mt-0.5 shrink-0" />{notice}</p>}

      <div className="mt-8 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center">
        <button type="button" disabled={busy} onClick={onContinue} className="h-12 cursor-pointer rounded-[10px] px-5 text-[15px] text-black/55 transition hover:bg-black/5 hover:text-black disabled:opacity-40">Skip for now</button>
        <button type="button" disabled={busy} onClick={onContinue} className="h-12 flex-1 cursor-pointer rounded-[10px] bg-[#18191b] px-6 text-[16px] font-semibold text-white transition hover:bg-black focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/15 active:scale-[0.99] disabled:opacity-40 sm:max-w-[200px] sm:order-last">Continue</button>
      </div>
      <p className="mt-4 text-sm text-black/40">You can add more knowledge anytime from your dashboard.</p>

      <dialog ref={panel} onCancel={event => { if (busy) event.preventDefault(); }} onClose={() => { setKind(null); setPreview(null); setAddOpen(false); setFile(null); setDragging(false); }} aria-labelledby="knowledge-panel-title" onClick={event => { if (event.target === event.currentTarget && !busy) setKind(null); }}
        className={kind === "website" || kind === "qa" ? "fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-dvh w-full max-w-xl border-0 bg-white p-0 shadow-2xl backdrop:bg-black/30 backdrop:backdrop-blur-[2px]" : "m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border-0 bg-white p-0 shadow-2xl backdrop:bg-black/30 backdrop:backdrop-blur-[2px]"}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-black/10 px-6 py-4">
            <h2 id="knowledge-panel-title" className="text-lg font-medium">{panelTitle}</h2>
            <button type="button" disabled={busy} onClick={() => setKind(null)} aria-label="Close" className="rounded-lg p-2 text-black/60 transition hover:bg-black/5 hover:text-black disabled:opacity-40"><X size={20} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
{kind === "website" && <>
              <p className="text-sm leading-relaxed text-black/55">Use your website as a source for your AI. We browse it page by page, starting with the most useful ones, and turn each into knowledge. You can close this and keep setting up.</p>

              <h3 className="mt-6 text-sm font-semibold">Import a website</h3>
              <form onSubmit={event => { event.preventDefault(); void importSite(domainInput); }} className="mt-2 flex gap-2">
                <div className="flex h-11 min-w-0 flex-1 items-center rounded-full border border-black/20 px-4 transition focus-within:border-black focus-within:ring-4 focus-within:ring-black/[0.06]">
                  <input value={domainInput} onChange={e => setDomainInput(e.target.value)} inputMode="url" aria-label="Website address" placeholder="yourcompany.com" className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-black/30" />
                </div>
                <button type="submit" disabled={!domainInput.trim() || busy || !siteId} className="inline-flex h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-[#18191b] px-5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40">{busy ? <Loader2 size={15} className="animate-spin" /> : null}Import</button>
              </form>
              {suggestion && domainInput.trim() !== suggestion && <p className="mt-2 text-xs text-black/50">Suggested: <button type="button" onClick={() => setDomainInput(suggestion)} className="cursor-pointer rounded-full bg-black/5 px-2 py-0.5 font-medium text-black/80 transition hover:bg-black/10">{suggestion}</button></p>}
              {error && <p role="alert" className="mt-3 text-sm text-red-600">{friendly(error)}</p>}
              {notice && <p role="status" className="mt-3 text-sm text-emerald-700">{notice}</p>}

              <div className="mt-8 flex items-baseline justify-between"><h3 className="text-sm font-semibold">Your website</h3><span className="text-xs text-black/45">{pages.length} {pages.length === 1 ? "page" : "pages"} found</span></div>
              {suggestion && (
                <div className={`mt-2 rounded-2xl border p-4 ${allFailed || crawl?.state === "failed" ? "border-red-200 bg-red-50/40" : "border-black/10 bg-black/[0.02]"}`} role="status">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 ring-1 ring-black/10"><Globe size={19} /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{suggestion}</p>
                      <p className={`mt-0.5 flex items-center gap-1.5 text-xs ${allFailed || crawl?.state === "failed" ? "text-red-600" : importing ? "text-blue-600" : "text-black/50"}`}>
                        {importing ? <><Loader2 size={12} className="animate-spin" />Crawling</> : allFailed || crawl?.state === "failed" ? <><AlertCircle size={12} />Couldn’t import</> : savedPages > 0 ? <><Check size={12} className="text-emerald-600" />Finished</> : "Waiting to start"}
                        <span className="text-black/45">· {savedPages} read{failedPages > 0 ? `, ${failedPages} failed` : ""}</span>
                      </p>
                    </div>
                    {(allFailed || crawl?.state === "failed") && <button type="button" disabled={busy} onClick={() => void retry()} className="shrink-0 cursor-pointer rounded-full bg-black px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-black/80 disabled:opacity-40">Try again</button>}
                  </div>
                  {(importing || savedPages > 0) && <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/10"><div className="h-full rounded-full bg-blue-600 transition-all duration-500" style={{ width: `${Math.max(progress, importing ? 8 : 0)}%` }} /></div>}
                </div>
              )}
              {pages.length > 0 && <ul className="mt-3 divide-y divide-black/5 overflow-hidden rounded-xl border border-black/10">
                {pages.map(page => {
                  const article = sources.find(source => source.sourceUrl === page.url && source.siteId === siteId);
                  const label = page.state === "summarizing" ? "Preparing article…" : page.state === "waiting" ? "Waiting…" : page.state === "reading" ? "Reading page…" : page.state === "saved" ? "Saved" : friendly(page.error);
                  return <li key={page.url} className="flex items-center gap-3 px-3.5 py-3">
                    <span className="shrink-0">{page.state === "saved" ? <Check size={16} className="text-emerald-600" /> : page.state === "failed" ? <AlertCircle size={16} className="text-red-600" /> : <Loader2 size={16} className="animate-spin text-black/40" />}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{page.title ?? page.url.replace(/^https?:\/\//, "")}</p>
                      <p className={`truncate text-xs ${page.state === "failed" ? "text-red-600" : "text-black/45"}`}>{label}</p>
                    </div>
                    {page.state === "failed" && <button type="button" disabled={busy} onClick={() => void retry(page.url)} className="shrink-0 rounded-md border border-black/15 px-2.5 py-1 text-xs transition hover:bg-black/5 disabled:opacity-40">Retry</button>}
                    {article && <button type="button" onClick={() => setPreview(article)} className="shrink-0 rounded-md px-2 py-1 text-xs text-black/70 transition hover:bg-black/5">View</button>}
                    <a href={page.url} target="_blank" rel="noopener noreferrer" aria-label="Open source page" className="shrink-0 rounded-md p-1 text-black/40 transition hover:bg-black/5 hover:text-black"><ArrowUpRight size={15} /></a>
                  </li>;
                })}
              </ul>}
              {preview && <div className="mt-4 rounded-xl border border-black/10 bg-black/[0.02] p-4"><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-medium">{preview.title}</h3><button type="button" onClick={() => setPreview(null)} aria-label="Close article preview" className="text-black/50 hover:text-black"><X size={16} /></button></div><pre className="mt-3 max-h-80 overflow-y-auto whitespace-pre-wrap font-sans text-sm leading-relaxed text-black/70">{preview.content}</pre></div>}
              <button type="button" onClick={() => { setError(null); setNotice(null); setAddOpen(true); }} className="mt-5 flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-dashed border-black/20 text-sm font-medium text-black/70 transition hover:border-black/40 hover:text-black"><Plus size={15} /> Add a single page</button>
            </>}
            {kind === "qa" && <>
              <p className="text-sm leading-relaxed text-black/55">Write clear answers to the questions your visitors ask most. Elpino uses these first.</p>
              {qaItems.length === 0 ? (
                <div className="mt-5 flex flex-col items-center rounded-2xl border border-dashed border-black/20 bg-black/[0.015] px-6 py-10 text-center">
                  <span className="flex size-12 items-center justify-center rounded-full bg-violet-50 text-violet-600 ring-1 ring-violet-100"><MessageCircle size={22} /></span>
                  <p className="mt-4 text-[15px] font-medium">No answers yet</p>
                  <p className="mt-1 text-sm text-black/50">Add your first question and answer below.</p>
                </div>
              ) : (
                <ul className="mt-5 space-y-3">
                  {qaItems.map(item => {
                    const [, q = item.title, a = ""] = /^Question:\s*([\s\S]*?)\nAnswer:\s*([\s\S]*)$/.exec(item.content ?? "") ?? [];
                    return <li key={item.id} className="rounded-xl border border-black/10 p-4">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-violet-50 text-xs font-semibold text-violet-600">Q</span>
                        <p className="text-sm font-medium">{q}</p>
                      </div>
                      {a && <div className="mt-2 flex items-start gap-3"><span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700">A</span><p className="line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-black/60">{a}</p></div>}
                    </li>;
                  })}
                </ul>
              )}
              <button type="button" onClick={() => { setError(null); setNotice(null); setAddOpen(true); }} className="mt-5 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-black/15 text-[15px] font-medium transition hover:border-black/40 hover:bg-black/[0.03]"><Plus size={16} /> Add {qaItems.length > 0 ? "more" : "a question & answer"}</button>
            </>}
            {kind === "qa" && addOpen && (
              <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && !busy) setAddOpen(false); }}>
                <form onSubmit={save} role="dialog" aria-label="Add a question and answer" className="w-full max-w-[480px] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_28px_80px_rgba(0,0,0,0.25)]">
                  <div className="flex items-start justify-between gap-3 border-b border-black/10 px-6 py-5">
                    <div><h3 className="text-[19px] font-semibold tracking-[-0.02em]">Add a question & answer</h3><p className="mt-1 text-[14.5px] leading-6 text-black/55">Write it the way you’d answer a customer.</p></div>
                    <button type="button" disabled={busy} onClick={() => setAddOpen(false)} aria-label="Close" className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-black/55 transition hover:bg-black/5 hover:text-black"><X size={18} /></button>
                  </div>
                  <div className="px-6 py-5">
                    <label htmlFor="onb-qa-q" className="block text-[14.5px] font-medium">Question</label>
                    <input id="onb-qa-q" autoFocus value={question} onChange={e => setQuestion(e.target.value)} placeholder="What is your return policy?" className="mt-2 h-12 w-full rounded-full border border-black/20 bg-white px-4 text-[15px] outline-none transition placeholder:text-black/30 focus:border-black focus:ring-4 focus:ring-black/[0.06]" />
                    <label htmlFor="onb-qa-a" className="mt-4 block text-[14.5px] font-medium">Answer</label>
                    <textarea id="onb-qa-a" value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Write the answer your customers should get." className="mt-2 h-32 w-full resize-none rounded-2xl border border-black/20 bg-white px-4 py-3 text-[15px] outline-none transition placeholder:text-black/30 focus:border-black focus:ring-4 focus:ring-black/[0.06]" />
                    {error && <p role="alert" className="mt-3 text-[14px] font-medium text-red-600">{error}</p>}
                  </div>
                  <div className="flex items-center justify-end gap-3 border-t border-black/10 px-6 py-4">
                    <button type="button" disabled={busy} onClick={() => setAddOpen(false)} className="h-11 cursor-pointer rounded-full border border-black/15 px-5 text-[15px] font-medium transition hover:bg-black/5">Cancel</button>
                    <button type="submit" disabled={!question.trim() || !answer.trim() || busy} className="flex h-11 cursor-pointer items-center gap-2 rounded-full bg-[#18191b] px-5 text-[15px] font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50">{busy && <Loader2 size={15} className="animate-spin" />}Save answer</button>
                  </div>
                </form>
              </div>
            )}
            {kind === "website" && addOpen && (
              <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && !busy) setAddOpen(false); }}>
                <form onSubmit={save} role="dialog" aria-label="Add a page" className="w-full max-w-[480px] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_28px_80px_rgba(0,0,0,0.25)]">
                  <div className="flex items-start justify-between gap-3 border-b border-black/10 px-6 py-5">
                    <div>
                      <h3 className="text-[19px] font-semibold tracking-[-0.02em]">Add a page</h3>
                      <p className="mt-1 text-[14.5px] leading-6 text-black/55">We’ll read this page and add it to your knowledge. It has to be on your website.</p>
                    </div>
                    <button type="button" disabled={busy} onClick={() => setAddOpen(false)} aria-label="Close" className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-black/55 transition hover:bg-black/5 hover:text-black"><X size={18} /></button>
                  </div>
                  <div className="px-6 py-5">
                    <label htmlFor="onb-page-url" className="block text-[14.5px] font-medium">Page address</label>
                    <div className="mt-2 flex h-12 items-center rounded-full border border-black/20 px-4 transition focus-within:border-black focus-within:ring-4 focus-within:ring-black/[0.06]">
                      <input id="onb-page-url" autoFocus type="text" inputMode="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/help/refunds" className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-black/30" />
                    </div>
                    {error && <p role="alert" className="mt-3 text-[14px] font-medium text-red-600">{friendly(error)}</p>}
                    {notice && <p role="status" className="mt-3 text-[14px] font-medium text-emerald-700">{notice}</p>}
                  </div>
                  <div className="flex items-center justify-end gap-3 border-t border-black/10 px-6 py-4">
                    <button type="button" disabled={busy} onClick={() => setAddOpen(false)} className="h-11 cursor-pointer rounded-full border border-black/15 px-5 text-[15px] font-medium transition hover:bg-black/5">Cancel</button>
                    <button type="submit" disabled={!url.trim() || busy} className="flex h-11 cursor-pointer items-center gap-2 rounded-full bg-[#18191b] px-5 text-[15px] font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50">{busy && <Loader2 size={15} className="animate-spin" />}Add page</button>
                  </div>
                </form>
              </div>
            )}
            {kind === "file" && <form onSubmit={save}>
              {kind === "file" && <div>
                <input ref={fileInput} type="file" accept=".pdf,.docx,.txt,.md" hidden onChange={e => setFile(e.target.files?.[0] ?? null)} />
                {!file ? (
                  <button type="button" onClick={() => fileInput.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
                    onDrop={e => { e.preventDefault(); setDragging(false); const dropped = e.dataTransfer.files?.[0]; if (dropped) setFile(dropped); }}
                    className={`flex w-full cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${dragging ? "border-black bg-black/[0.04]" : "border-black/20 bg-black/[0.015] hover:border-black/40 hover:bg-black/[0.03]"}`}>
                    <span className="flex size-12 items-center justify-center rounded-full bg-white text-black/70 shadow-sm ring-1 ring-black/10"><UploadCloud size={22} /></span>
                    <span className="mt-4 text-[15px] font-medium">Drop a file here, or <span className="underline underline-offset-4">browse</span></span>
                    <span className="mt-1 text-sm text-black/50">Up to 5 MB</span>
                    <span className="mt-5 flex flex-wrap items-center justify-center gap-2">
                      {([["PDF", FileText, "bg-red-50 text-red-600"], ["DOCX", FileType2, "bg-blue-50 text-blue-600"], ["TXT", FileText, "bg-black/5 text-black/60"], ["MD", FileCode2, "bg-violet-50 text-violet-600"]] as const).map(([label, Icon, tone]) => (
                        <span key={label} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}><Icon size={13} />{label}</span>
                      ))}
                    </span>
                  </button>
                ) : (
                  <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-black/[0.02] p-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-100"><FileText size={20} /></span>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{file.name}</p><p className={`text-xs ${file.size > 5 * 1024 * 1024 ? "text-red-600" : "text-black/50"}`}>{file.size > 5 * 1024 * 1024 ? "Too large — max 5 MB" : file.size < 1024 * 1024 ? `${Math.max(1, Math.round(file.size / 1024))} KB` : `${(file.size / 1024 / 1024).toFixed(1)} MB`}</p></div>
                    <button type="button" onClick={() => { setFile(null); if (fileInput.current) fileInput.current.value = ""; }} className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-black/60 transition hover:bg-black/5 hover:text-black">Remove</button>
                  </div>
                )}
              </div>}
              
              {<button disabled={busy || (kind === "file" && !file)} className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#18191b] px-5 text-sm font-medium text-white transition hover:bg-black disabled:opacity-40">{busy && <Loader2 size={15} className="animate-spin" />}{busy ? "Saving…" : "Upload file"}</button>}
            </form>}
            {error && kind && kind !== "website" && !addOpen && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
            {notice && kind && kind !== "website" && !addOpen && <p role="status" className="mt-4 text-sm text-emerald-700">{notice}</p>}
          </div>
        </div>
      </dialog>
    </section>
  );
}
