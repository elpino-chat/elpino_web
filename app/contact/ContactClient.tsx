"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, ArrowUpRight, BookOpen, Check, Clock, MessageCircleQuestion, Search, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useStoredLanguage } from "@/app/hooks/useStoredLanguage";
import { Rv } from "@/app/components/RevealOnScroll";
import { ContactForm, Envelope, type Desk } from "./ContactForm";

// Contact. The hero and the desks are in the site's quiet style; the postcard form, the tracking section and the
// library below them keep their original look. Same routes, copy and endpoint as before.


type T = (key: string, defaultValue?: string) => string;

/**
 * A translated array at `key` — t()'s traversal really does hand back the
 * raw JSON value (array or not) even though its declared return type is
 * `string`. Falls back to the English array wholesale when the locale
 * hasn't got this key yet.
 */
function tList<Item>(t: T, key: string, fallback: Item[]): Item[] {
  const value: unknown = t(key, undefined as unknown as string);
  return Array.isArray(value) ? (value as Item[]) : fallback;
}

// The steps after you send a message, with a letter that rides the dashed track: it starts at "Sent", every circle
// turns into a check as the letter reaches it, and at the far end it fades out, the checks reset and it begins again.
// Where the letter is comes from one clock; whether a circle is checked is read from the letter's actual position, so
// the two always agree. On small screens or with reduced motion nothing moves and only "Sent" is checked.
function TrackJourney({ steps }: { steps: { title: string; body: string }[] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const letter = useRef<HTMLSpanElement>(null);
  const circles = useRef<(HTMLSpanElement | null)[]>([]);
  const [checked, setChecked] = useState(1);

  useEffect(() => {
    const box = wrap.current;
    const el = letter.current;
    if (!box || !el) return;
    if (!window.matchMedia("(min-width: 1024px)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const RIDE = 7000;
    const FADE = 500;
    const PAUSE = 800;
    let frame = 0;
    let began = 0;
    const tick = (now: number) => {
      if (!began) began = now;
      const k = (now - began) % (RIDE + FADE + PAUSE);
      const first = circles.current[0];
      if (first) {
        const boxLeft = box.getBoundingClientRect().left;
        const box0 = first.getBoundingClientRect();
        const start = box0.left - boxLeft + box0.width / 2;
        const end = box.getBoundingClientRect().width;
        let x = start;
        let opacity = 0;
        if (k < RIDE) { const e = k / RIDE; x = start + (end - start) * (e * e * (3 - 2 * e)); opacity = 1; }
        else if (k < RIDE + FADE) { x = end; opacity = 1 - (k - RIDE) / FADE; }
        el.style.transform = `translateX(${x - 22}px)`;
        el.style.opacity = String(opacity);
        let count = 0;
        if (k < RIDE + FADE) {
          circles.current.forEach((circle, index) => {
            if (!circle) return;
            const r = circle.getBoundingClientRect();
            if (x >= r.left - boxLeft + r.width / 2 - 1) count = index + 1;
          });
        }
        setChecked((previous) => (previous === count ? previous : count));
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div ref={wrap} className="relative mt-14">
      <div aria-hidden="true" className="absolute left-0 right-0 top-[19px] hidden h-[3px] bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.45)_0_8px,transparent_8px_16px)] lg:block">
        <span ref={letter} className="absolute -top-[13px] left-0 h-8 w-11"><Envelope className="h-full w-full" /></span>
      </div>
      <ol className="grid gap-8 lg:grid-cols-4">
        {steps.map((step, index) => {
          const on = index < checked;
          return (
            <Rv key={step.title} variant="up" delay={index * 110} className="relative">
              <li className="list-none">
                <span ref={(node) => { circles.current[index] = node; }} className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-[14px] font-semibold transition-colors duration-300 ${on ? "bg-[#1aa37a] text-white" : "border border-white/40 bg-[#11120f] text-white"}`}>
                  {on ? <Check size={18} strokeWidth={3} aria-hidden="true" /> : index === 0 ? <span aria-hidden="true" className="size-2 rounded-full bg-white/60" /> : index}
                </span>
                <h3 className="mt-5 text-2xl font-medium tracking-[-0.02em]">{step.title}</h3>
                <p className="mt-2 text-[15px] leading-6 text-white/60">{step.body}</p>
              </li>
            </Rv>
          );
        })}
      </ol>
    </div>
  );
}

export function ContactClient() {
  const language = useStoredLanguage();
  const { t } = useTranslation(language as any);
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [desk, setDesk] = useState<Desk>("sales");

  const addressAction = t("contact.desks.actionAddress", "Address a postcard");
  const channels: { key: Desk; label: string; value: string; href: string; note: string; color: string; ink: boolean; action: string }[] = [
    { key: "other", label: t("contact.channels.generalLabel", "General"), value: "hello@elpino.chat", href: "mailto:hello@elpino.chat", note: t("contact.channels.generalNote", "Usually within one business day"), color: "#fc7b33", ink: false, action: addressAction },
    { key: "sales", label: t("contact.channels.salesLabel", "Sales"), value: "sales@elpino.chat", href: "mailto:sales@elpino.chat", note: t("contact.channels.salesNote", "Plans, demos, and enterprise"), color: "#3784ff", ink: false, action: addressAction },
    { key: "technical", label: t("contact.channels.supportLabel", "Support"), value: t("contact.channels.supportValue", "In-app chat"), href: "/login", note: t("contact.channels.supportNote", "Fastest for existing customers"), color: "#ffd84d", ink: true, action: addressAction },
    { key: "partnerships", label: t("contact.form.inquiryPartnerships", "Partnerships"), value: "hello@elpino.chat", href: "mailto:hello@elpino.chat", note: t("contact.cards.partnershipBody", "Tell us how you would like to build or grow together."), color: "#7060bd", ink: false, action: addressAction },
  ];
  const cards = [
    [t("contact.cards.salesTitle", "Sales conversation"), t("contact.cards.salesBody", "See Elpino in your workflow and find the right plan.")],
    [t("contact.cards.technicalTitle", "Technical question"), t("contact.cards.technicalBody", "Get clear answers about setup, channels, and security.")],
    [t("contact.cards.partnershipTitle", "Partnership idea"), t("contact.cards.partnershipBody", "Tell us how you would like to build or grow together.")],
  ];
  const journey = tList<{ title: string; body: string }>(t, "contact.tracking.steps", [
    { title: "Sent", body: "Your postcard leaves your hands. Nothing else to do." },
    { title: "We read every word", body: "Your note lands with a human on the team — no ticket maze, no bots." },
    { title: "A reply within one business day", body: "Real answers from someone who works on the product." },
    { title: "A call, if it's useful", body: "For sales and enterprise, we'll walk through Elpino on your actual workflow." },
  ]);
  const libraryText = tList<{ title: string; body: string; cta: string }>(t, "contact.library.items", [
    { title: "Quick answers", body: "Setup, billing, escalation, and security — answered in the FAQ.", cta: "Browse the FAQ" },
    { title: "Documentation", body: "Install guides, connector setup, and workspace configuration.", cta: "Open the docs" },
    { title: "Security & privacy", body: "How your data is encrypted, stored, and never used for training.", cta: "Read the policies" },
  ]);
  const library = [
    { icon: MessageCircleQuestion, href: "/faq", color: "#3784ff", ...libraryText[0] },
    { icon: BookOpen, href: "/docs", color: "#ffd84d", ...libraryText[1] },
    { icon: ShieldCheck, href: "/security-policy", color: "#7060bd", ...libraryText[2] },
  ];
  const searchItems = [
    ...channels.map((channel) => ({ title: channel.label, detail: channel.note, href: channel.href })),
    ...cards.map(([title, detail]) => ({ title, detail, href: "#send-message" })),
    { title: t("contact.search.plansTitle", "Plans and billing"), detail: t("contact.search.plansDetail", "Questions about subscriptions, invoices, or pricing"), href: "mailto:sales@elpino.chat" },
    { title: t("contact.search.accountTitle", "Account and security"), detail: t("contact.search.accountDetail", "Help with access, privacy, or account settings"), href: "#send-message" },
  ];
  const normalizedQuery = query.trim().toLowerCase();
  const searchResults = searchItems.filter((item) => `${item.title} ${item.detail}`.toLowerCase().includes(normalizedQuery)).slice(0, 5);
  const chosen = channels.find((channel) => channel.key === desk) ?? channels[1];

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const firstResult = searchResults[0];
    if (normalizedQuery && firstResult) {
      window.location.href = firstResult.href;
      return;
    }
    document.getElementById("send-message")?.scrollIntoView({ behavior: "smooth" });
  }

  function addressTo(key: Desk) {
    setDesk(key);
    document.getElementById("send-message")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <main className="bg-white text-[#11120f]">
      {/* Hero */}
      <section className="bg-white px-5 pb-16 pt-16 sm:px-8 lg:px-20 lg:pt-24">
        <div className="mx-auto max-w-[1500px]">
          <h1 className="max-w-4xl animate-[elpino-focus_0.9s_ease-out_both] text-5xl font-normal leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
            {t("contact.hero.greeting", "Hello.")} {t("contact.hero.titlePrefix", "How can")} {t("contact.hero.titleHl", "we help?")}
          </h1>

          <div className="relative mt-10 max-w-3xl animate-[elpino-focus_0.9s_ease-out_0.2s_both]">
            <form onSubmit={handleSearch} role="search" className="relative z-20 flex h-16 items-center rounded-[10px] border border-black/40 bg-white p-1.5 pl-5 transition-colors focus-within:border-[#0078f4]">
              <Search size={20} className="shrink-0 text-black/45" aria-hidden="true" />
              <label htmlFor="contact-search" className="sr-only">{t("contact.hero.searchLabel", "Search help topics")}</label>
              <input
                id="contact-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => window.setTimeout(() => setSearchFocused(false), 150)}
                placeholder={t("contact.hero.searchPlaceholder", "Search sales, support, billing, and more")}
                className="min-w-0 flex-1 bg-transparent px-4 text-base outline-none placeholder:text-black/40 sm:text-lg"
              />
              <button type="submit" aria-label={t("contact.hero.searchButtonLabel", "Search")} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#11120f] text-white transition hover:opacity-85"><ArrowRight size={18} /></button>
            </form>
            {searchFocused && normalizedQuery && (
              <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 animate-[elpino-focus_0.25s_ease-out_both] overflow-hidden rounded-[10px] border border-black/40 bg-white p-1.5 shadow-[0_18px_40px_rgba(17,18,15,0.12)]">
                {searchResults.length ? searchResults.map((item) => (
                  <a key={`${item.title}-${item.href}`} href={item.href} className="group flex items-center justify-between gap-5 rounded-lg px-4 py-3 transition hover:bg-[#f4f4f2]">
                    <span><span className="block text-sm font-medium">{item.title}</span><span className="mt-0.5 block text-xs text-black/55">{item.detail}</span></span>
                    <span aria-hidden="true" className="shrink-0 transition-transform group-hover:translate-x-1">→</span>
                  </a>
                )) : <div className="px-4 py-5 text-sm text-black/60">{t("contact.hero.noMatch", "No exact match. Press Enter to send us your question.")}</div>}
              </div>
            )}
          </div>

          <p className="mt-7 max-w-xl animate-[elpino-focus_0.9s_ease-out_0.3s_both] text-base leading-7 text-black/60">{t("contact.subheading", "Planning a new support setup, evaluating Elpino, or already need a hand? Tell us where you are and we'll meet you there.")}</p>
          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <a href="/faq" className="rounded-full border border-black/25 bg-white px-4 py-1.5 text-[14px] transition hover:border-black/60">{t("contact.hero.linkGettingStarted", "Getting started")}</a>
            <a href="/docs" className="rounded-full border border-black/25 bg-white px-4 py-1.5 text-[14px] transition hover:border-black/60">{t("contact.hero.linkFeaturedGuides", "Featured guides")}</a>
            <a href="/pricing" className="rounded-full border border-black/25 bg-white px-4 py-1.5 text-[14px] transition hover:border-black/60">{t("contact.hero.linkPlansBilling", "Plans & billing")}</a>
            <a href="#send-message" className="px-2 py-1.5 text-[14px] font-medium text-[#0078f4] underline underline-offset-4">{t("contact.hero.linkSendMessage", "Or send us a message ↓")}</a>
          </div>
        </div>
      </section>

      {/* Desks: pick where your note goes */}
      <section className="bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-20">
        <div className="mx-auto max-w-[1500px] border-t border-black/20 pt-16">
          <Rv className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h2 className="text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">{t("contact.desks.titlePrefix", "Reach the ")}{t("contact.desks.titleHl", "right desk.")}</h2>
            <p className="max-w-md text-base leading-7 text-black/60">{t("contact.desks.subtitle", "Pick the channel that best matches what you need. Every route leads to a real member of our team.")}</p>
          </Rv>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {channels.map((channel, index) => {
              const on = channel.key === desk;
              return (
                <Rv key={channel.key} variant="up" delay={index * 90}>
                  <button type="button" onClick={() => addressTo(channel.key)} aria-pressed={on} className={`flex min-h-[250px] w-full flex-col rounded-[10px] bg-white p-6 text-left transition-colors hover:bg-[#fafaf9] ${on ? "border-2 border-[#0078f4]" : "border border-black/40"}`}>
                    <span className="text-[13px] font-medium text-black/50">{t("contact.desks.deskLabel", "Desk {n}").replace("{n}", String(index + 1).padStart(2, "0"))}</span>
                    <span className="mt-1 text-3xl font-medium tracking-[-0.03em]">{channel.label}</span>
                    <span className="mt-2 text-[15px] text-black/75">{channel.value}</span>
                    <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-[#f4f4f2] px-3 py-1 text-xs text-black/65"><Clock size={12} />{channel.note}</span>
                    <span className={`mt-auto flex items-center justify-between pt-6 text-[14px] font-medium ${on ? "text-[#0078f4]" : "text-[#11120f]"}`}>
                      {on ? <span className="inline-flex items-center gap-1.5"><Check size={15} strokeWidth={3} />{t("contact.desks.addressed", "Postcard addressed ✓")}</span> : channel.action}
                      <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full border border-black/25 text-[#11120f]">↓</span>
                    </span>
                  </button>
                </Rv>
              );
            })}
          </div>
          <p className="mt-8 text-sm text-black/55">
            {(() => {
              const [before, after] = t("contact.desks.emailNote", "Prefer your own mail app? Every desk with an address also works by {link}.").split("{link}");
              return <>{before}<a href="mailto:hello@elpino.chat" className="font-medium text-[#0078f4] underline underline-offset-4">{t("contact.desks.emailNoteLink", "email")}</a>{after}</>;
            })()}
          </p>
        </div>
      </section>

      {/* The postcard */}
      <section id="send-message" className="scroll-mt-24 bg-white px-5 py-20 sm:px-8 lg:px-20 lg:py-28">
        <div className="mx-auto max-w-[1500px]">
          <Rv className="flex flex-col justify-between gap-8 border-t border-black/20 pt-12 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-[14px] text-black/50">{t("contact.postcard.eyebrow", "Send us a note")}</p>
              <h2 className="mt-3 text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">{t("contact.postcard.titlePrefix", "A real human ")}{t("contact.postcard.titleHl", "will read this.")}</h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-black/60">{t("contact.panelBody", "No ticket maze. No generic auto-response pretending to solve your question.")}</p>
            </div>
            <p className="inline-flex w-fit shrink-0 items-center gap-3 rounded-[10px] border border-black/40 bg-white px-5 py-3 text-[15px]">
              <span className="text-black/50">{t("contact.postcard.addressedTo", "Addressed to")}</span>
              <span className="inline-flex items-center gap-2 font-semibold"><span aria-hidden="true" className="size-3 rounded-full border border-black/30" style={{ background: chosen.color }} />{chosen.label}</span>
            </p>
          </Rv>
          <Rv variant="deal" className="mt-10">
            <ContactForm desk={desk} onDeskChange={setDesk} />
          </Rv>
        </div>
      </section>

      {/* What happens after you send */}
      <section className="overflow-hidden bg-[#11120f] px-5 py-20 text-white sm:px-8 lg:px-20 lg:py-28">
        <div className="mx-auto max-w-[1500px]">
          <Rv>
            <p className="text-[14px] text-white/55">{t("contact.tracking.eyebrow", "Track your postcard")}</p>
            <h2 className="mt-3 max-w-2xl text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">{t("contact.tracking.titlePrefix", "What happens ")}{t("contact.tracking.titleHl", "after you hit send.")}</h2>
          </Rv>

          <TrackJourney steps={journey} />

          <div className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/20 pt-8 text-sm">
            <span className="inline-flex items-center gap-2.5"><span className="relative flex h-3 w-3"><span className="absolute inset-0 animate-ping rounded-full bg-[#1aa37a]/70" /><span className="relative h-3 w-3 rounded-full bg-[#1aa37a]" /></span>{t("contact.tracking.onlineStatus", "Our team is online")}</span>
            <span className="inline-flex items-center gap-2 text-white/60"><Clock size={15} />{t("contact.tracking.hours", "Mon–Fri, 9:00–18:00 CET")}</span>
          </div>
        </div>
      </section>

      {/* Prefer to find it yourself? */}
      <section className="bg-white px-5 py-20 sm:px-8 lg:px-20 lg:py-24">
        <div className="mx-auto max-w-[1500px]">
          <Rv className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h2 className="max-w-2xl text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">{t("contact.library.titlePrefix", "Prefer to find it ")}{t("contact.library.titleHl", "yourself?")}</h2>
            <p className="max-w-md text-base leading-7 text-black/60">{t("contact.library.subtitle", "Most questions are already answered here — and everything below links straight to the source.")}</p>
          </Rv>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {library.map((item, index) => (
              <Rv key={item.title} variant="up" delay={index * 110}>
                <a href={item.href} className="group flex h-full flex-col rounded-[10px] border border-black/40 bg-white p-7 transition-colors hover:bg-[#fafaf9] sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <span className="inline-flex items-center gap-2 text-[13px] text-black/50"><span className="grid size-10 place-items-center rounded-lg border border-black/25 text-[#11120f]"><item.icon size={18} /></span>{t("contact.library.cardLabel", "Card {n}").replace("{n}", String(index + 1))}</span>
                    <ArrowUpRight size={22} className="shrink-0 text-black/40 transition duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#11120f]" />
                  </div>
                  <h3 className="mt-8 text-3xl font-normal leading-[1.05] tracking-[-0.03em]">{item.title}</h3>
                  <p className="mt-3 flex-1 text-[15px] leading-7 text-black/65">{item.body}</p>
                  <p className="mt-5 text-[15px] font-medium text-[#0078f4] underline underline-offset-4">{item.cta}</p>
                </a>
              </Rv>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
