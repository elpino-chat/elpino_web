"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, ArrowUpRight, Check, Clock3, Mail, Search, SearchX, Sparkles, X } from "lucide-react";
import { Rv } from "@/app/components/RevealOnScroll";
import type { BlogPost } from "./data";

// The blog index in the site's sticker style: a searchable, filterable list
// with a featured post, sticker covers generated from each post's category,
// and the newsletter form (posts to /api/newsletter, unchanged).

const INK = "#11120f";
const BLUE = "#3784ff";
const YELLOW = "#ffd84d";
const PURPLE = "#7060bd";
const ORANGE = "#fc7b33";
const GREEN = "#1aa37a";
const PINK = "#d9508a";

const card = "rounded-[22px] border-2 border-[#11120f]";
const mono = "font-mono text-[11px] font-semibold uppercase tracking-[0.14em]";
const onDark = (c: string) => (c === YELLOW ? INK : "#fff");
const dots = { backgroundImage: "radial-gradient(#000 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" };

export const CATEGORY_COLOR: Record<string, string> = { Company: BLUE, Product: GREEN, Guides: ORANGE };
export const colorFor = (category: string) => CATEGORY_COLOR[category] ?? PURPLE;

export function prettyDate(date: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${date}T00:00:00`));
}

function hash(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }

// A sticker cover: category colour, dot texture and three shapes whose
// positions come from the slug so every post looks a little different.
export function Cover({ post, tall = false }: { post: BlogPost; tall?: boolean }) {
  const c = colorFor(post.category);
  const h = hash(post.slug);
  const shapes = [
    { s: 46 + (h % 30), x: 8 + (h % 20), y: 14 + ((h >> 3) % 25), r: (h % 40) - 20, c: YELLOW, round: true },
    { s: 40 + ((h >> 2) % 34), x: 62 + ((h >> 4) % 22), y: 44 + ((h >> 5) % 30), r: ((h >> 6) % 50) - 25, c: "#fff", round: false },
    { s: 30 + ((h >> 3) % 26), x: 36 + ((h >> 7) % 26), y: 58 + ((h >> 8) % 18), r: ((h >> 9) % 60) - 30, c: PINK === c ? PURPLE : PINK, round: true },
  ];
  return (
    <div className={`relative overflow-hidden border-b-2 border-[#11120f] ${tall ? "h-full min-h-[240px]" : "h-44"}`} style={{ backgroundColor: c }} aria-hidden="true">
      <div className="absolute inset-0 opacity-[0.16]" style={dots} />
      {shapes.map((sh, i) => (
        <span key={i} className={`absolute border-2 border-[#11120f] ${sh.round ? "rounded-full" : "rounded-2xl"}`} style={{ width: sh.s, height: sh.s, left: `${sh.x}%`, top: `${sh.y}%`, backgroundColor: sh.c, transform: `rotate(${sh.r}deg)`, animation: `elpino-float ${5 + i}s ease-in-out ${-i}s infinite` }} />
      ))}
      <span className={`${mono} absolute left-4 top-4 rounded-full border-2 border-[#11120f] bg-white px-2.5 py-1 text-[#11120f]`}>{post.category}</span>
    </div>
  );
}

function Meta({ post, light = false }: { post: BlogPost; light?: boolean }) {
  return (
    <p className={`flex items-center gap-2 text-[13px] ${light ? "text-white/80" : "text-[#11120f]/55"}`}>
      {prettyDate(post.date)}<span aria-hidden="true">·</span><Clock3 size={12} />{post.readTime}
    </p>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setMessage("");
    try {
      const response = await fetch("/api/newsletter", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await response.json().catch(() => null);
      if (response.ok && data?.ok) { setStatus("success"); setEmail(""); }
      else { setStatus("error"); setMessage(data?.error === "invalid_email" ? "That email looks off. Mind double-checking it?" : "That didn't send. Try again in a moment."); }
    } catch { setStatus("error"); setMessage("That didn't send. Try again in a moment."); }
  }

  return (
    <section id="subscribe" className="scroll-mt-24 bg-white px-5 pb-24 pt-4 sm:px-8">
      <Rv variant="pop">
        <div className={`${card} relative mx-auto max-w-6xl overflow-hidden px-6 py-14 text-white sm:px-12`} style={{ backgroundColor: BLUE }}>
          <div aria-hidden="true" className="absolute inset-0 opacity-[0.16]" style={dots} />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_1fr]">
            <div>
              <span className={`${mono} inline-flex items-center gap-1.5 rounded-full border-2 border-[#11120f] px-3 py-1.5 text-[#11120f]`} style={{ backgroundColor: YELLOW }}><Mail size={12} />The newsletter</span>
              <h2 className="mt-5 text-[clamp(2rem,4.4vw,3.2rem)] font-semibold leading-[1.03] tracking-[-0.045em]">One short letter. No noise.</h2>
              <p className="mt-3 max-w-[42ch] text-lg leading-8 text-white/90">Calmer support, thoughtful automation, and what we shipped. Unsubscribe any time.</p>
            </div>
            {status === "success" ? (
              <div className={`${card} flex items-center gap-4 bg-white p-6 text-[#11120f]`}><span className="grid size-12 place-items-center rounded-full border-2 border-[#11120f]" style={{ backgroundColor: GREEN }}><Check size={22} color="#fff" strokeWidth={3} /></span><div><p className="text-xl font-semibold">You&apos;re on the list.</p><p className="text-[15px] text-[#11120f]/60">Watch your inbox.</p></div></div>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
                <label htmlFor="blog-newsletter-email" className="sr-only">Email address</label>
                <input id="blog-newsletter-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="h-13 min-w-0 flex-1 rounded-full border-2 border-[#11120f] bg-white px-6 text-[16px] text-[#11120f] outline-none placeholder:text-[#11120f]/40 focus:bg-[#fff6cf]" />
                <button type="submit" disabled={status === "sending"} className="inline-flex h-13 items-center justify-center gap-2 rounded-full border-2 border-[#11120f] px-7 font-semibold text-[#11120f] transition hover:-translate-y-0.5 disabled:opacity-60" style={{ backgroundColor: YELLOW }}>{status === "sending" ? "Sending…" : "Subscribe"}<ArrowRight size={16} /></button>
                {status === "error" && <p role="alert" className="text-sm font-medium text-white sm:absolute sm:mt-[3.75rem]">{message}</p>}
              </form>
            )}
          </div>
        </div>
      </Rv>
    </section>
  );
}

export function BlogClient({ posts }: { posts: BlogPost[] }) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");
  const sorted = useMemo(() => [...posts].sort((a, b) => b.date.localeCompare(a.date)), [posts]);
  const categories = useMemo(() => ["All", ...Array.from(new Set(sorted.map((p) => p.category)))], [sorted]);
  const counts = (c: string) => (c === "All" ? sorted.length : sorted.filter((p) => p.category === c).length);
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const visible = sorted.filter((p) => (cat === "All" || p.category === cat) && words.every((w) => `${p.title} ${p.excerpt} ${p.category}`.toLowerCase().includes(w)));
  const browsing = !words.length && cat === "All";
  const featured = browsing ? visible[0] : null;
  const list = browsing ? visible.slice(1) : visible;

  return (
    <main className="font-[family-name:var(--font-rethink-sans)] text-[#11120f]">
      <section className="relative isolate overflow-hidden bg-white">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-cover bg-top" style={{ backgroundImage: "url(/piliar-1-grandient.png)", maskImage: "linear-gradient(to bottom, #000 55%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, #000 55%, transparent)" }} />
        <div className="mx-auto max-w-6xl px-5 pb-14 pt-[124px] sm:px-8 lg:pt-[140px]">
          <div className="max-w-3xl">
            <Rv variant="drop"><span className={`${mono} inline-flex items-center gap-1.5 rounded-full border-2 border-[#11120f] px-3 py-1.5`} style={{ backgroundColor: YELLOW }}><Sparkles size={13} />The Elpino blog</span></Rv>
            <Rv delay={80}><h1 className="mt-6 text-[clamp(2.9rem,7vw,5.8rem)] font-semibold leading-[0.96] tracking-[-0.058em]">Notes on <span className="hl">calmer support.</span></h1></Rv>
            <Rv delay={170}><p className="mt-6 max-w-[52ch] text-lg leading-8 text-[#11120f]/70">Guides, product notes and lessons from building Elpino.</p></Rv>
          </div>
          <Rv delay={240}>
            <div className="mt-9 flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className={`${card} flex max-w-md flex-1 items-center gap-3 bg-white px-4 py-3 focus-within:bg-[#fff6cf]`}>
                <Search size={19} aria-hidden="true" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search articles" aria-label="Search articles" className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-[#11120f]/40" />
                {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="grid size-7 place-items-center rounded-full border-2 border-[#11120f] bg-white"><X size={13} /></button>}
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => {
                  const on = cat === c;
                  const col = c === "All" ? INK : colorFor(c);
                  return <button key={c} type="button" onClick={() => setCat(c)} aria-pressed={on} className="rounded-full border-2 border-[#11120f] px-4 py-2 text-[14px] font-semibold transition hover:-translate-y-0.5" style={{ backgroundColor: on ? col : "#fff", color: on ? onDark(col) : INK }}>{c} <span className="opacity-60">{counts(c)}</span></button>;
                })}
              </div>
            </div>
          </Rv>
        </div>
      </section>

      <section className="bg-[#fff8ec] px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          {featured && (
            <Rv variant="deal">
              <Link href={`/blog/${featured.slug}`} className={`${card} group grid overflow-hidden bg-white transition duration-300 hover:-translate-y-1.5 md:grid-cols-[1.05fr_1fr]`}>
                <div className="border-b-2 border-[#11120f] md:border-b-0 md:border-r-2"><Cover post={featured} tall /></div>
                <div className="flex flex-col p-6 sm:p-8">
                  <span className={`${mono} w-fit rounded-full border-2 border-[#11120f] px-2.5 py-1 text-white`} style={{ backgroundColor: YELLOW, color: INK }}>Latest</span>
                  <h2 className="mt-4 text-[clamp(1.8rem,3.4vw,2.8rem)] font-semibold leading-[1.05] tracking-[-0.04em]">{featured.title}</h2>
                  <p className="mt-3 line-clamp-4 text-[17px] leading-8 text-[#11120f]/65">{featured.excerpt}</p>
                  <div className="mt-auto flex items-end justify-between gap-4 pt-6">
                    <Meta post={featured} />
                    <span className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-[#11120f] bg-[#ffd84d] transition-transform duration-300 group-hover:rotate-45"><ArrowUpRight size={19} /></span>
                  </div>
                </div>
              </Link>
            </Rv>
          )}

          {visible.length === 0 && (
            <div className={`${card} flex flex-col items-center bg-white px-6 py-14 text-center`}>
              <span className="grid size-16 place-items-center rounded-full border-2 border-[#11120f]" style={{ backgroundColor: YELLOW }}><SearchX size={28} /></span>
              <p className="mt-5 text-2xl font-semibold tracking-tight">No articles match</p>
              <button type="button" onClick={() => { setQuery(""); setCat("All"); }} className="mt-5 rounded-full border-2 border-[#11120f] bg-white px-5 py-2.5 font-semibold transition hover:bg-[#ffd84d]">Clear filters</button>
            </div>
          )}

          <div className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${featured ? "mt-8" : ""}`}>
            {list.map((p, i) => (
              <Rv key={p.slug} variant="deal" delay={(i % 3) * 90}>
                <Link href={`/blog/${p.slug}`} className={`${card} group flex h-full flex-col overflow-hidden bg-white transition duration-300 hover:-translate-y-2 hover:rotate-[-0.8deg]`}>
                  <Cover post={p} />
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-[21px] font-semibold leading-[1.15] tracking-[-0.025em]">{p.title}</h3>
                    <p className="mt-2 line-clamp-3 text-[15.5px] leading-7 text-[#11120f]/65">{p.excerpt}</p>
                    <div className="mt-auto flex items-center justify-between pt-5">
                      <Meta post={p} />
                      <ArrowUpRight size={18} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Link>
              </Rv>
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
    </main>
  );
}
