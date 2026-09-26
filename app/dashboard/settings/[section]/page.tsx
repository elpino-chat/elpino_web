import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";
import { SettingsClient } from "../settings-client";

const SETTINGS_SECTIONS: Record<string, string> = {
  people: "People",
  teams: "Teams",
  billing: "Billing",
  availability: "Availability",
  chatbot: "Chatbot Interface",
  "chatbot-restrictions": "Restrictions",
  "chatbot-behavior": "Behavior",
  "ai-usage": "Usage",
  "security-permissions": "Security & Permissions",
  "audit-logs": "Audit Logs",
  "presence-log": "Presence Log",
  trash: "Trash",
  tags: "Tag Manager",
  identity: "Identity Verification",
  translations: "Translations",
  plugins: "Plugins",
  information: "Information",
  "setup-integration": "Setup & Integration",
  "data-legal": "Data Limits & Legal",
  "danger-zone": "Danger Zone",
};

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const title = SETTINGS_SECTIONS[section];
  return title ? { title: `${title} Settings`, robots: { index: false, follow: false } } : {};
}

export default async function SettingsSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  // The old standalone Upgrade page is gone: plans open in the full-screen dialog now.
  if (section === "upgrade") redirect("/dashboard/settings/billing");
  const page = SETTINGS_SECTIONS[section];
  if (!page) notFound();

  const session = await requireSession();
  if (!session) redirect("/login");

  return <SettingsClient user={{ email: session.email, name: session.name }} page={page} />;
}
