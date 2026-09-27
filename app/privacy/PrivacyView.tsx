"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { ArrowDown, Clock, Mail, Search, Shield } from "lucide-react";
import { useStoredLanguage } from "@/app/hooks/useStoredLanguage";
import { useTranslation } from "@/app/hooks/useTranslation";
import privacyTranslations from "./privacy-translations.generated.json";

// A privacy policy told as a journey. One customer message ("Where's my
// refund?") travels through Elpino; every stop says what happens to it, who
// can see it, how it is protected and how long it stays. After the journey:
// what we never do, how to use your rights, and the full policy as searchable
// fine print. Same visual language as the header menu and pricing page.

const LAST_UPDATED = "September 19, 2026";
const CONTACT = "hello@elpino.chat";
const INK = "#11120f";

const generatedPrivacyTranslations = privacyTranslations as Record<string, Record<string, string>>;

function useGeneratedPrivacyTranslation(language: string, rootRef: RefObject<HTMLDivElement | null>) {
  const originalText = useRef(new WeakMap<Text, string>());
  const originalAttributes = useRef(new WeakMap<Element, Map<string, string>>());

  useLayoutEffect(() => {
    const root = rootRef.current;
    const dictionary = generatedPrivacyTranslations[language] ?? generatedPrivacyTranslations.en;
    if (!root || !dictionary) return;

    const translate = () => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode() as Text | null;
      while (node) {
        if (!node.parentElement?.closest("script, style")) {
          if (!originalText.current.has(node)) originalText.current.set(node, node.nodeValue ?? "");
          const original = originalText.current.get(node) ?? "";
          const compact = original.replace(/\s+/g, " ").trim();
          const translated = dictionary[compact];
          if (translated && translated !== compact) {
            const leading = original.match(/^\s*/)?.[0] ?? "";
            const trailing = original.match(/\s*$/)?.[0] ?? "";
            const next = `${leading}${translated}${trailing}`;
            if (node.nodeValue !== next) node.nodeValue = next;
          } else if (language === "en" && node.nodeValue !== original) node.nodeValue = original;
        }
        node = walker.nextNode() as Text | null;
      }

      root.querySelectorAll("[placeholder], [aria-label], [title]").forEach((element) => {
        let originals = originalAttributes.current.get(element);
        if (!originals) { originals = new Map(); originalAttributes.current.set(element, originals); }
        for (const name of ["placeholder", "aria-label", "title"]) {
          const value = element.getAttribute(name);
          if (!value) continue;
          if (!originals.has(name)) originals.set(name, value);
          const original = originals.get(name)!;
          const next = dictionary[original] ?? original;
          if (value !== next) element.setAttribute(name, next);
        }
      });
    };

    translate();
    const observer = new MutationObserver(translate);
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [language, rootRef]);
}

type Provider = { name: string; tagline: string; badge: string; color: string; role: string; dataShared: string; trainingPolicy: string; location: string };

const AI_PROVIDERS: Provider[] = [
  { name: "OpenAI", tagline: "GPT-4o & Reasoning Architecture", badge: "Primary / Reasoning", color: "#3784ff", role: "Multilingual translation, conversational memory, draft generation, and teammate summarization.", dataShared: "Relevant conversation snippets and knowledge base context needed to complete prompt execution.", trainingPolicy: "Zero training on API customer data under enterprise data privacy agreements.", location: "United States (Global low-latency edge)" },
  { name: "Anthropic", tagline: "Claude 3.5 Sonnet & Haiku Models", badge: "High-Nuance Support", color: "#fc7b33", role: "Complex document analysis, nuanced empathy-driven customer responses, and multi-turn ticket resolutions.", dataShared: "Scoped customer inquiry text and matching knowledge base documentation snippets.", trainingPolicy: "Zero training on commercial API customer content.", location: "United States" },
  { name: "xAI", tagline: "Grok High-Speed Reasoning Engines", badge: "Real-Time Fallback & Reasoning", color: "#11120f", role: "Real-time query processing, dynamic decision trees, and intelligent multi-model failover support.", dataShared: "Task-specific customer message text stripped of unnecessary personal identifiers.", trainingPolicy: "Commercial API terms protecting input/output confidentiality.", location: "United States" },
  { name: "DeepSeek", tagline: "High-Efficiency Logic & Inference", badge: "Automated Routing & Logic", color: "#7060bd", role: "Rapid intent classification, routine query resolution, and cost-efficient structured triage.", dataShared: "Anonymized user question context required for instant resolution synthesis.", trainingPolicy: "Commercial inference API calls with strict task-scoped prompt boundaries.", location: "Regional / API Edge Endpoints" },
  { name: "GLM / Zhipu AI", tagline: "Specialized Multilingual & Regional Models", badge: "Multilingual Intelligence", color: "#1aa37a", role: "Localized Asian language understanding, cross-regional translations, and specialized dialect handling.", dataShared: "Regional conversation query inputs and localized knowledge base segments.", trainingPolicy: "Enterprise API privacy terms with zero unauthorized data mining.", location: "Asia-Pacific Regional Edge" },
  { name: "Nomic AI", tagline: "High-Dimensional Vector Embeddings", badge: "Semantic Search Embeddings", color: "#d9508a", role: "Creating numerical embeddings from your uploaded help docs, articles, and macros to power instant vector search.", dataShared: "Knowledge base text chunks to generate embedding matrices.", trainingPolicy: "Zero model training on vectorized customer workspace content.", location: "United States" },
];

// ------------------------------------------------------------ the journey

type Station = {
  id: string;
  color: string;
  ink: boolean; // dark text on this colour
  title: string;
  line: string;
  rows: [string, string][];
  section: string;
  // what the message looks like at this stop
  state: { label: string; body: ReactNode };
};

const STATIONS: Station[] = [
  {
    id: "widget", color: "#3784ff", ink: false, title: "A visitor asks", line: "Someone types into the chat widget on your website.",
    rows: [["Data", "The message, plus a name or email only if the visitor shares one."], ["Who sees it", "The visitor and your workspace. Nobody else."], ["Protection", "Sent over TLS 1.3."], ["Stays", "In your workspace while your account is active."]],
    section: "data-we-collect",
    state: { label: "Plain text", body: <span>Where&apos;s my refund?</span> },
  },
  {
    id: "workspace", color: "#ffd84d", ink: true, title: "It lands in your workspace", line: "Elpino stores the conversation, its status and any handoff log for your team.",
    rows: [["Data", "The conversation, thread status, handoff logs and attachments."], ["Who sees it", "Your teammates. Elpino staff don't read chats unless you authorize it for support diagnostics."], ["Protection", "Tokens and secrets are encrypted with AES-256-GCM. Traffic is encrypted with TLS 1.3."], ["Stays", "While your account is active."]],
    section: "storage-security",
    state: { label: "Encrypted", body: <span className="font-mono tracking-widest">8f3a·c91b·e27d·04fa</span> },
  },
  {
    id: "knowledge", color: "#7060bd", ink: false, title: "We look up your docs", line: "To ground the answer, Elpino searches your own help articles and macros.",
    rows: [["Data", "Your knowledge base, turned into vector embeddings by Nomic AI."], ["Who sees it", "Only the snippets that match the question are used."], ["Protection", "Zero model training on your vectorized content."], ["Stays", "While your account is active. Purged within 30 days of workspace deletion."]],
    section: "ai-processing",
    state: { label: "Matching snippets", body: <span className="flex flex-wrap gap-2"><b className="rounded-full border-2 border-[#11120f] bg-white px-2.5 py-0.5 text-[13px]">Refund policy</b><b className="rounded-full border-2 border-[#11120f] bg-white px-2.5 py-0.5 text-[13px]">Billing FAQ</b></span> },
  },
  {
    id: "ai", color: "#fc7b33", ink: false, title: "An AI model drafts the answer", line: "A vetted provider gets the question and those snippets. Nothing else.",
    rows: [["Data", "Only that message and the matching snippets. Never your whole database or history."], ["Who sees it", "One vetted provider: OpenAI, Anthropic, xAI, DeepSeek or GLM."], ["Protection", "Passwords and payment identifiers are never put in prompts."], ["Stays", "Never used to train models, by them or by us."]],
    section: "ai-processing",
    state: { label: "Scoped prompt", body: <span>message + 2 snippets<br /><span className="text-[13px] opacity-70">no passwords · no payment IDs</span></span> },
  },
  {
    id: "handoff", color: "#1aa37a", ink: false, title: "Answered, or handed to a person", line: "The AI replies, or escalates to a teammate with the context already attached.",
    rows: [["Data", "The reply, or the thread with a summary for your teammate."], ["Who sees it", "Your human agents, who review drafts and take escalations."], ["Protection", "Only members of your workspace can open it."], ["Stays", "While your account is active."]],
    section: "how-we-use-it",
    state: { label: "Your team takes over", body: <span>Priya joined the chat</span> },
  },
  {
    id: "meter", color: "#d9508a", ink: false, title: "The meter ticks", line: "Elpino counts usage so billing and rate limits work, and to spot abuse.",
    rows: [["Data", "AI resolution counts, token usage, latency and audit logs."], ["Who sees it", "Elpino, for billing, rate limits and abuse prevention."], ["Protection", "Card payments go through Razorpay. We never see full card numbers."], ["Stays", "Subscription tier, billing period and invoice identifiers."]],
    section: "data-we-collect",
    state: { label: "Usage meter", body: <span>+1 conversation counted</span> },
  },
  {
    id: "end", color: "#11120f", ink: false, title: "You decide how long it stays", line: "Your data, your lifecycle: disconnect, export or delete whenever you like.",
    rows: [["Data", "Everything above."], ["Who sees it", "You."], ["Protection", "Disconnect an integration and its tokens are wiped immediately."], ["Stays", "Delete your workspace and records are gone within 30 days. Ask for an export first."]],
    section: "retention-deletion",
    state: { label: "Gone", body: <span>Deleted <span aria-hidden="true">✓</span></span> },
  },
];

const NEVER = [
  { what: "Sell, rent or monetize your data", detail: "Yours or your customers' personal data, to any third party or data broker." },
  { what: "Serve third-party ads", detail: "No behavioural cross-site ad profiling either." },
  { what: "Judge creditworthiness", detail: "Your data is never used for loans, credit or insurance eligibility." },
  { what: "Train public AI models", detail: "Your support conversations never train generalized foundation models." },
];

const RIGHTS = [
  { name: "See it", subject: "Access request", text: "Request a complete copy of the personal records we hold." },
  { name: "Fix it", subject: "Rectification request", text: "Correct inaccurate or outdated account profiles." },
  { name: "Erase it", subject: "Erasure request", text: "Permanently wipe customer conversation history and records." },
  { name: "Limit it", subject: "Restriction request", text: "Opt out of AI assistance or automated suggestion workflows." },
  { name: "Take it", subject: "Data export request", text: "Get a full JSON or CSV archive of transcripts and knowledge base content." },
];

// ------------------------------------------------------------ small parts

const box = "rounded-2xl border-2 border-[#11120f]";
const mailLink = <a href={`mailto:${CONTACT}`} className="font-semibold text-[#11120f] underline decoration-[#3784ff] decoration-2 underline-offset-4">{CONTACT}</a>;

function Tick() {
  return (
    <span className="mt-1 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border-2 border-[#11120f] bg-[#3784ff] text-white">
      <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="4" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M16 6 8.5 13.5 4 9" /></svg>
    </span>
  );
}
function Bullet({ children }: { children: ReactNode }) {
  return <li className="flex items-start gap-3"><Tick /><span>{children}</span></li>;
}

const STICKERS = ["#3784ff", "#ffd84d", "#7060bd", "#fc7b33"];

// One fine-print section: a collapsible card with the legal text and a plain-English note.
function FineSection({ id, number, title, note, query, forceOpen, children }: { id: string; number?: number; title: string; note: string; query: string; forceOpen: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [matches, setMatches] = useState(true);
  const body = useRef<HTMLDivElement>(null);
  const sticker = STICKERS[(number ?? 0) % STICKERS.length];

  // Search: a section stays visible when the query appears in its title, its note or its text.
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) { setMatches(true); return; }
    const haystack = `${title} ${note} ${body.current?.textContent ?? ""}`.toLowerCase();
    const hit = haystack.includes(q);
    setMatches(hit);
    if (hit) setOpen(true);
  }, [query, title, note]);

  useEffect(() => { setOpen(forceOpen); }, [forceOpen]);

  // Opening via a #hash (from the journey's "fine print" links).
  useEffect(() => {
    const onHash = () => { if (window.location.hash === `#${id}`) setOpen(true); };
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [id]);

  if (!matches) return null;
  return (
    <article id={id} className="scroll-mt-28 rounded-[22px] border-2 border-[#11120f] bg-white">
      <h3>
        <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-3.5 px-5 py-4 text-left sm:px-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-[#11120f] font-mono text-[14px] font-bold" style={{ background: sticker, color: sticker === "#ffd84d" ? INK : "#fff" }}>
            {number ? String(number).padStart(2, "0") : "✺"}
          </span>
          <span className="flex-1 text-xl font-medium tracking-[-0.02em] sm:text-2xl">{title}</span>
          <span aria-hidden="true" className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#11120f] text-xl font-medium transition duration-300 ${open ? "rotate-[135deg] bg-[#ffd84d]" : "bg-white"}`}>+</span>
        </button>
      </h3>
      <div className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.3,1,0.3,1)] ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="grid gap-6 border-t-2 border-dashed border-black/15 p-5 sm:p-6 lg:grid-cols-[1.6fr_1fr] lg:gap-8">
            <div ref={body} className="min-w-0 space-y-4 text-[15px] leading-7 text-black/70">{children}</div>
            <aside className="self-start">
              <div className="-rotate-1 rounded-2xl border-2 border-[#11120f] bg-[#ffd84d] p-5">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#11120f]/60">In plain English</p>
                <p className="mt-2 text-[15px] leading-6 text-[#11120f]">{note}</p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </article>
  );
}

// ------------------------------------------------------------ page

const CHAPTERS = [
  { id: "journey", label: "The journey" },
  { id: "never", label: "What we never do" },
  { id: "controls", label: "Your controls" },
  { id: "fine-print", label: "The fine print" },
] as const;

export function PrivacyView() {
  const language = useStoredLanguage();
  const { t } = useTranslation(language as any);
  const [station, setStation] = useState(0);
  const [trackFill, setTrackFill] = useState(0);
  const [chapter, setChapter] = useState<string>("");
  const [pageProgress, setPageProgress] = useState(0);
  const [showBar, setShowBar] = useState(false);
  const [query, setQuery] = useState("");
  const [expandAll, setExpandAll] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  useGeneratedPrivacyTranslation(language, pageRef);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = `${t("privacyPage.title", "Privacy Policy")} | Elpino`;
  }, [language, t]);

  // Scroll: the journey's track fill, the active station, the sticky header's progress and chapter.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setPageProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
      setShowBar(window.scrollY > 520);

      const list = listRef.current;
      if (list) {
        const rect = list.getBoundingClientRect();
        const centre = window.innerHeight * 0.45;
        setTrackFill(Math.min(1, Math.max(0, (centre - rect.top) / rect.height)));
        const cards = Array.from(list.querySelectorAll<HTMLElement>("[data-station]"));
        let active = 0;
        cards.forEach((card, index) => { if (card.getBoundingClientRect().top < centre) active = index; });
        setStation(active);
      }
      let current = "";
      for (const item of CHAPTERS) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.4) current = item.label;
      }
      setChapter(current);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (frame) cancelAnimationFrame(frame); };
  }, []);

  const current = STATIONS[station];

  return (
    <div ref={pageRef} lang={language} className="bg-white text-[#11120f]">
      {/* Sticky header for this long page: where you are, and how far */}
      <div className={`fixed inset-x-0 top-0 z-[60] transition-transform duration-500 ease-[cubic-bezier(0.3,1,0.3,1)] ${showBar ? "translate-y-0" : "-translate-y-full"}`} aria-hidden={!showBar}>
        <div className="border-b-2 border-[#11120f] bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-[1300px] items-center gap-4 px-5 sm:px-8">
            <Link href="/" aria-label="Elpino home" className="flex shrink-0 items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.png" alt="" className="h-8 w-8 rounded-full border-2 border-[#11120f] bg-white object-contain p-0.5" />
              <span className="hidden text-[15px] font-semibold sm:inline">{t("privacyPage.shortTitle", "Privacy")}</span>
            </Link>
            <span className="hidden h-5 w-px bg-black/15 sm:block" />
            <p className="min-w-0 flex-1 truncate font-mono text-[12px] font-medium uppercase tracking-[0.1em] text-black/55">
              {chapter === "The journey" ? `Stop ${station + 1} of ${STATIONS.length} · ${current.title}` : chapter || "Privacy policy"}
            </p>
            <nav className="hidden items-center gap-1 md:flex" aria-label="Privacy sections">
              {CHAPTERS.map((item) => (
                <a key={item.id} href={`#${item.id}`} className={`rounded-full px-3 py-1.5 text-[13px] transition ${chapter === item.label ? "bg-[#ffd84d] font-semibold" : "text-black/60 hover:bg-black/5"}`}>{item.label}</a>
              ))}
            </nav>
            <a href={`mailto:${CONTACT}`} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border-2 border-[#11120f] bg-[#3784ff] px-4 text-[13px] font-semibold text-white transition hover:-translate-y-0.5">
              <Mail size={14} /> <span className="hidden sm:inline">{t("privacyPage.askUs", "Ask us")}</span>
            </a>
          </div>
          <div className="h-[3px] bg-black/10"><div className="h-full bg-[#3784ff]" style={{ width: `${pageProgress * 100}%` }} /></div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative isolate overflow-hidden pb-20 pt-[124px]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[url('/piliar-1-grandient.png')] bg-cover bg-top bg-no-repeat [mask-image:linear-gradient(to_bottom,black_75%,transparent)]" />
        <div className="mx-auto max-w-5xl px-5 text-center sm:px-8">
          <p className="mx-auto w-fit rounded-full border-2 border-[#11120f] bg-white px-4 py-1 font-mono text-[12px] font-medium uppercase tracking-[0.12em]">{t("privacyPage.title", "Privacy policy")}</p>
          <h1 className="mt-5 animate-[elpino-focus_0.9s_ease-out_both] text-5xl font-normal tracking-[-0.045em] sm:text-7xl">
            {t("privacyPage.heroTitle", "Follow one message through Elpino.")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl animate-[elpino-focus_0.9s_ease-out_0.15s_both] text-base leading-7 text-black/60 sm:text-lg">
            {t("privacyPage.heroDescription", "A customer asks where their refund is. Here is every place the message goes, who can see it, and how long it stays. The full policy follows for anyone who wants every word.")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="#journey" className="group inline-flex h-12 items-center gap-2 rounded-full border-2 border-[#11120f] bg-[#3784ff] px-7 text-[15px] font-semibold text-white transition hover:-translate-y-0.5">
              {t("privacyPage.startJourney", "Start the journey")} <ArrowDown size={16} className="transition-transform group-hover:translate-y-0.5" />
            </a>
            <a href="#fine-print" className="inline-flex h-12 items-center rounded-full border-2 border-[#11120f] bg-white px-7 text-[15px] font-semibold transition hover:-translate-y-0.5">{t("privacyPage.jumpToPolicy", "Jump to the fine print")}</a>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#11120f] bg-white px-3.5 py-1.5"><Clock size={14} /> {t("privacyPage.updated", "Updated")} {LAST_UPDATED}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-3.5 py-1.5 font-semibold"><Shield size={14} /> GDPR &amp; CCPA</span>
            <span className="rounded-full border-2 border-[#11120f] bg-white px-3.5 py-1.5">{t("privacyPage.neverSold", "Never sold")}</span>
            <span className="rounded-full border-2 border-[#11120f] bg-white px-3.5 py-1.5">{t("privacyPage.zeroTraining", "Zero AI training")}</span>
          </div>
        </div>
      </section>

      {/* The journey */}
      <section id="journey" className="scroll-mt-16 bg-[#fff8ec] px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-[1200px]">
          <div className="max-w-2xl">
            <p className="font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-[#7060bd]">{t("privacyPage.journey.eyebrow", "The journey")}</p>
            <h2 className="mt-3 text-4xl font-normal tracking-[-0.045em] sm:text-5xl">{t("privacyPage.journey.title", "Seven stops. Nothing hidden.")}</h2>
            <p className="mt-4 text-base leading-7 text-black/60">{t("privacyPage.journey.description", "Scroll down and watch the message change as it moves. On the left, what it looks like at this stop. On the right, what it means for your data.")}</p>
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
            {/* The message, sticky */}
            <div className="hidden lg:block">
              <div className="sticky top-28">
                <div className="relative overflow-hidden rounded-[28px] border-2 border-[#11120f] p-8 text-white transition-colors duration-700" style={{ background: current.color }}>
                  <div aria-hidden="true" className="absolute inset-0 opacity-25" style={{ backgroundImage: "radial-gradient(#fff 1.4px, transparent 1.4px)", backgroundSize: "20px 20px" }} />
                  <div className="relative">
                    <p className="font-mono text-[12px] font-medium uppercase tracking-[0.12em] opacity-80">Stop {station + 1} of {STATIONS.length}</p>
                    <div key={current.id} className="mt-6 animate-[elpino-pop_0.5s_ease-out_both]">
                      <div className="rounded-3xl rounded-bl-md border-2 border-[#11120f] bg-white px-6 py-5 text-[22px] leading-8 text-[#11120f]">{current.state.body}</div>
                      <p className="mt-4 inline-block rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-3.5 py-1 font-mono text-[11.5px] font-bold uppercase tracking-[0.08em] text-[#11120f]">{current.state.label}</p>
                    </div>
                    <div className="mt-8 flex gap-1.5" aria-hidden="true">
                      {STATIONS.map((item, index) => (
                        <span key={item.id} className={`h-2 flex-1 rounded-full border-2 border-[#11120f] transition-colors duration-500 ${index <= station ? "bg-white" : "bg-transparent"}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-4 px-2 text-sm leading-6 text-black/50">The message above is illustrative. What happens at each stop is exactly what the policy says.</p>
              </div>
            </div>

            {/* The stops, on a track that fills as you scroll */}
            <div ref={listRef} className="relative pl-10 sm:pl-14">
              <span aria-hidden="true" className="absolute bottom-0 left-[15px] top-0 w-[3px] rounded-full bg-black/10 sm:left-[21px]" />
              <span aria-hidden="true" className="absolute left-[15px] top-0 w-[3px] rounded-full bg-[#11120f] transition-[height] duration-150 sm:left-[21px]" style={{ height: `${trackFill * 100}%` }} />
              <div className="space-y-6">
                {STATIONS.map((item, index) => {
                  const reached = index <= station;
                  return (
                    <article key={item.id} data-station className="relative min-h-[60vh] lg:min-h-[64vh]">
                      <span aria-hidden="true" className={`absolute -left-10 top-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#11120f] font-mono text-[13px] font-bold transition duration-500 sm:-left-14 sm:h-11 sm:w-11 sm:text-[15px] ${reached ? "scale-100 text-white" : "scale-90 bg-white text-black/40"}`} style={reached ? { background: item.color } : undefined}>{index + 1}</span>
                      <div className={`${box} overflow-hidden bg-white transition duration-500 ${index === station ? "lg:-translate-y-1" : "lg:opacity-70"}`}>
                        <div className="border-b-2 border-[#11120f] p-5 sm:p-6" style={{ background: item.color, color: item.ink ? INK : "#fff" }}>
                          <h3 className="text-2xl font-medium tracking-[-0.03em] sm:text-[28px]">{item.title}</h3>
                          <p className="mt-1.5 text-[15px] leading-6 opacity-85">{item.line}</p>
                        </div>
                        {/* on small screens the message state is shown inline */}
                        <div className="border-b-2 border-dashed border-black/15 bg-[#fffdf5] px-5 py-3 text-[15px] lg:hidden sm:px-6">
                          <span className="mr-2 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-black/45">{item.state.label}</span>{item.state.body}
                        </div>
                        <dl className="divide-y-2 divide-dashed divide-black/15">
                          {item.rows.map(([label, value]) => (
                            <div key={label} className="grid gap-1 px-5 py-3.5 sm:grid-cols-[110px_1fr] sm:gap-4 sm:px-6">
                              <dt className="font-mono text-[11.5px] font-medium uppercase tracking-[0.1em] text-black/45">{label}</dt>
                              <dd className="text-[15px] leading-6 text-black/75">{value}</dd>
                            </div>
                          ))}
                        </dl>
                        <a href={`#${item.section}`} className="group flex items-center justify-between border-t-2 border-[#11120f] px-5 py-3 text-sm font-semibold transition hover:bg-[#ffd84d] sm:px-6">
                          Read this in the fine print <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What we never do */}
      <section id="never" className="scroll-mt-16 bg-[#11120f] px-5 py-20 text-[#fff8ec] sm:px-8 lg:py-28">
        <div className="mx-auto max-w-[1200px]">
          <p className="font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-[#ffd84d]">The short list</p>
          <h2 className="mt-3 max-w-2xl text-4xl font-normal tracking-[-0.045em] sm:text-5xl">Things we will <span className="text-[#fc7b33]">never</span> do with your data.</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {NEVER.map((item, index) => (
              <div key={item.what} className={`relative overflow-hidden rounded-[22px] border-2 border-[#fff8ec]/70 p-6 sm:p-8 ${index % 2 ? "sm:translate-y-6" : ""}`}>
                <p className="max-w-[80%] text-2xl font-medium leading-tight tracking-[-0.02em] sm:text-[28px]">{item.what}</p>
                <p className="mt-3 max-w-[85%] text-[15px] leading-6 text-[#fff8ec]/65">{item.detail}</p>
                <span aria-hidden="true" className="elpino-stamp absolute right-4 top-4 rotate-[-8deg] rounded-lg border-[3px] border-[#fc7b33] px-3 py-1 font-mono text-[15px] font-bold uppercase tracking-[0.16em] text-[#fc7b33]">Never</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Controls */}
      <section id="controls" className="scroll-mt-16 bg-white px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-2xl">
              <p className="font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-[#fc7b33]">Your controls</p>
              <h2 className="mt-3 text-4xl font-normal tracking-[-0.045em] sm:text-5xl">You&apos;re in charge. <span className="bg-[linear-gradient(transparent_62%,#ffd84d_62%)]">Just ask.</span></h2>
              <p className="mt-4 text-base leading-7 text-black/60">Whatever your location, these rights apply, in line with GDPR, CCPA/CPRA and global standards. Pick one and the email writes itself.</p>
            </div>
            <div className="flex items-center gap-4">
              <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90" aria-hidden="true">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#11120f" strokeOpacity="0.12" strokeWidth="9" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="#3784ff" strokeWidth="9" strokeLinecap="round" className="elpino-ring" />
              </svg>
              <p className="text-sm leading-5 text-black/60"><b className="block text-2xl tracking-[-0.03em] text-[#11120f]">30 days</b>to act on a verified request</p>
            </div>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {RIGHTS.map((right, index) => (
              <a key={right.name} href={`mailto:${CONTACT}?subject=${encodeURIComponent(right.subject)}&body=${encodeURIComponent(`Hi Elpino,\n\nI would like to make a request: ${right.subject.toLowerCase()}.\n\nWorkspace / account email:\n`)}`} className="group flex flex-col rounded-[22px] border-2 border-[#11120f] p-5 transition duration-300 hover:-translate-y-2 hover:-rotate-1" style={{ background: STICKERS[index % STICKERS.length], color: STICKERS[index % STICKERS.length] === "#ffd84d" ? INK : "#fff" }}>
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] opacity-75">Right {index + 1}</span>
                <span className="mt-2 text-3xl font-medium tracking-[-0.03em]">{right.name}</span>
                <span className="mt-2 flex-1 text-[14px] leading-5 opacity-90">{right.text}</span>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold">Email us <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span></span>
              </a>
            ))}
          </div>
          <p className="mt-8 text-sm text-black/55">Prefer to delete everything yourself? <Link href="/dashboard/settings" className="font-semibold text-[#11120f] underline decoration-[#3784ff] decoration-2 underline-offset-4">Delete your workspace in Settings</Link>: subscriptions cancel, widgets disconnect and records are gone within 30 days.</p>
        </div>
      </section>

      {/* Fine print: the full policy, searchable */}
      <section id="fine-print" className="scroll-mt-16 bg-[#fff8ec] px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-[1100px]">
          <p className="font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-[#7060bd]">The fine print</p>
          <h2 className="mt-3 text-4xl font-normal tracking-[-0.045em] sm:text-5xl">The whole policy, <span className="bg-[linear-gradient(transparent_62%,#ffd84d_62%)]">nothing skipped.</span></h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-black/60">Every section, in full. The yellow notes only help you understand the text beside them and aren&apos;t legally binding. Search for a word, or open everything.</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <label className="flex h-12 min-w-[260px] flex-1 items-center gap-3 rounded-full border-2 border-[#11120f] bg-white px-5 focus-within:border-[#3784ff]">
              <Search size={17} className="text-black/45" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the policy: cookies, Razorpay, delete…" aria-label="Search the privacy policy" className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-black/35" />
              {query && <button type="button" onClick={() => setQuery("")} className="text-sm font-semibold text-black/45 hover:text-black">Clear</button>}
            </label>
            <button type="button" onClick={() => setExpandAll((v) => !v)} className="h-12 rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-6 text-sm font-semibold transition hover:-translate-y-0.5">{expandAll ? "Collapse all" : "Expand all"}</button>
          </div>

          <div className="mt-8 space-y-4">
            <FineSection id="principles" title="Our Privacy Commitment" note="We only touch what you connect, we never sell it, and we never train public AI models on your conversations or documents." query={query} forceOpen={expandAll}>
              <p>At <b className="text-[#11120f]">Elpino</b>, we build intelligent customer support infrastructure that allows businesses to automate resolutions, organize conversations, and empower support teams with AI. We believe enterprise AI must be built on unwavering transparency, uncompromising security, and clear boundaries.</p>
              <p>This Privacy Policy outlines how Elpino collects, uses, encrypts, and retains your data across <code className="rounded bg-[#fff8ec] px-1.5 py-0.5 text-[13px] text-[#11120f]">elpino.chat</code>, the Elpino dashboard, our embeddable chat widget, our API endpoints, and our connected workflow integrations.</p>
              <div className={`${box} bg-[#eef4ff] p-4 text-sm`}>
                <b className="text-[#11120f]">Key takeaway:</b> We only access what you explicitly connect. We use it solely to run the platform for you, we never sell your data, and we <b className="text-[#11120f]">never allow your proprietary conversations or uploaded documents to be used to train generalized AI models.</b>
              </div>
            </FineSection>

            <FineSection id="data-we-collect" number={1} title="Data We Collect" note="Six kinds of data: your account, your customers' chats, your help docs, connected apps, usage stats and billing records. We never see full card numbers." query={query} forceOpen={expandAll}>
              <p>We only collect data that is strictly required to provide real-time AI assistance, conversational handoffs, and workspace collaboration:</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["A", "Account & Identity Data", "Your name, work email address, team membership, profile avatar, and authentication credentials. Passwords are encrypted with salted one-way hashes; OAuth sign-ins store zero password data."],
                  ["B", "Customer Conversation Data", "Inbound and outbound messages sent through the Elpino chat widget, connected inboxes, visitor profile tags (name, email submitted by visitor), thread status, handoff logs, and conversation attachments."],
                  ["C", "Knowledge Base & Business Docs", "Help center articles, FAQs, uploaded policy documents, macros, canned responses, and custom instructions you configure to ground the AI in your company's verified knowledge."],
                  ["D", "Connected Integration Data", "When you link connectors (Google, Slack, Stripe, Razorpay, etc.), we access only the specific scopes you authorize (e.g., payment status verification or notification dispatch)."],
                  ["E", "Telemetry & Metered AI Usage", "AI resolution counts, token usage, latency metrics, handoff trigger rates, system audit logs, and security telemetry needed for billing, rate limits, and abuse prevention."],
                  ["F", "Payment & Billing Records", "Handled securely via our PCI-DSS certified payment processor (Razorpay). Elpino never sees or stores full credit card numbers; we retain only subscription tier, billing period, and invoice identifiers."],
                ].map(([letter, name, text], i) => (
                  <div key={letter} className={`${box} bg-white p-4`}>
                    <div className="flex items-center gap-2.5 font-semibold text-[#11120f]">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-[#11120f] text-xs font-bold" style={{ background: STICKERS[i % STICKERS.length], color: STICKERS[i % STICKERS.length] === "#ffd84d" ? INK : "#fff" }}>{letter}</span>
                      {name}
                    </div>
                    <p className="mt-2 text-[13.5px] leading-6 text-black/60">{text}</p>
                  </div>
                ))}
              </div>
            </FineSection>

            <FineSection id="how-we-use-it" number={2} title="How We Use Your Data" note="We use data to run Elpino for you: answering, handing off, drafting, sorting and metering. No selling, no ads, no credit decisions, no public model training." query={query} forceOpen={expandAll}>
              <p>We process workspace and customer information exclusively to deliver, maintain, and secure the Elpino platform:</p>
              <ul className="space-y-3">
                <Bullet><b className="text-[#11120f]">Instant AI Auto-Resolutions:</b> Synthesizing immediate, grounded answers to visitor queries based strictly on your uploaded knowledge base and approved canned macros.</Bullet>
                <Bullet><b className="text-[#11120f]">Human Teammate Handoffs:</b> Gracefully escalating ambiguous inquiries, payment edge cases, or sensitive conversations directly to your human agents.</Bullet>
                <Bullet><b className="text-[#11120f]">Copilot &amp; Draft Generation:</b> Generating proposed replies and conversation summaries in the team inbox for human review prior to sending.</Bullet>
                <Bullet><b className="text-[#11120f]">Intelligent Inbox Triage:</b> Categorizing, tagging, priority-scoring, and routing customer tickets across departments.</Bullet>
                <Bullet><b className="text-[#11120f]">Usage Metering &amp; Security:</b> Auditing resolution consumption against plan quotas, detecting spam/DDoS attempts, and debugging service anomalies.</Bullet>
              </ul>
              <div className={`${box} bg-[#ffe3e0] p-5 text-sm`}>
                <h4 className="font-bold text-[#11120f]">What we NEVER do</h4>
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[13.5px] leading-6">
                  <li>We <b>do not sell, rent, or monetize</b> your or your customers&apos; personal data to any third party or data broker.</li>
                  <li>We <b>do not serve third-party ads</b> or conduct behavioural cross-site ad profiling.</li>
                  <li>We <b>do not use your data</b> to determine consumer creditworthiness, loans, or insurance eligibility.</li>
                  <li>We <b>do not train public base foundation models</b> using your proprietary support discussions.</li>
                </ul>
              </div>
            </FineSection>

            <FineSection id="ai-processing" number={3} title="Third-Party AI Providers & Processing" note="To answer, we send only the message and matching help-doc snippets to vetted AI providers. They don't train on it, and passwords or payment IDs are never included." query={query} forceOpen={expandAll}>
              <p>To answer questions, summarize long customer discussions, draft teammate recommendations, and index knowledge bases for fast semantic retrieval, relevant content snippets (such as the customer&apos;s immediate message or relevant knowledge base articles) are transmitted over encrypted connections (<code className="rounded bg-[#fff8ec] px-1.5 py-0.5 font-mono text-[13px] text-[#11120f]">TLS 1.3</code>) to vetted third-party large language model (LLM) and vector embedding providers.</p>
              <p>Elpino employs a high-performance <b className="text-[#11120f]">multi-model architecture</b>. Depending on task complexity, language, latency requirements, and workspace configuration, prompts and context snippets may be processed by the following enterprise AI providers under strict commercial API terms:</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {AI_PROVIDERS.map((provider) => (
                  <div key={provider.name} className={`${box} flex flex-col overflow-hidden bg-white`}>
                    <div className="border-b-2 border-[#11120f] px-4 py-3 text-white" style={{ background: provider.color }}>
                      <div className="flex items-start justify-between gap-2">
                        <div><span className="text-lg font-bold">{provider.name}</span><p className="text-xs opacity-80">{provider.tagline}</p></div>
                        <span className="shrink-0 rounded-full border-2 border-[#11120f] bg-white px-2 py-0.5 text-[10.5px] font-bold text-[#11120f]">{provider.badge}</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2 p-4 text-[13px] leading-5 text-black/65">
                      <p><b className="text-[#11120f]">Primary role: </b>{provider.role}</p>
                      <p><b className="text-[#11120f]">Data scoped: </b>{provider.dataShared}</p>
                      <p><b className="text-[#11120f]">Training policy: </b><span className="font-semibold text-[#1a7a5a]">{provider.trainingPolicy}</span></p>
                    </div>
                    <p className="border-t-2 border-dashed border-black/15 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.06em] text-black/45">Region · {provider.location}</p>
                  </div>
                ))}
              </div>
              <div className={`${box} bg-[#eef4ff] p-5`}>
                <h4 className="font-bold text-[#11120f]">AI data protection &amp; prompt boundary rules</h4>
                <ul className="mt-3 space-y-3 text-[14px] leading-6">
                  <Bullet><b className="text-[#11120f]">Zero AI Training:</b> Data submitted via enterprise API integrations is not used by OpenAI, Anthropic, xAI, DeepSeek, GLM, Nomic, or Elpino to train, retrain, or improve generalized public AI models.</Bullet>
                  <Bullet><b className="text-[#11120f]">Task-Specific Data Scoping:</b> No AI provider receives your entire database or full conversation history. Prompts only include the specific inquiry and matching knowledge base snippets required to answer.</Bullet>
                  <Bullet><b className="text-[#11120f]">PII &amp; Payment Protection:</b> Customer sensitive payment identifiers and passwords are never packaged into prompt payloads sent to AI models.</Bullet>
                  <Bullet><b className="text-[#11120f]">Regional Routing &amp; Custom LLM Endpoints:</b> If your enterprise has specific regulatory mandates requiring dedicated sovereign LLM hosting or custom private endpoints, contact {mailLink}.</Bullet>
                </ul>
              </div>
            </FineSection>

            <FineSection id="google-user-data" number={4} title="Google Sign-In & API Data" note="Signing in with Google gives us your name, email and photo, only to log you in. Never ads, never sold, and you can revoke access any time." query={query} forceOpen={expandAll}>
              <p>If you choose to sign in to Elpino with your Google account, Elpino&apos;s use and transfer of information received from Google APIs adheres to the{" "}
                <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#11120f] underline decoration-[#3784ff] decoration-2 underline-offset-4">Google API Services User Data Policy</a>, including the <b className="text-[#11120f]">Limited Use</b> requirements:</p>
              <ul className="space-y-3">
                <Bullet><b className="text-[#11120f]">Google Identity Data:</b> We access only basic Google profile information (name, email address, profile picture) to authenticate your session and label your workspace account.</Bullet>
                <Bullet><b className="text-[#11120f]">No Advertising or Brokering:</b> Google user data is strictly used for authentication and service provision. It is never used for serving ads, never sold to data brokers, and never transferred to third parties except as required for security or legal compliance.</Bullet>
                <Bullet><b className="text-[#11120f]">Instant Revocation:</b> You can revoke Elpino&apos;s Google OAuth access at any time through the Elpino Settings dashboard or via your{" "}
                  <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#11120f] underline decoration-[#3784ff] decoration-2 underline-offset-4">Google Account Permissions Manager</a>.</Bullet>
              </ul>
            </FineSection>

            <FineSection id="storage-security" number={5} title="Storage, Encryption & Security Architecture" note="Tokens are encrypted, traffic is encrypted, our staff don't read your chats unless you ask, and we tell admins quickly if something goes wrong." query={query} forceOpen={expandAll}>
              <p>We treat your customer communications and credentials with defense-in-depth security measures:</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["AES-256-GCM Encryption at Rest", "Integration access tokens, OAuth refresh credentials, and workspace secrets are encrypted using AES-256-GCM."],
                  ["TLS 1.3 Transport Security", "All web traffic, API calls, and webhook dispatches move over encrypted modern TLS connections."],
                  ["Zero Employee Snooping", "Elpino personnel do not inspect your customer conversation text unless explicitly authorized by you for support diagnostics."],
                  ["Rapid Incident Notification", "In the event of a verified security incident impacting your workspace data, we notify affected admins without undue delay."],
                ].map(([name, text]) => (
                  <div key={name} className={`${box} bg-[#fffdf5] p-4`}><p className="font-semibold text-[#11120f]">{name}</p><p className="mt-1 text-[13.5px] leading-6 text-black/60">{text}</p></div>
                ))}
              </div>
            </FineSection>

            <FineSection id="retention-deletion" number={6} title="Retention, Export & Permanent Deletion" note="Disconnect an app and its tokens vanish immediately. Delete your workspace and it's gone within 30 days. Need your data first? Email us." query={query} forceOpen={expandAll}>
              <p>You have complete lifecycle control over your data. We retain active workspace data for as long as your account remains active.</p>
              <div className={`${box} divide-y-2 divide-dashed divide-black/15 bg-[#fffdf5]`}>
                <div className="p-4"><h4 className="font-bold text-[#11120f]">Disconnecting integrations</h4><p className="mt-1 text-[13.5px] leading-6">When you disconnect a connector (e.g., Slack, Google, Stripe), stored OAuth access tokens and credentials are wiped immediately from our servers.</p></div>
                <div className="p-4"><h4 className="font-bold text-[#11120f]">1-click workspace deletion</h4><p className="mt-1 text-[13.5px] leading-6">You can delete your entire workspace from Dashboard Settings. This cancels subscriptions, disconnects live widgets, purges knowledge base vectors, and deletes active message records within 30 days.</p></div>
                <div className="p-4"><h4 className="font-bold text-[#11120f]">Data portability &amp; export</h4><p className="mt-1 text-[13.5px] leading-6">You can request a full JSON / CSV data archive of your customer conversation transcripts and knowledge base content at any time by emailing {mailLink}.</p></div>
              </div>
            </FineSection>

            <FineSection id="sharing" number={7} title="When We Share Data & Subprocessors" note="We share only with hosting, AI and payment providers we need to run Elpino, or when the law requires it." query={query} forceOpen={expandAll}>
              <p>We only share data with third parties in the following limited circumstances:</p>
              <ul className="space-y-3">
                <Bullet><b className="text-[#11120f]">Infrastructure &amp; Hosting Providers:</b> Secure cloud infrastructure (AWS/Vercel/Google Cloud) and database storage bound by strict Data Processing Agreements.</Bullet>
                <Bullet><b className="text-[#11120f]">Enterprise AI Providers:</b> Scoped prompt execution via OpenAI, Anthropic Claude, xAI, DeepSeek, GLM, and Nomic vector embeddings as detailed in Section 3.</Bullet>
                <Bullet><b className="text-[#11120f]">Payment Processors:</b> Razorpay for subscription lifecycle and PCI-compliant invoicing.</Bullet>
                <Bullet><b className="text-[#11120f]">Legal Compliance:</b> When strictly required to comply with a valid court order, subpoena, or applicable regulatory law.</Bullet>
              </ul>
            </FineSection>

            <FineSection id="cookies-analytics" number={8} title="Cookies & Telemetry" note="One login cookie. Analytics only if you say yes, and nothing loads if you say no." query={query} forceOpen={expandAll}>
              <p>Elpino uses a minimal approach to cookies:</p>
              <div className="space-y-3">
                <div className={`${box} bg-[#fffdf5] p-4 text-[14px] leading-6`}><b className="text-[#11120f]">Essential Session Cookies:</b> We set an essential cookie strictly to maintain your authenticated login state and keep you logged into your dashboard.</div>
                <div className={`${box} bg-[#fffdf5] p-4 text-[14px] leading-6`}><b className="text-[#11120f]">Optional Analytics:</b> If you explicitly click &ldquo;Accept All&rdquo; on our cookie consent banner, aggregated analytics (Google Analytics &amp; Microsoft Clarity) help us understand page performance and UI friction. Neither loads if you choose &ldquo;Reject All&rdquo;.</div>
              </div>
            </FineSection>

            <FineSection id="your-rights" number={9} title="Your Rights & Global Privacy Compliance" note="You can see, fix, delete or limit how we use your data. Email us and we'll answer within 30 days." query={query} forceOpen={expandAll}>
              <p>Regardless of location, we afford all customers robust privacy controls compliant with GDPR, CCPA/CPRA, and global standards:</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Right to Access", "Request a complete copy of personal records held by Elpino."],
                  ["Right to Rectification", "Correct inaccurate or outdated account profiles directly."],
                  ["Right to Erasure (“Forget Me”)", "Permanently wipe customer conversation history and records."],
                  ["Right to Restrict Processing", "Opt out of AI assistance or automated suggestion workflows anytime."],
                ].map(([name, text]) => (
                  <div key={name} className={`${box} bg-[#fffdf5] p-4 text-[14px] leading-6`}><b className="text-[#11120f]">{name}:</b> {text}</div>
                ))}
              </div>
              <p>To exercise any of these rights, email us at {mailLink}. We acknowledge and act on verified privacy requests within <b className="text-[#11120f]">30 calendar days</b>.</p>
            </FineSection>

            <FineSection id="changes-contact" number={10} title="Changes to This Policy & Contact Information" note="If this changes in a big way, we'll email workspace owners at least 14 days before it takes effect." query={query} forceOpen={expandAll}>
              <p>As we introduce new capabilities, connectors, and model integrations, we may update this Privacy Policy. For material modifications, we will notify registered workspace owners via email or an in-app banner at least 14 days prior to the changes taking effect.</p>
              <p>Questions about any of this? Email our Data Protection Office at {mailLink}.</p>
            </FineSection>
          </div>

          {query.trim() && (
            <p className="mt-6 text-sm text-black/50">Showing sections that mention &ldquo;{query.trim()}&rdquo;. <button type="button" onClick={() => setQuery("")} className="font-semibold text-[#11120f] underline decoration-[#3784ff] decoration-2 underline-offset-4">Show all sections</button></p>
          )}

          {/* Contact */}
          <div className="relative isolate mt-14 overflow-hidden rounded-[28px] border-2 border-[#11120f] bg-[#3784ff] p-7 text-white sm:p-10">
            <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-25" style={{ backgroundImage: "radial-gradient(#fff 1.4px, transparent 1.4px)", backgroundSize: "22px 22px" }} />
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-white/80">Data Protection Office</p>
            <h3 className="mt-2 max-w-xl text-3xl font-medium tracking-[-0.03em] sm:text-4xl">Have a question or need a signed DPA?</h3>
            <p className="mt-2 text-white/80">Our security and compliance team answers every inquiry promptly.</p>
            <a href={`mailto:${CONTACT}`} className="group mt-6 inline-flex h-12 items-center gap-2 rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-7 text-[15px] font-semibold text-[#11120f] transition hover:-translate-y-0.5">
              <Mail size={16} /> {CONTACT} <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
