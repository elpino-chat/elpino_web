"use client";

import { ArrowUp, LoaderCircle, X } from "lucide-react";
import { FormEvent, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function GlossyDocsSearch() {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setExpanded(true);
    const question = query.trim();
    if (!question || loading) return;
    setLoading(true);
    setAnswer("");
    setError("");
    try {
      const content = document.querySelector("main")?.innerText || document.body.innerText;
      const response = await fetch("/api/docs/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, content, path: window.location.pathname }),
      });
      const result = await response.json() as { answer?: string; error?: string; message?: string | string[] };
      const backendMessage = Array.isArray(result.message) ? result.message.join(" ") : result.message;
      if (!response.ok || !result.answer) throw new Error(result.error || backendMessage || "Could not answer that question.");
      setAnswer(result.answer);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not answer that question.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`fixed bottom-2 left-1/2 z-40 max-w-[calc(100%_-_2rem)] -translate-x-1/2 transition-[width] duration-300 ${expanded ? "w-[620px]" : "w-[380px]"}`}>
      {(answer || error || loading) && <div role="status" aria-live="polite" className="mb-2 max-h-[480px] overflow-y-auto rounded-2xl border border-white/80 bg-white/80 p-4 text-sm leading-6 text-black shadow-[0_16px_45px_rgba(25,32,22,0.16)] ring-1 ring-black/5 [backdrop-filter:blur(24px)_saturate(160%)]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {loading ? <p>Reading this guide…</p> : error ? <p>{error}</p> : <div className="space-y-3 [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:font-semibold [&_li]:ml-5 [&_ol]:list-decimal [&_pre]:overflow-hidden [&_strong]:font-semibold [&_ul]:list-disc"><ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ children, ...props }) => <a {...props} target="_blank" rel="noreferrer" className="font-medium text-[#7651b0] underline underline-offset-2">{children}</a>,
                code: ({ children, className, ...props }) => className
                  ? <code {...props} className={`${className} block overflow-x-auto rounded-xl bg-[#171914] p-3 font-mono text-xs leading-5 text-white`}>{children}</code>
                  : <code {...props} className="rounded bg-black/[0.07] px-1 py-0.5 font-mono text-[0.9em]">{children}</code>,
              }}
            >{answer}</ReactMarkdown></div>}
          </div>
          {!loading && <button type="button" aria-label="Close answer" onClick={() => { setAnswer(""); setError(""); }} className="sticky top-0 mt-0.5 shrink-0 text-black/40 hover:text-black"><X size={15} /></button>}
        </div>
        {!error && !loading && <p className="mt-2 text-[10px] uppercase tracking-[0.1em] text-black/35">Answered from this page · GPT-4o mini</p>}
      </div>}
      <form onSubmit={search} className="flex items-center gap-2 rounded-full border border-white/80 bg-white/35 p-2 shadow-[0_16px_45px_rgba(25,32,22,0.18)] ring-1 ring-black/5 [backdrop-filter:blur(24px)_saturate(160%)]">
        <input value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => setExpanded(true)} name="q" type="search" aria-label="Ask about this documentation page" placeholder="Ask about this page..." className="h-10 min-w-0 flex-1 bg-transparent px-3 text-sm text-black outline-none placeholder:text-black/45" />
        <button type="submit" aria-label="Ask documentation assistant" className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-black text-white transition hover:bg-black/80">{loading ? <LoaderCircle size={17} className="animate-spin" /> : <ArrowUp size={17} />}</button>
      </form>
    </div>
  );
}
