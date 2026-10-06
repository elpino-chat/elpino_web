"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Clock3, Link2, Mail, Share2 } from "lucide-react";
import { Rv } from "@/app/components/RevealOnScroll";
import type { BlogPost } from "../data";
import { relatedPosts } from "../data";
import { Cover, colorFor, prettyDate } from "../BlogClient";

// The article page, in the site's quiet editorial style (home + pricing +
// blog index): thin borders, font-normal headlines, pastel washes. The whole
// page spans the full width of the screen — full-bleed cover, full-width
// text column with a sticky share/progress rail on the right.

const BRAND_PATHS = {
  whatsapp: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z",
  x: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z",
  facebook: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  linkedin: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z",
  telegram: "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z",
  instagram: "M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z",
};

function BrandIcon({ d, size = 15 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

type ShareTarget = {
  key: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  external: boolean;
};

function buildShareTargets(post: BlogPost): ShareTarget[] {
  const url = window.location.href;
  const enc = encodeURIComponent;
  return [
    { key: "whatsapp", label: "WhatsApp", icon: <BrandIcon d={BRAND_PATHS.whatsapp} />, href: `https://wa.me/?text=${enc(`${post.title} — ${url}`)}`, external: true },
    { key: "x", label: "X (Twitter)", icon: <BrandIcon d={BRAND_PATHS.x} />, href: `https://twitter.com/intent/tweet?text=${enc(post.title)}&url=${enc(url)}`, external: true },
    { key: "facebook", label: "Facebook", icon: <BrandIcon d={BRAND_PATHS.facebook} />, href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`, external: true },
    { key: "linkedin", label: "LinkedIn", icon: <BrandIcon d={BRAND_PATHS.linkedin} />, href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`, external: true },
    { key: "telegram", label: "Telegram", icon: <BrandIcon d={BRAND_PATHS.telegram} />, href: `https://t.me/share/url?url=${enc(url)}&text=${enc(post.title)}`, external: true },
    { key: "email", label: "Email", icon: <Mail size={15} />, href: `mailto:?subject=${enc(post.title)}&body=${enc(`${post.excerpt}\n\n${url}`)}`, external: false },
  ];
}

const shareItem = "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13.5px] font-medium transition hover:bg-[#f4f4f2]";

function ShareMenu({ post, align, showToast, className }: { post: BlogPost; align: "left" | "right"; showToast: (message: string) => void; className: string }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  async function copyLink(message: string) {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast(message);
    } catch {
      showToast("Couldn't copy automatically — copy it from the address bar.");
    }
  }

  async function nativeShare() {
    setOpen(false);
    if (navigator.share) {
      try { await navigator.share({ title: post.title, text: post.excerpt, url: window.location.href }); } catch { /* user cancelled */ }
    }
  }

  async function shareInstagram() {
    // Instagram has no web share endpoint, so put the link on the clipboard and say so.
    setOpen(false);
    await copyLink("Link copied — paste it in your Instagram bio or story.");
  }

  // Built only while the menu is open: buildShareTargets reads window.location,
  // which does not exist while the page is prerendering on the server.
  const targets = open ? buildShareTargets(post) : [];

  return (
    <div ref={box} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu" className={className}>
        <Share2 size={15} />Share
      </button>
      {open && (
        <div role="menu" aria-label={`Share ${post.title}`} className={`absolute z-30 mt-2 w-56 origin-top overflow-hidden rounded-[10px] border border-black/15 bg-white p-1.5 shadow-[0_20px_45px_rgba(17,18,15,0.14)] ${align === "right" ? "right-0" : "left-0"}`}>
          {typeof navigator !== "undefined" && "share" in navigator && (
            <button type="button" role="menuitem" onClick={() => void nativeShare()} className={shareItem}>
              <Share2 size={15} />More options…
            </button>
          )}
          {targets.map((t) => (
            <a key={t.key} role="menuitem" href={t.href} {...(t.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} onClick={() => setOpen(false)} className={shareItem}>
              {t.icon}{t.label}
            </a>
          ))}
          <button type="button" role="menuitem" onClick={() => { setOpen(false); void copyLink("Link copied to clipboard."); }} className={shareItem}>
            <Link2 size={15} />Copy link
          </button>
          <button type="button" role="menuitem" onClick={() => { setOpen(false); void shareInstagram(); }} className={shareItem}>
            <BrandIcon d={BRAND_PATHS.instagram} />Instagram
          </button>
        </div>
      )}
    </div>
  );
}

// Renders **text** as bold; everything else stays plain text.
function withBold(text: string) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <strong key={i} className="font-semibold text-[#11120f]">{part}</strong> : part));
}

export function BlogPostClient({ post, allPosts }: { post: BlogPost; allPosts: BlogPost[] }) {
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
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

  useEffect(() => () => { if (toastTimer.current) window.clearTimeout(toastTimer.current); }, []);

  function showToast(message: string) {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2800);
  }

  const related = useMemo(() => relatedPosts(post, allPosts, 2), [post, allPosts]);
  const paragraphs = post.content.split("\n\n");

  return (
    <main className="bg-white font-[family-name:var(--font-rethink-sans)] text-[#11120f]">
      {/* Reading progress: one quiet hairline across the top of the screen. */}
      <div aria-hidden="true" className="fixed inset-x-0 top-0 z-[100] h-1 bg-black/[0.07]">
        <div className="h-full origin-left" style={{ width: `${progress * 100}%`, backgroundColor: accent }} />
      </div>

      <article>
        {/* ── Header: full width ── */}
        <header className="px-5 pb-10 pt-14 sm:px-8 sm:pt-20 lg:px-20">
          <Rv variant="drop">
            <Link href="/blog" className="inline-flex h-10 items-center gap-2 rounded-full border border-black/20 bg-white px-4 text-sm font-medium transition hover:border-black"><ArrowLeft size={14} aria-hidden="true" />All articles</Link>
          </Rv>
          <Rv delay={80}>
            <p className="mt-8 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: accent }}>
              <span className="size-1.5 rounded-full" style={{ backgroundColor: accent }} aria-hidden="true" />{post.category}
              <span className="font-normal normal-case tracking-normal text-black/50" aria-hidden="true">·</span>
              <span className="flex items-center gap-2 font-normal normal-case tracking-normal text-black/50">{prettyDate(post.date)}<span aria-hidden="true">·</span><Clock3 size={13} aria-hidden="true" />{post.readTime}</span>
            </p>
          </Rv>
          <Rv delay={140}><h1 className="mt-5 max-w-5xl text-4xl font-normal leading-[1.06] tracking-[-0.045em] sm:text-6xl">{post.title}</h1></Rv>
          <Rv delay={200}><p className="mt-6 max-w-3xl text-lg leading-8 text-black/60 sm:text-xl sm:leading-9">{post.excerpt}</p></Rv>
          <Rv delay={260}>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-full text-sm font-semibold text-white" style={{ backgroundColor: accent }}>{post.authorAvatar}</span>
                <div><p className="font-medium leading-tight">{post.authorName}</p><p className="text-[13.5px] leading-tight text-black/50">{post.authorRole}</p></div>
              </div>
              <div className="lg:hidden">
                <ShareMenu post={post} align="left" showToast={showToast} className="inline-flex h-10 items-center gap-2 rounded-full border border-black/20 bg-white px-4 text-sm font-medium transition hover:border-black" />
              </div>
            </div>
          </Rv>
        </header>

        {/* ── Cover: edge to edge ── */}
        <Rv variant="deal">
          <div className="h-[38vh] min-h-[280px] w-full sm:h-[52vh]">
            <Cover post={post} tall />
          </div>
        </Rv>

        {/* ── Body: full width, sticky rail on the right ── */}
        <div className="grid gap-12 px-5 py-14 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,1fr)_300px] lg:px-20 lg:py-20">
          <div className="min-w-0 space-y-8 text-[18px] leading-9 text-black/75">
            {/* Post content is plain text with three light markers: "## " starts a section heading, a block of
                "- " lines is a list, and **text** is bold. */}
            {paragraphs.map((p, i) => {
              if (p.startsWith("## ")) return <h2 key={i} className="pt-4 text-[28px] font-normal leading-tight tracking-[-0.03em] text-[#11120f]">{p.slice(3)}</h2>;
              const lines = p.split("\n");
              if (lines.every((line) => line.startsWith("- "))) {
                return <ul key={i} className="list-disc space-y-2 pl-6">{lines.map((line, j) => <li key={j}>{withBold(line.slice(2))}</li>)}</ul>;
              }
              return <p key={i} className={i === 0 ? "text-[21px] font-medium leading-9 text-[#11120f]" : ""}>{withBold(p)}</p>;
            })}

            <div className="relative !mt-14 overflow-hidden rounded-tl-[2rem] bg-[#11120f] p-8 text-white sm:p-10">
              <div aria-hidden="true" className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px)", backgroundSize: "20px 20px", maskImage: "radial-gradient(70% 90% at 80% 100%, #000 0%, transparent 75%)", WebkitMaskImage: "radial-gradient(70% 90% at 80% 100%, #000 0%, transparent 75%)" }} />
              <p className="relative text-2xl font-normal leading-snug tracking-[-0.02em] sm:text-3xl">Give your customers the answer before they finish typing.</p>
              <p className="relative mt-3 text-base leading-7 text-white/65">Start free with 100 AI messages a month. No card required.</p>
              <Link href="/signup" className="relative mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-[#0078f4] px-6 text-[15px] font-medium text-white transition hover:bg-[#006bdb]">Start free <ArrowRight size={16} aria-hidden="true" /></Link>
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-4">
              <ShareMenu post={post} align="right" showToast={showToast} className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-black/20 bg-white text-sm font-medium transition hover:border-black" />
              <div className="rounded-[10px] border border-black/15 bg-white p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-black/45">Progress</p>
                <p className="mt-1 text-3xl font-normal tabular-nums tracking-[-0.02em]">{Math.round(progress * 100)}<span className="text-lg text-black/50">%</span></p>
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-black/[0.07]">
                  <div className="h-full rounded-full" style={{ width: `${progress * 100}%`, backgroundColor: accent }} />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-black/10 px-5 py-16 sm:px-8 sm:py-20 lg:px-20">
          <h2 className="text-3xl font-normal tracking-[-0.035em] sm:text-4xl">Keep reading</h2>
          <div className="mt-9 grid gap-6 sm:grid-cols-2">
            {related.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="group flex flex-col overflow-hidden rounded-[10px] border border-black/15 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(17,18,15,0.10)]">
                <Cover post={p} />
                <div className="flex flex-1 flex-col p-6">
                  <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: colorFor(p.category) }}>
                    <span className="size-1.5 rounded-full" style={{ backgroundColor: colorFor(p.category) }} aria-hidden="true" />{p.category}
                  </p>
                  <h3 className="mt-3 text-xl font-medium leading-[1.2] tracking-[-0.02em]">{p.title}</h3>
                  <p className="mt-2.5 line-clamp-2 text-[15px] leading-7 text-black/60">{p.excerpt}</p>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                    <span className="flex items-center gap-2 text-[13px] text-black/50">{prettyDate(p.date)}<span aria-hidden="true">·</span><Clock3 size={12} aria-hidden="true" />{p.readTime}</span>
                    <ArrowUpRight size={17} aria-hidden="true" className="shrink-0 text-black/45 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {toast && (
        <div role="status" className="fixed bottom-6 left-1/2 z-[120] -translate-x-1/2 rounded-full bg-[#11120f] px-5 py-2.5 text-center text-sm font-medium text-white shadow-[0_20px_45px_rgba(17,18,15,0.25)]">
          {toast}
        </div>
      )}
    </main>
  );
}
