import type { Metadata } from "next";
import { ProductFeatureLayout } from "../../components/product/ProductFeatureLayout";
import { Briefcase, Building, Users2, ShieldCheck, Headphones, Sparkles, FolderSync, Clock } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Agencies & Client Services AI Support Solutions",
  description: "Manage client inquiries, project status updates, and multi-tenant knowledge bases with Elpino.",
  alternates: { canonical: `${SITE_URL}/solutions/agencies` },
  openGraph: {
    title: "Agencies & Client Services AI Support Solutions | Elpino",
    description: "Manage client inquiries, project status updates, and multi-tenant knowledge bases with Elpino.",
    url: `${SITE_URL}/solutions/agencies`,
    type: "website",
  },
};

export default function AgenciesSolutionPage() {
  return (
    <ProductFeatureLayout
      category="Solutions / Industry"
      title="Scale white-glove client support"
      highlightedTitle="across multiple accounts."
      description="Equip digital agencies, consultancies, and service firms with AI that understands client contracts, deliverables, and SLAs."
      primaryCtaText="Start free for Agencies"
      features={[
        {
          title: "Multi-Client Knowledge Segregation",
          description: "Keep client project scopes, style guides, and documentation completely isolated with strict tenant boundaries.",
          icon: Building,
          badge: "Multi-Tenant",
        },
        {
          title: "Deliverable & Scope Clarification",
          description: "Answer client questions regarding revision rounds, turnaround times, and contract deliverables instantly.",
          icon: Briefcase,
        },
        {
          title: "Executive & Account Lead Handoffs",
          description: "Escalate urgent client requests directly to dedicated account managers with full briefing summaries.",
          icon: Users2,
        },
        {
          title: "Client Portal Integration",
          description: "Embed customized, white-labeled AI assistants directly inside your proprietary client portals or Notion hubs.",
          icon: FolderSync,
        },
        {
          title: "24/7 After-Hours Coverage",
          description: "Keep global clients supported across time zones without keeping your creative team on standby.",
          icon: Clock,
        },
        {
          title: "Confidentiality & NDA Protection",
          description: "Enterprise zero-training guarantees ensure proprietary client briefs and strategies are never leaked.",
          icon: ShieldCheck,
        },
      ]}
      deepDiveTitle="Deliver high-touch client experiences at scale"
      deepDiveDescription="Protect your agency's billable hours by letting AI resolve routine status questions and intake inquiries."
      deepDiveItems={[
        {
          title: "Client Onboarding Accelerator",
          description: "Guide new clients through asset collection, brand brief questionnaires, and account setup automatically.",
          icon: Sparkles,
          accentColor: "#168cff",
        },
        {
          title: "Emergency Escalation Routing",
          description: "Trigger SMS and Telegram alerts to project leads when a client flags a production blocker.",
          icon: Headphones,
          accentColor: "#ff6038",
        },
        {
          title: "Custom Brand Tone Adaptation",
          description: "Tailor the voice of the AI assistant to match the distinct brand tone of each client account.",
          icon: Briefcase,
          accentColor: "#8557e8",
        },
      ]}
      stats={[
        { value: "100%", label: "Client data isolation" },
        { value: "4.9/5", label: "Average client CSAT rating" },
        { value: "< 2 min", label: "Client portal deployment" },
        { value: "0", label: "Unanswered weekend briefs" },
      ]}
      faqItems={[
        {
          q: "Can we use Elpino for multiple different agency clients?",
          a: "Yes. You can create distinct workspaces or knowledge collections for each client with separated permissions and custom branding.",
        },
        {
          q: "Is client confidential data used to train public AI models?",
          a: "Never. All data processed through Elpino is encrypted with TLS and zero-retention enterprise commitments from our AI providers.",
        },
        {
          q: "Can clients book calls directly through the AI?",
          a: "Yes. Elpino integrates with Cal.com and Calendly to schedule discovery calls and project syncs within the chat window.",
        },
      ]}
    />
  );
}
