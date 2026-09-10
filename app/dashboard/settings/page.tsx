import { redirect } from "next/navigation";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";
import { SettingsClient } from "./settings-client";

export const metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const session = await requireSession();
  if (!session) redirect("/login");
  return <SettingsClient user={{ email: session.email, name: session.name }} />;
}
