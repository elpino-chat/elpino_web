import Image from "next/image";
import Link from "next/link";
import { navGroups } from "./nav-data";

// Built from the same data as the header menus (nav-data.ts), so the footer
// can't drift from them.
const dedupe = (links: { label: string; href: string }[]) => links.filter((l, i) => links.findIndex((x) => x.href === l.href) === i);
const groupLinks = (label: string, skip: string[] = []) =>
  dedupe(navGroups.find((g) => g.label === label)?.sections.filter((s) => !skip.includes(s.title)).flatMap((s) => s.items) ?? []);
const columns = [
  { title: "Product", links: groupLinks("Product") },
  { title: "Solutions", links: groupLinks("Solutions") },
  { title: "Resources", links: groupLinks("Resources", ["Company"]) },
  { title: "Company", links: navGroups.find((g) => g.label === "Resources")?.sections.find((s) => s.title === "Company")?.items ?? [] },
];

// The strip that scrolls across the band above the links.
const ticker = ["AI answers from your own knowledge", "Human handoff, always free", "50 free AI conversations", "One shared inbox", "Live in an afternoon"];

const wordmark = "elpino".split("");

// Underline that draws itself from the left on hover.
const linkClass =
  "inline-block bg-[linear-gradient(#3784ff,#3784ff)] bg-[length:0%_2px] bg-left-bottom bg-no-repeat pb-0.5 text-[15px] leading-6 text-black/70 transition-[background-size,color] duration-300 hover:bg-[length:100%_2px] hover:text-black";

export function Footer({ editorial = false }: { editorial?: boolean }) {
  return (
    <footer className={`w-full bg-white text-[#11120f] ${editorial ? "font-[family-name:var(--font-rethink-sans)]" : ""}`}>
      {/* Call to action, with the mascot peeking up from the bottom edge */}
      <div className="mx-auto max-w-[1500px] px-5 pt-16 sm:px-8 lg:px-16">
        <div className="relative isolate overflow-hidden rounded-[32px] border-2 border-[#11120f] bg-[#3784ff] px-7 py-12 text-white sm:px-12 sm:py-16">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 opacity-25"
            style={{ backgroundImage: "radial-gradient(#fff 1.4px, transparent 1.4px)", backgroundSize: "22px 22px" }}
          />
          <p className="w-fit rounded-full border-2 border-[#11120f] bg-white px-3 py-1 font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-[#11120f]">Ready when you are</p>
          <h2 className="mt-5 max-w-2xl text-4xl font-normal leading-[1.05] tracking-[-0.045em] sm:text-6xl">Give every customer a helpful answer.</h2>
          <p className="mt-4 max-w-lg text-base leading-7 text-white/80">Start free with AI support, a shared inbox, and human handoff. No card needed.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className="group inline-flex h-12 items-center gap-2 rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-7 text-[15px] font-semibold text-[#11120f] transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              Start free <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
            <Link href="/pricing" className="inline-flex h-12 items-center rounded-full border-2 border-[#11120f] bg-white px-7 text-[15px] font-semibold text-[#11120f] transition hover:-translate-y-0.5">See pricing</Link>
          </div>
          {/* peek-a-boo */}
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-1 right-8 hidden h-40 w-40 animate-[elpino-peek_7s_cubic-bezier(0.3,1.3,0.5,1)_infinite] sm:block lg:right-20 lg:h-52 lg:w-52">
            <Image src="/icon.png" alt="" width={208} height={208} className="h-full w-full rounded-full border-2 border-[#11120f] bg-white object-contain p-4" />
          </div>
        </div>
      </div>

      {/* Ticker band */}
      <div aria-hidden="true" className="group/ticker mt-16 overflow-hidden border-y-2 border-[#11120f] bg-[#ffd84d] py-3">
        <div className="flex w-max animate-[elpino-marquee_38s_linear_infinite] group-hover/ticker:[animation-play-state:paused]">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center">
              {ticker.map((item) => (
                <span key={`${copy}-${item}`} className="flex items-center whitespace-nowrap font-mono text-[13px] font-medium uppercase tracking-[0.1em]">
                  <span className="px-7">{item}</span>
                  <span className="text-[#3784ff]">✺</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="bg-[#fff8ec]">
        <div className="mx-auto grid max-w-[1500px] gap-x-10 gap-y-12 px-5 py-16 sm:grid-cols-2 sm:px-8 lg:grid-cols-[repeat(4,minmax(0,1fr))_1.35fr] lg:px-16 lg:py-20">
          <nav aria-label="Footer navigation" className="contents">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="mb-5 flex items-center gap-2 font-mono text-[12px] font-medium uppercase tracking-[0.12em] text-black/50">
                  <span className="h-2 w-2 rounded-full border-2 border-[#11120f] bg-[#ffd84d]" aria-hidden="true" />
                  {column.title}
                </h3>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className={linkClass}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className="sm:col-span-2 lg:col-span-1 lg:pl-6">
            <Link href="/" aria-label="Elpino home" className="inline-flex"><Image src="/elpino.png" alt="Elpino" width={906} height={275} className="h-9 w-auto" /></Link>
            <p className="mt-6 max-w-xs text-[15px] leading-7 text-black/60">Elpino helps teams answer customers with AI grounded in their own knowledge, then hands conversations to a person when needed.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {[["Blog", "/blog"], ["Contact", "/contact"]].map(([label, href]) => (
                <Link key={label} href={href} className="rounded-full border-2 border-[#11120f] bg-white px-4 py-1.5 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-[#ffd84d]">{label} ↗</Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legal + wordmark: every letter hops when you touch it */}
      <div className="overflow-hidden bg-[#11120f] text-[#fff8ec]">
        <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-5 border-b border-white/15 px-5 py-6 text-xs text-white/60 sm:px-8 md:flex-row md:items-center lg:px-16">
          <span>© {new Date().getFullYear()} Elpino Inc. All rights reserved.</span>
          <div className="flex flex-wrap gap-x-7 gap-y-3">
            <Link href="/privacy" className="transition hover:text-white hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="transition hover:text-white hover:underline">Terms of Service</Link>
            <Link href="/security-policy" className="transition hover:text-white hover:underline">Security</Link>
          </div>
        </div>
        <p aria-hidden="true" className="select-none px-5 pt-6 text-center text-[clamp(96px,27vw,360px)] font-semibold leading-[0.78] tracking-[-0.06em] sm:px-8">
          {wordmark.map((letter, index) => (
            <span key={index} className="inline-block cursor-default text-white/[0.14] transition duration-300 ease-[cubic-bezier(0.3,1.6,0.5,1)] hover:-translate-y-[0.12em] hover:-rotate-[4deg] hover:text-[#ffd84d]">{letter}</span>
          ))}
        </p>
      </div>
    </footer>
  );
}
