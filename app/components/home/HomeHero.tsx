import Link from "next/link";
import { Fragment } from "react";
import { ArrowRight, Inbox, Sparkles, Tag } from "lucide-react";
import { HeroDashboardPreview } from "./HeroDashboardPreview";

const highlights = [
  { title: "All-in-one", detail: "Shared inbox & handoff", icon: Inbox },
  { title: "AI answers", detail: "From your knowledge base", icon: Sparkles },
  { title: "Fair pricing", detail: "Pay per resolution, not per seat", icon: Tag },
];

export function HomeHero() {
  return (
    <section className="pb-4 pt-0 text-[#11120f]">
      <div className="relative flex w-full flex-col overflow-hidden bg-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[url('/images/heros/elpino-dawn-hero.webp')] bg-cover bg-center" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,rgba(255,255,255,0.94)_0%,rgba(255,255,255,0.8)_38%,rgba(255,255,255,0.35)_68%,rgba(255,255,255,0.12)_100%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(35,61,77,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(35,61,77,0.07)_1px,transparent_1px)] [background-size:72px_72px]" />

        <div className="relative z-10 mx-auto flex w-full max-w-full flex-col items-start px-5 pb-0 pt-12 text-left sm:px-8 sm:pt-14 lg:px-22 lg:pt-16">
          <Link href="/features" className="group inline-block rounded-full bg-[linear-gradient(90deg,#fc7b33_0%,#7060BD_55%,#547FFF_100%)] p-[1.5px] transition hover:brightness-105">
            <span className="flex items-center gap-2.5 rounded-full bg-white py-[5px] pl-3 pr-3 text-[13px]">
              <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#fc7b33] opacity-70 motion-safe:animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#fc7b33]" />
              </span>
              <span className="font-medium text-black">New</span>
              <span aria-hidden="true" className="h-3 w-px bg-black/10" />
              <span className="text-black">AI answers with human handoff</span>
              <ArrowRight size={14} aria-hidden="true" className="text-black/40 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          </Link>

          <h1 className="elpino-hero-title mt-7 max-w-[20ch] text-[40px] font-normal leading-[1.02] tracking-[-0.04em] text-[#11120f] [text-wrap:balance] sm:text-6xl lg:text-[68px]">
            Support that answers itself.
            <span className="block text-black/35">Until it shouldn&apos;t.</span>
          </h1>
          <p className="mt-6 max-w-[46ch] text-base leading-7 text-black/60 sm:text-lg">
            Elpino answers from your own knowledge base in seconds, and hands the conversation to your team the moment it can&apos;t.
          </p>
          <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Link href="/signup" className="group inline-flex h-13 w-full items-center justify-center gap-2.5 rounded-full bg-[#11120f] px-8 text-lg font-medium text-white transition duration-200 hover:bg-[#11120f]/90 active:translate-y-px sm:w-auto">
              Start free <ArrowRight size={17} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <Link href="/pricing" className="group inline-flex h-13 w-full items-center justify-center gap-1.5 bg-transparent px-8 text-[15px] font-medium text-[#11120f] underline underline-offset-4 transition duration-200 hover:text-[#11120f]/70 sm:w-auto">
              See pricing <ArrowRight size={17} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
          <p className="mt-3 text-[13px] text-black/50">Free plan, no card · 50 AI resolutions a month · human handoffs never billed</p>
        </div>

        <div className="relative z-10 mt-10 px-5 sm:px-8 lg:px-22"><HeroDashboardPreview /></div>

        <div className="relative z-10 -mt-6 px-5 pb-10 sm:px-8 lg:px-22">
          <div className="mx-auto w-fit max-w-full rounded-2xl bg-[linear-gradient(90deg,#fc7b33_0%,#7060BD_55%,#547FFF_100%)] p-[1.5px] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.35)]">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 rounded-2xl bg-white px-7 py-5 text-sm">
              {highlights.map(({ title, detail, icon: Icon }, index) => (
                <Fragment key={title}>
                  {index > 0 && <span aria-hidden="true" className="hidden h-4 w-px bg-black/10 sm:block" />}
                  <span className="flex items-center gap-2.5">
                    <Icon size={17} aria-hidden="true" className="shrink-0 text-[#7060BD]" />
                    <span className="font-semibold text-[#11120f]">{title}</span>
                    <span className="text-black/45">{detail}</span>
                  </span>
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
