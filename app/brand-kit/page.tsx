import type { Metadata } from "next";
import Image from "next/image";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Brand Kit",
  description: "Download Elpino brand assets and explore our visual guidelines.",
  alternates: { canonical: `${SITE_URL}/brand-kit` },
  openGraph: {
    title: "Brand Kit",
    description: "Elpino brand assets and visual guidelines.",
    url: `${SITE_URL}/brand-kit`,
    type: "website",
  },
};

// Only one full-color lockup exists today — no separate light/dark variant —
// so the showcase only claims what's actually in /public.
const logos = [
  { name: "Primary logo", src: "/elpino.png", bg: "bg-white" },
  { name: "Icon / mark", src: "/elpino_slack.png", bg: "bg-[#FAF9F6]" },
];

const colors = [
  { name: "Black", hex: "#000000", description: "Text, primary buttons, and the footer background." },
  { name: "White", hex: "#FFFFFF", description: "The canvas. Clean, uncluttered space for content." },
  { name: "Elpino Blue", hex: "#2563EB", description: "Links, active states, and moments that need attention." },
  { name: "Warm Grey", hex: "#FAF9F6", description: "Soft surfaces for cards and secondary sections." },
];

const DownloadIcon = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 10H18L12 16L6 10H11V3H13V10ZM4 19H20V12H22V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V12H4V19Z"></path>
  </svg>
);

export default function BrandKitPage() {
  return (
    <main className="w-full bg-white text-black">
      {/* Hero */}
      <section className="border-b border-black/10 px-6 pb-20 pt-32 text-center sm:px-10 lg:px-14">
        <div className="mx-auto max-w-3xl">
          <span className="mb-6 inline-flex items-center rounded-full border border-[#DDDAD3] px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-black/60">
            Brand identity
          </span>
          <h1 className="font-display text-5xl font-normal leading-[1.1] tracking-[-0.045em] text-black sm:text-6xl">
            Simple, on purpose.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-black/60">
            Logos, colors, and type for Elpino — the AI customer support platform that answers
            instantly and hands off to a human when it can&apos;t.
          </p>
          <a
            href="/api/brand-kit"
            download="elpino-brand-kit.zip"
            className="mt-9 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-black px-7 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-black/85"
          >
            <DownloadIcon />
            Download all assets
          </a>
        </div>
      </section>

      {/* Logos */}
      <section className="border-b border-black/10 px-6 py-24 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12">
            <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.24em] text-black/40">01 — Logos</span>
            <h2 className="font-display text-3xl font-normal tracking-[-0.03em] text-black sm:text-4xl">Official logos</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {logos.map((logo) => (
              <div
                key={logo.name}
                className="overflow-hidden rounded-2xl border border-[#DDDAD3] bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(17,18,15,0.08)]"
              >
                <div className={`flex h-56 items-center justify-center border-b border-[#DDDAD3] p-10 ${logo.bg}`}>
                  <Image src={logo.src} alt={logo.name} width={200} height={50} className="object-contain" />
                </div>
                <div className="flex items-center justify-between px-6 py-5">
                  <div>
                    <h4 className="text-sm font-semibold text-black">{logo.name}</h4>
                    <span className="text-xs text-black/40">PNG</span>
                  </div>
                  <a
                    href={logo.src}
                    download
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DDDAD3] text-black transition hover:border-black/30 hover:bg-black/5"
                  >
                    <DownloadIcon />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Colors */}
      <section className="border-b border-black/10 bg-[#FAF9F6] px-6 py-24 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12">
            <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.24em] text-black/40">02 — Color</span>
            <h2 className="font-display text-3xl font-normal tracking-[-0.03em] text-black sm:text-4xl">Color palette</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {colors.map((color) => (
              <div
                key={color.hex}
                className="overflow-hidden rounded-2xl border border-[#DDDAD3] bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(17,18,15,0.08)]"
              >
                <div
                  className="h-28 w-full border-b border-[#DDDAD3]"
                  style={{ backgroundColor: color.hex }}
                ></div>
                <div className="p-6">
                  <h4 className="text-sm font-semibold text-black">{color.name}</h4>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-black/40">{color.hex}</p>
                  <p className="mt-3 text-sm leading-6 text-black/60">{color.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className="border-b border-black/10 px-6 py-24 sm:px-10 lg:px-14">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div>
            <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.24em] text-black/40">03 — Type</span>
            <h2 className="font-display mb-6 text-3xl font-normal tracking-[-0.03em] text-black sm:text-4xl">Typography</h2>
            <p className="mb-10 max-w-md text-base leading-relaxed text-black/60">
              Outfit carries headlines, Rethink Sans carries everything else — two clean, readable
              typefaces built for a product people scan quickly, not decode.
            </p>
            <div className="space-y-5">
              <div className="border-b border-[#DDDAD3] pb-4">
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-black/40">Headlines</span>
                <p className="font-display mt-1 text-2xl font-normal text-black">Outfit</p>
              </div>
              <div className="border-b border-[#DDDAD3] pb-4">
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-black/40">Body text</span>
                <p className="mt-1 text-lg text-black">Rethink Sans</p>
              </div>
              <div className="border-b border-[#DDDAD3] pb-4">
                <span className="text-xs font-medium uppercase tracking-[0.14em] text-black/40">Labels / status</span>
                <p className="mt-1 text-sm font-semibold uppercase tracking-[0.14em] text-black">Rethink Sans, small caps</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-[#DDDAD3] bg-[#FAF9F6] p-10">
            <p className="font-display text-[96px] font-normal leading-none text-black">Aa</p>
            <p className="mt-5 text-lg font-medium text-black">ABCDEFGHIJKLM<br />NOPQRSTUVWXYZ</p>
            <p className="mt-2 text-lg text-black/70">abcdefghijklm<br />nopqrstuvwxyz</p>
            <p className="mt-4 text-lg font-medium text-black">0123456789 !@#$%</p>
          </div>
        </div>
      </section>

      {/* Logo usage */}
      <section className="border-b border-black/10 px-6 py-24 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12">
            <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.24em] text-black/40">04 — Usage</span>
            <h2 className="font-display text-3xl font-normal tracking-[-0.03em] text-black sm:text-4xl">Logo usage</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#DDDAD3] bg-white p-8">
              <div className="mb-6 flex h-32 items-center justify-center rounded-xl bg-[#FAF9F6]">
                <Image src="/elpino.png" alt="Correct logo spacing" width={160} height={49} className="object-contain" />
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white">✓</span>
                <p className="text-sm leading-6 text-black/60">
                  Keep clear space around the logo equal to at least the height of the mark, and use
                  the light or dark version depending on the background.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-[#DDDAD3] bg-white p-8">
              <div className="mb-6 flex h-32 items-center justify-center rounded-xl bg-[#FAF9F6]">
                <Image src="/elpino.png" alt="Incorrect logo usage" width={160} height={49} className="object-contain opacity-40 grayscale" style={{ transform: "scaleX(-1) rotate(6deg)" }} />
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black/10 text-xs font-bold text-black/50">✕</span>
                <p className="text-sm leading-6 text-black/60">
                  Don&apos;t stretch, rotate, recolor, or add effects to the logo. It should always
                  appear exactly as provided in the assets above.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Voice & tone */}
      <section className="border-b border-black/10 bg-[#FAF9F6] px-6 py-24 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12">
            <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.24em] text-black/40">05 — Voice</span>
            <h2 className="font-display text-3xl font-normal tracking-[-0.03em] text-black sm:text-4xl">Voice & tone</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#DDDAD3] bg-white p-7">
              <h4 className="text-sm font-semibold text-black">Plain</h4>
              <p className="mt-3 text-sm leading-6 text-black/60">
                Short sentences, everyday words. If a customer or a support agent wouldn&apos;t say
                it out loud, we don&apos;t write it.
              </p>
            </div>
            <div className="rounded-2xl border border-[#DDDAD3] bg-white p-7">
              <h4 className="text-sm font-semibold text-black">Honest</h4>
              <p className="mt-3 text-sm leading-6 text-black/60">
                We say when the AI is unsure and when a human is stepping in — never dress up
                automation as something it isn&apos;t.
              </p>
            </div>
            <div className="rounded-2xl border border-[#DDDAD3] bg-white p-7">
              <h4 className="text-sm font-semibold text-black">Calm</h4>
              <p className="mt-3 text-sm leading-6 text-black/60">
                No urgency tricks, no exclamation points doing the work a good sentence should
                already do.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* UI elements */}
      <section className="border-b border-black/10 px-6 py-24 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12">
            <span className="mb-3 block text-xs font-semibold uppercase tracking-[0.24em] text-black/40">06 — Components</span>
            <h2 className="font-display text-3xl font-normal tracking-[-0.03em] text-black sm:text-4xl">UI elements</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#DDDAD3] bg-white p-8">
              <h4 className="mb-6 text-sm font-semibold uppercase tracking-[0.14em] text-black/40">Buttons</h4>
              <div className="flex flex-wrap items-center gap-4">
                <button className="inline-flex h-11 items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white">Primary</button>
                <button className="inline-flex h-11 items-center justify-center rounded-full border border-[#DDDAD3] bg-white px-6 text-sm font-semibold text-black">Secondary</button>
                <button className="inline-flex h-11 items-center justify-center rounded-full bg-black/5 px-6 text-sm font-semibold text-black">Subtle</button>
              </div>
            </div>
            <div className="rounded-2xl border border-[#DDDAD3] bg-white p-8">
              <h4 className="mb-6 text-sm font-semibold uppercase tracking-[0.14em] text-black/40">Badges & radius</h4>
              <div className="flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center rounded-full border border-[#DDDAD3] px-4 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-black/60">Pill badge</span>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#DDDAD3] bg-white text-xs font-semibold text-black/60">xl</span>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#DDDAD3] bg-white text-xs font-semibold text-black/60">full</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="px-6 py-28 text-center sm:px-10 lg:px-14">
        <div className="mx-auto max-w-3xl">
          <span className="mb-6 block text-xs font-semibold uppercase tracking-[0.24em] text-black/40">07 — Philosophy</span>
          <h2 className="font-display mb-10 text-3xl font-normal tracking-[-0.03em] text-black sm:text-4xl">Our design philosophy</h2>
          <p className="text-xl leading-relaxed text-black/60">
            Elpino is built on three pillars: <br />
            <span className="font-medium text-black">Simple over complex</span>, <br />
            <span className="font-medium text-black">AI first, human when it matters</span>, and <br />
            <span className="font-medium text-[#2563EB]">Clarity over noise</span>.
          </p>
        </div>
      </section>
    </main>
  );
}
