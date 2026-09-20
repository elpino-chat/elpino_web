import type { Metadata } from "next";
import { ProductFeatureLayout } from "@/app/components/product/ProductFeatureLayout";
import { Ticket, ArrowRightLeft, ShieldAlert, ListTree, CheckCircle, Tag } from "lucide-react";

export const metadata: Metadata = {
  title: "Ticketing & Issue Tracking | Elpino",
  description: "Modern ticket workflows with smart prioritization, status tracking, and automated customer notifications.",
};

export default function TicketsPage() {
  return (
    <ProductFeatureLayout
      category="Tickets"
      title="Turn chaotic support messages into"
      highlightedTitle="structured tickets."
      description="Track every complex inquiry from creation to resolution with automated status tracking, priority flags, and SLA alarms."
      features={[
        {
          title: "Automated Ticket Creation",
          description: "Converts complex customer discussions into structured tickets with assigned owners automatically.",
          icon: Ticket,
          badge: "Automated",
        },
        {
          title: "Priority Scoring & SLAs",
          description: "Flag urgent payment or outage queries automatically based on customer sentiment and account tier.",
          icon: ShieldAlert,
        },
        {
          title: "Custom Tags & Attributes",
          description: "Categorize tickets by feature request, bug report, billing query, or enterprise sales lead.",
          icon: Tag,
        },
        {
          title: "Multi-Tier Escalation",
          description: "Route technical questions directly to engineering or billing disputes to finance teammates.",
          icon: ArrowRightLeft,
        },
        {
          title: "Audit Trail & History",
          description: "Complete chronological event log of every reassignment, status change, and internal teammate note.",
          icon: ListTree,
        },
        {
          title: "Customer Status Sync",
          description: "Keep visitors notified via live widget and email updates as their ticket progresses.",
          icon: CheckCircle,
        },
      ]}
      deepDiveTitle="Structure without the enterprise bloat"
      deepDiveDescription="Clean, modern issue tracking that keeps teams aligned."
    />
  );
}
