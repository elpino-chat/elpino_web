import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";
import { SettingsClient } from "../settings-client";

const SETTINGS_SECTIONS: Record<string, string> = {
  people: "People",
  teams: "Members",
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
  information: "Information",
  "setup-integration": "Setup & Integration",
  "danger-zone": "Danger Zone",
};

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const title = SETTINGS_SECTIONS[section];
  return title ? { title: `${title} Settings`, robots: { index: false, follow: false } } : {};
}

export default async function SettingsSectionPage({ params, searchParams }: { params: Promise<{ section: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { section } = await params;
  // The old standalone Upgrade page is gone: plans open in the full-screen dialog now.
  if (section === "upgrade") redirect("/dashboard/settings/billing");
  // Connectors live on Setup & Integration only; the separate Plugins page is gone. Old links
  // and bookmarks land there, with any query string (e.g. ?connected=stripe) carried through.
  if (section === "plugins") {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(await searchParams)) if (typeof value === "string") query.set(key, value);
    const suffix = query.toString();
    redirect(`/dashboard/settings/setup-integration${suffix ? `?${suffix}` : ""}`);
  }
  const page = SETTINGS_SECTIONS[section];
  if (!page) notFound();

  const session = await requireSession();
  if (!session) redirect("/login");

  return <SettingsClient user={{ email: session.email, name: session.name }} page={page} />;
}
