import Link from "next/link";
import {
  ArrowUpRight,
  BookOpenCheck,
  Check,
  Clock3,
  MessagesSquare,
  MoonStar,
  ShieldCheck,
} from "lucide-react";

const stats = [
  {
    value: "1,000+",
    label: "Conversations resolved",
    heading: "Fewer tickets sitting in the queue",
    description: "Every question Elpino can safely answer never becomes a backlog item for your team to clear.",
    icon: MessagesSquare,
    accent: "#ff6038",
  },
  {
    value: "<5s",
    label: "Average AI response",
    heading: "Speed customers actually notice",
    description: "No queue, no hold music — Elpino replies from your knowledge base before the tab even loses focus.",
    icon: Clock3,
    accent: "#168cff",
  },
  {
    value: "24/7",
    label: "Always-on coverage",
    heading: "Coverage that doesn't clock out",
    description: "Nights, weekends, time zones you don't staff — Elpino is still there, and still following your policy.",
    icon: MoonStar,
    accent: "#8557e8",
  },
];

function AnswerLedger() {
  return (
    <div className="relative mx-auto w-full max-w-[520px] lg:mx-0">
      <div aria-hidden="true" className="absolute -inset-8 rounded-full bg-[#168cff]/15 blur-3xl" />
      <div className="relative overflow-hidden rounded-[26px] border border-[#17191c]/10 bg-white shadow-[0_30px_90px_rgba(32,39,55,0.14)]">
        <div className="flex items-center justify-between border-b border-[#17191c]/8 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-[#ff6038] text-white">
              <ShieldCheck size={18} strokeWidth={2.2} />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#17191c]">Answer record</p>
              <p className="text-[11px] text-[#17191c]/45">Conversation #1048</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#168cff]/30 bg-[#168cff]/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8ac5ff]">
            <span className="size-1.5 rounded-full bg-[#168cff] shadow-[0_0_10px_#168cff]" />
            Verified
          </span>
        </div>

        <div className="p-5 sm:p-6">
          <div className="rounded-2xl rounded-bl-sm bg-[#f0f2f5] px-4 py-3.5 text-sm leading-6 text-[#17191c]/70">
            How long do I have to request a refund?
          </div>
          <div className="ml-7 mt-3 rounded-2xl rounded-br-sm bg-[#f3f0e8] px-4 py-3.5 text-sm leading-6 text-[#20231f] sm:ml-12">
            You can request a refund within 30 days of your purchase. I can bring in the team if you need help with one.
          </div>

          <div className="relative mt-7 pl-5 before:absolute before:bottom-3 before:left-[5px] before:top-3 before:w-px before:bg-[#17191c]/10">
            {[
              { icon: ShieldCheck, label: "Policy", value: "Refund policy · v3.2" },
              { icon: BookOpenCheck, label: "Source", value: "Billing & refunds" },
              { icon: Clock3, label: "Answered", value: "Today · 10:42:08" },
            ].map((item) => (
              <div key={item.label} className="relative flex items-center gap-3 py-2.5">
                <span className="absolute -left-5 size-[11px] rounded-full border-2 border-white bg-[#ff6038]" />
                <item.icon size={16} className="shrink-0 text-[#17191c]/40" aria-hidden="true" />
                <span className="w-[58px] text-[11px] uppercase tracking-[0.1em] text-[#17191c]/40">{item.label}</span>
                <span className="truncate text-xs font-medium text-[#17191c]/75 sm:text-sm">{item.value}</span>
                <Check size={14} className="ml-auto shrink-0 text-[#168cff]" aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute -bottom-5 -right-2 hidden items-center gap-2 rounded-full border border-black/10 bg-[#8557e8] px-4 py-2.5 text-xs font-semibold text-white shadow-xl sm:flex lg:-right-6">
        <Check size={14} strokeWidth={3} />
        Ready to review
      </div>
    </div>
  );
}

export function ClosingCta() {
  return (
    <section className="relative overflow-hidden bg-[#f7f5f0] px-5 py-20 font-[family-name:var(--font-rethink-sans)] text-[#17191c] sm:px-8 sm:py-28 lg:px-[4.2vw] lg:py-32">
      <div aria-hidden="true" className="absolute -left-40 bottom-[-18rem] size-[34rem] rounded-full bg-[#8557e8]/12 blur-[110px]" />
      <div aria-hidden="true" className="absolute -right-36 top-[-15rem] size-[38rem] rounded-full bg-[#168cff]/12 blur-[120px]" />

      <div className="relative mx-auto max-w-[1500px]">
        <div className="grid items-center gap-16 lg:grid-cols-[1.02fr_.98fr] lg:gap-20 xl:gap-28">
          <div>
            <div className="mb-7 flex items-center gap-3">
              <span className="h-px w-8 bg-[#ff6038]" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ff7958]">Not just a chatbot</p>
            </div>
            <h2 className="max-w-[780px] text-[clamp(3rem,6vw,6.8rem)] font-medium leading-[0.88] tracking-[-0.065em]">
              Numbers your team can <span className="text-[#58a9ff]">stand behind.</span>
            </h2>
            <p className="mt-8 max-w-[58ch] text-base leading-7 text-[#17191c]/62 sm:text-lg sm:leading-8">
              Every reply Elpino sends is logged against a policy, a source, and a timestamp — so when someone asks
              “why did it say that?”, the answer is already sitting in the thread.
            </p>
            <Link
              href="/signup"
              className="group mt-9 inline-flex min-h-13 items-center gap-4 rounded-full bg-[#17191c] py-3 pl-6 pr-2.5 text-sm font-semibold text-white transition duration-300 hover:bg-[#ff6038] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff6038]"
            >
              Start for free
              <span className="flex size-8 items-center justify-center rounded-full bg-[#151713] text-white transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight size={16} aria-hidden="true" />
              </span>
            </Link>
          </div>

          <AnswerLedger />
        </div>

        <div className="mt-24 grid gap-14 md:grid-cols-3 md:gap-9 lg:mt-32 lg:gap-16">
          {stats.map((stat, index) => (
            <article
              key={stat.label}
              className={`group relative min-h-[300px] ${index === 1 ? "md:translate-y-14" : index === 2 ? "md:translate-y-7" : ""}`}
            >
              <div
                aria-hidden="true"
                className="absolute -left-6 top-3 size-28 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-25"
                style={{ backgroundColor: stat.accent }}
              />
              <div className="relative flex h-full flex-col">
                <div className="flex items-start justify-between gap-5 border-t border-[#17191c]/15 pt-6">
                  <div>
                    <p className="text-[clamp(3.8rem,7vw,7rem)] font-medium leading-none tracking-[-0.075em]" style={{ color: stat.accent }}>
                      {stat.value}
                    </p>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#17191c]/45">{stat.label}</p>
                  </div>
                  <span
                    className="flex size-11 shrink-0 items-center justify-center rounded-full text-[#151713] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"
                    style={{ backgroundColor: stat.accent }}
                  >
                    <stat.icon size={19} aria-hidden="true" />
                  </span>
                </div>
                <div className="mt-auto pt-14">
                  <h3 className="max-w-[17ch] text-xl font-medium leading-tight tracking-[-0.025em] sm:text-2xl">{stat.heading}</h3>
                  <p className="mt-3 max-w-[36ch] text-sm leading-6 text-[#17191c]/55">{stat.description}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
