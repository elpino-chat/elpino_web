"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, BookOpen, Search } from "lucide-react";
import { useRouter } from "next/navigation";

const SEARCH_ITEMS = [
  { title: "Introduction", description: "Understand what Elpino does and how customer support flows through it.", href: "/docs", group: "Get started", keywords: "overview basics welcome" },
  { title: "Quickstart", description: "Set up a workspace and reach your first customer conversation.", href: "/docs#quickstart", group: "Get started", keywords: "setup start workspace first conversation" },
  { title: "AI answers", description: "Learn how knowledge, AI answers, and human handoff fit together.", href: "/docs/ai-answers", group: "AI support", keywords: "ai answer handoff confidence flow" },
  { title: "Knowledge base", description: "Add websites, documents, URLs, and help articles for the AI.", href: "/docs/knowledge", group: "AI support", keywords: "crawl upload file page source train" },
  { title: "Install the chat widget", description: "Create a site tag and add Elpino to your website.", href: "/docs/chat-widget", group: "Chat widget", keywords: "script tag javascript embed website install" },
  { title: "Pre-chat form", description: "Collect useful customer details before a conversation begins.", href: "/dashboard/connect/prechat-form", group: "Chat widget", keywords: "name email phone fields form" },
  { title: "Identity verification", description: "Safely identify signed-in customers with short-lived tokens.", href: "/docs/identity-verification", group: "Chat widget", keywords: "jwt token hs256 logged in user security" },
  { title: "Shared inbox", description: "Claim, reply to, summarize, translate, and resolve conversations.", href: "/docs/inbox", group: "Team workspace", keywords: "agent teammate conversation reply ticket" },
  { title: "Invite teammates", description: "Add people to your workspace and shared support inbox.", href: "/dashboard/settings/people", group: "Team workspace", keywords: "member people seat team invitation" },
  { title: "Availability", description: "Set the hours when you are available for customer handoffs.", href: "/dashboard/settings/availability", group: "Team workspace", keywords: "schedule online hours status" },
  { title: "Integrations", description: "Connect payment and work tools to customer support.", href: "/docs/integrations", group: "Connect", keywords: "stripe razorpay trello tools" },
  { title: "Billing and usage", description: "Understand credits, seats, payments, and recharge.", href: "/docs/billing", group: "Platform", keywords: "plan credit seat razorpay recharge" },
  { title: "Troubleshooting", description: "Fix common widget, knowledge, identity, and billing issues.", href: "/docs/troubleshooting", group: "Help", keywords: "fix error broken diagnose" },
  { title: "Security", description: "Read how Elpino protects credentials and customer information.", href: "/docs/security", group: "Security", keywords: "encryption privacy data credentials" },
] as const;

export function DocsSearch({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(() => {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (!terms.length) return SEARCH_ITEMS.slice(0, 6);
    return SEARCH_ITEMS.filter((item) => {
      const haystack = `${item.title} ${item.description} ${item.group} ${item.keywords}`.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    }).slice(0, 7);
  }, [query]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (event.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  useEffect(() => setActiveIndex(0), [query]);

  function navigate(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <div ref={rootRef} className="relative ml-auto w-full max-w-xl">
      <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-black/45" />
      <input
        ref={inputRef}
        autoFocus={autoFocus}
        value={query}
        onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") { event.preventDefault(); setActiveIndex((index) => Math.min(index + 1, results.length - 1)); }
          if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex((index) => Math.max(index - 1, 0)); }
          if (event.key === "Enter" && results[activeIndex]) { event.preventDefault(); navigate(results[activeIndex].href); }
        }}
        type="search"
        role="combobox"
        aria-label="Search Elpino documentation"
        aria-expanded={open}
        aria-controls="docs-search-results"
        aria-activedescendant={open && results[activeIndex] ? `docs-result-${activeIndex}` : undefined}
        autoComplete="off"
        placeholder="What do you want to set up?"
        className="h-10 w-full rounded-lg border border-black/30 bg-transparent pl-10 pr-16 text-sm text-[#11120f] outline-none transition placeholder:text-black/45 hover:border-black/50 focus:border-black focus:ring-2 focus:ring-black/10"
      />
      <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-black/20 bg-transparent px-1.5 py-0.5 text-[10px] text-black/45">⌘ K</kbd>

      {open && (
        <div id="docs-search-results" role="listbox" className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-2xl border border-black/10 bg-white p-2 text-[#192016] shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
          <div className="flex items-center justify-between px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.11em] text-[#969b96]"><span>{query ? "Search results" : "Popular guides"}</span><span>{results.length} {results.length === 1 ? "result" : "results"}</span></div>
          {results.length ? results.map((item, index) => (
            <button
              id={`docs-result-${index}`}
              key={`${item.title}-${item.href}`}
              type="button"
              role="option"
              aria-selected={activeIndex === index}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => navigate(item.href)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${activeIndex === index ? "bg-[#f3edfb]" : "hover:bg-[#f7f6f2]"}`}
            >
              <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${activeIndex === index ? "bg-[#bf91ff] text-black" : "bg-[#eeece6] text-[#667069]"}`}><BookOpen size={16} /></span>
              <span className="min-w-0 flex-1"><span className="flex items-center gap-2"><span className="truncate text-sm font-semibold">{item.title}</span><span className="shrink-0 text-[9px] font-semibold uppercase tracking-wide text-[#9a829f]">{item.group}</span></span><span className="mt-0.5 block truncate text-[11px] text-[#747b74]">{item.description}</span></span>
              <ArrowRight size={14} className={activeIndex === index ? "text-[#7651b0]" : "text-[#b0b4b0]"} />
            </button>
          )) : <div className="px-4 py-9 text-center"><p className="text-sm font-semibold">No matching guide</p><p className="mt-1 text-xs text-[#747b74]">Try “widget”, “knowledge”, or “security”.</p></div>}
          <div className="mt-1 flex items-center gap-3 border-t border-black/10 px-3 pt-2 text-[10px] text-[#969b96]"><span>↑↓ Navigate</span><span>↵ Open</span><span>Esc Close</span></div>
        </div>
      )}
    </div>
  );
}
