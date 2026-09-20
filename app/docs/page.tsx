import Link from "next/link";
import { ArrowRight, BookOpen, MessageSquareText, ShieldCheck, Users } from "lucide-react";
import { DocSection, DocsShell, Note } from "./_components/DocsShell";
import { docsMetadata, docsPages } from "./_lib/docs";

const description = "Set up Elpino AI support, connect trusted knowledge, install the chat widget, and prepare your team for human handoff.";
export const metadata = docsMetadata("/docs", "Documentation", description);

export default function DocsPage() {
  return <DocsShell current="/docs" title="Build better customer support" description={description}>
    <DocSection id="start" title="Start with the essentials">
      <p>Elpino answers visitors from the knowledge you approve and moves conversations to your team when a person is needed. A reliable setup has three parts: useful knowledge, a working site tag, and teammates ready for handoff.</p>
      <div className="grid gap-3 pt-2 sm:grid-cols-2">
        {docsPages.slice(1, 7).map((page, index) => <Link key={page.href} href={page.href} className="group rounded-2xl border border-black/10 bg-white p-5 transition hover:-translate-y-0.5 hover:border-black/25"><span className="text-xs font-bold text-[#7651b0]">0{index + 1}</span><h3 className="mt-3 font-semibold">{page.title}</h3><p className="mt-1 text-sm leading-6 text-black/55">{page.description}</p><ArrowRight className="mt-4 text-black/30 transition group-hover:translate-x-1 group-hover:text-black" size={16} /></Link>)}
      </div>
    </DocSection>
    <DocSection id="quickstart" title="Quickstart">
      <ol className="space-y-4">
        {[
          [BookOpen, "Add trusted knowledge", "Crawl your website, upload useful material, or write a help page, then confirm it is visible to visitors."],
          [MessageSquareText, "Install the widget", "Create a site tag for your domain and place the generated script on each public page that should show chat."],
          [Users, "Prepare your team", "Invite teammates, set availability, and decide how conversations should move from AI Assist to Team Inbox."],
          [ShieldCheck, "Verify signed-in customers", "Add server-signed identity tokens before the AI or team accesses private account information."],
        ].map(([Icon, title, text], index) => <li key={String(title)} className="flex gap-4 rounded-2xl border border-black/10 bg-white p-5"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eee5fb] text-[#6d469d]"><Icon size={18} /></span><div><p className="text-xs font-bold text-black/35">STEP {index + 1}</p><h3 className="mt-1 font-semibold text-black">{String(title)}</h3><p className="mt-1 text-sm leading-6">{String(text)}</p></div></li>)}
      </ol>
      <Note>Elpino does not currently publish a general REST API, official SDK package, or outbound workspace webhook catalog. These guides match the product available today.</Note>
    </DocSection>
  </DocsShell>;
}
