import { DocSection, DocsShell, Note } from "../_components/DocsShell";
import { docsMetadata } from "../_lib/docs";
const description = "Understand plans, seats, resolution credits, eligible handoff refunds, and automatic recharge.";
export const metadata = docsMetadata("/docs/billing", "Billing and usage", description);
export default function Page(){return <DocsShell current="/docs/billing" title="Billing and usage" description={description}>
<DocSection id="credits" title="What usage represents"><p>Elpino billing tracks plan access, seats, and resolution credits. AI-handled resolutions consume eligible credits; qualifying human handoffs can return a credit according to the active billing rules.</p></DocSection>
<DocSection id="payments" title="Payment confirmation"><p>Razorpay payment events update plan and credit state only after Elpino validates the signed webhook. Event processing is idempotent so replaying the same event does not apply the purchase twice.</p><Note>A browser success screen is not the source of truth for a completed purchase. Signed payment confirmation is.</Note></DocSection>
<DocSection id="recharge" title="Automatic recharge"><p>When auto-recharge is enabled, the workspace can purchase additional credits after reaching its configured threshold. Review the threshold, payment method, and usage history periodically.</p></DocSection>
</DocsShell>}
