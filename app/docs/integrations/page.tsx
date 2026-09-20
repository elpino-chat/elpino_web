import { DocSection, DocsShell, Note } from "../_components/DocsShell";
import { docsMetadata } from "../_lib/docs";
const description = "Connect supported payment, project-management, and MCP tools to your Elpino workspace.";
export const metadata = docsMetadata("/docs/integrations", "Integrations", description);
export default function Page(){return <DocsShell current="/docs/integrations" title="Integrations" description={description}>
<DocSection id="available" title="Available connections"><p>The dashboard currently supports Asana through OAuth, plus Trello, Stripe, Razorpay, Cashfree, and Paystack through their respective credentials. MCP server connections can extend the tools available to your workspace.</p></DocSection>
<DocSection id="connect" title="Connect safely"><ol className="list-decimal space-y-3 pl-5"><li>Open Connect in the dashboard and choose a supported provider.</li><li>Authorize with OAuth or enter the requested provider credentials.</li><li>Test the connection with a low-risk action before relying on it in customer workflows.</li><li>Remove or rotate access when ownership changes.</li></ol><Note>Never paste provider secrets into chat messages, public knowledge pages, or widget code.</Note></DocSection>
</DocsShell>}
