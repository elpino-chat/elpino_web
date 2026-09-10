import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";
import { SettingsClient } from "../settings-client";

const SETTINGS_SECTIONS: Record<string, string> = {
  people: "People",
  teams: "Teams",
  upgrade: "Upgrade",
  billing: "Billing",
  availability: "Availability",
  chatbot: "Chatbot Interface",
  "ai-usage": "AI Usage",
  "security-permissions": "Security & Permissions",
  "audit-logs": "Audit Logs",
  "presence-log": "Presence Log",
  trash: "Trash",
  "custom-fields": "Custom Field Manager",
  tags: "Tag Manager",
  translations: "Translations",
};

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const title = SETTINGS_SECTIONS[section];
  return title ? { title: `${title} Settings`, robots: { index: false, follow: false } } : {};
}

export default async function SettingsSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const page = SETTINGS_SECTIONS[section];
  if (!page) notFound();

  const session = await requireSession();
  if (!session) redirect("/login");

  return <SettingsClient user={{ email: session.email, name: session.name }} page={page} />;
}
