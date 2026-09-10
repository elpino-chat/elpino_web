import { ChevronDown, CircleCheck, Lock, Paperclip, Send, SmilePlus, TicketPlus } from "lucide-react";

/**
 * The "what Elpino actually did" conversation panel: a customer message, the
 * collapsible audit trail of what the AI checked before replying, and the
 * reply. Shared between the hero dashboard preview and the canvas/code
 * section so both show the same real product moment.
 */
export function ConversationPreview() {
  return (
    <section className="flex min-w-0 flex-1 flex-col border-l border-white/10 bg-[#0F1113]">
      <header className="flex h-[58px] shrink-0 items-center border-b border-white/10 px-4">
        <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#c0634d] text-xs font-bold text-white">
          RD
          <span className="absolute -bottom-px -right-px h-2.5 w-2.5 rounded-full border-2 border-[#0F1113] bg-[#35b92c]" />
        </span>
        <div className="ml-3 min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-[15px] font-semibold text-white">Rahul Das</span>
            <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] font-semibold text-white/80">
              RESOLVED
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-white/80">Customer support</p>
        </div>
        <div className="ml-auto hidden shrink-0 items-center gap-2 md:flex">
          <span className="flex h-9 items-center gap-1.5 rounded-lg border border-white/15 px-3 text-[12.5px] font-semibold text-white">
            <TicketPlus size={15} /> Ticket
          </span>
          <span className="flex h-9 shrink-0 items-center gap-2 rounded-lg bg-white px-4 text-[13px] font-semibold text-[#0F1113]">
            <CircleCheck size={15} /> Resolved
          </span>
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-4 overflow-hidden px-5 py-5">
        <div className="flex gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#c0634d] text-[10px] font-bold text-white">
            RD
          </span>
          <div className="max-w-[76%]">
            <div className="rounded-2xl bg-[#1c2a3f] px-3.5 py-2.5 text-[13.5px] leading-[1.55] text-white">
              I tried to upgrade to Growth twice and the payment failed both times — but I can see two pending
              charges on my card. Have I been billed?
            </div>
            <p className="mt-1 text-[11px] text-white/80">11:25 PM</p>
          </div>
        </div>

        <div className="flex flex-row-reverse gap-3">
          <details open className="group/audit w-[76%]">
            <summary className="flex cursor-pointer list-none items-center gap-2 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/80 [&::-webkit-details-marker]:hidden">
              Thinking
              <ChevronDown
                size={14}
                className="ml-auto shrink-0 transition-transform duration-200 group-open/audit:rotate-180"
              />
            </summary>
            <p className="mt-1.5 border-l border-white/15 pl-3 text-[12px] leading-5 text-white/80">
              Checking Stripe for rahul.das@example.com — two payment intents in the last hour, both{" "}
              <span className="text-white">card_declined</span>, no successful charges. Those pending amounts are
              authorisation holds, not captures.
            </p>
          </details>
        </div>

        <div className="flex flex-row-reverse gap-3">
          <div className="max-w-[76%]">
            <div className="text-[13.5px] leading-[1.55] text-white">
              Good news — nothing was captured. Both attempts were declined by your bank, so you haven&apos;t been
              billed. The two pending amounts are authorisation holds and your bank releases them in 3–5 business
              days. You&apos;re still on Starter — want me to send a fresh payment link?
            </div>
            <p className="mt-1 text-right text-[11px] text-white/80">11:25 PM</p>
          </div>
        </div>
      </div>

      <div className="shrink-0 px-5 pb-4">
        <div className="overflow-hidden rounded-2xl border-[3px] border-white/[0.07] bg-white/[0.07]">
          <div className="rounded-xl bg-[#141719]">
            <p className="px-5 pb-1 pt-4 text-[13px] text-white/80">
              Write your reply to the customer, press &apos;space&apos; for AI, &apos;/&apos; for commands
            </p>
            <div className="flex h-12 items-center gap-3 px-4 text-white/80">
              <Paperclip size={17} />
              <SmilePlus size={17} />
              <TicketPlus size={17} />
              <Lock size={17} />
              <span className="ml-auto flex h-8 items-center overflow-hidden rounded-lg bg-white text-[#0F1113]">
                <span className="flex h-full w-10 items-center justify-center">
                  <Send size={17} />
                </span>
                <span className="flex h-5 w-6 items-center justify-center border-l border-black/25">
                  <ChevronDown size={13} />
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
