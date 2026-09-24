"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpRight, BookOpen, Clock, MessageCircleQuestion, Search, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useStoredLanguage } from "@/app/hooks/useStoredLanguage";
import { Rv } from "@/app/components/RevealOnScroll";
import { ContactForm, Envelope, type Desk } from "./ContactForm";

// Contact, as a mailroom: pick the desk your note should reach, write it on a
// postcard, mail it, and watch it go. Same routes, copy and endpoint as before.

const INK = "#11120f";

export function ContactClient() {
  const language = useStoredLanguage();
  const { t } = useTranslation(language as any);
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [desk, setDesk] = useState<Desk>("sales");

  const channels: { key: Desk; label: string; value: string; href: string; note: string; color: string; ink: boolean; action: string }[] = [
    { key: "other", label: t("contact.channels.generalLabel", "General"), value: "hello@elpino.chat", href: "mailto:hello@elpino.chat", note: t("contact.channels.generalNote", "Usually within one business day"), color: "#fc7b33", ink: false, action: "Address a postcard" },
    { key: "sales", label: t("contact.channels.salesLabel", "Sales"), value: "sales@elpino.chat", href: "mailto:sales@elpino.chat", note: t("contact.channels.salesNote", "Plans, demos, and enterprise"), color: "#3784ff", ink: false, action: "Address a postcard" },
    { key: "technical", label: t("contact.channels.supportLabel", "Support"), value: t("contact.channels.supportValue", "In-app chat"), href: "/login", note: t("contact.channels.supportNote", "Fastest for existing customers"), color: "#ffd84d", ink: true, action: "Address a postcard" },
    { key: "partnerships", label: t("contact.form.inquiryPartnerships", "Partnerships"), value: "hello@elpino.chat", href: "mailto:hello@elpino.chat", note: t("contact.cards.partnershipBody", "Tell us how you would like to build or grow together."), color: "#7060bd", ink: false, action: "Address a postcard" },
  ];
  const cards = [
    [t("contact.cards.salesTitle", "Sales conversation"), t("contact.cards.salesBody", "See Elpino in your workflow and find the right plan.")],
    [t("contact.cards.technicalTitle", "Technical question"), t("contact.cards.technicalBody", "Get clear answers about setup, channels, and security.")],
    [t("contact.cards.partnershipTitle", "Partnership idea"), t("contact.cards.partnershipBody", "Tell us how you would like to build or grow together.")],
  ];
  const journey = [
    { title: "Sent", body: "Your postcard leaves your hands. Nothing else to do." },
    { title: "We read every word", body: "Your note lands with a human on the team — no ticket maze, no bots." },
    { title: "A reply within one business day", body: "Real answers from someone who works on the product." },
    { title: "A call, if it's useful", body: "For sales and enterprise, we'll walk through Elpino on your actual workflow." },
  ];
  const library = [
    { icon: MessageCircleQuestion, title: "Quick answers", body: "Setup, billing, escalation, and security — answered in the FAQ.", href: "/faq", cta: "Browse the FAQ", color: "#3784ff" },
    { icon: BookOpen, title: "Documentation", body: "Install guides, connector setup, and workspace configuration.", href: "/docs", cta: "Open the docs", color: "#ffd84d" },
    { icon: ShieldCheck, title: "Security & privacy", body: "How your data is encrypted, stored, and never used for training.", href: "/security-policy", cta: "Read the policies", color: "#7060bd" },
  ];
  const searchItems = [
    ...channels.map((channel) => ({ title: channel.label, detail: channel.note, href: channel.href })),
    ...cards.map(([title, detail]) => ({ title, detail, href: "#send-message" })),
    { title: "Plans and billing", detail: "Questions about subscriptions, invoices, or pricing", href: "mailto:sales@elpino.chat" },
    { title: "Account and security", detail: "Help with access, privacy, or account settings", href: "#send-message" },
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
      {/* Hero, with envelopes drifting about */}
      <section className="relative isolate overflow-hidden pb-24 pt-[124px]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[url('/piliar-1-grandient.png')] bg-cover bg-top bg-no-repeat [mask-image:linear-gradient(to_bottom,black_75%,transparent)]" />
        <Envelope className="pointer-events-none absolute left-[6%] top-[190px] hidden w-20 -rotate-12 animate-[elpino-float_6s_ease-in-out_infinite] lg:block" />
        <Envelope className="pointer-events-none absolute right-[7%] top-[150px] hidden w-24 rotate-6 animate-[elpino-float_7s_ease-in-out_1s_infinite] lg:block" />
        <Envelope className="pointer-events-none absolute right-[16%] top-[380px] hidden w-14 -rotate-3 animate-[elpino-float_5s_ease-in-out_0.5s_infinite] xl:block" />

        <div className="mx-auto max-w-5xl px-5 text-center sm:px-8">
          <p className="mx-auto w-fit rounded-full border-2 border-[#11120f] bg-white px-4 py-1 font-mono text-[12px] font-medium uppercase tracking-[0.12em]">Contact · the mailroom</p>
          <h1 className="mt-5 animate-[elpino-focus_0.9s_ease-out_both] text-5xl font-normal leading-[1.02] tracking-[-0.045em] sm:text-7xl md:text-8xl">
            <span className="text-[#3784ff]">Hello.</span> How can<br className="hidden sm:block" /> we <span className="hl-load">help?</span>
          </h1>

          <div className="relative mx-auto mt-10 max-w-3xl animate-[elpino-focus_0.9s_ease-out_0.2s_both] text-left">
            <form onSubmit={handleSearch} role="search" className="relative z-20 flex h-16 items-center rounded-full border-2 border-[#11120f] bg-white p-1.5 pl-6 sm:h-20">
              <Search size={20} className="shrink-0 text-black/45" aria-hidden="true" />
              <label htmlFor="contact-search" className="sr-only">Search help topics</label>
              <input
                id="contact-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => window.setTimeout(() => setSearchFocused(false), 150)}
                placeholder="Search sales, support, billing, and more"
                className="min-w-0 flex-1 bg-transparent px-4 text-base outline-none placeholder:text-black/40 sm:text-lg"
              />
              <button type="submit" aria-label="Search" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-[#11120f] bg-[#ffd84d] text-lg font-bold transition hover:-translate-y-0.5 sm:h-[68px] sm:w-[68px]">→</button>
            </form>
            {searchFocused && normalizedQuery && (
              <div className="absolute left-3 right-3 top-[calc(100%+0.6rem)] z-30 animate-[elpino-focus_0.25s_ease-out_both] overflow-hidden rounded-2xl border-2 border-[#11120f] bg-white p-1.5">
                {searchResults.length ? searchResults.map((item) => (
                  <a key={`${item.title}-${item.href}`} href={item.href} className="group flex items-center justify-between gap-5 rounded-xl px-4 py-3 transition hover:bg-[#ffd84d]">
                    <span><span className="block text-sm font-semibold">{item.title}</span><span className="mt-0.5 block text-xs text-black/55">{item.detail}</span></span>
                    <span aria-hidden="true" className="shrink-0 transition-transform group-hover:translate-x-1">→</span>
                  </a>
                )) : <div className="px-4 py-5 text-sm text-black/60">No exact match. Press Enter to send us your question.</div>}
              </div>
            )}
          </div>

          <p className="mx-auto mt-7 max-w-xl animate-[elpino-focus_0.9s_ease-out_0.3s_both] text-base leading-7 text-black/60">{t("contact.subheading", "Planning a new support setup, evaluating Elpino, or already need a hand? Tell us where you are and we'll meet you there.")}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            <a href="/faq" className="rounded-full border-2 border-[#11120f] bg-white px-4 py-1.5 text-[13.5px] font-semibold transition hover:-translate-y-0.5">Getting started</a>
            <a href="/docs" className="rounded-full border-2 border-[#11120f] bg-white px-4 py-1.5 text-[13.5px] font-semibold transition hover:-translate-y-0.5">Featured guides</a>
            <a href="/pricing" className="rounded-full border-2 border-[#11120f] bg-white px-4 py-1.5 text-[13.5px] font-semibold transition hover:-translate-y-0.5">Plans &amp; billing</a>
            <a href="#send-message" className="rounded-full border-2 border-[#11120f] bg-[#3784ff] px-4 py-1.5 text-[13.5px] font-semibold text-white transition hover:-translate-y-0.5">Or send us a message ↓</a>
          </div>
        </div>
      </section>

      {/* Desks: pick where your postcard goes */}
      <section className="bg-[#fff8ec] px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-[1300px]">
          <Rv className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-[#7060bd]">Choose a route</p>
              <h2 className="mt-3 text-4xl font-normal tracking-[-0.045em] sm:text-6xl">Reach the <span className="hl">right desk.</span></h2>
            </div>
            <p className="max-w-md text-base leading-7 text-black/60">Pick the channel that best matches what you need. Every route leads to a real member of our team.</p>
          </Rv>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {channels.map((channel, index) => {
              const on = channel.key === desk;
              return (
                <Rv key={channel.key} variant="deal" delay={index * 110} className="group/desk relative pt-10">
                  {/* the letter that dips into the slot on hover */}
                  <Envelope className="absolute left-1/2 top-0 z-0 w-24 -translate-x-1/2 -rotate-3 transition-transform duration-500 ease-[cubic-bezier(0.3,1.4,0.5,1)] group-hover/desk:translate-y-3" />
                  <div className="group relative z-10">
                    <button type="button" onClick={() => addressTo(channel.key)} aria-pressed={on} className={`flex min-h-[290px] w-full flex-col rounded-[24px] border-2 border-[#11120f] p-6 text-left transition duration-300 hover:-translate-y-1.5 hover:-rotate-[0.6deg] ${on ? "outline outline-4 outline-offset-4 outline-[#ffd84d]" : ""}`} style={{ background: channel.color, color: channel.ink ? INK : "#fff" }}>
                      {/* the mail slot */}
                      <span aria-hidden="true" className="mb-5 block h-3 w-full rounded-full border-2 border-[#11120f] bg-[#11120f]/85" />
                      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] opacity-75">Desk {String(index + 1).padStart(2, "0")}</span>
                      <span className="mt-1 text-4xl font-medium tracking-[-0.035em]">{channel.label}</span>
                      <span className="mt-2 text-[15px] font-semibold">{channel.value}</span>
                      <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border-2 border-[#11120f] bg-white/90 px-3 py-1 text-xs text-[#11120f]"><Clock size={12} />{channel.note}</span>
                      <span className="mt-auto flex items-center justify-between pt-6 text-[14px] font-semibold">
                        {on ? "Postcard addressed ✓" : channel.action}
                        <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#11120f] bg-white text-[#11120f] transition group-hover:rotate-90">↓</span>
                      </span>
                    </button>
                  </div>
                </Rv>
              );
            })}
          </div>
          <p className="mt-8 text-sm text-black/55">Prefer your own mail app? Every desk with an address also works by <a href="mailto:hello@elpino.chat" className="font-semibold text-[#11120f] underline decoration-[#3784ff] decoration-2 underline-offset-4">email</a>.</p>
        </div>
      </section>

      {/* The postcard */}
      <section id="send-message" className="scroll-mt-24 bg-white px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-[1100px]">
          <Rv className="max-w-2xl">
            <p className="font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-[#3784ff]">Send us a note</p>
            <h2 className="mt-3 text-4xl font-normal tracking-[-0.045em] sm:text-6xl">A real human <span className="hl">will read this.</span></h2>
            <p className="mt-4 text-base leading-7 text-black/60">{t("contact.panelBody", "No ticket maze. No generic auto-response pretending to solve your question.")}</p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border-2 border-[#11120f] px-4 py-1.5 text-sm" style={{ background: chosen.color, color: chosen.ink ? INK : "#fff" }}>
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] opacity-80">Addressed to</span>
              <b>{chosen.label}</b>
            </p>
          </Rv>
          <Rv variant="deal" className="mt-10">
            <ContactForm desk={desk} onDeskChange={setDesk} />
          </Rv>
        </div>
      </section>

      {/* Tracking: what happens after you send */}
      <section className="overflow-hidden bg-[#11120f] px-5 py-20 text-[#fff8ec] sm:px-8 lg:py-28">
        <div className="mx-auto max-w-[1300px]">
          <Rv>
            <p className="font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-[#ffd84d]">Track your postcard</p>
            <h2 className="mt-3 max-w-2xl text-4xl font-normal tracking-[-0.045em] sm:text-6xl">What happens <span className="text-[#fc7b33]">after you hit send.</span></h2>
          </Rv>

          <div className="relative mt-16">
            {/* the track, with a letter riding along it */}
            <div aria-hidden="true" className="absolute left-0 right-0 top-[19px] hidden h-[3px] bg-[repeating-linear-gradient(90deg,rgba(255,248,236,0.5)_0_8px,transparent_8px_16px)] lg:block">
              <span className="absolute -top-[13px] left-0 h-8 w-11 animate-[elpino-track_9s_ease-in-out_infinite]"><Envelope className="h-full w-full" /></span>
            </div>
            <ol className="grid gap-8 lg:grid-cols-4">
              {journey.map((step, index) => (
                <Rv key={step.title} variant="up" delay={index * 130} className="relative">
                  <li className="list-none">
                    <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#fff8ec] bg-[#11120f] font-mono text-[14px] font-bold" style={index === 0 ? { background: "#ffd84d", color: INK, borderColor: "#ffd84d" } : undefined}>{index === 0 ? "✓" : index}</span>
                    <h3 className="mt-5 text-2xl font-medium tracking-[-0.02em]">{step.title}</h3>
                    <p className="mt-2 text-[15px] leading-6 text-[#fff8ec]/65">{step.body}</p>
                  </li>
                </Rv>
              ))}
            </ol>
          </div>

          <div className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-3 border-t-2 border-dashed border-[#fff8ec]/25 pt-8 text-sm">
            <span className="inline-flex items-center gap-2.5"><span className="relative flex h-3 w-3"><span className="absolute inset-0 animate-ping rounded-full bg-[#1aa37a]/70" /><span className="relative h-3 w-3 rounded-full bg-[#1aa37a]" /></span>Our team is online</span>
            <span className="inline-flex items-center gap-2 text-[#fff8ec]/65"><Clock size={15} className="text-[#ffd84d]" />Mon–Fri, 9:00–18:00 CET</span>
          </div>
        </div>
      </section>

      {/* The library: index cards */}
      <section className="bg-[#fff8ec] px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-[1300px]">
          <Rv className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h2 className="max-w-2xl text-4xl font-normal tracking-[-0.045em] sm:text-6xl">Prefer to find it <span className="hl">yourself?</span></h2>
            <p className="max-w-md text-base leading-7 text-black/60">Most questions are already answered here — and everything below links straight to the source.</p>
          </Rv>
          <div className="mt-14 grid gap-7 md:grid-cols-3">
            {library.map((item, index) => (
              <Rv key={item.title} variant="drop" delay={index * 140}>
                <a href={item.href} className="group relative mt-6 block rounded-[6px] rounded-tl-none border-2 border-[#11120f] bg-white p-7 pt-10 transition duration-300 hover:-translate-y-2 hover:rotate-[0.8deg] sm:p-8 sm:pt-11">
                  {/* the tab sticking up like a card in a catalogue drawer */}
                  <span className="absolute -top-[26px] left-[-2px] flex h-[26px] items-center gap-1.5 rounded-t-md border-2 border-b-0 border-[#11120f] px-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.1em]" style={{ background: item.color, color: item.color === "#ffd84d" ? INK : "#fff" }}>
                    <item.icon size={12} /> Card {index + 1}
                  </span>
                  <div className="pointer-events-none absolute inset-x-7 top-[74px] bottom-7 opacity-60 [background-image:repeating-linear-gradient(transparent_0_31px,rgba(55,132,255,0.18)_31px_32px)]" aria-hidden="true" />
                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-3xl font-normal leading-[1.05] tracking-[-0.035em]">{item.title}</h3>
                      <ArrowUpRight size={22} className="shrink-0 text-black/40 transition duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#11120f]" />
                    </div>
                    <p className="mt-3 min-h-[96px] text-[15px] leading-8 text-black/65">{item.body}</p>
                    <p className="mt-4 inline-flex rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-4 py-1.5 text-sm font-semibold transition group-hover:bg-[#3784ff] group-hover:text-white">{item.cta}</p>
                  </div>
                </a>
              </Rv>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
