"use client";

import Image from "next/image";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useStoredLanguage } from "@/app/hooks/useStoredLanguage";
import { ContactForm } from "./ContactForm";

function Arrow() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none"><path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

const channelIcons = ["✦", "↗", "?"];

export function ContactClient() {
  const language = useStoredLanguage();
  const { t } = useTranslation(language as any);
  const channels = [
    { label: t("contact.channels.generalLabel", "General"), value: "hello@elpino.chat", href: "mailto:hello@elpino.chat", note: t("contact.channels.generalNote", "Questions, ideas, or a friendly hello") },
    { label: t("contact.channels.salesLabel", "Sales"), value: "sales@elpino.chat", href: "mailto:sales@elpino.chat", note: t("contact.channels.salesNote", "Plans, demos, and enterprise support") },
    { label: t("contact.channels.supportLabel", "Support"), value: t("contact.channels.supportValue", "In-app chat"), href: "/login", note: t("contact.channels.supportNote", "The quickest route for existing customers") },
  ];

  return (
    <main className="overflow-hidden bg-[#fafaf7] font-[family-name:var(--font-rethink-sans)] text-[#20251d]">
      <section className="relative border-b border-[#758269]/20 bg-[#e9eee3] px-5 pb-10 pt-14 sm:px-8 sm:pt-20 lg:px-12 lg:pb-0">
        <div aria-hidden="true" className="absolute inset-0 opacity-40 [background-image:radial-gradient(#9dac8c_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-5 lg:grid-cols-[1fr_0.9fr] lg:gap-12">
          <div className="pb-4 lg:pb-20">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#758269]/35 bg-white/55 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#5d6d50]"><span className="h-1.5 w-1.5 rounded-full bg-[#849d6d]" />Talk to a human</p>
            <h1 className="mt-7 max-w-3xl text-5xl font-medium leading-[0.94] tracking-[-0.065em] text-[#20251d] sm:text-7xl lg:text-8xl">A little help goes a <span className="font-[family-name:var(--font-instrument-serif)] italic font-normal text-[#667b55]">long</span> way.</h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-[#596353] sm:text-lg">Whether you’re curious about Elpino, need a hand setting things up, or simply want to share an idea, we’re here.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#send-message" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#20251d] px-6 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-[#536445]">Send a message <Arrow /></a>
              <a href="mailto:hello@elpino.chat" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#758269]/40 bg-white/50 px-6 text-sm font-medium transition hover:bg-white">Email us directly <Arrow /></a>
            </div>
            <p className="mt-7 flex items-center gap-2 text-sm text-[#64725a]"><span className="relative flex h-2.5 w-2.5"><span className="absolute inset-0 animate-ping rounded-full bg-[#849d6d]/50" /><span className="relative h-2.5 w-2.5 rounded-full bg-[#849d6d]" /></span>Small team, real replies — usually within one business day.</p>
          </div>
          <div className="relative mx-auto w-full max-w-[540px] self-end lg:-mb-5">
            <div aria-hidden="true" className="absolute inset-x-[8%] bottom-[9%] h-16 rounded-[100%] bg-[#667b55]/20 blur-2xl" />
            <Image src="/images/contact-support-sloth.png" alt="Elpino's sloth support teammate wearing a headset at a desk" width={1234} height={1275} priority sizes="(min-width: 1024px) 43vw, 90vw" className="relative h-auto w-full drop-shadow-[0_24px_22px_rgba(41,52,32,0.16)]" />
            <div className="absolute right-[2%] top-[16%] hidden rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-sm shadow-sm backdrop-blur sm:block"><span className="block text-xs text-[#79856f]">Currently</span><span className="font-medium">making time for you</span></div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-medium uppercase tracking-[0.14em] text-[#78866b]">Find your way in</p><h2 className="mt-3 text-3xl font-medium tracking-[-0.05em] sm:text-4xl">Choose the conversation that fits.</h2></div><p className="max-w-md text-sm leading-6 text-[#687467]">No labyrinth of departments. Pick a starting point and we’ll make sure the right person sees it.</p></div>
          <div className="mt-9 grid gap-3 md:grid-cols-3">
            {channels.map((channel, index) => <a key={channel.label} href={channel.href} className="group rounded-[22px] border border-[#d6ded0] bg-white p-6 transition hover:-translate-y-1 hover:border-[#9cab8d] hover:shadow-[0_18px_35px_-26px_rgba(38,50,29,0.42)]"><div className="flex items-center justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e9eee3] text-sm text-[#637555]">{channelIcons[index]}</span><span className="text-[#849d6d] transition-transform group-hover:translate-x-1"><Arrow /></span></div><h3 className="mt-10 text-xl font-medium tracking-[-0.035em]">{channel.label}</h3><p className="mt-2 text-sm font-medium text-[#374033]">{channel.value}</p><p className="mt-2 text-sm leading-5 text-[#7a8474]">{channel.note}</p></a>)}
          </div>
        </div>
      </section>

      <section id="send-message" className="scroll-mt-20 bg-[#f1f3ed] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.74fr_1.26fr] lg:gap-20">
          <div className="lg:pt-10"><p className="text-xs font-medium uppercase tracking-[0.14em] text-[#78866b]">Write to us</p><h2 className="mt-4 max-w-md text-4xl font-medium leading-[0.97] tracking-[-0.06em] sm:text-6xl">Start wherever you are.</h2><p className="mt-6 max-w-md text-base leading-7 text-[#687467]">{t("contact.panelBody", "No ticket maze. No generic auto-response pretending to solve your question.")}</p><div className="mt-10 rounded-2xl border border-[#d4ddcd] bg-[#fafaf7] p-5"><p className="text-sm font-medium">A promise from us</p><p className="mt-2 text-sm leading-6 text-[#6d7868]">We read every note. If someone else on the team can answer better, we’ll bring them in with the context intact.</p></div></div>
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
