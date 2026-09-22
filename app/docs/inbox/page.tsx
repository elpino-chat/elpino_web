import { DocSection, DocsShell, Note } from "../_components/DocsShell";
import { docsMetadata } from "../_lib/docs";
const description = "Work human conversations from Team Inbox while keeping AI-handled conversations separate in AI Assist.";
export const metadata = docsMetadata("/docs/inbox", "Team inbox", description);
export default function Page(){return <DocsShell current="/docs/inbox" title="Team inbox" description={description}>
<DocSection id="views" title="AI Assist and Team Inbox"><p>AI Assist contains conversations the AI is handling. Team Inbox contains conversations that need a teammate. Only the active tab receives the bottom-border treatment, so the current view is immediately clear.</p></DocSection>
<DocSection id="workflow" title="Work a conversation"><ol className="list-decimal space-y-3 pl-5"><li>Claim or join an unassigned conversation.</li><li>Read the history and AI summary before replying.</li><li>Use translation, secure requests, or ticket tools when needed.</li><li>Resolve the conversation when the customer&apos;s request is complete. Reopen it if work resumes.</li></ol></DocSection>
<DocSection id="routing" title="Assignment and availability"><p>Handoffs prefer teammates who are online and not busy, with round-robin distribution among eligible people. A declined or stalled assignment can be reassigned.</p><Note>Keep availability and teammate status current. If nobody is eligible, the conversation remains unassigned for the team to pick up.</Note></DocSection>
</DocsShell>}
