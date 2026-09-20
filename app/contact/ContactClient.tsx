"use client";

import { useState, type FormEvent } from "react";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useStoredLanguage } from "@/app/hooks/useStoredLanguage";
import { ContactForm } from "./ContactForm";

function Arrow() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none"><path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function SearchIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none"><circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" /><path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>;
}

export function ContactClient() {
  const language = useStoredLanguage();
  const { t } = useTranslation(language as any);
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const channels = [
    { label: t("contact.channels.generalLabel", "General"), value: "hello@elpino.chat", href: "mailto:hello@elpino.chat", note: t("contact.channels.generalNote", "Usually within one business day") },
    { label: t("contact.channels.salesLabel", "Sales"), value: "sales@elpino.chat", href: "mailto:sales@elpino.chat", note: t("contact.channels.salesNote", "Plans, demos, and enterprise") },
    { label: t("contact.channels.supportLabel", "Support"), value: t("contact.channels.supportValue", "In-app chat"), href: "/login", note: t("contact.channels.supportNote", "Fastest for existing customers") },
  ];
  const cards = [
    [t("contact.cards.salesTitle", "Sales conversation"), t("contact.cards.salesBody", "See Elpino in your workflow and find the right plan.")],
    [t("contact.cards.technicalTitle", "Technical question"), t("contact.cards.technicalBody", "Get clear answers about setup, channels, and security.")],
    [t("contact.cards.partnershipTitle", "Partnership idea"), t("contact.cards.partnershipBody", "Tell us how you would like to build or grow together.")],
  ];
  const searchItems = [
    ...channels.map((channel) => ({ title: channel.label, detail: channel.note, href: channel.href })),
    ...cards.map(([title, detail]) => ({ title, detail, href: "#send-message" })),
    { title: "Plans and billing", detail: "Questions about subscriptions, invoices, or pricing", href: "mailto:sales@elpino.chat" },
    { title: "Account and security", detail: "Help with access, privacy, or account settings", href: "#send-message" },
  ];
  const normalizedQuery = query.trim().toLowerCase();
  const searchResults = searchItems.filter((item) => `${item.title} ${item.detail}`.toLowerCase().includes(normalizedQuery)).slice(0, 5);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const firstResult = searchResults[0];
    if (normalizedQuery && firstResult) {
      window.location.href = firstResult.href;
      return;
    }
    document.getElementById("send-message")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <main className="bg-white text-[#0d0d0d]">
      <section className="relative overflow-hidden bg-black px-5 py-20 text-white sm:px-8 md:py-28 lg:px-12">
        <div aria-hidden="true" className="absolute -right-48 -top-48 h-[36rem] w-[36rem] rounded-full border border-[#d9bef4]/25" />
        <div aria-hidden="true" className="absolute -right-24 -top-24 h-96 w-96 rounded-full border border-[#d9bef4]/15" />
        <div className="relative mx-auto max-w-[108rem]">
          <div className="mb-8 flex items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55"><span className="h-2 w-2 rounded-full bg-[#d9bef4]" />Talk to Elpino</div>
          <h1 className="mx-auto max-w-6xl text-center text-[clamp(4rem,8.5vw,9rem)] font-normal leading-[0.88] tracking-[-0.065em]"><span className="text-[#d9bef4]">Hello.</span> How can<br className="hidden sm:block" /> we help?</h1>
          <div className="relative mx-auto mt-12 max-w-5xl">
            <form onSubmit={handleSearch} role="search" className="relative z-20 flex min-h-20 items-center rounded-full bg-white p-2 pl-6 text-[#0d0d0d] shadow-[0_24px_80px_-24px_rgba(0,0,0,0.65)] sm:min-h-24 sm:pl-8">
              <span className="shrink-0 text-[#686868]"><SearchIcon /></span>
              <label htmlFor="contact-search" className="sr-only">Search help topics</label>
              <input
                id="contact-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => window.setTimeout(() => setSearchFocused(false), 150)}
                placeholder="Search sales, support, billing, and more"
                className="min-w-0 flex-1 bg-transparent px-4 text-base outline-none placeholder:text-[#777] sm:px-6 sm:text-xl"
              />
              <button type="submit" aria-label="Search" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#d9bef4] text-black transition hover:scale-[1.03] hover:bg-black hover:text-white sm:h-20 sm:w-20"><Arrow /></button>
            </form>
            {searchFocused && normalizedQuery && (
              <div className="absolute left-5 right-5 top-[calc(100%+0.75rem)] z-30 overflow-hidden rounded-3xl border border-black/10 bg-white p-2 text-[#0d0d0d] shadow-[0_28px_80px_-28px_rgba(0,0,0,0.6)] sm:left-8 sm:right-8">
                {searchResults.length ? searchResults.map((item) => (
                  <a key={`${item.title}-${item.href}`} href={item.href} className="group flex items-center justify-between gap-5 rounded-2xl px-5 py-4 transition hover:bg-[#f3f1ed]">
                    <span><span className="block text-sm font-semibold">{item.title}</span><span className="mt-1 block text-xs text-[#717171]">{item.detail}</span></span>
                    <span className="shrink-0 text-[#8c64b4] transition-transform group-hover:translate-x-1"><Arrow /></span>
                  </a>
                )) : <div className="px-5 py-6 text-sm text-[#666]">No exact match. Press Enter to send us your question.</div>}
              </div>
            )}
            <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xl text-sm leading-6 text-white/60 sm:text-base">{t("contact.subheading", "Planning a new support setup, evaluating Elpino, or already need a hand? Tell us where you are and we'll meet you there.")}</p>
              <a href="#send-message" className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-white transition hover:text-[#d9bef4]">Or send us a message <span className="transition-transform group-hover:translate-x-1"><Arrow /></span></a>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-[108rem]">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div><p className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#8c64b4]">Choose a route</p><h2 className="text-5xl font-normal leading-none tracking-[-0.05em] sm:text-6xl">Reach the right person.</h2></div>
            <p className="max-w-md text-base leading-7 text-[#626262]">Pick the channel that best matches what you need. Every route leads to a real member of our team.</p>
          </div>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {channels.map((channel, index) => (
              <a key={channel.label} href={channel.href} className="group flex min-h-64 flex-col justify-between rounded-[1.75rem] border border-black/15 bg-[#f4f1f6] p-7 transition duration-300 hover:-translate-y-1 hover:border-black hover:bg-[#d9bef4] sm:p-9">
                <div className="flex items-start justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-white font-geist-mono text-xs transition-colors group-hover:bg-black group-hover:text-white">0{index + 1}</span><span className="flex h-12 w-12 items-center justify-center rounded-full border border-black transition group-hover:bg-black group-hover:text-white"><Arrow /></span></div>
                <div><h3 className="text-3xl font-normal tracking-[-0.035em]">{channel.label}</h3><p className="mt-2 text-base font-semibold">{channel.value}</p><p className="mt-2 text-sm text-black/55">{channel.note}</p></div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="send-message" className="scroll-mt-24 bg-[#f1efea] px-5 py-20 sm:px-8 md:py-28 lg:px-12">
        <div className="mx-auto grid max-w-[108rem] gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
          <div><p className="mb-5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#8c64b4]">Send us a note</p><h2 className="max-w-xl text-5xl font-normal leading-[0.98] tracking-[-0.055em] sm:text-7xl">A real human will read this.</h2><p className="mt-7 max-w-md text-base leading-7 text-[#646464]">{t("contact.panelBody", "No ticket maze. No generic auto-response pretending to solve your question.")}</p><div className="mt-12 flex items-center gap-3 text-sm"><span className="relative flex h-3 w-3"><span className="absolute inset-0 animate-ping rounded-full bg-[#d9bef4]/60" /><span className="relative h-3 w-3 rounded-full bg-[#8c64b4]" /></span>Our team is online</div></div>
          <ContactForm />
        </div>
      </section>

      <section className="bg-[#0d0d0d] px-5 py-20 text-white sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[108rem]">
          <h2 className="text-5xl font-normal tracking-[-0.05em] sm:text-6xl">What can we help with?</h2>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {cards.map(([title, body], index) => <div key={title} className={`flex min-h-52 flex-col justify-between rounded-[1.5rem] p-7 sm:p-9 ${index === 1 ? 'bg-[#d9bef4] text-black' : 'border border-white/15 bg-white/5 text-white'}`}><span className="font-geist-mono text-xs text-current/50">0{index + 1}</span><div><h3 className="text-3xl font-normal tracking-[-0.035em]">{title}</h3><p className={`mt-3 max-w-sm text-sm leading-6 ${index === 1 ? 'text-black/60' : 'text-white/55'}`}>{body}</p></div></div>)}
          </div>
        </div>
      </section>
    </main>
  );
}
