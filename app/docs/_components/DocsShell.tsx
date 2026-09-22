import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, LifeBuoy } from "lucide-react";
import { DocsSearch } from "@/app/components/docs/DocsSearch";
import { GlossyDocsSearch } from "@/app/components/docs/GlossyDocsSearch";
import { HeaderDocsSearch } from "@/app/components/docs/HeaderDocsSearch";
import { AskAiMenu } from "@/app/components/docs/AskAiMenu";
import { docsPages, docsToc, SITE_URL, type DocsHref } from "../_lib/docs";

export function DocsShell({ current, title, description, children }: { current: DocsHref; title: string; description: string; children: React.ReactNode }) {
  const index = docsPages.findIndex((page) => page.href === current);
  const previous = index > 0 ? docsPages[index - 1] : null;
  const next = index < docsPages.length - 1 ? docsPages[index + 1] : null;
  const groups = Array.from(new Set(docsPages.map((page) => page.group)));
  const toc = docsToc[current];
  const jsonLd = { "@context": "https://schema.org", "@graph": [
    { "@type": "TechArticle", headline: title, description, url: `${SITE_URL}${current}`, author: { "@type": "Organization", name: "Elpino", url: SITE_URL }, publisher: { "@type": "Organization", name: "Elpino", url: SITE_URL }, isPartOf: { "@type": "WebSite", name: "Elpino Documentation", url: `${SITE_URL}/docs` } },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Elpino", item: SITE_URL }, { "@type": "ListItem", position: 2, name: "Documentation", item: `${SITE_URL}/docs` }, ...(current === "/docs" ? [] : [{ "@type": "ListItem", position: 3, name: title, item: `${SITE_URL}${current}` }])] },
  ] };

  return <div className="min-h-screen bg-white font-[family-name:var(--font-rethink-sans)] text-[#192016]">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    <div className="sticky top-0 z-30 bg-white">
    <div className="relative bg-white text-[#11120f]">
      <div className="relative flex h-16 w-full items-center justify-between gap-4 px-4">
        <Link href="/docs" className="relative z-10 flex w-fit shrink-0 items-center gap-2 transition-opacity hover:opacity-90"><Image src="/icon.png" alt="" width={96} height={96} priority className="size-8 rounded-lg object-contain" /><span className="hidden items-center gap-2 text-[15px] font-normal tracking-[-0.01em] sm:flex"><span>elpino</span><span aria-hidden="true" className="h-5 w-px bg-black" /><span>Docs</span></span></Link>
        <div className="absolute left-1/2 w-[calc(100%_-_6rem)] -translate-x-1/2 lg:w-[min(42rem,calc(100%_-_34rem))]"><div className="relative hidden flex-1 items-center gap-2.5 lg:flex"><HeaderDocsSearch /><AskAiMenu pageUrl={`${SITE_URL}${current}`} /></div><div className="lg:hidden"><DocsSearch /></div></div>
        <div className="relative z-10 hidden shrink-0 items-center gap-2 md:flex"><Link href="/contact" className="inline-flex h-10 items-center rounded-md px-5 text-sm text-black transition hover:bg-black/5">Contact us</Link><Link href="/signup" className="inline-flex h-10 items-center rounded-md bg-black px-5 text-sm text-white transition hover:bg-black/80">Get started</Link></div>
      </div>
    </div>
    <div className="relative z-20 hidden bg-white text-sm font-normal text-black/70 md:block"><div className="flex h-11 items-center justify-between px-4"><nav className="flex items-center gap-5" aria-label="Documentation resources"><Link href="/docs" aria-current={current === "/docs" ? "page" : undefined} className={current === "/docs" ? "border-b border-black px-3 py-1.5 text-black" : "px-3 py-1.5 transition hover:text-black"}>Help center</Link><Link href="/docs/identity-verification" className={current === "/docs/identity-verification" ? "border-b border-black py-1.5 text-black" : "transition hover:text-black"}>Identity verification</Link><Link href="/docs/security" className="transition hover:text-black">Security</Link><Link href="/changelog" className="transition hover:text-black">Changelog</Link></nav><nav className="flex items-center gap-5" aria-label="Elpino resources"><Link href="/contact" className="transition hover:text-black">Partner</Link><Link href="/features" className="transition hover:text-black">Platform</Link></nav></div></div>
    </div>
    <div className="border-b border-black/10 bg-white px-5 py-3 lg:hidden"><nav aria-label="Documentation topics" className="mx-auto flex max-w-3xl gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{docsPages.map((page) => <Link key={page.href} href={page.href} className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-medium ${page.href === current ? "bg-[#192016] text-white" : "border border-black/10 bg-white text-[#59615a]"}`}>{page.title}</Link>)}</nav></div>
    <div className="grid w-full grid-cols-1 px-4 lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[250px_minmax(0,3fr)_1fr]">
      <aside className="hidden border-r border-black/30 bg-white px-5 py-9 lg:block"><nav className="sticky top-[132px] space-y-5" aria-label="Documentation navigation">{groups.map((group) => <div key={group}><p className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#59615a]">{group}</p><ul className="space-y-[0.5px]">{docsPages.filter((page) => page.group === group).map((page) => <li key={page.href}><Link href={page.href} aria-current={page.href === current ? "page" : undefined} className={`block rounded-lg px-3 py-2 text-sm transition ${page.href === current ? "font-bold text-black" : "text-[#575d56] hover:bg-black/[0.03] hover:text-black"}`}>{page.title}</Link></li>)}</ul></div>)}<div className="rounded-2xl bg-[#dceee8] p-4"><span className="flex size-8 items-center justify-center rounded-full bg-white"><LifeBuoy size={15} /></span><p className="mt-3 text-sm font-semibold">Need a hand?</p><p className="mt-1 text-xs leading-5 text-[#65716b]">Talk to the Elpino team about your setup.</p><Link href="/contact" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold underline underline-offset-4">Contact support <ArrowRight size={12} /></Link></div></nav></aside>
      <main className="min-w-0 bg-white px-5 py-6 sm:px-12"><header className="border-b border-black/10 pb-12"><span className="inline-flex rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-xs font-medium text-black/70">Elpino documentation</span><h1 className="mt-5 max-w-3xl text-[clamp(2.5rem,6vw,4.5rem)] font-medium leading-[1.02] tracking-[-0.055em]">{title}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-black/70">{description}</p></header><div>{children}</div><nav aria-label="Adjacent documentation pages" className="mt-4 grid gap-3 border-t border-black/10 py-10 sm:grid-cols-2">{previous ? <Link href={previous.href} className="rounded-2xl border border-black/10 p-5 transition hover:bg-black/[0.02]"><span className="flex items-center gap-2 text-xs text-black/45"><ArrowLeft size={13} /> Previous</span><strong className="mt-2 block">{previous.title}</strong></Link> : <span />}{next && <Link href={next.href} className="rounded-2xl border border-black/10 p-5 text-right transition hover:bg-black/[0.02]"><span className="flex items-center justify-end gap-2 text-xs text-black/45">Next <ArrowRight size={13} /></span><strong className="mt-2 block">{next.title}</strong></Link>}</nav></main>
      <aside className="hidden px-6 py-9 xl:block">
        <nav className="sticky top-[132px]" aria-label="On this page">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#59615a]">On this page</p>
          <ul className="space-y-1">
            {toc.map((item) => <li key={item.id}><Link href={`#${item.id}`} className="block py-1.5 text-xs leading-5 text-[#667069] transition hover:text-black">{item.label}</Link></li>)}
          </ul>
          <div className="mt-8 border-t border-black/10 pt-5">
            <p className="text-xs leading-5 text-[#667069]">Was this guide helpful?</p>
            <Link href="/contact" className="mt-2 inline-flex text-xs font-semibold text-[#7651b0] hover:underline">Send feedback</Link>
          </div>
        </nav>
      </aside>
    </div>
    <GlossyDocsSearch />
  </div>;
}

export function DocSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) { return <section id={id} className="scroll-mt-40 border-b border-[#e8eaed] py-14"><h2 className="text-3xl font-semibold tracking-[-0.035em]">{title}</h2><div className="mt-4 max-w-3xl space-y-4 text-base leading-7 text-[#626c78]">{children}</div></section>; }
export function Note({ children }: { children: React.ReactNode }) { return <div className="rounded-2xl border border-black/10 bg-[#f3edfb] p-5 text-sm leading-6 text-[#5f4c79]">{children}</div>; }
