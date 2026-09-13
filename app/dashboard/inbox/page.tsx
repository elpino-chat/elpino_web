import { redirect } from "next/navigation";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";
import { DashboardClient } from "../dashboard-client";
import AiAssistPage from "../ai-assist/page";

export const metadata = {
  title: "Inbox",
  robots: { index: false, follow: false },
};

export default async function InboxPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const session = await requireSession();
  if (!session) redirect("/login");
  const { view } = await searchParams;
  const aiView = view === "ai";

  return (
    <div id="dashboard-inbox-page" className="flex h-full min-h-0 flex-col bg-[#262626] text-white">
      <div className="min-h-0 flex-1">
        {aiView ? <AiAssistPage /> : <DashboardClient name={session.name ?? ""} />}
      </div>
    </div>
  );
}
