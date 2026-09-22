import Link from "next/link";
import { DocSection, DocsShell, Note } from "../_components/DocsShell";
import { docsMetadata } from "../_lib/docs";
const description = "Install Elpino on your public website, configure visitor details, and verify the widget connection.";
export const metadata = docsMetadata("/docs/chat-widget", "Install the chat widget", description);
const snippet = '<script async src="https://cdn.elpino.chat/tag.js" data-site-key="YOUR_SITE_KEY"></script>';
export default function Page(){return <DocsShell current="/docs/chat-widget" title="Install the chat widget" description={description}>
<DocSection id="install" title="Add the site tag"><ol className="list-decimal space-y-3 pl-5"><li>Create a site tag in the dashboard for the domain that will host chat.</li><li>Copy the generated script and add it before the closing <code className="rounded bg-black/5 px-1">&lt;/head&gt;</code> tag on every public page that needs chat.</li><li>Deploy the page, visit the configured domain, and open the launcher.</li></ol><pre className="overflow-x-auto rounded-2xl bg-[#171914] p-5 text-sm text-white"><code>{snippet}</code></pre><Note>The site key is public. Do not place workspace secrets or identity-signing secrets in browser code.</Note></DocSection>
<DocSection id="details" title="Collect visitor details"><p>Email and name/phone collection are independent settings. Enable only the information your team needs. When enabled, Elpino can ask after the AI&apos;s first reply; when disabled, visitors may still share details naturally in chat.</p><p>Verified identity data takes priority and is not overwritten by unverified form input.</p></DocSection>
<DocSection id="identity" title="Support signed-in customers"><p>For account-specific help, continue with <Link href="/docs/identity-verification" className="font-semibold text-[#6d469d] underline">identity verification</Link>.</p></DocSection>
</DocsShell>}
