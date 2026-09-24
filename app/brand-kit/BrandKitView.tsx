"use client";

import Image from "next/image";
import { useCallback, useMemo, useRef, useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { Rv } from "@/app/components/RevealOnScroll";

// The Elpino brand kit, in Elpino's own style. Everything described here is
// what the site actually uses today: the sloth mark, the three logo files, the
// sticker palette on cream, and Rethink Sans + Inter + Geist Mono.

const INK = "#11120F";

// ------------------------------------------------------------ data

const PALETTE = [
  { name: "Ink", hex: "#11120F", role: "Text, outlines and the primary dark button." },
  { name: "White", hex: "#FFFFFF", role: "The canvas: clean, uncluttered space for content." },
  { name: "Cream", hex: "#FFF8EC", role: "Warm section backgrounds and soft surfaces." },
  { name: "Elpino Blue", hex: "#3784FF", role: "Primary actions and links. Our main call to action." },
  { name: "Sunny Yellow", hex: "#FFD84D", role: "Highlights, badges and the friendly second button." },
  { name: "Purple", hex: "#7060BD", role: "AI and product moments, and secondary accents." },
  { name: "Orange", hex: "#FC7B33", role: "A warm accent for people and handoffs." },
  { name: "Green", hex: "#1AA37A", role: "Success, verified and \"all good\" states." },
  { name: "Pink", hex: "#D9508A", role: "Used sparingly, for a little delight." },
];

const LOGOS = [
  { id: "wordmark", name: "Wordmark", file: "/logo_demo_transparent.png", download: "elpino-logo.png", w: 900, h: 274, note: "The horizontal logo. Black artwork on a transparent background.", invertOnDark: true },
  { id: "lockup", name: "Full-colour lockup", file: "/elpino.png", download: "elpino-lockup.png", w: 906, h: 275, note: "The original lockup, in full colour.", invertOnDark: false },
  { id: "mark", name: "The mark", file: "/elpino_slack.png", download: "elpino-mark.png", w: 380, h: 380, note: "The sloth mark on its own. For avatars, app icons and small spaces.", invertOnDark: false },
];

const BACKGROUNDS = [
  { id: "white", label: "White", css: "#FFFFFF", dark: false },
  { id: "cream", label: "Cream", css: "#FFF8EC", dark: false },
  { id: "blue", label: "Blue", css: "#3784FF", dark: true },
  { id: "ink", label: "Ink", css: "#11120F", dark: true },
];

const SLOTHS = [
  { src: "/desk_avatar1.png", name: "Pino at the desk", alt: "Pino the sloth at a desk" },
  { src: "/images/founders-sloth.png", name: "Founders", alt: "Sloth celebrating a milestone" },
  { src: "/images/busy-teams-sloth.png", name: "Busy teams", alt: "Sloth at a busy multi-monitor setup" },
  { src: "/images/blog/learning-sloth.png", name: "Learning", alt: "Sloth reading" },
  { src: "/images/contact-support-sloth.png", name: "Support", alt: "Sloth on a support headset" },
  { src: "/images/trust-sloth.png", name: "Trust", alt: "Sloth standing steady" },
];

const VOICE = [
  { name: "Plain", color: "#3784FF", text: "Short sentences, everyday words. If a customer or a support agent wouldn't say it out loud, we don't write it.", say: "We'll get back to you within one business day.", not: "Our team will endeavour to respond at the earliest opportunity." },
  { name: "Honest", color: "#FFD84D", ink: true, text: "We say when the AI is unsure and when a human is stepping in. We never dress automation up as something it isn't.", say: "I'm not sure about that one, so I'm bringing in a teammate.", not: "Our advanced AI has successfully resolved your inquiry!" },
  { name: "Calm", color: "#7060BD", text: "No urgency tricks, and no exclamation points doing the work a good sentence should already do.", say: "Your payment didn't go through. Here's a new link.", not: "URGENT: act now before it's too late!!!" },
];

const BOILERPLATE = [
  { label: "One line", text: "Elpino is an AI customer support platform that answers instantly and hands off to a human when it can't." },
  { label: "Short", text: "Elpino helps teams answer customers with AI grounded in their own knowledge, in one shared inbox with a chat widget, and hands the conversation to a person the moment it needs one." },
  { label: "Long", text: "Elpino is an AI customer support platform. Its agent answers questions from a company's own knowledge base, checks real account and payment data for verified customers, and hands the conversation to a teammate, with the full context, when a person is needed. Teams get a chat widget, a shared inbox, and controls over what the AI can and can't do." },
];

// ------------------------------------------------------------ helpers

function luminance(hex: string): number {
  const value = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function bestText(hex: string): { colour: string; label: string; ratio: number; grade: string } {
  const white = contrast(hex, "#FFFFFF");
  const ink = contrast(hex, INK);
  const useWhite = white > ink;
  const ratio = useWhite ? white : ink;
  return { colour: useWhite ? "#FFFFFF" : INK, label: useWhite ? "White text" : "Ink text", ratio, grade: ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : ratio >= 3 ? "AA large" : "Low" };
}

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const copy = useCallback((text: string, label = text) => {
    const done = () => {
      setCopied(label);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(null), 1800);
    };
    try {
      void navigator.clipboard.writeText(text).then(done, done);
    } catch {
      done();
    }
  }, []);
  return { copied, copy };
}

const DownloadIcon = () => <Download size={16} aria-hidden="true" />;

// ------------------------------------------------------------ parts

function Eyebrow({ n, children, color }: { n: string; children: string; color: string }) {
  return (
    <p className="flex items-center gap-3 font-mono text-[12px] font-medium uppercase tracking-[0.12em]" style={{ color }}>
      <span className="rounded-md border-2 border-[#11120f] px-1.5 py-0.5 text-[11px] font-bold" style={{ background: color, color: color === "#FFD84D" ? INK : "#fff" }}>{n}</span>
      {children}
    </p>
  );
}

// A die-cut sticker. Clicking it peels it up a little and copies its hex.
function Sticker({ swatch, index, onCopy, isCopied }: { swatch: (typeof PALETTE)[number]; index: number; onCopy: (hex: string) => void; isCopied: boolean }) {
  const text = bestText(swatch.hex);
  const tilt = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2"][index % 4];
  return (
    <Rv variant="pop" delay={(index % 5) * 80}>
      <button
        type="button"
        onClick={() => onCopy(swatch.hex)}
        aria-label={`Copy ${swatch.name} ${swatch.hex}`}
        className={`group relative block w-full text-left transition duration-300 ease-[cubic-bezier(0.3,1.5,0.5,1)] hover:-translate-y-2 hover:rotate-0 active:-translate-y-4 active:rotate-3 ${tilt}`}
      >
        {/* the backing sheet shows through where the sticker lifts */}
        <span aria-hidden="true" className="absolute inset-0 translate-y-1 rounded-[26px] border-2 border-dashed border-[#11120f]/25" />
        <span className="relative flex aspect-[4/5] flex-col justify-between rounded-[26px] border-2 border-[#11120f] p-5" style={{ background: swatch.hex, color: text.colour }}>
          <span aria-hidden="true" className="absolute right-4 top-4 h-5 w-5 rounded-full bg-white/40 [clip-path:polygon(0_0,100%_0,0_100%)]" />
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] opacity-75">{String(index + 1).padStart(2, "0")}</span>
          <span>
            <span className="block text-2xl font-medium tracking-[-0.03em]">{swatch.name}</span>
            <span className="mt-1 flex items-center gap-2 font-mono text-[13px] font-bold tracking-[0.04em]">
              {swatch.hex}
              <span className="rounded-md border-2 px-1.5 py-0.5 text-[10.5px]" style={{ borderColor: text.colour }}>{isCopied ? "Copied ✓" : "Copy"}</span>
            </span>
            <span className="mt-3 block text-[12.5px] leading-5 opacity-85">{swatch.role}</span>
            <span className="mt-3 block font-mono text-[10.5px] uppercase tracking-[0.08em] opacity-75">{text.label} · {text.ratio.toFixed(1)}:1 · {text.grade}</span>
          </span>
        </span>
      </button>
    </Rv>
  );
}

// ------------------------------------------------------------ page

export function BrandKitView() {
  const { copied, copy } = useCopy();
  const [bg, setBg] = useState(BACKGROUNDS[0].id);
  const stage = BACKGROUNDS.find((item) => item.id === bg) ?? BACKGROUNDS[0];
  const dots = useMemo(() => PALETTE.filter((swatch) => !["#FFFFFF", "#11120F"].includes(swatch.hex)), []);

  return (
    <main className="bg-white text-[#11120f]">
      {/* Toast */}
      <div role="status" aria-live="polite" className={`pointer-events-none fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 transition duration-300 ${copied ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
        <span className="inline-flex items-center gap-2 rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-5 py-2.5 text-sm font-semibold"><Check size={15} /> Copied {copied}</span>
      </div>

      {/* Hero */}
      <section className="relative isolate overflow-hidden pb-20 pt-[124px]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[url('/piliar-1-grandient.png')] bg-cover bg-top bg-no-repeat [mask-image:linear-gradient(to_bottom,black_75%,transparent)]" />
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="w-fit rounded-full border-2 border-[#11120f] bg-white px-4 py-1 font-mono text-[12px] font-medium uppercase tracking-[0.12em]">Brand kit</p>
            <h1 className="mt-5 animate-[elpino-focus_0.9s_ease-out_both] text-5xl font-normal leading-[1.02] tracking-[-0.045em] sm:text-7xl">
              Simple, <span className="hl-load">on purpose.</span>
            </h1>
            <p className="mt-6 max-w-xl animate-[elpino-focus_0.9s_ease-out_0.15s_both] text-lg leading-8 text-black/60">
              Logos, colours and type for Elpino, the AI customer support platform that answers instantly and hands off to a human when it can&apos;t. Everything here is free to use to write about us.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="/api/brand-kit" download="elpino-brand-kit.zip" className="group inline-flex h-12 items-center gap-2 rounded-full border-2 border-[#11120f] bg-[#3784ff] px-7 text-[15px] font-semibold text-white transition hover:-translate-y-0.5">
                <DownloadIcon /> Download all assets
              </a>
              <a href="#colour" className="inline-flex h-12 items-center rounded-full border-2 border-[#11120f] bg-white px-7 text-[15px] font-semibold transition hover:-translate-y-0.5">Jump to colours</a>
            </div>
            <div className="mt-8 flex flex-wrap gap-2.5 text-sm">
              <span className="rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-3.5 py-1.5 font-semibold">{LOGOS.length} logo files</span>
              <span className="rounded-full border-2 border-[#11120f] bg-white px-3.5 py-1.5">{PALETTE.length} colours</span>
              <span className="rounded-full border-2 border-[#11120f] bg-white px-3.5 py-1.5">3 typefaces</span>
            </div>
          </div>

          {/* the mark, with the palette orbiting it */}
          <div aria-hidden="true" className="relative mx-auto flex h-[320px] w-[320px] items-center justify-center sm:h-[380px] sm:w-[380px]">
            <span className="absolute inset-4 rounded-full border-2 border-dashed border-[#11120f]/35" />
            <div className="absolute inset-0 animate-[elpino-orbit_28s_linear_infinite]">
              {dots.map((swatch, index) => {
                const angle = (index / dots.length) * Math.PI * 2 - Math.PI / 2;
                return (
                  <span key={swatch.hex} className="absolute h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#11120f]" style={{ left: `${50 + Math.cos(angle) * 43}%`, top: `${50 + Math.sin(angle) * 43}%`, background: swatch.hex }} />
                );
              })}
            </div>
            <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-2 border-[#11120f] bg-white sm:h-56 sm:w-56">
              <Image src="/elpino_slack.png" alt="" width={190} height={190} priority className="h-32 w-32 object-contain sm:h-40 sm:w-40" />
            </div>
          </div>
        </div>
      </section>

      {/* 01 Logos */}
      <section id="logos" className="scroll-mt-16 bg-[#fff8ec] px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-[1200px]">
          <Rv className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <Eyebrow n="01" color="#3784FF">Logos</Eyebrow>
              <h2 className="mt-3 text-4xl font-normal tracking-[-0.045em] sm:text-6xl">Official <span className="hl">logos.</span></h2>
            </div>
            <p className="max-w-md text-base leading-7 text-black/60">Pick a background to see how each file looks on it, then download the one you need.</p>
          </Rv>

          <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Preview background">
            {BACKGROUNDS.map((item) => (
              <button key={item.id} type="button" aria-pressed={bg === item.id} onClick={() => setBg(item.id)} className={`inline-flex items-center gap-2 rounded-full border-2 border-[#11120f] px-4 py-2 text-[14px] font-semibold transition hover:-translate-y-0.5 ${bg === item.id ? "bg-[#ffd84d]" : "bg-white"}`}>
                <span className="h-4 w-4 rounded-full border-2 border-[#11120f]" style={{ background: item.css }} /> {item.label}
              </button>
            ))}
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {LOGOS.map((logo, index) => (
              <Rv key={logo.id} variant="deal" delay={index * 120}>
                <article className="group overflow-hidden rounded-[24px] border-2 border-[#11120f] bg-white transition duration-300 hover:-translate-y-1.5">
                  <div className="flex h-56 items-center justify-center border-b-2 border-[#11120f] p-8 transition-colors duration-500" style={{ background: stage.css }}>
                    <Image
                      src={logo.file}
                      alt={logo.name}
                      width={logo.w}
                      height={logo.h}
                      className={`max-h-full w-auto object-contain transition duration-500 ${logo.id === "mark" ? "h-36" : "h-16"} ${logo.invertOnDark && stage.dark ? "brightness-0 invert" : ""}`}
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-medium tracking-[-0.02em]">{logo.name}</h3>
                        <p className="mt-1 text-[13.5px] leading-5 text-black/55">{logo.note}</p>
                      </div>
                      <a href={logo.file} download={logo.download} aria-label={`Download ${logo.name}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[#11120f] bg-[#ffd84d] transition hover:-translate-y-0.5"><DownloadIcon /></a>
                    </div>
                    <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.08em] text-black/40">PNG · {logo.w} × {logo.h}</p>
                  </div>
                </article>
              </Rv>
            ))}
          </div>
          <p className="mt-5 text-sm leading-6 text-black/55">On dark backgrounds the wordmark is shown inverted to white. The file itself is black, so invert it the same way when you place it on dark colours.</p>
        </div>
      </section>

      {/* Logo usage */}
      <section className="bg-white px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-[1200px]">
          <Rv className="max-w-2xl">
            <Eyebrow n="02" color="#7060BD">Usage</Eyebrow>
            <h2 className="mt-3 text-4xl font-normal tracking-[-0.045em] sm:text-6xl">Giving the logo <span className="hl">room.</span></h2>
          </Rv>

          <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            {/* clear space */}
            <Rv variant="up">
              <div className="rounded-[24px] border-2 border-[#11120f] bg-[#fff8ec] p-6 sm:p-8">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-black/45">Clear space</p>
                <div className="mt-5 flex justify-center">
                  <div className="relative inline-block border-2 border-dashed border-[#3784ff] p-[44px]">
                    <span className="absolute inset-[44px] border-2 border-[#11120f]/25" aria-hidden="true" />
                    {["-left-px -top-px", "-right-px -top-px", "-bottom-px -left-px", "-bottom-px -right-px"].map((pos) => <span key={pos} aria-hidden="true" className={`absolute flex h-[44px] w-[44px] items-center justify-center font-mono text-[13px] font-bold text-[#3784ff] ${pos}`}>x</span>)}
                    <Image src="/logo_demo_transparent.png" alt="Elpino logo with clear space marked" width={900} height={274} className="relative h-[72px] w-auto" />
                  </div>
                </div>
                <p className="mt-5 text-[15px] leading-7 text-black/65"><b className="text-[#11120f]">x</b> is the height of the sloth mark&apos;s head. Keep at least one <b className="text-[#11120f]">x</b> free on every side, with no text, edges or other logos inside it.</p>
                <p className="mt-3 text-[15px] leading-7 text-black/65"><b className="text-[#11120f]">Minimum size:</b> we recommend not going below 24 px tall on screen.</p>
              </div>
            </Rv>

            {/* do */}
            <Rv variant="up" delay={120}>
              <div className="h-full rounded-[24px] border-2 border-[#11120f] bg-white p-6 sm:p-8">
                <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#1aa37a]"><span className="flex h-5 w-5 items-center justify-center rounded-md border-2 border-[#11120f] bg-[#1aa37a] text-white"><Check size={12} strokeWidth={3.5} /></span> Do</p>
                <div className="mt-5 flex h-32 items-center justify-center rounded-2xl border-2 border-[#11120f] bg-white"><Image src="/logo_demo_transparent.png" alt="Correct logo use" width={900} height={274} className="h-12 w-auto" /></div>
                <ul className="mt-5 space-y-2.5 text-[15px] leading-6 text-black/65">
                  <li>Use the files exactly as provided.</li>
                  <li>Put the black logo on white, cream or a light colour, and the inverted (white) logo on blue or ink.</li>
                  <li>Keep it on a calm background with strong contrast.</li>
                </ul>
              </div>
            </Rv>
          </div>

          {/* don't */}
          <Rv variant="up" className="mt-6">
            <div className="rounded-[24px] border-2 border-[#11120f] bg-white p-6 sm:p-8">
              <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#d9508a]"><span className="flex h-5 w-5 items-center justify-center rounded-md border-2 border-[#11120f] bg-[#d9508a] text-[11px] text-white">✕</span> Don&apos;t</p>
              <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-5">
                {[
                  { label: "Stretch or squash", style: { transform: "scaleX(1.6)" } },
                  { label: "Rotate or flip", style: { transform: "rotate(-14deg) scaleX(-1)" } },
                  { label: "Recolour", style: { filter: "hue-rotate(160deg) saturate(4)" } },
                  { label: "Add effects", style: { filter: "drop-shadow(4px 6px 3px rgba(0,0,0,0.6)) blur(0.6px)" } },
                  { label: "Place on busy imagery", style: {}, busy: true },
                ].map((item) => (
                  <figure key={item.label}>
                    <div className="relative flex h-24 items-center justify-center overflow-hidden rounded-xl border-2 border-[#11120f]" style={item.busy ? { background: "repeating-linear-gradient(45deg,#fc7b33 0 10px,#3784ff 10px 20px,#ffd84d 20px 30px,#7060bd 30px 40px)" } : { background: "#fffdf5" }}>
                      <Image src="/logo_demo_transparent.png" alt="" width={900} height={274} className="h-8 w-auto" style={item.style} />
                      <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center text-6xl font-bold text-[#d9508a]/70">✕</span>
                    </div>
                    <figcaption className="mt-2 text-[13px] leading-5 text-black/60">{item.label}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </Rv>
        </div>
      </section>

      {/* 03 Colour: the sticker sheet */}
      <section id="colour" className="scroll-mt-16 bg-[#fff8ec] px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-[1200px]">
          <Rv className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <Eyebrow n="03" color="#FC7B33">Colour</Eyebrow>
              <h2 className="mt-3 text-4xl font-normal tracking-[-0.045em] sm:text-6xl">A sheet of <span className="hl">stickers.</span></h2>
            </div>
            <p className="max-w-md text-base leading-7 text-black/60">Click a sticker to peel it off and copy its hex. Each shows the best text colour on top of it and how well it reads.</p>
          </Rv>

          <div className="mt-14 grid grid-cols-2 gap-5 rounded-[32px] border-2 border-dashed border-[#11120f]/40 bg-white/60 p-4 sm:gap-7 sm:p-8 lg:grid-cols-3 xl:grid-cols-5">
            {PALETTE.map((swatch, index) => (
              <Sticker key={swatch.hex} swatch={swatch} index={index} onCopy={(hex) => copy(hex)} isCopied={copied === swatch.hex} />
            ))}
            <Rv variant="pop" delay={400}>
              <button type="button" onClick={() => copy(PALETTE.map((swatch) => `${swatch.name}: ${swatch.hex}`).join("\n"), "the full palette")} className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-3 rounded-[26px] border-2 border-dashed border-[#11120f]/50 p-5 text-center transition hover:-translate-y-2 hover:bg-white">
                <Copy size={26} />
                <span className="text-lg font-medium tracking-[-0.02em]">Copy the whole palette</span>
                <span className="text-[12.5px] leading-5 text-black/55">Names and hex codes, one per line.</span>
              </button>
            </Rv>
          </div>
          <p className="mt-5 text-sm leading-6 text-black/55">Ratios are measured against white or ink text (WCAG). For body text, use combinations marked AA or better.</p>
        </div>
      </section>

      {/* 04 Type */}
      <section className="bg-white px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-[1200px]">
          <Rv className="max-w-2xl">
            <Eyebrow n="04" color="#1AA37A">Type</Eyebrow>
            <h2 className="mt-3 text-4xl font-normal tracking-[-0.045em] sm:text-6xl">Three <span className="hl">typefaces.</span></h2>
            <p className="mt-4 text-base leading-7 text-black/60">Clean, readable type for a product people scan quickly, not decode. All three are free on Google Fonts.</p>
          </Rv>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {[
              { role: "Headlines", name: "Rethink Sans", color: "#3784FF", cls: "font-display", sample: "Answers instantly. Hands off to a human.", href: "https://fonts.google.com/specimen/Rethink+Sans" },
              { role: "Body & interface", name: "Inter", color: "#FFD84D", ink: true, cls: "font-[family-name:var(--font-neue-haas)]", sample: "One shared inbox, a knowledge base your AI actually reads from, and a clean handoff to your team.", href: "https://fonts.google.com/specimen/Inter" },
              { role: "Labels & code", name: "Geist Mono", color: "#7060BD", cls: "font-mono", sample: "STEP 01 · VERIFIED · 10 MIN", href: "https://fonts.google.com/specimen/Geist+Mono" },
            ].map((face, index) => (
              <Rv key={face.name} variant="deal" delay={index * 120}>
                <article className="h-full overflow-hidden rounded-[24px] border-2 border-[#11120f] bg-white transition duration-300 hover:-translate-y-1.5">
                  <header className="flex items-center justify-between border-b-2 border-[#11120f] px-6 py-3" style={{ background: face.color, color: face.ink ? INK : "#fff" }}>
                    <span className="font-mono text-[12px] font-bold uppercase tracking-[0.12em]">{face.role}</span>
                    <span className="font-mono text-[12px] opacity-80">{String(index + 1).padStart(2, "0")}</span>
                  </header>
                  <div className="p-6">
                    <p className={`text-[88px] leading-none tracking-[-0.04em] ${face.cls}`}>Aa</p>
                    <h3 className="mt-3 text-2xl font-medium tracking-[-0.03em]">{face.name}</h3>
                    <p className={`mt-4 text-[17px] leading-7 text-black/70 ${face.cls}`}>{face.sample}</p>
                    <p className={`mt-5 text-[13px] leading-6 text-black/45 ${face.cls}`}>ABCDEFGHIJKLM NOPQRSTUVWXYZ<br />abcdefghijklm nopqrstuvwxyz<br />0123456789 !@#$%</p>
                    <a href={face.href} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex rounded-full border-2 border-[#11120f] bg-[#fff8ec] px-4 py-1.5 text-[13.5px] font-semibold transition hover:bg-[#ffd84d]">Get it on Google Fonts ↗</a>
                  </div>
                </article>
              </Rv>
            ))}
          </div>
        </div>
      </section>

      {/* 05 How we draw */}
      <section className="bg-[#fff8ec] px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-[1200px]">
          <Rv className="max-w-2xl">
            <Eyebrow n="05" color="#7060BD">Style</Eyebrow>
            <h2 className="mt-3 text-4xl font-normal tracking-[-0.045em] sm:text-6xl">How we <span className="hl">draw things.</span></h2>
            <p className="mt-4 text-base leading-7 text-black/60">Sticker-like shapes: a clear ink outline, flat colour, generous rounding and a little motion. Here are the building blocks.</p>
          </Rv>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Rv variant="up">
              <div className="h-full rounded-[24px] border-2 border-[#11120f] bg-white p-6 sm:p-8">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-black/45">Buttons</p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <span className="inline-flex h-12 items-center rounded-full border-2 border-[#11120f] bg-[#3784ff] px-7 text-[15px] font-semibold text-white">Primary</span>
                  <span className="inline-flex h-12 items-center rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-7 text-[15px] font-semibold">Friendly</span>
                  <span className="inline-flex h-12 items-center rounded-full border-2 border-[#11120f] bg-white px-7 text-[15px] font-semibold">Secondary</span>
                  <span className="inline-flex h-12 items-center rounded-full border-2 border-[#11120f] bg-[#11120f] px-7 text-[15px] font-semibold text-white">Dark</span>
                </div>
                <p className="mt-5 text-[14px] leading-6 text-black/55">Pills with a 2 px ink outline. They lift a little on hover.</p>
              </div>
            </Rv>
            <Rv variant="up" delay={100}>
              <div className="h-full rounded-[24px] border-2 border-[#11120f] bg-white p-6 sm:p-8">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-black/45">Badges, labels & stamps</p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <span className="rounded-full border-2 border-[#11120f] bg-white px-4 py-1 font-mono text-[12px] font-medium uppercase tracking-[0.12em]">Mono label</span>
                  <span className="-rotate-3 rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider">Sticker</span>
                  <span className="rotate-[-8deg] rounded-lg border-[3px] border-[#1aa37a] px-3 py-1 font-mono text-[14px] font-bold uppercase tracking-[0.16em] text-[#1aa37a]">Sent ✓</span>
                </div>
                <p className="mt-5 text-[14px] leading-6 text-black/55">Labels are Geist Mono in capitals. Stamps are outlined, tilted and never solid.</p>
              </div>
            </Rv>
            <Rv variant="up">
              <div className="h-full rounded-[24px] border-2 border-[#11120f] bg-white p-6 sm:p-8">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-black/45">The highlighter</p>
                <p className="mt-6 text-4xl font-normal leading-[1.1] tracking-[-0.04em]">A little better, <span className="hl-load">every release.</span></p>
                <p className="mt-5 text-[14px] leading-6 text-black/55">One phrase per headline gets a yellow marker line that draws itself in.</p>
              </div>
            </Rv>
            <Rv variant="up" delay={100}>
              <div className="h-full rounded-[24px] border-2 border-[#11120f] bg-white p-6 sm:p-8">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-black/45">Cards & surfaces</p>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="h-20 rounded-2xl border-2 border-[#11120f] bg-white" />
                  <div className="h-20 rounded-2xl border-2 border-[#11120f] bg-[#fff8ec]" />
                  <div className="relative h-20 overflow-hidden rounded-2xl border-2 border-[#11120f] bg-[#3784ff]"><span className="absolute inset-0 opacity-25" style={{ backgroundImage: "radial-gradient(#fff 1.4px, transparent 1.4px)", backgroundSize: "14px 14px" }} /></div>
                </div>
                <p className="mt-5 text-[14px] leading-6 text-black/55">Rounded 22–28 px, ink outline, flat colour. No hard drop shadows. A dot pattern adds texture on colour.</p>
              </div>
            </Rv>
          </div>
        </div>
      </section>

      {/* 06 The mascot */}
      <section className="bg-white px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-[1200px]">
          <Rv className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <Eyebrow n="06" color="#FC7B33">Mascot</Eyebrow>
              <h2 className="mt-3 text-4xl font-normal tracking-[-0.045em] sm:text-6xl">Meet <span className="hl">Pino.</span></h2>
            </div>
            <p className="max-w-md text-base leading-7 text-black/60">Sloths never rush bad code. Pino is calm, thorough and quietly helpful, and is the friendly face of the product.</p>
          </Rv>
          <div className="mt-12 grid grid-cols-2 gap-5 md:grid-cols-3">
            {SLOTHS.map((sloth, index) => (
              <Rv key={sloth.src} variant="deal" delay={(index % 3) * 100}>
                <figure className="group overflow-hidden rounded-[22px] border-2 border-[#11120f] bg-white transition duration-300 hover:-translate-y-1.5 hover:-rotate-[0.6deg]">
                  <div className="flex h-48 items-center justify-center bg-[linear-gradient(135deg,#eef4ff,#fff3e2)] p-4 sm:h-56">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={sloth.src} alt={sloth.alt} loading="lazy" className="h-full w-full object-contain transition duration-500 group-hover:scale-105" />
                  </div>
                  <figcaption className="flex items-center justify-between border-t-2 border-[#11120f] px-4 py-3 text-[14px] font-semibold">
                    {sloth.name}
                    <a href={sloth.src} download aria-label={`Download ${sloth.name}`} className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#11120f] bg-[#ffd84d] transition hover:-translate-y-0.5"><DownloadIcon /></a>
                  </figcaption>
                </figure>
              </Rv>
            ))}
          </div>
        </div>
      </section>

      {/* 07 Voice */}
      <section className="bg-[#11120f] px-5 py-20 text-[#fff8ec] sm:px-8 lg:py-28">
        <div className="mx-auto max-w-[1200px]">
          <Rv className="max-w-2xl">
            <p className="flex items-center gap-3 font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-[#ffd84d]"><span className="rounded-md border-2 border-[#fff8ec] px-1.5 py-0.5 text-[11px] font-bold">07</span> Voice</p>
            <h2 className="mt-3 text-4xl font-normal tracking-[-0.045em] sm:text-6xl">How we <span className="text-[#fc7b33]">sound.</span></h2>
          </Rv>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {VOICE.map((voice, index) => (
              <Rv key={voice.name} variant="deal" delay={index * 130}>
                <article className="h-full overflow-hidden rounded-[22px] border-2 border-[#fff8ec]/70">
                  <header className="border-b-2 border-[#11120f] px-6 py-4 text-2xl font-medium tracking-[-0.02em]" style={{ background: voice.color, color: voice.ink ? INK : "#fff" }}>{voice.name}</header>
                  <div className="space-y-4 p-6">
                    <p className="text-[15px] leading-6 text-[#fff8ec]/70">{voice.text}</p>
                    <div className="rounded-xl border-2 border-[#1aa37a] p-4"><p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#1aa37a]">Say this</p><p className="mt-1.5 text-[15px] leading-6">&ldquo;{voice.say}&rdquo;</p></div>
                    <div className="rounded-xl border-2 border-dashed border-[#d9508a]/70 p-4"><p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#d9508a]">Not this</p><p className="mt-1.5 text-[15px] leading-6 text-[#fff8ec]/60 line-through decoration-[#d9508a]/60">&ldquo;{voice.not}&rdquo;</p></div>
                  </div>
                </article>
              </Rv>
            ))}
          </div>
        </div>
      </section>

      {/* 08 Boilerplate */}
      <section className="bg-white px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-[1000px]">
          <Rv className="max-w-2xl">
            <Eyebrow n="08" color="#3784FF">About us</Eyebrow>
            <h2 className="mt-3 text-4xl font-normal tracking-[-0.045em] sm:text-6xl">Ready to <span className="hl">paste.</span></h2>
            <p className="mt-4 text-base leading-7 text-black/60">Writing about Elpino? Use whichever length fits.</p>
          </Rv>
          <div className="mt-12 space-y-5">
            {BOILERPLATE.map((item, index) => (
              <Rv key={item.label} variant="up" delay={index * 100}>
                <article className="rounded-[22px] border-2 border-[#11120f] bg-[#fffdf5] p-6 sm:p-7">
                  <div className="flex items-center justify-between gap-4">
                    <span className="rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-3 py-0.5 font-mono text-[11px] font-bold uppercase tracking-[0.1em]">{item.label}</span>
                    <button type="button" onClick={() => copy(item.text, "the text")} className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#11120f] bg-white px-4 py-1.5 text-[13.5px] font-semibold transition hover:-translate-y-0.5"><Copy size={14} /> Copy</button>
                  </div>
                  <p className="mt-4 text-[17px] leading-8 text-black/75">{item.text}</p>
                </article>
              </Rv>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy + download */}
      <section className="bg-white px-5 pb-24 sm:px-8">
        <Rv variant="pop" className="mx-auto max-w-[1200px]">
          <div className="relative isolate overflow-hidden rounded-[32px] border-2 border-[#11120f] bg-[#3784ff] px-7 py-14 text-white sm:px-14 sm:py-20">
            <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-25" style={{ backgroundImage: "radial-gradient(#fff 1.4px, transparent 1.4px)", backgroundSize: "22px 22px" }} />
            <span aria-hidden="true" className="elpino-stamp absolute right-6 top-6 hidden rotate-[-8deg] rounded-lg border-[3px] border-[#ffd84d] px-3 py-1 font-mono text-[14px] font-bold uppercase tracking-[0.16em] text-[#ffd84d] sm:block">Free to use</span>
            <p className="font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-white/80">Our design philosophy</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-normal leading-[1.05] tracking-[-0.04em] sm:text-6xl">Simple over complex. AI first, human when it matters. Clarity over noise.</h2>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="/api/brand-kit" download="elpino-brand-kit.zip" className="group inline-flex h-12 items-center gap-2 rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-7 text-[15px] font-semibold text-[#11120f] transition hover:-translate-y-0.5"><DownloadIcon /> Download all assets</a>
              <a href="mailto:hello@elpino.chat?subject=Brand%20question" className="inline-flex h-12 items-center rounded-full border-2 border-[#11120f] bg-white px-7 text-[15px] font-semibold text-[#11120f] transition hover:-translate-y-0.5">Ask about the brand</a>
            </div>
          </div>
        </Rv>
      </section>
    </main>
  );
}
