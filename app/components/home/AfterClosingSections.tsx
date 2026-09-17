import Link from "next/link";
import {
  ArrowUpRight,
  BookOpenCheck,
  Check,
  Gauge,
  Headphones,
  LockKeyhole,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";

const toolkit = ["AI agent", "Shared inbox", "Knowledge", "Handoffs", "Visitor context"];

const controls = [
  "Knowledge-only answers",
  "Automatic human handoff",
  "AI budget limits",
  "Source and policy history",
];

const safeguards = [
  { icon: BookOpenCheck, title: "Grounded answers", detail: "Replies use the knowledge you approve" },
  { icon: UserRoundCheck, title: "Human handoff", detail: "Uncertain questions reach your team" },
  { icon: Gauge, title: "Budget guardrails", detail: "AI pauses before surprise overages" },
  { icon: LockKeyhole, title: "Secure requests", detail: "Sensitive details use one-time forms" },
  { icon: ShieldCheck, title: "Answer history", detail: "Sources and decisions stay reviewable" },
];

function ProductCanvas() {
  return (
    <div className="relative mx-auto mt-12 max-w-[1320px] overflow-hidden rounded-[28px] bg-[#edf3ff] px-5 pb-0 pt-14 sm:px-10 sm:pt-20 lg:px-20">
      <div aria-hidden="true" className="absolute -left-20 top-16 size-72 rounded-full bg-[#8557e8]/20 blur-3xl" />
      <div aria-hidden="true" className="absolute -right-16 bottom-0 size-80 rounded-full bg-[#168cff]/20 blur-3xl" />
      <div className="relative mx-auto max-w-[1050px] overflow-hidden rounded-t-2xl border border-[#17191c]/10 bg-white shadow-[0_25px_70px_rgba(38,53,83,.16)]">
        <div className="flex h-14 items-center justify-between border-b border-[#17191c]/8 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-lg bg-[#ff6038] text-white"><Headphones size={16} /></span>
            <span className="text-sm font-semibold">Support inbox</span>
          </div>
          <span className="rounded-full bg-[#edf4ff] px-3 py-1 text-[11px] font-medium text-[#1674d1]">12 resolved today</span>
        </div>
        <div className="grid min-h-[360px] grid-cols-[92px_1fr] sm:grid-cols-[230px_1fr]">
          <div className="border-r border-[#17191c]/8 bg-[#fbfbfa] p-3 sm:p-4">
            {["Maya Chen", "Jordan Lee", "Sam Rivera"].map((name, index) => (
              <div key={name} className={`mb-2 rounded-xl p-3 ${index === 0 ? "bg-[#eee9ff]" : "bg-transparent"}`}>
                <div className="flex items-center gap-2">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-[9px] font-semibold">{name.split(" ").map((part) => part[0]).join("")}</span>
                  <span className="hidden text-xs font-medium sm:block">{name}</span>
                </div>
                <div className="ml-9 mt-2 hidden h-1.5 w-20 rounded-full bg-[#17191c]/8 sm:block" />
              </div>
            ))}
          </div>
          <div className="p-5 sm:p-8">
            <div className="flex items-center justify-between border-b border-[#17191c]/8 pb-5">
              <div><p className="text-sm font-semibold">Maya Chen</p><p className="mt-1 text-[11px] text-[#17191c]/45">Billing question · AI replied</p></div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#1674d1]"><Check size={13} /> Resolved</span>
            </div>
            <div className="mx-auto mt-7 max-w-[620px]">
              <div className="max-w-[72%] rounded-2xl rounded-bl-sm bg-[#f0f2f5] px-4 py-3 text-xs leading-5 sm:text-sm">Can I add another teammate to my plan?</div>
              <div className="ml-auto mt-3 max-w-[82%] rounded-2xl rounded-br-sm bg-[#e8f2ff] px-4 py-3 text-xs leading-5 sm:text-sm">Yes. Open Settings → Team and choose “Invite teammate.” Your current plan includes two seats.</div>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#17191c]/10 px-3 py-1.5 text-[10px]"><BookOpenCheck size={12} className="text-[#8557e8]" /> Team setup guide</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#17191c]/10 px-3 py-1.5 text-[10px]"><ShieldCheck size={12} className="text-[#168cff]" /> Policy checked</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolkitSection() {
  return (
    <section className="bg-[#fffdfa] px-5 py-24 text-[#17191c] sm:px-8 sm:py-32 lg:px-[4.2vw]">
      <div className="mx-auto max-w-[1500px] text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ff6038]">One support workspace</p>
        <h2 className="mx-auto mt-5 max-w-[980px] text-[clamp(2.7rem,5.4vw,5.6rem)] font-medium leading-[0.95] tracking-[-0.06em]">
          Your complete support toolkit. <span className="text-[#ff6038]">One place to run it.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-[680px] text-base leading-7 text-[#17191c]/58 sm:text-lg">Answer, review, hand off, and learn from every customer conversation without stitching together another support stack.</p>
        <div className="mx-auto mt-12 flex max-w-[900px] overflow-x-auto border-b border-[#17191c]/12 [scrollbar-width:none]">
          {toolkit.map((item, index) => <span key={item} className={`shrink-0 border-b-2 px-5 py-3 text-sm ${index === 0 ? "border-[#ff6038] font-semibold text-[#17191c]" : "border-transparent text-[#17191c]/50"}`}>{item}</span>)}
        </div>
        <ProductCanvas />
      </div>
    </section>
  );
}

function ResultsSection() {
  return (
    <section className="border-y border-[#17191c]/10 bg-[#f4f1eb] px-5 py-24 text-[#17191c] sm:px-8 sm:py-32 lg:px-[4.2vw]">
      <div className="mx-auto max-w-[1500px]">
        <h2 className="text-[clamp(2.4rem,4.5vw,4.8rem)] font-medium leading-none tracking-[-0.055em]">No AI theatre. <span className="text-[#8557e8]">Just useful support.</span></h2>
        <div className="mt-16 border-t border-[#17191c]/12 pt-12">
          <p className="text-[clamp(5rem,14vw,13rem)] font-medium leading-[0.78] tracking-[-0.085em] text-[#168cff]">1,000+</p>
          <p className="mt-8 text-[clamp(1.45rem,3vw,3rem)] tracking-[-0.035em]">customer conversations resolved</p>
        </div>
        <div className="mt-16 grid gap-14 border-t border-[#17191c]/12 pt-12 lg:grid-cols-2 lg:gap-24">
          <div>
            <svg viewBox="0 0 700 260" role="img" aria-label="Illustrative upward trend in resolved conversations" className="w-full overflow-visible">
              <defs><linearGradient id="results-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#168cff" stopOpacity=".25"/><stop offset="1" stopColor="#168cff" stopOpacity="0"/></linearGradient></defs>
              <path d="M10 235 L110 210 L205 220 L310 170 L405 118 L505 68 L590 46 L675 10 L675 250 L10 250 Z" fill="url(#results-fill)" />
              <path d="M10 235 L110 210 L205 220 L310 170 L405 118 L505 68 L590 46 L675 10" fill="none" stroke="#168cff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="675" cy="10" r="8" fill="#ff6038" />
            </svg>
            <div className="mt-3 flex justify-between text-xs text-[#17191c]/45"><span>Your first conversation</span><span>Today</span></div>
          </div>
          <div className="flex items-center">
            <p className="max-w-[23ch] text-[clamp(1.8rem,3.3vw,3.5rem)] leading-[1.08] tracking-[-0.045em]">Elpino turns the questions your team has answered before into help your next customer can use instantly.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ControlSection() {
  return (
    <section className="bg-[#fffdfa] px-5 py-24 text-[#17191c] sm:px-8 sm:py-32 lg:px-[4.2vw]">
      <div className="mx-auto max-w-[1500px]">
        <div className="text-center"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8557e8]">Control without the busywork</p><h2 className="mx-auto mt-5 max-w-[1000px] text-[clamp(2.7rem,5vw,5.2rem)] font-medium leading-[.96] tracking-[-0.06em]">Let AI move fast. <span className="text-[#168cff]">Keep your team in control.</span></h2></div>
        <div className="mt-20 grid items-center gap-14 lg:grid-cols-[.72fr_1.28fr] lg:gap-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ff6038]">Answer policy</p>
            <h3 className="mt-5 text-[clamp(2rem,3.4vw,3.6rem)] leading-[1.02] tracking-[-0.045em]">Define exactly what Elpino can answer.</h3>
            <p className="mt-6 max-w-[46ch] text-base leading-7 text-[#17191c]/60">Choose the knowledge customers can see, keep private pages private, and let uncertain questions reach a person with the full thread attached.</p>
            <div className="mt-10 border-t border-[#17191c]/12">
              {controls.map((control, index) => <div key={control} className="flex items-center justify-between border-b border-[#17191c]/12 py-4 text-sm font-medium"><span>{control}</span><span className="text-lg" style={{ color: ["#ff6038", "#168cff", "#8557e8", "#ff6038"][index] }}>+</span></div>)}
            </div>
          </div>
          <div className="relative min-h-[560px] overflow-hidden rounded-[30px] bg-[#eef3fb] p-6 sm:p-10">
            <div aria-hidden="true" className="absolute -right-24 -top-24 size-80 rounded-full bg-[#168cff]/18 blur-3xl" />
            <div aria-hidden="true" className="absolute -bottom-28 -left-20 size-80 rounded-full bg-[#ff6038]/16 blur-3xl" />
            <div className="relative mx-auto max-w-[720px] rounded-2xl bg-white p-5 shadow-[0_24px_60px_rgba(40,58,86,.13)] sm:p-7">
              <div className="flex items-center justify-between border-b border-[#17191c]/8 pb-5"><div><p className="font-semibold">AI answer policy</p><p className="mt-1 text-xs text-[#17191c]/45">Website chat · Published</p></div><span className="size-2.5 rounded-full bg-[#168cff] shadow-[0_0_0_5px_rgba(22,140,255,.12)]" /></div>
              <div className="mt-6 space-y-4">
                {[
                  ["Answer from approved knowledge", "On", "#168cff"],
                  ["Hand off when confidence is low", "On", "#8557e8"],
                  ["Ask before collecting sensitive data", "Required", "#ff6038"],
                  ["Monthly AI resolution limit", "1,000", "#168cff"],
                ].map(([label, value, color]) => <div key={label} className="flex items-center justify-between gap-5 rounded-xl bg-[#f7f7f5] px-4 py-4"><span className="text-sm">{label}</span><span className="rounded-full bg-white px-3 py-1 text-xs font-semibold" style={{ color }}>{value}</span></div>)}
              </div>
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-[#8557e8]/20 bg-[#8557e8]/7 p-4"><ShieldCheck className="shrink-0 text-[#8557e8]" size={20}/><p className="text-xs leading-5 text-[#17191c]/65">Every answer keeps its source and policy decision in the conversation.</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SafeguardsSection() {
  return (
    <section className="bg-[#f4f1eb] px-5 py-24 text-[#17191c] sm:px-8 sm:py-32 lg:px-[4.2vw]">
      <div className="mx-auto max-w-[1500px]">
        <div className="text-center"><p className="text-xs font-semibold uppercase tracking-[0.16em]">Built into every conversation</p><h2 className="mx-auto mt-5 max-w-[900px] text-[clamp(2.6rem,4.8vw,5rem)] font-medium leading-[.96] tracking-[-0.055em]">Support that stays <span className="text-[#ff6038]">inside the lines.</span></h2></div>
        <div className="mt-16 grid gap-x-10 gap-y-12 border-t border-[#17191c]/14 pt-8 sm:grid-cols-2 lg:grid-cols-5">
          {safeguards.map((item, index) => <div key={item.title} className="flex min-h-[190px] flex-col"><item.icon size={25} strokeWidth={1.7} style={{ color: ["#ff6038", "#168cff", "#8557e8", "#ff6038", "#168cff"][index] }} /><div className="mt-auto pt-12"><h3 className="text-lg font-medium">{item.title}</h3><p className="mt-2 text-sm leading-6 text-[#17191c]/52">{item.detail}</p></div></div>)}
        </div>
      </div>
    </section>
  );
}

function FinalAction() {
  return (
    <section className="relative overflow-hidden bg-[#edf3ff] px-5 py-24 text-center text-[#17191c] sm:px-8 sm:py-32">
      <div aria-hidden="true" className="absolute left-[18%] top-[-8rem] size-72 rounded-full bg-[#8557e8]/20 blur-[90px]" />
      <div aria-hidden="true" className="absolute bottom-[-10rem] right-[18%] size-80 rounded-full bg-[#ff6038]/18 blur-[100px]" />
      <div className="relative mx-auto max-w-[920px]">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8557e8]">Start with the next question</p>
        <h2 className="mt-5 text-[clamp(3rem,6vw,6.6rem)] font-medium leading-[.9] tracking-[-0.065em]">Turn support questions into <span className="text-[#168cff]">resolved conversations.</span></h2>
        <p className="mx-auto mt-7 max-w-[620px] text-base leading-7 text-[#17191c]/58 sm:text-lg">Bring your knowledge. Add the widget. Let Elpino handle your first 50 AI resolutions free.</p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/signup" className="group inline-flex min-h-13 items-center gap-4 rounded-full bg-[#ff6038] py-3 pl-7 pr-3 text-sm font-semibold text-white transition hover:bg-[#e84b25]">Start free <span className="flex size-8 items-center justify-center rounded-full bg-white text-[#ff6038] transition-transform group-hover:rotate-45"><ArrowUpRight size={16}/></span></Link>
          <Link href="/pricing" className="inline-flex min-h-13 items-center rounded-full border border-[#17191c]/20 px-7 text-sm font-semibold transition hover:border-[#17191c]">See pricing</Link>
        </div>
        <p className="mt-5 text-xs text-[#17191c]/45">No credit card required · Two seats included</p>
      </div>
    </section>
  );
}

export function AfterClosingSections() {
  return <><ToolkitSection /><ResultsSection /><ControlSection /><SafeguardsSection /><FinalAction /></>;
}
