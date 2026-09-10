import Link from "next/link";
import { ArrowRight, BookOpen, Inbox, Sparkles, Users } from "lucide-react";
import { DashboardShowcase } from "./DashboardShowcase";

const columns = [
  {
    icon: BookOpen,
    title: "Knowledge base",
    description: "Give the AI your help articles, website pages, and documents so it answers from what you actually know.",
    href: "/features",
    linkLabel: "Explore the knowledge base",
  },
  {
    icon: Sparkles,
    title: "AI resolution",
    description: "Elpino searches your knowledge and replies in seconds, with every step logged for your team to check.",
    href: "/features",
    linkLabel: "See how AI answers",
  },
  {
    icon: Users,
    title: "Human handoff",
    description: "The moment a question needs a person, it's handed off with full context and a reason, not just a ping.",
    href: "/features",
    linkLabel: "Explore human handoff",
  },
  {
    icon: Inbox,
    title: "Shared inbox",
    description: "Resolved, escalated, or waiting — your whole team sees every conversation in one place.",
    href: "/integrations",
    linkLabel: "See integrations",
  },
];

export function CanvasCodeSection() {
  return (
    <section className="bg-white px-5 py-16 font-[family-name:var(--font-rethink-sans)] text-[#171e16] sm:px-8 sm:py-24 lg:px-[4.2vw]">
      <h2 className="max-w-[36ch] text-[clamp(1.75rem,3vw,2.75rem)] font-semibold uppercase leading-[1.08] tracking-[-0.03em]">
        Every answer comes with receipts.
      </h2>
      <p className="mt-4 max-w-[52ch] text-base leading-7 text-black/60 sm:text-lg">
        Move fluidly between what your customer asks and what your team can prove was done, so nothing slips through
        without context.
      </p>

      <DashboardShowcase />

      <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-10 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
        {columns.map(({ icon: Icon, title, description, href, linkLabel }) => (
          <div key={title}>
            <Icon size={20} aria-hidden="true" className="text-[#7060BD]" />
            <p className="mt-4 font-medium">{title}</p>
            <p className="mt-2 text-sm leading-6 text-black/55">{description}</p>
            <Link
              href={href}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4"
            >
              {linkLabel} <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
