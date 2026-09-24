import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type FeaturePill = {
  title: string;
  description: string;
  icon?: LucideIcon;
  badge?: string;
};

export type ProductFeaturePageProps = {
  category?: string;
  showCategoryBadge?: boolean;
  title: string;
  highlightedTitle?: string;
  highlightGradient?: string;
  description: string;
  heroTheme?: "dark" | "light" | "white" | "gradient" | "black";
  heroBackgroundImage?: string;
  align?: "center" | "left";
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  heroPreview?: ReactNode;
  features: FeaturePill[];
  deepDiveTitle?: string;
  deepDiveDescription?: string;
  deepDiveItems?: {
    title: string;
    description: string;
    icon: LucideIcon;
    accentColor?: string;
  }[];
  stats?: {
    value: string;
    label: string;
  }[];
  faqItems?: {
    q: string;
    a: string;
  }[];
};

export function ProductFeatureLayout({
  category,
  showCategoryBadge = true,
  title,
  highlightedTitle,
  highlightGradient = "from-[#ff9357] via-[#d9bef4] to-[#58a9ff]",
  description,
  heroTheme = "black",
  heroBackgroundImage,
  align = "center",
  primaryCtaText = "Start for free",
  primaryCtaHref = "/signup",
  secondaryCtaText = "See all features",
  secondaryCtaHref = "/features",
  heroPreview,
  features,
  deepDiveTitle = "Engineered for resolution",
  deepDiveDescription = "Everything your AI and support team need to keep customer inquiries moving.",
  deepDiveItems,
  stats = [
    { value: "< 1.5s", label: "Average AI reply speed" },
    { value: "100%", label: "Verified source attribution" },
    { value: "0", label: "Surprise overage fees" },
    { value: "24/7", label: "Continuous coverage" },
  ],
  faqItems,
}: ProductFeaturePageProps) {
  const isWhiteHero = heroTheme === "white" || heroTheme === "light";
  const isLeftAlign = align === "left";
  const hasBadge = showCategoryBadge && Boolean(category);

  return (
    <div className="overflow-hidden bg-white font-[family-name:var(--font-rethink-sans)] text-[#17191c]">
      {/* 1. HERO SECTION */}
      <section
        className={`relative overflow-hidden ${
          isWhiteHero
            ? "border-b border-[#17191c]/10 bg-white py-8 sm:py-12 text-[#17191c]"
            : "bg-black pb-16 pt-12 sm:pb-24 sm:pt-16 lg:pt-20 text-white"
        }`}
      >
        {/* Full-bleed Hero Background Image */}
        {heroBackgroundImage && (
          <div 
            className="absolute inset-0 z-0" 
            style={{ 
              backgroundImage: `url(${heroBackgroundImage})`, 
              backgroundSize: "cover", 
              backgroundPosition: "center" 
            }}
          >
            <div className={`absolute inset-0 ${isWhiteHero ? "bg-white/80" : "bg-black/60"} backdrop-blur-sm`} />
          </div>
        )}

        {/* Ambient Gradient Mesh for Dark / Black Background (if no background image) */}
        {!isWhiteHero && !heroBackgroundImage && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden z-0">
            <div className="absolute -top-32 left-[15%] h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(133,87,232,0.22)_0%,transparent_65%)] blur-3xl" />
            <div className="absolute top-0 right-[15%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(22,140,255,0.18)_0%,transparent_65%)] blur-3xl" />
            <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 h-[350px] w-[650px] rounded-full bg-[radial-gradient(circle,rgba(255,96,56,0.15)_0%,transparent_65%)] blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
            />
          </div>
        )}

        {hasBadge && (
          <div className={`relative mx-auto flex max-w-7xl px-5 sm:px-8 ${isLeftAlign ? "justify-start" : "justify-center"}`}>
            <div
              className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-medium backdrop-blur-md ${
                isWhiteHero
                  ? "border border-[#17191c]/10 bg-[#f4f2ee] text-[#17191c]"
                  : "border border-white/20 bg-white/10 text-white"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isWhiteHero ? "bg-black" : "bg-[#168cff]"}`} />
              <span>Elpino / {category}</span>
            </div>
          </div>
        )}

        <div className={`relative mx-auto max-w-7xl px-5 sm:px-8 ${hasBadge ? (isWhiteHero ? "pt-4" : "pt-6") : "pt-1"} ${isLeftAlign ? "text-left" : "text-center"}`}>
          <div className={isLeftAlign ? "max-w-4xl" : "mx-auto max-w-4xl"}>
            <h1
              className={`text-[clamp(2.4rem,4.8vw,4.8rem)] font-normal leading-[1.02] tracking-[-0.04em] ${
                isWhiteHero ? "text-[#11120f]" : "text-white"
              }`}
            >
              {title}{" "}
              {highlightedTitle && (
                <span
                  className={
                    isWhiteHero
                      ? "text-[#11120f] font-medium"
                      : `bg-gradient-to-r ${highlightGradient} bg-clip-text text-transparent font-medium`
                  }
                >
                  {highlightedTitle}
                </span>
              )}
            </h1>
            <p
              className={`max-w-[54ch] text-base leading-7 sm:text-lg sm:leading-8 ${
                isWhiteHero ? "mt-3 text-[#17191c]/70" : "mt-5 text-white/70"
              } ${isLeftAlign ? "" : "mx-auto"}`}
            >
              {description}
            </p>

            <div className={`flex flex-col gap-3 sm:flex-row ${isWhiteHero ? "mt-5" : "mt-7"} ${isLeftAlign ? "items-start justify-start" : "items-center justify-center"}`}>
              <Link
                href={primaryCtaHref}
                className={`group inline-flex h-11 min-h-11 items-center justify-center gap-2 rounded-md px-6 text-[15px] font-semibold transition duration-200 hover:brightness-95 active:translate-y-px ${
                  isWhiteHero
                    ? "bg-[#11120f] text-white hover:bg-black/85"
                    : "bg-gradient-to-r from-[#ff6038] to-[#ff7d45] text-white shadow-[0_4px_20px_rgba(255,96,56,0.3)] hover:brightness-110"
                }`}
              >
                {primaryCtaText} <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href={secondaryCtaHref}
                className={`inline-flex h-11 min-h-11 items-center justify-center rounded-md px-6 text-[15px] font-semibold transition ${
                  isWhiteHero
                    ? "border border-[#17191c]/20 text-[#17191c] hover:border-[#17191c] hover:bg-black/5"
                    : "border border-white/25 text-white hover:bg-white/10 hover:border-white/40"
                }`}
              >
                {secondaryCtaText}
              </Link>
            </div>
            <p className={`text-xs ${isWhiteHero ? "mt-2.5 text-[#17191c]/45" : "mt-3.5 text-white/45"}`}>
              50 AI conversations free each month · No credit card required
            </p>
          </div>
        </div>

        {/* Hero Mockup Preview */}
        {heroPreview && (
          <div className={`relative mx-auto max-w-5xl px-5 sm:px-8 ${isWhiteHero ? "mt-6" : "mt-10"}`}>
            {!isWhiteHero && (
              <div
                aria-hidden="true"
                className="absolute -inset-8 -z-10 rounded-[40px] bg-[radial-gradient(circle_at_30%_20%,rgba(255,96,56,0.2)_0%,transparent_50%),radial-gradient(circle_at_70%_30%,rgba(133,87,232,0.22)_0%,transparent_50%),radial-gradient(circle_at_50%_90%,rgba(22,140,255,0.18)_0%,transparent_50%)] blur-2xl"
              />
            )}
            <div
              className={`overflow-hidden rounded-2xl p-1 shadow-[0_25px_80px_rgba(0,0,0,0.6)] ${
                isWhiteHero ? "border border-[#e5e7eb] bg-white" : "border border-white/15 bg-[#0f1117]/95 backdrop-blur-xl"
              }`}
            >
              {heroPreview}
            </div>
          </div>
        )}
      </section>

      {/* 2. STATS BAR */}
      <section className="border-y border-[#17191c]/10 bg-[#f7f5f0] px-5 py-12 sm:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 text-center md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <span className="block text-3xl font-semibold tracking-tight text-[#17191c] sm:text-4xl">{stat.value}</span>
              <span className="mt-1 block text-xs uppercase tracking-wider text-[#17191c]/50">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. CAPABILITIES GRID */}
      <section className="bg-[#fffdfa] px-5 py-24 sm:px-8 sm:py-32 lg:px-[4.2vw]">
        <div className="mx-auto max-w-[1400px]">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ff6038]">Key capabilities</p>
            <h2 className="mx-auto mt-4 max-w-[800px] text-[clamp(2.4rem,4.5vw,4.5rem)] font-medium leading-tight tracking-[-0.045em]">
              {deepDiveTitle}
            </h2>
            <p className="mx-auto mt-5 max-w-[550px] text-base leading-7 text-[#17191c]/60">
              {deepDiveDescription}
            </p>
          </div>

          <div className="mt-16 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {features.map((item, idx) => {
              const Icon = item.icon ?? Sparkles;
              return (
                <div
                  key={item.title}
                  className="group flex flex-col justify-between rounded-2xl border border-[#17191c]/10 bg-white p-7 shadow-xs transition hover:border-[#17191c]/30 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-[#edf4ff] text-[#168cff]">
                        <Icon size={20} />
                      </span>
                      {item.badge && (
                        <span className="rounded-full bg-[#168cff]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#168cff]">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-[#17191c]">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#17191c]/60">{item.description}</p>
                  </div>
                  <div className="mt-6 flex items-center gap-1.5 border-t border-[#17191c]/5 pt-4 text-xs font-semibold text-[#168cff]">
                    <span>Included in all plans</span>
                    <Check size={14} className="ml-auto" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. DEEP DIVE HIGHLIGHTS */}
      {deepDiveItems && deepDiveItems.length > 0 && (
        <section className="bg-[#f4f1eb] px-5 py-24 sm:px-8 sm:py-32 lg:px-[4.2vw]">
          <div className="mx-auto max-w-[1400px]">
            <div className="text-center">
              <h2 className="text-3xl font-medium tracking-tight text-[#17191c] sm:text-4xl">
                How it works in practice
              </h2>
            </div>
            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {deepDiveItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl bg-white p-8 shadow-xs">
                    <span
                      className="flex size-11 items-center justify-center rounded-xl text-white"
                      style={{ backgroundColor: item.accentColor ?? "#ff6038" }}
                    >
                      <Icon size={20} />
                    </span>
                    <h3 className="mt-6 text-xl font-semibold text-[#17191c]">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#17191c]/65">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 5. FAQ SECTION */}
      {faqItems && faqItems.length > 0 && (
        <section className="border-t border-[#17191c]/10 bg-white px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-10 text-center text-3xl font-medium text-[#17191c]">Common questions</h2>
            <div className="space-y-4">
              {faqItems.map((faq) => (
                <div key={faq.q} className="rounded-xl border border-[#17191c]/10 bg-[#fbfbfa] p-5">
                  <h4 className="font-semibold text-[#17191c]">{faq.q}</h4>
                  <p className="mt-2 text-sm leading-6 text-[#17191c]/60">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. FINAL CLOSING CTA */}
      <section className="relative overflow-hidden bg-[#edf3ff] px-5 py-24 text-center text-[#17191c] sm:px-8 sm:py-32">
        <div className="relative mx-auto max-w-[900px]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8557e8]">Ready to get started?</p>
          <h2 className="mt-4 text-[clamp(2.6rem,5.5vw,5.5rem)] font-medium leading-[0.92] tracking-[-0.05em]">
            Deliver instant support <span className="text-[#168cff]">without the burnout.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-[550px] text-base leading-7 text-[#17191c]/60">
            Set up your AI agent in minutes. 50 AI conversations free each month.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex min-h-13 items-center gap-4 rounded-full bg-[#ff6038] py-3 pl-7 pr-3 text-sm font-semibold text-white transition hover:bg-[#e84b25]"
            >
              Start free
              <span className="flex size-8 items-center justify-center rounded-full bg-white text-[#ff6038] transition-transform group-hover:rotate-45">
                <ArrowUpRight size={16} />
              </span>
            </Link>
            <Link
              href="/pricing"
              className="inline-flex min-h-13 items-center rounded-full border border-[#17191c]/20 px-7 text-sm font-semibold transition hover:border-[#17191c]"
            >
              See pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
