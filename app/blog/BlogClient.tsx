"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { ArrowRight, ArrowUpRight, Check, Clock3, Mail, Search, SearchX, X } from "lucide-react";
import { Rv } from "@/app/components/RevealOnScroll";
import type { BlogPost } from "./data";

// The blog index, laid out like a clean editorial feed: a plain title, the
// latest post featured full width, quiet category tabs, then a grid of the
// rest with "Show more posts" underneath. The visual language is the site's
// current one (home + pricing): thin borders, font-normal headlines with
// tight tracking, pastel washes instead of stickers, and a dark closing panel.

export const CATEGORY_COLOR: Record<string, string> = { Company: "#3784ff", Product: "#1aa37a", Guides: "#fc7b33" };
export const colorFor = (category: string) => CATEGORY_COLOR[category] ?? "#7060bd";

// The pastel wash behind each cover: derived from the same soft gradients the
// home page's product stages use, one per category.
const CATEGORY_WASH: Record<string, string> = {
  Company: "linear-gradient(200deg, #e4edff 0%, #d8e2ff 45%, #e7ddff 100%)",
  Product: "linear-gradient(200deg, #dff5ec 0%, #cfeedd 50%, #d9f1f4 100%)",
  Guides: "linear-gradient(200deg, #ffeeda 0%, #ffe3d1 50%, #ffe9ee 100%)",
};
const washFor = (category: string) => CATEGORY_WASH[category] ?? "linear-gradient(200deg, #ece7fb 0%, #e2dcf8 50%, #f3e4f1 100%)";

export function prettyDate(date: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${date}T00:00:00`));
}

function hash(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }

// A quiet generative cover: a pastel wash, a faint dot grid and two soft
// shapes whose positions come from the slug, so every post reads slightly
// differently without any hard borders. The category label sits on a small
// frosted pill in the corner.
export function Cover({ post, tall = false }: { post: BlogPost; tall?: boolean }) {
  const h = hash(post.slug);
  const shapes = [
    { s: 90 + (h % 70), x: 64 + ((h >> 4) % 18), y: -(h % 22), ring: true },
    { s: 60 + ((h >> 2) % 60), x: 6 + ((h >> 6) % 14), y: 58 + ((h >> 8) % 20), ring: false },
  ];
  return (
    <div className={`relative overflow-hidden ${tall ? "h-full min-h-[240px]" : "h-44"}`} style={{ backgroundImage: washFor(post.category) }} aria-hidden="true">
      <div className="absolute inset-0 opacity-[0.35]" style={{ backgroundImage: "radial-gradient(rgba(17,18,15,0.14) 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
      {shapes.map((sh, i) => (
        sh.ring
          ? <span key={i} className="absolute rounded-full border border-white/80" style={{ width: sh.s, height: sh.s, left: `${sh.x}%`, top: `${sh.y}%` }} />
          : <span key={i} className="absolute rounded-[2rem] bg-white/55" style={{ width: sh.s, height: sh.s, left: `${sh.x}%`, top: `${sh.y}%`, transform: `rotate(${((h >> 5) % 14) - 7}deg)` }} />
      ))}
      <span className="absolute bottom-4 left-5 inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#11120f] backdrop-blur">
        <span className="size-1.5 rounded-full" style={{ backgroundColor: colorFor(post.category) }} />
        {post.category}
      </span>
    </div>
  );
}

function CategoryLabel({ post }: { post: BlogPost }) {
  return (
    <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: colorFor(post.category) }}>
      <span className="size-1.5 rounded-full" style={{ backgroundColor: colorFor(post.category) }} aria-hidden="true" />
      {post.category}
    </p>
  );
}

function Meta({ post }: { post: BlogPost }) {
  return (
    <p className="flex items-center gap-2 text-[13px] text-black/50">
      {prettyDate(post.date)}<span aria-hidden="true">·</span><Clock3 size={12} aria-hidden="true" />{post.readTime}
    </p>
  );
}

const showMoreButton = "inline-flex h-12 items-center gap-2.5 rounded-full border border-black/40 bg-white px-6 text-sm font-medium transition hover:border-black";

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
    <section className="bg-white px-5 pb-24 pt-6 sm:px-8 lg:px-20">
      <Rv variant="pop">
        <div className="relative mx-auto max-w-[1500px] overflow-hidden rounded-tl-[2rem] bg-[#11120f] px-7 py-14 text-white sm:px-12 sm:py-20">
          <div aria-hidden="true" className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px)", backgroundSize: "20px 20px", maskImage: "radial-gradient(70% 90% at 80% 100%, #000 0%, transparent 75%)", WebkitMaskImage: "radial-gradient(70% 90% at 80% 100%, #000 0%, transparent 75%)" }} />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_1fr]">
            <div>
              <p className="flex items-center gap-2 text-[13px] font-medium text-white/60"><Mail size={14} aria-hidden="true" />The newsletter</p>
              <h2 className="mt-4 text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-5xl">One short letter.<br />No noise.</h2>
              <p className="mt-4 max-w-[46ch] text-base leading-7 text-white/65">Calmer support, thoughtful automation, and what we shipped. Unsubscribe any time.</p>
            </div>
            {status === "success" ? (
              <div className="flex items-center gap-4 rounded-[10px] border border-white/15 bg-white/[0.06] p-6">
                <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-[#1aa37a]"><Check size={22} strokeWidth={3} aria-hidden="true" /></span>
                <div>
                  <p className="text-xl font-medium tracking-[-0.02em]">You&apos;re on the list.</p>
                  <p className="mt-1 text-sm text-white/60">Watch your inbox.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
                <label htmlFor="blog-newsletter-email" className="sr-only">Email address</label>
                <input id="blog-newsletter-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="h-12 min-w-0 flex-1 rounded-full border border-white/25 bg-white px-6 text-[15px] text-[#11120f] outline-none placeholder:text-black/40 focus:border-white" />
                <button type="submit" disabled={status === "sending"} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#0078f4] px-7 text-[15px] font-medium text-white transition hover:bg-[#006bdb] disabled:opacity-60">
                  {status === "sending" ? "Sending…" : "Subscribe"}<ArrowRight size={16} aria-hidden="true" />
                </button>
                {status === "error" && <p role="alert" className="text-sm font-medium text-white/85 sm:absolute sm:mt-[3.75rem]">{message}</p>}
              </form>
            )}
          </div>
        </div>
      </Rv>
    </section>
  );
}

const PAGE_SIZE = 9;

export function BlogClient({ posts }: { posts: BlogPost[] }) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");
  const [shown, setShown] = useState(PAGE_SIZE);
  const sorted = useMemo(() => [...posts].sort((a, b) => b.date.localeCompare(a.date)), [posts]);
  const categories = useMemo(() => ["All", ...Array.from(new Set(sorted.map((p) => p.category)))], [sorted]);
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const visible = sorted.filter((p) => (cat === "All" || p.category === cat) && words.every((w) => `${p.title} ${p.excerpt} ${p.category}`.toLowerCase().includes(w)));
  const browsing = !words.length && cat === "All";
  const featured = browsing ? visible[0] : null;
  const rest = browsing ? visible.slice(1) : visible;
  const list = rest.slice(0, shown);
  const hasMore = rest.length > shown;

  return (
    <main className="bg-white font-[family-name:var(--font-rethink-sans)] text-[#11120f]">

      {/* ── Title ── */}
      <section className="px-5 pb-12 pt-14 sm:px-8 sm:pt-20 lg:px-20">
        <div className="mx-auto max-w-[1500px]">
          <Rv variant="drop">
            <h1 className="font-[family-name:var(--font-bricolage)] text-4xl font-normal tracking-[-0.045em] sm:text-6xl">Blog</h1>
          </Rv>
          <Rv delay={100}>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-black/60">Product updates, guides, and lessons from the Elpino team.</p>
          </Rv>
        </div>
      </section>

      {/* ── Featured post ── */}
      {featured && (
        <section className="px-5 sm:px-8 lg:px-20">
          <div className="mx-auto max-w-[1500px]">
            <Rv variant="deal">
              <Link href={`/blog/${featured.slug}`} className="group block overflow-hidden rounded-tl-[2rem] border border-black/20 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(17,18,15,0.10)]">
                <div className="aspect-[21/9] w-full sm:aspect-[21/8]">
                  <Cover post={featured} tall />
                </div>
                <div className="p-6 sm:p-10 lg:p-12">
                  <CategoryLabel post={featured} />
                  <h2 className="mt-4 max-w-3xl text-3xl font-normal leading-[1.08] tracking-[-0.035em] sm:text-5xl">{featured.title}</h2>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-black/60 sm:text-lg sm:leading-8">{featured.excerpt}</p>
                  <div className="mt-7 flex items-center justify-between gap-4">
                    <Meta post={featured} />
                    <span className="grid size-11 shrink-0 place-items-center rounded-full border border-black/20 transition group-hover:border-[#11120f] group-hover:bg-[#11120f] group-hover:text-white"><ArrowUpRight size={18} aria-hidden="true" /></span>
                  </div>
                </div>
              </Link>
            </Rv>
          </div>
        </section>
      )}

      {/* ── Category tabs + search ── */}
      <section className="px-5 pt-14 sm:px-8 lg:px-20">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by category">
            {categories.map((c) => {
              const on = cat === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => { setCat(c); setShown(PAGE_SIZE); }}
                  aria-pressed={on}
                  className={`h-10 rounded-full border px-5 text-sm font-medium transition ${on ? "border-[#11120f] bg-[#11120f] text-white" : "border-black/15 bg-white text-black/60 hover:border-black/50 hover:text-black"}`}
                >
                  {c}
                </button>
              );
            })}
          </div>
          <div className="flex h-11 w-full max-w-xs items-center gap-3 rounded-full border border-black/15 bg-white px-4 transition focus-within:border-black/50">
            <Search size={17} className="shrink-0 text-black/45" aria-hidden="true" />
            <input value={query} onChange={(e) => { setQuery(e.target.value); setShown(PAGE_SIZE); }} placeholder="Search articles" aria-label="Search articles" className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-black/40" />
            {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="grid size-6 shrink-0 place-items-center rounded-full border border-black/20"><X size={12} aria-hidden="true" /></button>}
          </div>
        </div>
      </section>

      {/* ── Post grid ── */}
      <section className="px-5 pb-16 pt-8 sm:px-8 lg:px-20">
        <div className="mx-auto max-w-[1500px]">
          {visible.length === 0 && (
            <div className="flex flex-col items-center rounded-[10px] border border-black/15 bg-white px-6 py-16 text-center">
              <span className="grid size-14 place-items-center rounded-lg border border-black/15 bg-[#f4f4f2]"><SearchX size={24} aria-hidden="true" /></span>
              <p className="mt-5 text-2xl font-normal tracking-[-0.02em]">No articles match</p>
              <button type="button" onClick={() => { setQuery(""); setCat("All"); setShown(PAGE_SIZE); }} className="mt-5 h-11 rounded-full border border-black/40 bg-white px-5 text-sm font-medium transition hover:border-black">Clear filters</button>
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p, i) => (
              <Rv key={p.slug} variant="deal" delay={(i % 3) * 90}>
                <Link href={`/blog/${p.slug}`} className="group flex h-full flex-col overflow-hidden rounded-[10px] border border-black/15 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(17,18,15,0.10)]">
                  <Cover post={p} />
                  <div className="flex flex-1 flex-col p-6">
                    <CategoryLabel post={p} />
                    <h3 className="mt-3 text-xl font-medium leading-[1.2] tracking-[-0.02em]">{p.title}</h3>
                    <p className="mt-2.5 line-clamp-3 text-[15px] leading-7 text-black/60">{p.excerpt}</p>
                    <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                      <Meta post={p} />
                      <ArrowUpRight size={17} aria-hidden="true" className="shrink-0 text-black/45 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Link>
              </Rv>
            ))}
          </div>

          {hasMore && (
            <div className="mt-12 flex justify-center">
              <button type="button" onClick={() => setShown((n) => n + PAGE_SIZE)} className={showMoreButton}>
                Show more posts
                <span aria-hidden="true">↓</span>
              </button>
            </div>
          )}
        </div>
      </section>

      <Newsletter />
    </main>
  );
}
