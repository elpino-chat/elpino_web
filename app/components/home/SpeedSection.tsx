import TypingDots from "../TypingDots";

const TRANSCRIPT_TEXT = "Do you offer refunds after the 30 day window";
const TRANSCRIPT_WORDS = TRANSCRIPT_TEXT.split(" ");
const MARQUEE_SECONDS = 9;

function LiveTranscript() {
  return (
    <div
      className="w-full max-w-sm overflow-hidden"
      style={{
        WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
        maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
      }}
    >
      <div className="speed-marquee flex w-max whitespace-nowrap font-mono text-lg font-bold md:text-2xl">
        {[0, 1].map((copy) => (
          <span key={copy} className="flex px-4">
            {TRANSCRIPT_WORDS.map((word, i) => (
              <span
                key={i}
                className="speed-word inline-block px-1.5"
                style={{ animationDelay: `${(i / TRANSCRIPT_WORDS.length) * MARQUEE_SECONDS}s` }}
              >
                {word}
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

export function SpeedSection() {
  return (
    <section className="relative overflow-hidden bg-white px-6 py-32 md:px-10 md:py-40 lg:px-14">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .speed-marquee {
              animation: speed-marquee 9s linear infinite;
            }
            @keyframes speed-marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .speed-word {
              animation: speed-word-pulse ${MARQUEE_SECONDS}s linear infinite;
            }
            @keyframes speed-word-pulse {
              0%, 85%, 100% { transform: scale(1); color: rgba(17, 18, 15, 0.35); }
              50% { transform: scale(1.4); color: #11120f; }
            }
          `,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto flex w-full max-w-[88rem] flex-col items-center gap-6 text-center">
        <h2 className="text-5xl font-normal leading-tight tracking-tight text-[#11120f] [text-wrap:balance] md:text-7xl">
          <span className="relative inline-block font-bold text-[#7060BD]">
            10x faster
            <svg
              viewBox="0 0 220 20"
              preserveAspectRatio="none"
              aria-hidden="true"
              className="absolute -bottom-2 left-0 h-3 w-full text-[#7060BD]"
            >
              <path
                d="M2 14C36 4 74 4 110 10C146 16 184 16 218 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <br />
          <span className="text-[#11120f]/70">than a support queue.</span>
        </h2>
        <p className="max-w-2xl text-base leading-7 text-[#44483F] md:text-xl">
          Elpino lives right in your website&apos;s chat widget, and every escalation lands in your team&apos;s shared
          inbox. No app to open, no tab to switch to, no ticket queue to triage — just answers where your customers
          already are.
        </p>
        <div className="mt-14 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="speed-card flex min-h-[460px] w-full flex-col items-center rounded-2xl border-2 border-black/10 bg-[#F7F8FA] px-6 py-8 text-center">
            <h3 className="text-left text-2xl font-bold text-[#11120f]">
              A customer types their question, and Elpino{" "}
              <span className="relative inline-block">
                handles the rest
                <svg
                  viewBox="0 0 140 16"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                  className="absolute -bottom-1.5 left-0 h-2.5 w-full text-[#7060BD]"
                >
                  <path
                    d="M2 11C24 3 48 3 70 8C92 13 116 13 138 5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span>.</span>
            </h3>
            <div className="mt-auto flex flex-col items-center gap-6 pt-10">
              <LiveTranscript />
              <div className="flex items-center justify-center rounded-full border border-black/10 bg-white px-5 py-3">
                <TypingDots color="#233D4D" />
              </div>
            </div>
          </div>
          <div className="speed-card flex min-h-[460px] w-full flex-col rounded-2xl border-2 border-black/10 bg-[#F7F8FA] px-6 py-8 text-left">
            <h3 className="text-left text-2xl font-bold text-[#11120f]">
              Nothing slips through.{" "}
              <span className="relative inline-block">
                Every escalation
                <svg
                  viewBox="0 0 220 16"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                  className="absolute -bottom-1.5 left-0 h-2.5 w-full text-[#7060BD]"
                >
                  <path
                    d="M2 11C38 3 76 3 110 8C144 13 182 13 218 5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{" "}
              lands with full context.
            </h3>
            <p className="mt-4 text-sm leading-6 text-[#44483F]">
              Not just the question — what Elpino already checked, and why it couldn&apos;t finish the job.
            </p>
            <div className="mt-auto w-full pt-10">
              <div className="morning-brief-card w-full rounded-2xl border border-black/10 bg-white p-5 text-left">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#e0954f]" aria-hidden="true" />
                  <span className="text-sm font-bold text-black">Escalated to Priya</span>
                  <span className="ml-auto text-xs text-black/40">just now</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-black/70">
                  Sneha Roy asked about a refund past the 30-day window. Elpino checked the policy and the order —
                  this one needs a human call.
                </p>
                <div className="mt-4 flex items-center gap-3 rounded-xl bg-black/5 px-3 py-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                    SR
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-black">Sneha Roy</p>
                    <p className="truncate text-xs text-black/50">Refund past policy window</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
