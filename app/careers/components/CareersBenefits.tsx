"use client";

import { Heart, Home, TrendingUp, CheckCircle2, ArrowRight } from "lucide-react";

export function CareersBenefits() {
  function scrollToRoles() {
    const el = document.getElementById("open-roles");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  const benefitCategories = [
    {
      icon: Heart,
      title: "Health & wellness",
      description: "Complete physical and mental care so you can operate at your peak.",
      perks: [
        "Comprehensive health, dental, and vision insurance for you and your dependents (100% premium covered)",
        "Employee Assistance Program with confidential mental health counseling whenever you need it",
        "Income protection & disability if illness or injury keeps you from work",
        "Life insurance coverage up to 4x your annual salary — at zero cost to you",
        "$200/month wellness stipend for fitness, therapy, gym, or massage",
      ],
    },
    {
      icon: Home,
      title: "Family & time off",
      description: "We work hard, but life beyond the screen always comes first.",
      perks: [
        "Up to 26 weeks of fully paid leave for birthing parents",
        "12 weeks of fully paid parental leave for non-birthing parents",
        "Flexible vacation policy — take the time you need to recharge without counting days",
        "Work from home setup: $1,500 home-office budget + latest Apple M4 Max MacBook Pro",
        "Annual all-hands company offsites in world-class destinations (past: Lisbon, Kyoto)",
      ],
    },
    {
      icon: TrendingUp,
      title: "Financial future",
      description: "Generous ownership and wealth-building for long-term partners.",
      perks: [
        "Meaningful equity ownership via stock grants / RSUs — your success is our success",
        "Highly competitive tier-1 cash compensation benchmarked against top Silicon Valley tech",
        "401(k) / pension matching program up to 5% with immediate vesting",
        "Commuter benefits and global co-working pass (WeWork All-Access anywhere)",
        "$3,000 annual continuous education, books, courses, and conference travel stipend",
      ],
    },
  ];

  return (
    <section className="relative w-full border-t border-black/10 bg-white py-20 sm:py-28 lg:py-36">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="flex flex-col justify-between gap-6 border-b border-black/10 pb-12 sm:flex-row sm:items-end sm:pb-16">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ff5600]">
              Total Rewards
            </span>
            <h2 className="mt-3 font-serif text-[clamp(2.5rem,5vw,5rem)] font-normal leading-[0.95] tracking-[-0.03em] text-[#0c1017]">
              Benefits to support your best work.
            </h2>
          </div>
          <p className="max-w-md text-base leading-relaxed text-black/65 sm:text-lg">
            We want the work to be challenging, but not punishing. The benefits are designed
            to make space for both monumental ambition and a peaceful life.
          </p>
        </div>

        {/* 3 Columns matching fin.ai */}
        <div className="mt-12 grid gap-8 md:grid-cols-3 lg:gap-12">
          {benefitCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.title}
                className="flex flex-col justify-between rounded-3xl border border-black/10 bg-[#faf9f6] p-8 transition-all hover:border-black/30 hover:shadow-md sm:p-10"
              >
                <div>
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-white shadow-xs">
                    <Icon size={22} className="text-[#ff5600]" />
                  </div>

                  <h3 className="mt-6 font-serif text-2xl font-normal tracking-tight text-black sm:text-3xl">
                    {category.title}
                  </h3>
                  <p className="mt-2 text-sm text-black/60">
                    {category.description}
                  </p>

                  <ul className="mt-8 space-y-4">
                    {category.perks.map((perk, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-black/75">
                        <CheckCircle2 size={16} className="mt-1 shrink-0 text-[#ff5600]" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-10 pt-6 border-t border-black/5 text-xs font-medium uppercase tracking-wider text-black/40">
                  Elpino Global Package
                </div>
              </div>
            );
          })}
        </div>

        {/* Action button */}
        <div className="mt-12 flex justify-center pt-8">
          <button
            onClick={scrollToRoles}
            type="button"
            className="group inline-flex cursor-pointer items-center gap-3 rounded-full bg-black px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[#ff5600]"
          >
            See 8 open roles with full benefits
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
