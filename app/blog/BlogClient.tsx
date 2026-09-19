"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Building2, Clock3, Compass, Search, Sparkles, Wrench, X } from "lucide-react";
import { BlogPost } from "./data";
import { BlogCover } from "../components/BlogCover";

const categoryMeta = {
  Company: { icon: Building2, eyebrow: "Behind Elpino", description: "How we think about AI support, trust, focus, and the company we are building.", background: "bg-[#e7ddf3]", accent: "text-[#7651b0]" },
  Product: { icon: Wrench, eyebrow: "Product thinking", description: "A closer look at the systems, safeguards, and product decisions behind Elpino.", background: "bg-[#dceee8]", accent: "text-[#28745a]" },
  Guides: { icon: BookOpen, eyebrow: "Practical guides", description: "Step-by-step ideas for connecting tools, reducing busywork, and running support well.", background: "bg-[#fff1e3]", accent: "text-[#a96027]" },
} as const;

const categories = Object.keys(categoryMeta) as Array<keyof typeof categoryMeta>;

function prettyDate(date: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${date}T00:00:00`));
}

export function BlogClient({ posts }: { posts: BlogPost[] }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"All" | keyof typeof categoryMeta>("All");
  const sortedPosts = useMemo(() => [...posts].sort((a, b) => b.date.localeCompare(a.date)), [posts]);
  const filteredPosts = useMemo(() => {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return sortedPosts.filter((post) => {
      if (activeCategory !== "All" && post.category !== activeCategory) return false;
      if (!terms.length) return true;
      const haystack = `${post.title} ${post.excerpt} ${post.category} ${post.authorName}`.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
  }, [activeCategory, query, sortedPosts]);
  const featured = sortedPosts[0];

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[#f6f4ef] font-[family-name:var(--font-rethink-sans)] text-[#192016]">
      <section className="relative overflow-hidden bg-[#11120f] px-5 pb-20 pt-20 text-white sm:px-8 sm:pb-24 sm:pt-24">
        <div aria-hidden="true" className="absolute -right-28 -top-36 size-[480px] rounded-full bg-[#bf91ff]/35 blur-[100px]" />
        <div aria-hidden="true" className="absolute -bottom-40 left-[15%] size-[420px] rounded-full bg-[#fe9238]/25 blur-[110px]" />
        <Image src="/images/blog/learning-sloth.png" alt="A friendly sloth hanging from a branch and reading" width={1145} height={1374} priority sizes="(min-width: 1280px) 310px, (min-width: 768px) 230px, 0px" className="pointer-events-none absolute -right-5 -top-4 hidden h-auto w-[230px] drop-shadow-[0_25px_35px_rgba(0,0,0,0.28)] md:block xl:right-8 xl:w-[310px]" />
        <div className="relative mx-auto max-w-7xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-xs font-medium text-[#d9bef4]"><Sparkles size={13} />The Elpino learning center</span>
          <h1 className="mx-auto mt-7 max-w-4xl text-[clamp(2.8rem,7vw,6.5rem)] font-medium leading-[0.95] tracking-[-0.065em]">Ideas for better<br />customer support.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/60 sm:text-lg">Guides, product notes, and lessons from building AI that helps customers and knows when to bring in a person.</p>
          <div className="relative mx-auto mt-10 max-w-2xl text-left">
            <Search size={19} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[#777d78]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" aria-label="Search Elpino articles" placeholder="What do you want to learn?" className="h-15 w-full rounded-2xl border border-white/10 bg-white pl-13 pr-12 text-[15px] text-[#192016] shadow-[0_20px_60px_rgba(0,0,0,0.28)] outline-none placeholder:text-[#8a908a] focus:border-[#bf91ff] focus:ring-4 focus:ring-[#bf91ff]/15" />
            {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-4 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#eeece6] text-[#656b65] hover:bg-[#e3dfd6]"><X size={14} /></button>}
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 sm:py-18">
        {!query && activeCategory === "All" && <>
          <section aria-labelledby="explore-topics">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.11em] text-[#7651b0]">Explore by topic</p><h2 id="explore-topics" className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">Choose where to begin</h2></div><p className="max-w-sm text-sm leading-6 text-[#667069]">Browse the whole library or start with the part of Elpino you want to understand.</p></div>
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {categories.map((category) => {
                const meta = categoryMeta[category];
                const categoryPosts = sortedPosts.filter((post) => post.category === category);
                return <article key={category} className={`flex min-h-[390px] flex-col rounded-[26px] border border-black/10 p-6 sm:p-7 ${meta.background}`}>
                  <div className="flex items-start justify-between"><span className="flex size-11 items-center justify-center rounded-2xl bg-white/75"><meta.icon size={20} /></span><span className="rounded-full border border-black/10 bg-white/45 px-3 py-1 text-[10px] font-semibold">{categoryPosts.length} articles</span></div>
                  <p className={`mt-8 text-[11px] font-bold uppercase tracking-[0.11em] ${meta.accent}`}>{meta.eyebrow}</p><h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">{category}</h3><p className="mt-3 text-sm leading-6 text-[#5e675f]">{meta.description}</p>
                  <ul className="mt-7 divide-y divide-black/10 border-t border-black/10">{categoryPosts.slice(0, 3).map((post) => <li key={post.slug}><Link href={`/blog/${post.slug}`} className="group flex items-center gap-3 py-3.5 text-sm font-medium leading-5"><span className="line-clamp-2 flex-1">{post.title}</span><ArrowRight size={14} className="shrink-0 transition group-hover:translate-x-1" /></Link></li>)}</ul>
                  <button type="button" onClick={() => setActiveCategory(category)} className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold underline decoration-black/30 underline-offset-4">View all {category.toLowerCase()} articles <ArrowRight size={14} /></button>
                </article>;
              })}
            </div>
          </section>

          <section className="mt-18 grid overflow-hidden rounded-[28px] bg-[#192016] text-white lg:grid-cols-[1.15fr_0.85fr]">
            <div className="p-7 sm:p-10"><p className="text-xs font-bold uppercase tracking-[0.11em] text-[#d9bef4]">Featured read</p><h2 className="mt-4 max-w-xl text-3xl font-medium leading-tight tracking-[-0.045em] sm:text-4xl">{featured.title}</h2><p className="mt-4 max-w-xl text-sm leading-7 text-white/60">{featured.excerpt}</p><div className="mt-7 flex flex-wrap items-center gap-3 text-xs text-white/50"><span className="rounded-full bg-white/10 px-3 py-1.5 text-white/80">{featured.category}</span><span>{featured.readTime}</span><span>·</span><span>{prettyDate(featured.date)}</span></div><Link href={`/blog/${featured.slug}`} className="mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-[#bf91ff] px-5 text-sm font-semibold text-black transition hover:bg-[#cfaeff]">Read article <ArrowRight size={15} /></Link></div>
            <div className="min-h-[300px] border-t border-white/10 lg:border-l lg:border-t-0"><BlogCover category={featured.category} title={featured.title} slug={featured.slug} aspectRatio="hero" className="h-full min-h-[300px] border-0" /></div>
          </section>

          <div className="mt-22 space-y-20">
            {categories.map((category, categoryIndex) => {
              const meta = categoryMeta[category];
              const categoryPosts = sortedPosts.filter((post) => post.category === category);
              const lead = categoryPosts[0];
              const remaining = categoryPosts.slice(1);
              return <section key={category} aria-labelledby={`section-${category.toLowerCase()}`} className="scroll-mt-28">
                <div className="flex flex-col justify-between gap-4 border-b border-black/10 pb-6 sm:flex-row sm:items-end"><div className="flex items-start gap-4"><span className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${meta.background}`}><meta.icon size={21} /></span><div><p className={`text-[11px] font-bold uppercase tracking-[0.11em] ${meta.accent}`}>{meta.eyebrow}</p><h2 id={`section-${category.toLowerCase()}`} className="mt-1 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">{category}</h2></div></div><div className="sm:text-right"><p className="max-w-md text-sm leading-6 text-[#667069]">{meta.description}</p><span className="mt-1 block text-[11px] font-semibold text-[#929891]">{categoryPosts.length} articles</span></div></div>
                <div className={`mt-7 grid gap-6 lg:grid-cols-[1.08fr_0.92fr] ${categoryIndex % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}>
                  <Link href={`/blog/${lead.slug}`} className={`group overflow-hidden rounded-[26px] border border-black/10 ${meta.background}`}><div className="overflow-hidden"><BlogCover category={lead.category} title={lead.title} slug={lead.slug} aspectRatio="hero" className="h-[280px] min-h-0 border-0 transition duration-300 group-hover:scale-[1.025] sm:h-[340px]" /></div><div className="p-6 sm:p-8"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.09em]"><span className={meta.accent}>Start here</span><span className="text-black/25">·</span><span className="text-[#747b74]">{lead.readTime}</span></div><h3 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.035em] sm:text-3xl">{lead.title}</h3><p className="mt-3 line-clamp-3 text-sm leading-7 text-[#5f685f]">{lead.excerpt}</p><span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold">Read article <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span></div></Link>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">{remaining.map((post, index) => <Link key={post.slug} href={`/blog/${post.slug}`} className="group grid min-h-[150px] grid-cols-[96px_minmax(0,1fr)] overflow-hidden rounded-2xl border border-black/10 bg-white transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(25,32,22,0.08)] sm:grid-cols-1 lg:grid-cols-[120px_minmax(0,1fr)]"><div className="overflow-hidden"><BlogCover category={post.category} title={post.title} slug={post.slug} aspectRatio="card" className="h-full min-h-[150px] border-0 transition duration-300 group-hover:scale-[1.03] sm:h-28 sm:min-h-0 lg:h-full lg:min-h-[150px]" /></div><div className="flex min-w-0 flex-col justify-center p-4"><div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.08em] text-[#858b85]"><span>0{index + 2}</span><span>·</span><span>{post.readTime.replace(" read", "")}</span></div><h3 className="mt-2 line-clamp-3 text-base font-semibold leading-snug tracking-[-0.02em] transition group-hover:text-[#7651b0]">{post.title}</h3><span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-[#7651b0]">Read <ArrowRight size={11} /></span></div></Link>)}</div>
                </div>
              </section>;
            })}
          </div>
        </>}

        {(query || activeCategory !== "All") && <section aria-labelledby="recent-posts">
          <div className="flex flex-col justify-between gap-5 border-b border-black/10 pb-6 sm:flex-row sm:items-end">
            <div><p className="text-xs font-bold uppercase tracking-[0.11em] text-[#7651b0]">{query ? "Search results" : activeCategory === "All" ? "Latest from Elpino" : `${activeCategory} articles`}</p><h2 id="recent-posts" className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">{query ? `${filteredPosts.length} ${filteredPosts.length === 1 ? "article" : "articles"} found` : activeCategory === "All" ? "Recently published" : categoryMeta[activeCategory].eyebrow}</h2></div>
            <div className="flex flex-wrap gap-2">{(["All", ...categories] as const).map((category) => <button key={category} type="button" onClick={() => setActiveCategory(category)} className={`rounded-full px-4 py-2 text-xs font-semibold transition ${activeCategory === category ? "bg-[#192016] text-white" : "border border-black/10 bg-white text-[#626a63] hover:border-[#bf91ff]"}`}>{category}</button>)}</div>
          </div>
          {filteredPosts.length ? <div className="divide-y divide-black/10">{filteredPosts.map((post, index) => <Link key={post.slug} href={`/blog/${post.slug}`} className="group grid gap-5 py-7 sm:grid-cols-[150px_minmax(0,1fr)_auto] sm:items-center">
            <div className="overflow-hidden rounded-2xl border border-black/10"><BlogCover category={post.category} title={post.title} slug={post.slug} aspectRatio="card" className="h-28 min-h-0 border-0 transition duration-300 group-hover:scale-[1.03]" /></div>
            <div className="min-w-0"><div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.09em]"><span className={categoryMeta[post.category as keyof typeof categoryMeta]?.accent ?? "text-[#7651b0]"}>{post.category}</span><span className="text-[#a0a59f]">·</span><span className="text-[#858b85]">{prettyDate(post.date)}</span>{index < 3 && activeCategory === "All" && !query ? <span className="rounded-full bg-[#e7ddf3] px-2 py-0.5 text-[#7651b0]">New</span> : null}</div><h3 className="mt-2 text-xl font-semibold leading-tight tracking-[-0.025em] transition group-hover:text-[#7651b0] sm:text-2xl">{post.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-[#667069]">{post.excerpt}</p></div>
            <div className="flex items-center justify-between gap-5 sm:flex-col sm:items-end"><span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-[#7a817a]"><Clock3 size={13} />{post.readTime.replace(" read", "")}</span><span className="flex size-9 items-center justify-center rounded-full border border-black/10 bg-white transition group-hover:border-[#192016] group-hover:bg-[#192016] group-hover:text-white"><ArrowRight size={15} /></span></div>
          </Link>)}</div> : <div className="flex flex-col items-center py-20 text-center"><span className="flex size-14 items-center justify-center rounded-full bg-[#e7ddf3] text-[#7651b0]"><Compass size={23} /></span><h3 className="mt-5 text-xl font-semibold">No articles found</h3><p className="mt-2 max-w-sm text-sm leading-6 text-[#667069]">Try another topic or a broader search phrase.</p><button type="button" onClick={() => { setQuery(""); setActiveCategory("All"); }} className="mt-5 rounded-full bg-[#192016] px-5 py-2.5 text-sm font-semibold text-white">Show all articles</button></div>}
        </section>}
      </div>
    </div>
  );
}
