"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight, Search, X } from "lucide-react";
import { BlogCover } from "../components/BlogCover";
import { useStoredLanguage } from "../hooks/useStoredLanguage";
import type { BlogPost } from "./data";

const categories = ["All", "Company", "Product", "Guides"] as const;
type Category = (typeof categories)[number];

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function dateLabel(date: string, language: string) {
  return new Intl.DateTimeFormat(language, { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${date}T00:00:00`));
}

function Rise({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function Meta({ post, language }: { post: BlogPost; language: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5d6872]">
      <span className="text-[#6c48a0]">{post.category}</span>
      <span aria-hidden="true">•</span>
      <span>{dateLabel(post.date, language)}</span>
      <span aria-hidden="true">•</span>
      <span>{post.readTime}</span>
    </div>
  );
}

function StoryLink({ post, language, delay = 0, tall = false }: { post: BlogPost; language: string; delay?: number; tall?: boolean }) {
  return (
    <Rise delay={delay}>
      <Link href={`/blog/${post.slug}`} className="group block min-w-0">
        <div className="overflow-hidden rounded-2xl bg-[#11120f] shadow-[0_20px_45px_-38px_rgba(23,24,28,0.7)]">
          <BlogCover
            category={post.category}
            title={post.title}
            slug={post.slug}
            aspectRatio="card"
            className={`${tall ? "h-[240px] sm:h-[280px]" : "h-[210px] sm:h-[240px]"} min-h-0 border-0 transition duration-500 group-hover:scale-[1.03]`}
          />
        </div>
        <div className="pt-5">
          <Meta post={post} language={language} />
          <h3 className="mt-3 text-[clamp(1.3rem,2vw,1.8rem)] font-medium leading-[1.05] tracking-[-0.045em] text-[#233d4d] transition group-hover:text-[#6c48a0]">
            {post.title}
          </h3>
          <p className="mt-3 line-clamp-2 max-w-xl text-sm leading-6 text-[#5d6872]">{post.excerpt}</p>
          <p className="mt-4 text-sm text-[#7b858c]">By {post.authorName}</p>
        </div>
      </Link>
    </Rise>
  );
}

function FeaturedStory({ post, language }: { post: BlogPost; language: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
    >
      <Link href={`/blog/${post.slug}`} className="group grid items-center gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
        <div className="overflow-hidden rounded-[24px] bg-[#11120f] shadow-[0_35px_80px_-50px_rgba(23,24,28,0.75)]">
          <BlogCover
            category={post.category}
            title={post.title}
            slug={post.slug}
            aspectRatio="hero"
            className="h-[280px] min-h-0 border-0 transition duration-500 group-hover:scale-[1.03] sm:h-[380px] lg:h-[440px]"
          />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="rounded-full bg-[#e7ddf3] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#5c416f]">Featured</span>
            <Meta post={post} language={language} />
          </div>
          <h2 className="mt-5 text-[clamp(2rem,3.6vw,3.4rem)] font-medium leading-[0.98] tracking-[-0.055em] text-[#233d4d] transition group-hover:text-[#6c48a0]">
            {post.title}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#53616b]">{post.excerpt}</p>
          <p className="mt-5 text-sm text-[#7b858c]">
            By {post.authorName} · {post.authorRole}
          </p>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#233d4d]">
            Read the story <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

function NewsletterStrip() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setMessage("");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => null);
      if (response.ok && data?.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data?.error === "invalid_email" ? "That email looks off — mind double-checking it?" : "That didn't send. Try again in a moment.");
      }
    } catch {
      setStatus("error");
      setMessage("That didn't send. Try again in a moment.");
    }
  }

  return (
    <Rise className="mt-20">
      <div className="relative overflow-hidden rounded-[28px] bg-[#233d4d] p-8 text-white sm:p-12">
        <div aria-hidden="true" className="absolute inset-0 opacity-[0.35] [background-image:radial-gradient(rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:20px_20px]" />
        <div aria-hidden="true" className="absolute -left-24 -top-24 size-72 rounded-full bg-[#7651b0]/40 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#d9bef4]">The newsletter</p>
            <h2 className="mt-4 text-3xl font-medium tracking-[-0.05em] sm:text-4xl">
              Calm support ops, <span className="font-[family-name:var(--font-instrument-serif)] font-normal italic text-[#d9bef4]">in your inbox.</span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/65">
              One short letter on calmer support operations and thoughtful automation. No noise, unsubscribe anytime.
            </p>
          </div>
          <form onSubmit={submit} className="w-full">
            <div className="flex flex-col gap-3 sm:flex-row">
              <label htmlFor="blog-newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="blog-newsletter-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                className="h-12 min-w-0 flex-1 rounded-full border border-white/25 bg-white/10 px-5 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-[#d9bef4] focus:ring-4 focus:ring-[#d9bef4]/20"
              />
              <button
                type="submit"
                disabled={status === "sending"}
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#d9bef4] px-7 text-sm font-semibold text-[#231c29] transition hover:bg-white disabled:opacity-60"
              >
                {status === "sending" ? "Sending…" : "Subscribe"}
              </button>
            </div>
            <p aria-live="polite" className={`mt-3 min-h-5 text-sm ${status === "error" ? "text-[#ffb9b9]" : "text-[#d9bef4]"}`}>
              {status === "success" ? "You're on the list — the next letter lands soon." : status === "error" ? message : ""}
            </p>
          </form>
        </div>
      </div>
    </Rise>
  );
}

export function BlogClient({ posts }: { posts: BlogPost[] }) {
  const language = useStoredLanguage();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const sortedPosts = useMemo(() => [...posts].sort((a, b) => b.date.localeCompare(a.date)), [posts]);
  const visiblePosts = useMemo(() => {
    const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return sortedPosts.filter((post) => (activeCategory === "All" || post.category === activeCategory) && words.every((word) => `${post.title} ${post.excerpt} ${post.category}`.toLowerCase().includes(word)));
  }, [activeCategory, query, sortedPosts]);
  const isBrowsing = !query && activeCategory === "All";
  const featured = sortedPosts[0];
  const secondary = sortedPosts.slice(1, 3);
  const rest = sortedPosts.slice(3);

  return (
    <div className="flex flex-1 flex-col bg-[#f6f4ef] font-[family-name:var(--font-rethink-sans)] text-[#233d4d]">
      <section className="relative px-5 pt-12 sm:px-8 sm:pt-16">
        <div className="mx-auto max-w-[1440px]">
          <div className="relative border-b border-[#233d4d]/20 pb-8">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="md:pr-56 lg:pr-80"
            >
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#6c48a0]">Notes from Elpino</p>
              <h1 className="mt-3 text-[clamp(3.75rem,10vw,9.5rem)] font-medium leading-[0.8] tracking-[-0.09em]">
                Shortcut<span className="text-[#7651b0]">.</span>
              </h1>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12, ease: EASE }}
              className="mt-6 flex max-w-md flex-col items-start gap-4"
            >
              <p className="text-base leading-7 text-[#53616b]">
                A field guide to <span className="font-[family-name:var(--font-instrument-serif)] text-lg italic text-[#667b55]">calmer support</span>, thoughtful automation, and the people building them.
              </p>
              <a href="#subscribe" className="inline-flex items-center gap-2 text-sm font-semibold text-[#6c48a0] transition hover:text-[#5c416f]">
                Get new stories by email <ArrowDown size={15} className="transition-transform hover:translate-y-0.5" />
              </a>
            </motion.div>
            <Image
              src="/images/blog/learning-sloth.png"
              alt=""
              width={1145}
              height={1374}
              priority
              className="pointer-events-none absolute bottom-0 right-0 hidden w-48 select-none rotate-2 drop-shadow-[0_18px_25px_rgba(23,24,28,0.22)] md:block lg:w-72"
            />
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="flex flex-col gap-5 py-5 lg:flex-row lg:items-center lg:justify-between"
          >
            <nav aria-label="Blog categories" className="flex flex-wrap gap-x-5 gap-y-2">
              {categories.map((category) => (
                <button key={category} type="button" onClick={() => setActiveCategory(category)} className="relative pb-1 text-sm font-semibold transition">
                  <span className={activeCategory === category ? "text-[#233d4d]" : "text-[#71808a] transition hover:text-[#233d4d]"}>
                    {category === "All" ? "Latest" : category}
                  </span>
                  {activeCategory === category && (
                    <motion.span layoutId="blog-nav-underline" className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-[#6c48a0]" transition={{ duration: 0.35, ease: EASE }} />
                  )}
                </button>
              ))}
            </nav>
            <label className="relative block w-full lg:w-72">
              <Search size={16} className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-[#71808a]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="search"
                aria-label="Search articles"
                placeholder="Search articles"
                className="h-9 w-full border-b border-[#233d4d]/35 bg-transparent pl-7 pr-7 text-sm outline-none placeholder:text-[#71808a] focus:border-[#7651b0]"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-0 top-1/2 -translate-y-1/2 text-[#71808a] hover:text-[#233d4d]">
                  <X size={15} />
                </button>
              )}
            </label>
          </motion.div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-[1440px] px-5 pb-20 pt-4 sm:px-8 sm:pb-24 sm:pt-6">
        {isBrowsing ? (
          <>
            {featured && (
              <section aria-label="Featured story" className="border-b border-[#233d4d]/20 pb-14 sm:pb-16">
                <FeaturedStory post={featured} language={language} />
              </section>
            )}
            {secondary.length > 0 && (
              <section aria-label="More featured stories" className="grid gap-x-6 gap-y-12 border-b border-[#233d4d]/20 py-14 sm:py-16 md:grid-cols-2">
                {secondary.map((post, index) => (
                  <StoryLink key={post.slug} post={post} language={language} delay={index * 0.08} tall />
                ))}
              </section>
            )}
            {rest.length > 0 && (
              <section className="pt-14 sm:pt-16">
                <div className="flex items-end justify-between border-b border-[#233d4d]/20 pb-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#6c48a0]">The latest</p>
                    <h2 className="mt-2 text-4xl font-medium tracking-[-0.055em] sm:text-5xl">Keep exploring</h2>
                  </div>
                  <span className="hidden text-sm text-[#71808a] sm:block">
                    {rest.length} more {rest.length === 1 ? "story" : "stories"}
                  </span>
                </div>
                <div className="grid gap-x-6 gap-y-12 pt-10 md:grid-cols-2 xl:grid-cols-3">
                  {rest.map((post, index) => (
                    <StoryLink key={post.slug} post={post} language={language} delay={Math.min(index * 0.06, 0.3)} />
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <section aria-live="polite" className="pt-10 sm:pt-14">
            <div className="flex items-end justify-between border-b border-[#233d4d]/20 pb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#6c48a0]">{query ? "Search results" : activeCategory}</p>
                <h2 className="mt-2 text-4xl font-medium tracking-[-0.055em] sm:text-5xl">
                  {visiblePosts.length} {visiblePosts.length === 1 ? "story" : "stories"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setActiveCategory("All");
                }}
                className="text-sm font-semibold underline underline-offset-4"
              >
                Reset filters
              </button>
            </div>
            {visiblePosts.length ? (
              <div className="grid gap-x-6 gap-y-12 pt-10 md:grid-cols-2 xl:grid-cols-3">
                {visiblePosts.map((post, index) => (
                  <StoryLink key={post.slug} post={post} language={language} delay={Math.min(index * 0.06, 0.3)} />
                ))}
              </div>
            ) : (
              <div className="py-24 text-center">
                <p className="text-2xl font-medium tracking-[-0.04em]">No stories found.</p>
                <p className="mt-2 text-sm text-[#5d6872]">Try another phrase or browse all articles.</p>
              </div>
            )}
          </section>
        )}

        <NewsletterStrip />
      </main>
    </div>
  );
}
