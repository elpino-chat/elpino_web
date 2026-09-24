import Link from "next/link";

export function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden bg-[#233D4D] px-6 py-24 md:px-10 lg:px-14">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto flex max-w-[88rem] flex-col items-start gap-10 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <span className="text-[11px] font-normal uppercase tracking-[0.18em] text-white/50">Start today</span>
          <h2 className="mt-5 max-w-xl text-3xl font-normal leading-tight tracking-tight text-white [text-wrap:balance] md:text-5xl">
            Let Elpino answer your first 50. <span className="text-white/45">No card, no lock-out.</span>
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-6 text-white/50 md:text-base">
            The Free plan is a real plan, not a countdown — 50 AI conversations a month, two seats, no credit card.
            Upgrade when your customers outgrow it, not before.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Link
            href="/signup"
            className="inline-flex h-12 items-center justify-center rounded-full bg-[#D9BEF4] px-8 text-base font-normal text-[#233D4D] transition hover:bg-[#CBB8F0]"
          >
            Start free
          </Link>
          <Link
            href="/pricing"
            className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 px-8 text-base font-normal text-white transition hover:border-white hover:bg-white hover:text-[#233D4D]"
          >
            See pricing
          </Link>
        </div>
      </div>
    </section>
  );
}
