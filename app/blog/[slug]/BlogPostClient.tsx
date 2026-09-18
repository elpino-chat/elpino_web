"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Clock3, Share2, Sparkles } from "lucide-react";
import { motion, useScroll, useSpring } from "framer-motion";
import { BlogPost } from "../data";
import { BlogCover } from "../../components/BlogCover";

const categoryTone: Record<string, string> = {
  Company: "bg-[#e7ddf3] text-[#7651b0]",
  Product: "bg-[#dceee8] text-[#28745a]",
  Guides: "bg-[#fff1e3] text-[#a96027]",
};

function prettyDate(date: string) {
  return new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(new Date(`${date}T00:00:00`));
}

export function BlogPostClient({ post, allPosts }: { post: BlogPost; allPosts: BlogPost[] }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 150, damping: 25, restDelta: 0.001 });
  const relatedPosts = allPosts.filter((item) => item.slug !== post.slug && item.category === post.category).slice(0, 2);
  if (relatedPosts.length < 2) relatedPosts.push(...allPosts.filter((item) => item.slug !== post.slug && !relatedPosts.some((related) => related.slug === item.slug)).slice(0, 2 - relatedPosts.length));

  async function shareArticle() {
    if (navigator.share) await navigator.share({ title: post.title, text: post.excerpt, url: window.location.href }).catch(() => undefined);
    else await navigator.clipboard.writeText(window.location.href).catch(() => undefined);
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[#f6f4ef] font-[family-name:var(--font-rethink-sans)] text-[#192016]">
      <motion.div className="fixed inset-x-0 top-0 z-[100] h-[3px] origin-left bg-[#bf91ff]" style={{ scaleX }} />

      <article>
        <header className="relative overflow-hidden bg-[#11120f] px-5 pb-36 pt-16 text-white sm:px-8 sm:pb-44 sm:pt-20">
          <div aria-hidden="true" className="absolute -right-24 -top-28 size-[430px] rounded-full bg-[#bf91ff]/30 blur-[100px]" />
          <div aria-hidden="true" className="absolute -bottom-36 left-[12%] size-[400px] rounded-full bg-[#fe9238]/20 blur-[110px]" />
          <div className="relative mx-auto max-w-5xl">
            <div className="flex items-center justify-between gap-4">
              <Link href="/blog" className="group inline-flex items-center gap-2 text-xs font-semibold text-white/55 transition hover:text-white"><ArrowLeft size={14} className="transition group-hover:-translate-x-1" />Learning center</Link>
              <button type="button" onClick={() => void shareArticle()} className="inline-flex h-9 items-center gap-2 rounded-full border border-white/15 px-3.5 text-xs font-medium text-white/70 transition hover:bg-white/10 hover:text-white"><Share2 size={13} />Share</button>
            </div>
            <div className="mt-16 flex flex-wrap items-center gap-3 text-xs"><span className={`rounded-full px-3 py-1.5 font-semibold ${categoryTone[post.category] ?? "bg-white/10 text-white"}`}>{post.category}</span><span className="inline-flex items-center gap-1.5 text-white/45"><Clock3 size={13} />{post.readTime}</span><span className="text-white/25">·</span><span className="text-white/45">{prettyDate(post.date)}</span></div>
            <h1 className="mt-6 max-w-4xl text-[clamp(2.7rem,7vw,5.8rem)] font-medium leading-[0.98] tracking-[-0.06em]">{post.title}</h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-white/60 sm:text-xl">{post.excerpt}</p>
            <div className="mt-9 flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-[#bf91ff] text-sm font-bold text-black">E</span><div><p className="text-sm font-semibold">Elpino team</p><p className="mt-0.5 text-xs text-white/40">Product notes and practical guides</p></div></div>
          </div>
        </header>

        <div className="relative z-10 mx-auto -mt-24 max-w-5xl px-5 sm:-mt-30 sm:px-8">
          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#17191f] shadow-[0_35px_80px_rgba(17,18,15,0.25)]"><BlogCover category={post.category} title={post.title} slug={post.slug} aspectRatio="hero" className="min-h-[300px] border-0 sm:min-h-[430px]" /></div>
        </div>

        <div className="mx-auto grid max-w-5xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,680px)_180px] lg:justify-between">
          <div className="min-w-0">
            <div className="space-y-7 text-[17px] leading-8 text-[#59635b] sm:text-[18px] sm:leading-9">
              {post.content.split("\n\n").map((paragraph, index) => <p key={index} className={index === 0 ? "text-xl font-medium leading-9 text-[#252c26] sm:text-2xl sm:leading-10" : ""}>{paragraph}</p>)}
            </div>
            <div className="mt-14 rounded-[24px] border border-black/10 bg-[#dceee8] p-6 sm:p-8"><span className="flex size-10 items-center justify-center rounded-full bg-white"><Sparkles size={17} /></span><h2 className="mt-5 text-2xl font-semibold tracking-[-0.035em]">Put the ideas into practice.</h2><p className="mt-3 max-w-xl text-sm leading-7 text-[#5f6d64]">Create an Elpino workspace and see how AI answers, shared context, and human handoff work together.</p><Link href="/signup" className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-[#192016] px-5 text-sm font-semibold text-white">Start for free <ArrowRight size={14} /></Link></div>
          </div>
          <aside className="hidden lg:block"><div className="sticky top-[calc(var(--elpino-header-h,64px)+32px)] border-l border-black/10 pl-5"><p className="text-[10px] font-bold uppercase tracking-[0.11em] text-[#969c96]">Article</p><p className="mt-3 text-xs font-semibold leading-5">{post.category}</p><p className="mt-2 text-xs leading-5 text-[#7a827b]">{post.readTime}<br />Published {prettyDate(post.date)}</p><button type="button" onClick={() => void shareArticle()} className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#7651b0]"><Share2 size={13} />Share article</button></div></aside>
        </div>
      </article>

      {relatedPosts.length > 0 && <section className="border-t border-black/10 bg-white px-5 py-16 sm:px-8 sm:py-20"><div className="mx-auto max-w-5xl"><div className="flex items-end justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.11em] text-[#7651b0]">More from Elpino</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em]">Keep learning</h2></div><Link href="/blog" className="hidden items-center gap-2 text-sm font-semibold sm:inline-flex">All articles <ArrowRight size={14} /></Link></div><div className="mt-8 grid gap-5 md:grid-cols-2">{relatedPosts.map((related, index) => <Link key={related.slug} href={`/blog/${related.slug}`} className={`group overflow-hidden rounded-[24px] border border-black/10 ${index === 0 ? "bg-[#e7ddf3]" : "bg-[#fff1e3]"}`}><div className="overflow-hidden"><BlogCover category={related.category} title={related.title} slug={related.slug} aspectRatio="card" className="h-48 min-h-0 border-0 transition duration-300 group-hover:scale-[1.025]" /></div><div className="p-6"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.09em] text-[#717871]"><span>{related.category}</span><span>·</span><span>{related.readTime}</span></div><h3 className="mt-3 text-xl font-semibold leading-tight tracking-[-0.025em]">{related.title}</h3><p className="mt-3 line-clamp-2 text-sm leading-6 text-[#616a62]">{related.excerpt}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">Read article <ArrowRight size={14} className="transition group-hover:translate-x-1" /></span></div></Link>)}</div></div></section>}
    </div>
  );
}
