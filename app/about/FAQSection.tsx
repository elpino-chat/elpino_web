import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";

const faqs = [
  ["What is Elpino?", "Elpino is an AI customer support platform with a website chat widget, answers from your knowledge base, a shared team inbox, and human handoff when the AI cannot help."],
  ["Does Elpino replace my support team?", "Elpino handles everyday questions from your knowledge and brings your team in when a conversation needs a person. Your team stays part of the support experience."],
  ["How can I get started?", "Start with the free plan, which includes 50 AI conversations each month with no card required. Add your knowledge, connect your website, and bring in your teammates."],
  ["How is pricing structured?", "Free includes 50 AI conversations a month, and paid plans include a monthly AI credit. Extra teammates come in seat packs from $0.60 a seat, and handing a conversation to a human never costs extra. The pricing page explains included seats and the free-plan minimum charge."],
];

export default function FAQSection() {
  return (
    <section aria-labelledby="about-faq-title" className="border-y border-white/10 bg-[#111] py-16 text-white sm:py-20">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-20">
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#8c6aac]">A little more about us</p>
          <h2 id="about-faq-title" className="mt-5 text-4xl font-normal leading-[1.08] tracking-[-0.045em]">Glad you asked.</h2>
          <p className="mt-5 max-w-[33ch] text-sm leading-7 text-white/55">A few answers before you start a conversation of your own.</p>
          <Link href="/faq" className="mt-6 inline-flex items-center gap-2 text-sm underline underline-offset-4">Explore the full FAQ <ArrowUpRight size={15} /></Link>
        </div>
        <div className="border-t border-white/15">
          {faqs.map(([question, answer]) => (
            <details key={question} className="group border-b border-white/15">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-6 text-base [&::-webkit-details-marker]:hidden">
                {question}
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-white/20 transition group-open:rotate-45 group-open:bg-[#d9bef4] group-open:text-black"><Plus size={14} /></span>
              </summary>
              <p className="max-w-[60ch] pb-6 pr-4 text-sm leading-7 text-white/55">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
