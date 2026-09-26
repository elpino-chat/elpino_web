import { DocSection, DocsShell, Note } from "../_components/DocsShell";
import { docsMetadata } from "../_lib/docs";
const description = "Understand plans, seats, AI credit, how handoffs are treated, and automatic recharge.";
export const metadata = docsMetadata("/docs/billing", "Billing and usage", description);
export default function Page(){return <DocsShell current="/docs/billing" title="Billing and usage" description={description}>
<DocSection id="credits" title="What usage represents"><p>Elpino billing tracks plan access, seats, and AI usage. The Free plan includes 100 AI messages a month; every reply the AI sends counts as one. Paid plans include a monthly AI credit that the AI spends as it works, so short conversations cost less than long ones; the pricing page lists the credit each plan includes. When the AI hands a conversation to your team, the handoff itself costs nothing extra on every plan. You can see your allowances under Workspace, then Usage.</p></DocSection>
<DocSection id="payments" title="Payment confirmation"><p>Razorpay payment events update plan and credit state only after Elpino validates the signed webhook. Event processing is idempotent so replaying the same event does not apply the purchase twice.</p><Note>A browser success screen is not the source of truth for a completed purchase. Signed payment confirmation is.</Note></DocSection>
<DocSection id="recharge" title="Automatic recharge"><p>When your monthly credit runs out, the AI hands new conversations to your team until you top up or the month resets. Top-ups never expire. When auto-recharge is enabled, the workspace buys more credit automatically after reaching its configured threshold. Review the threshold, payment method, and usage history periodically.</p></DocSection>
</DocsShell>}
