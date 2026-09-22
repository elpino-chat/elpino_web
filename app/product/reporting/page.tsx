import type { Metadata } from "next";
import { ProductFeatureLayout } from "@/app/components/product/ProductFeatureLayout";
import { BarChart3, TrendingUp, Clock, Users, ShieldCheck, Gauge } from "lucide-react";

export const metadata: Metadata = {
  title: "Analytics & Resolution Reporting | Elpino",
  description: "Real-time support telemetry, AI resolution rates, first response time metrics, and team performance analytics.",
};

export default function ReportingPage() {
  return (
    <ProductFeatureLayout
      category="Reporting"
      title="Clear support analytics without"
      highlightedTitle="the guesswork."
      description="Track AI resolution rates, customer sentiment, response latencies, and agent workload in real time."
      features={[
        {
          title: "AI Resolution Rate Tracking",
          description: "See exact breakdown of inquiries resolved autonomously versus handed off to teammates.",
          icon: BarChart3,
          badge: "Analytics",
        },
        {
          title: "First Response & Close Time",
          description: "Monitor average customer wait times across chat, email, and social channels with SLA benchmarks.",
          icon: Clock,
        },
        {
          title: "Resolution Ledger & Auditing",
          description: "Inspect every verified AI conversation with policy citations and token usage records.",
          icon: ShieldCheck,
        },
        {
          title: "Teammate Performance",
          description: "Track individual agent ticket throughput, customer satisfaction scores (CSAT), and active hours.",
          icon: Users,
        },
        {
          title: "Usage & Cost Forecasting",
          description: "Live metering of resolution usage against monthly plan tiers to eliminate surprise billings.",
          icon: Gauge,
        },
        {
          title: "Trend & Keyword Insights",
          description: "Identify spiking customer issues, product bug trends, and seasonal inquiry volume automatically.",
          icon: TrendingUp,
        },
      ]}
      deepDiveTitle="Data-driven support operations"
      deepDiveDescription="Understand team capacity and optimize resolution speed."
    />
  );
}
