import type { ReactNode } from "react";
import Image from "next/image";
import { LegalToc } from "./LegalToc";

export type LegalSection = { id: string; title: string; body: ReactNode };

function ArrowIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none"><path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

/** Shared, editorial layout for long-form legal documents. */
export function LegalPage({ eyebrow = "Legal", title, updated, intro, sections, illustrationSrc }: { eyebrow?: string; title: string; updated: string; intro: ReactNode; sections: LegalSection[]; illustrationSrc?: string | null }) {
  return (
    <main className="relative flex flex-1 flex-col overflow-x-clip bg-[#fafaf7] font-[family-name:var(--font-rethink-sans)] text-[#20251d]">
      <section className="relative overflow-hidden border-b border-[#758269]/20 bg-[#e9eee3]">
        <div aria-hidden="true" className="absolute inset-0 opacity-35 [background-image:radial-gradient(#9dac8c_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-5 pb-14 pt-14 sm:px-8 md:pb-20 md:pt-20 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-end lg:px-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#758269]/35 bg-white/55 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[#5d6d50]"><span className="h-1.5 w-1.5 rounded-full bg-[#849d6d]" />{eyebrow} / Elpino</div>
            <h1 className="mt-7 max-w-3xl text-[clamp(3.5rem,8vw,6.5rem)] font-medium leading-[0.88] tracking-[-0.065em] text-[#20251d]">{title}</h1>
            <div className="mt-7 max-w-2xl text-base leading-7 text-[#596353] sm:text-lg sm:leading-8">{intro}</div>
          </div>
          <div className="relative rounded-[22px] border border-white/60 bg-white/55 p-6 backdrop-blur-sm">
            {illustrationSrc && <Image src={illustrationSrc} alt="" width={1024} height={1536} className="pointer-events-none absolute -right-8 -top-20 w-36 opacity-30" />}
            <p className="relative text-[10px] font-medium uppercase tracking-[0.16em] text-[#6d7d62]">Document record</p>
            <dl className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 text-sm lg:grid-cols-1">
              <div className="relative"><dt className="text-[#71806a]">Effective</dt><dd className="mt-1 font-medium text-[#20251d]">{updated}</dd></div>
              <div className="relative"><dt className="text-[#71806a]">Sections</dt><dd className="mt-1 font-medium text-[#20251d]">{String(sections.length).padStart(2, "0")}</dd></div>
            </dl>
          </div>
        </div>
      </section>

      <div className="relative mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 md:py-20 lg:px-10">
        <div className="border-y border-[#cfd9c8] py-4 lg:hidden">
          <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.16em] text-[#6a7a61]">Jump to a section</p>
          <nav aria-label="Table of contents" className="flex snap-x gap-2 overflow-x-auto pb-1">
            {sections.map((section, index) => <a key={section.id} href={`#${section.id}`} className="shrink-0 snap-start rounded-full border border-[#cfd9c8] bg-white px-3 py-2 text-xs text-[#46523f] transition hover:border-[#95a887]"><span className="mr-2 text-[10px] text-[#84977a]">{String(index + 1).padStart(2, "0")}</span>{section.title}</a>)}
          </nav>
        </div>

        <div className="grid gap-14 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-20">
          <aside className="hidden lg:block">
            <LegalToc sections={sections.map(({ id, title }) => ({ id, title }))} />
          </aside>

          <div className="min-w-0 max-w-[48rem]">
            {sections.map((section, index) => (
              <article key={section.id} id={section.id} className="scroll-mt-28 border-t border-[#d8e0d2] py-10 first:border-t-0 first:pt-0 md:py-14">
                <header className="grid gap-3 sm:grid-cols-[3.25rem_minmax(0,1fr)] sm:gap-5"><span className="text-[11px] font-medium tracking-[0.12em] text-[#84977a]">{String(index + 1).padStart(2, "0")}</span><h2 className="text-[2rem] font-medium leading-[1.05] tracking-[-0.045em] text-[#20251d] md:text-[2.5rem]">{section.title}</h2></header>
                <div className="legal-body mt-6 space-y-5 text-[15px] leading-[1.85] text-[#596353] sm:ml-[4.5rem] sm:text-base [&_a]:font-medium [&_a]:text-[#33442b] [&_a]:underline [&_a]:decoration-[#9cac8d] [&_a]:underline-offset-4 [&_a:hover]:text-[#799064] [&_li]:pl-2 [&_strong]:font-semibold [&_strong]:text-[#283124] [&_ul]:list-none [&_ul]:space-y-3 [&_ul]:pl-0 [&_ul>li]:relative [&_ul>li]:before:absolute [&_ul>li]:before:-left-4 [&_ul>li]:before:top-[0.78rem] [&_ul>li]:before:h-1.5 [&_ul>li]:before:w-1.5 [&_ul>li]:before:rounded-full [&_ul>li]:before:bg-[#91a782]">{section.body}</div>
              </article>
            ))}

            <aside className="mt-6 overflow-hidden rounded-[22px] border border-[#d2ddcc] bg-[#e9eee3] p-6 sm:p-8">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#6a7a61]">Need clarification?</p>
              <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <p className="max-w-md text-2xl font-medium leading-tight tracking-[-0.045em] text-[#20251d]">Questions about this document? We answer every message.</p>
                <a href="mailto:hello@elpino.chat" className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-[#20251d] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#536445]">hello@elpino.chat<span className="transition-transform group-hover:translate-x-1"><ArrowIcon /></span></a>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
