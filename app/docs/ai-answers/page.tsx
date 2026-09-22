import Link from "next/link";
import { DocSection, DocsShell, Note } from "../_components/DocsShell";
import { docsMetadata } from "../_lib/docs";
const description = "Understand how Elpino uses workspace knowledge, conversation context, specialist routing, and human handoff.";
export const metadata = docsMetadata("/docs/ai-answers", "AI answers and handoff", description);
export default function Page(){return <DocsShell current="/docs/ai-answers" title="AI answers and handoff" description={description}>
<DocSection id="answer-flow" title="How an answer is produced"><p>Elpino combines the visitor&apos;s message, the current conversation, and relevant published workspace knowledge. Requests can be routed through support, sales, or technical specialist behavior before an answer is returned.</p><p>The AI should not invent workspace facts. When the evidence is weak, the safe outcome is a clarifying question, a limited answer, or a request for human help.</p></DocSection>
<DocSection id="handoff" title="When a person takes over"><p>A handoff moves the conversation from AI Assist to Team Inbox. Available teammates are considered using online and busy state, then work is distributed in round-robin order. Declined or stalled assignments can return for reassignment.</p><Note>If nobody is available, the conversation remains visible as unassigned instead of silently disappearing.</Note></DocSection>
<DocSection id="prepare" title="Prepare for better answers"><ul className="list-disc space-y-2 pl-5"><li>Publish current, non-duplicated <Link href="/docs/knowledge" className="font-semibold text-[#6d469d] underline">knowledge</Link>.</li><li>Verify signed-in users before accessing private records.</li><li>Keep teammate availability accurate for predictable handoff.</li></ul></DocSection>
</DocsShell>}
