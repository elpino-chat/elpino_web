import type { ReactNode } from "react";
import { LegalToc } from "./LegalToc";

export type LegalSection = { id: string; title: string; body: ReactNode };

function ArrowIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none"><path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

/** Shared, editorial layout for long-form legal documents. */
export function LegalPage({ eyebrow = "Legal", title, updated, intro, sections }: { eyebrow?: string; title: string; updated: string; intro: ReactNode; sections: LegalSection[] }) {
  return (
    <main className="relative flex flex-1 flex-col overflow-x-clip bg-[#f4f2ec] text-[#0d0d0d]">
      <section className="relative border-b border-[#0d0d0d]/15">
        <div className="mx-auto grid w-full max-w-[82rem] gap-14 px-5 pb-16 pt-16 sm:px-8 md:pb-24 md:pt-24 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end lg:px-10">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ff584a]"><span className="h-px w-8 bg-[#ff584a]" />{eyebrow} / Elpino</div>
            <h1 className="mt-8 max-w-3xl font-instrument-serif text-[clamp(3.5rem,8vw,7.25rem)] font-normal leading-[0.86] tracking-[-0.045em] text-[#0d0d0d]">{title}</h1>
            <div className="mt-9 max-w-2xl text-base leading-7 text-[#5b5b5b] sm:text-lg sm:leading-8">{intro}</div>
          </div>
          <div className="border-l border-[#0d0d0d]/15 pl-6 lg:mb-2">
            <p className="font-geist-mono text-[10px] uppercase tracking-[0.2em] text-[#777]">Document record</p>
            <dl className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 text-sm lg:grid-cols-1">
              <div><dt className="text-[#777]">Effective</dt><dd className="mt-1 text-[#0d0d0d]">{updated}</dd></div>
              <div><dt className="text-[#777]">Sections</dt><dd className="mt-1 text-[#0d0d0d]">{String(sections.length).padStart(2, "0")}</dd></div>
            </dl>
          </div>
        </div>
      </section>

      <div className="relative mx-auto w-full max-w-[82rem] px-5 py-12 sm:px-8 md:py-20 lg:px-10">
        <div className="border-y border-[#0d0d0d]/12 py-4 lg:hidden">
          <p className="mb-3 font-geist-mono text-[10px] uppercase tracking-[0.18em] text-[#526159]">Jump to a section</p>
          <nav aria-label="Table of contents" className="flex snap-x gap-2 overflow-x-auto pb-1">
            {sections.map((section, index) => <a key={section.id} href={`#${section.id}`} className="shrink-0 snap-start border border-[#0d0d0d]/15 bg-white/60 px-3 py-2 text-xs text-[#353535] transition hover:border-[#0d0d0d]/40 hover:bg-white"><span className="mr-2 font-geist-mono text-[10px] text-[#7a7a7a]">{String(index + 1).padStart(2, "0")}</span>{section.title}</a>)}
          </nav>
        </div>

        <div className="grid gap-14 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-20">
          <aside className="hidden lg:block">
            <LegalToc sections={sections.map(({ id, title }) => ({ id, title }))} />
          </aside>

          <div className="min-w-0 max-w-[48rem]">
            {sections.map((section, index) => (
              <article key={section.id} id={section.id} className="scroll-mt-28 border-t border-[#0d0d0d]/15 py-10 first:border-t-0 first:pt-0 md:py-14">
                <header className="grid gap-3 sm:grid-cols-[3.25rem_minmax(0,1fr)] sm:gap-5"><span className="font-geist-mono text-[11px] tracking-[0.12em] text-[#737373]">{String(index + 1).padStart(2, "0")}</span><h2 className="font-instrument-serif text-[2rem] font-normal leading-[1.05] tracking-[-0.025em] text-[#0d0d0d] md:text-[2.5rem]">{section.title}</h2></header>
                <div className="legal-body mt-6 space-y-5 text-[15px] leading-[1.85] text-[#555] sm:ml-[4.5rem] sm:text-base [&_a]:font-medium [&_a]:text-[#0d0d0d] [&_a]:underline [&_a]:decoration-[#ff584a] [&_a]:underline-offset-4 [&_a:hover]:text-[#ff584a] [&_li]:pl-2 [&_strong]:font-semibold [&_strong]:text-[#222] [&_ul]:list-none [&_ul]:space-y-3 [&_ul]:pl-0 [&_ul>li]:relative [&_ul>li]:before:absolute [&_ul>li]:before:-left-4 [&_ul>li]:before:top-[0.78rem] [&_ul>li]:before:h-1 [&_ul>li]:before:w-1 [&_ul>li]:before:bg-[#ff584a]">{section.body}</div>
              </article>
            ))}

            <aside className="mt-6 overflow-hidden border border-[#0d0d0d]/15 bg-[#e9e8e3] p-6 sm:p-8">
              <p className="font-geist-mono text-[10px] uppercase tracking-[0.2em] text-[#66746c]">Need clarification?</p>
              <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <p className="max-w-md font-instrument-serif text-2xl leading-tight tracking-[-0.02em] text-[#0d0d0d]">Questions about this document? We answer every message.</p>
                <a href="mailto:hello@elpino.chat" className="group inline-flex shrink-0 items-center gap-2 border-b border-[#ff584a] pb-1 text-sm font-medium text-[#0d0d0d] transition-colors hover:text-[#ff584a]">hello@elpino.chat<span className="text-[#ff584a] transition-transform group-hover:translate-x-1"><ArrowIcon /></span></a>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
