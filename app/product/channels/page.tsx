import type { Metadata } from "next";
import { ProductFeatureLayout } from "@/app/components/product/ProductFeatureLayout";
import { MessageSquare, Mail, MessageCircle, Hash, Share2, Layers } from "lucide-react";

export const metadata: Metadata = {
  title: "Omnichannel Support & Connectors | Elpino",
  description: "Connect your website live chat widget, email, Slack, and billing connectors into one unified customer stream.",
};

export default function ChannelsPage() {
  return (
    <ProductFeatureLayout
      category="Channels"
      title="Meet your customers wherever"
      highlightedTitle="they reach out."
      description="Connect your embeddable live chat widget, support email address, and Slack channels into a synchronized inbox."
      features={[
        {
          title: "Embeddable Chat Widget",
          description: "Lightweight, customizable live chat widget with dark/light themes and brand color matching.",
          icon: MessageSquare,
          badge: "Live Chat",
        },
        {
          title: "Two-Way Email Support",
          description: "Forward your help@ or support@ inbox to automatically draft AI replies and organize ticket threads.",
          icon: Mail,
        },
        {
          title: "Slack Workspace Integration",
          description: "Receive instant notifications when conversations require human assistance and reply directly in Slack.",
          icon: Hash,
        },
        {
          title: "Payment & Order Connectors",
          description: "Read-only integrations with Stripe and Razorpay to verify order status, delivery, and refunds.",
          icon: Layers,
        },
        {
          title: "Visitor Telemetry & Context",
          description: "Capture user operating system, browser, country, and active URL path alongside every message.",
          icon: Share2,
        },
        {
          title: "Social & Webhooks",
          description: "Extensible webhook API for connecting bespoke CRMs, WhatsApp, and internal business backends.",
          icon: MessageCircle,
        },
      ]}
      deepDiveTitle="Unified Omnichannel Inbox"
      deepDiveDescription="One stream for all inbound conversations across every platform."
    />
  );
}
