import Link from "next/link";
import { DocSection, DocsShell, Note } from "../_components/DocsShell";
import { docsMetadata } from "../_lib/docs";
const description = "Diagnose common widget installation, knowledge, identity, realtime, assignment, and billing problems.";
export const metadata = docsMetadata("/docs/troubleshooting", "Troubleshooting", description);
export default function Page(){return <DocsShell current="/docs/troubleshooting" title="Troubleshooting" description={description}>
<DocSection id="widget" title="Widget does not appear"><ul className="list-disc space-y-2 pl-5"><li>Confirm the script is present in the deployed page source, not only your local build.</li><li>Check that <code className="rounded bg-black/5 px-1">data-site-key</code> matches the site tag.</li><li>Confirm the current hostname is allowed by that tag.</li><li>Inspect the browser console and network panel for blocked requests.</li></ul></DocSection>
<DocSection id="answers" title="Answers are missing or outdated"><ul className="list-disc space-y-2 pl-5"><li>Confirm the source completed processing and is published for visitor use.</li><li>Remove conflicting or outdated copies.</li><li>Ask the question in a fresh conversation.</li><li>Rewrite broad pages into focused topics with explicit rules and exceptions.</li></ul></DocSection>
<DocSection id="handoff" title="Handoff or realtime problems"><p>Confirm at least one eligible teammate is online and not busy. Refresh the conversation after reconnecting, and check whether a stalled assignment returned to the unassigned queue.</p></DocSection>
<DocSection id="identity" title="Identity token is rejected"><p>Check HS256, audience, issued-at and expiry times, a fresh single-use token ID, and a maximum five-minute lifetime. See the complete <Link href="/docs/identity-verification#troubleshooting" className="font-semibold text-[#6d469d] underline">identity error guide</Link>.</p><Note>If a payment or plan appears delayed, wait for signed payment confirmation and then refresh billing. Do not repeat a purchase solely because the return page did not update immediately.</Note></DocSection>
</DocsShell>}
