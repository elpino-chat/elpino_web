import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";
import { SettingsClient } from "../../settings-client";

const AUDIT_VIEWS = ["assigned", "solved", "unresolved"] as const;
type AuditView = (typeof AUDIT_VIEWS)[number];

export async function generateMetadata({ params }: { params: Promise<{ view: string }> }) {
  const { view } = await params;
  if (!AUDIT_VIEWS.includes(view as AuditView)) return {};
  const label = view.charAt(0).toUpperCase() + view.slice(1);
  return { title: `${label} Audit Logs`, robots: { index: false, follow: false } };
}

export default async function AuditLogViewPage({ params }: { params: Promise<{ view: string }> }) {
  const { view } = await params;
  if (!AUDIT_VIEWS.includes(view as AuditView)) notFound();

  const session = await requireSession();
  if (!session) redirect("/login");

  return <SettingsClient user={{ email: session.email, name: session.name }} page="Audit Logs" auditView={view as AuditView} />;
}
