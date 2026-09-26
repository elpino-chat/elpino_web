"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Clock3, Share2 } from "lucide-react";
import { Rv } from "@/app/components/RevealOnScroll";
import type { BlogPost } from "../data";
import { Cover, colorFor, prettyDate } from "../BlogClient";

const INK = "#11120f";
const BLUE = "#3784ff";
const YELLOW = "#ffd84d";

const card = "rounded-[22px] border-2 border-[#11120f]";
const mono = "font-mono text-[11px] font-semibold uppercase tracking-[0.14em]";
const dots = { backgroundImage: "radial-gradient(#000 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" };

export function BlogPostClient({ post, allPosts }: { post: BlogPost; allPosts: BlogPost[] }) {
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const accent = colorFor(post.category);

  useEffect(() => {
    const on = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); };
  }, []);

  const related = allPosts.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 2);
  if (related.length < 2) related.push(...allPosts.filter((p) => p.slug !== post.slug && !related.some((r) => r.slug === p.slug)).slice(0, 2 - related.length));

  async function share() {
    try {
      if (navigator.share) await navigator.share({ title: post.title, text: post.excerpt, url: window.location.href });
      else { await navigator.clipboard.writeText(window.location.href); setCopied(true); window.setTimeout(() => setCopied(false), 1600); }
    } catch { /* cancelled or unavailable */ }
  }

  const paragraphs = post.content.split("\n\n");

  return (
    <main className="font-[family-name:var(--font-rethink-sans)] text-[#11120f]">
      <div aria-hidden="true" className="fixed inset-x-0 top-0 z-[100] h-1.5 border-b-2 border-[#11120f] bg-white/60">
        <div className="h-full origin-left border-r-2 border-[#11120f]" style={{ width: `${progress * 100}%`, backgroundColor: accent }} />
      </div>

      <article>
        <header className="relative isolate overflow-hidden bg-white">
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-cover bg-top" style={{ backgroundImage: "url(/piliar-1-grandient.png)", maskImage: "linear-gradient(to bottom, #000 55%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, #000 55%, transparent)" }} />
          <div className="mx-auto max-w-4xl px-5 pb-12 pt-[124px] sm:px-8 lg:pt-[140px]">
            <Rv variant="drop">
              <Link href="/blog" className="inline-flex items-center gap-2 rounded-full border-2 border-[#11120f] bg-white px-3.5 py-1.5 text-[13.5px] font-semibold transition hover:-translate-y-0.5 hover:bg-[#ffd84d]"><ArrowLeft size={14} />All articles</Link>
            </Rv>
            <Rv delay={80}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <span className={`${mono} rounded-full border-2 border-[#11120f] px-3 py-1.5 text-white`} style={{ backgroundColor: accent }}>{post.category}</span>
                <span className="flex items-center gap-2 text-[14px] text-[#11120f]/60">{prettyDate(post.date)}<span aria-hidden="true">·</span><Clock3 size={13} />{post.readTime}</span>
              </div>
            </Rv>
            <Rv delay={140}><h1 className="mt-6 text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-[1] tracking-[-0.055em]">{post.title}</h1></Rv>
            <Rv delay={200}><p className="mt-6 max-w-[56ch] text-xl leading-9 text-[#11120f]/65">{post.excerpt}</p></Rv>
            <Rv delay={260}>
              <div className="mt-8 flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-full border-2 border-[#11120f] text-sm font-bold text-white" style={{ backgroundColor: accent }}>{post.authorAvatar}</span>
                <div><p className="font-semibold leading-tight">{post.authorName}</p><p className="text-[13.5px] text-[#11120f]/55">{post.authorRole}</p></div>
              </div>
            </Rv>
          </div>
        </header>

        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <Rv variant="deal"><div className={`${card} overflow-hidden`}><Cover post={post} tall /></div></Rv>
        </div>

        <div className="mx-auto grid max-w-4xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,1fr)_180px]">
          <div className="min-w-0 space-y-7 text-[18px] leading-9 text-[#11120f]/75">
            {paragraphs.map((p, i) => (
              <p key={i} className={i === 0 ? "text-[22px] font-medium leading-10 text-[#11120f]" : ""}>{p}</p>
            ))}

            <div className={`${card} relative !mt-14 overflow-hidden p-7 text-white`} style={{ backgroundColor: BLUE }}>
              <div aria-hidden="true" className="absolute inset-0 opacity-[0.16]" style={dots} />
              <p className="relative text-2xl font-semibold leading-snug tracking-tight">Give your customers the answer before they finish typing.</p>
              <p className="relative mt-2 text-[16px] leading-7 text-white/90">Start free with 100 AI messages a month. No card required.</p>
              <Link href="/signup" className="relative mt-5 inline-flex h-12 items-center gap-2 rounded-full border-2 border-[#11120f] px-6 font-semibold text-[#11120f] transition hover:-translate-y-0.5" style={{ backgroundColor: YELLOW }}>Start free <ArrowRight size={16} /></Link>
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-3">
              <button type="button" onClick={() => void share()} className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#11120f] bg-white px-4 py-2.5 text-[14px] font-semibold transition hover:-translate-y-0.5 hover:bg-[#ffd84d]">{copied ? <Check size={15} /> : <Share2 size={15} />}{copied ? "Link copied" : "Share"}</button>
              <div className={`${card} bg-white p-3.5 text-[13px]`}>
                <p className={`${mono} text-[#11120f]/45`}>Progress</p>
                <p className="mt-1 font-mono text-2xl font-bold tabular-nums">{Math.round(progress * 100)}%</p>
              </div>
            </div>
          </aside>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t-2 border-[#11120f] bg-[#fff8ec] px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-semibold tracking-[-0.03em]">Keep reading</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {related.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className={`${card} group flex flex-col overflow-hidden bg-white transition duration-300 hover:-translate-y-2`}>
                  <Cover post={p} />
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-[20px] font-semibold leading-[1.15] tracking-[-0.025em]">{p.title}</h3>
                    <p className="mt-2 line-clamp-2 text-[15px] leading-7 text-[#11120f]/65">{p.excerpt}</p>
                    <ArrowUpRight size={18} className="mt-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

