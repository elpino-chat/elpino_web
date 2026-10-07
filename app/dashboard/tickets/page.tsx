import { Suspense } from "react";
import { redirect } from "next/navigation";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";
import TicketsInbox from "./tickets-client";

export const metadata = {
  title: "Tickets",
  robots: { index: false, follow: false },
};

// Its own page beside the Inbox, with its own sidebar of queues (TicketsNavPanel in the dashboard layout).
// It shares the Inbox's page id so the conversation list styles apply to the ticket list as well.
export default async function TicketsPage() {
  const session = await requireSession();
  if (!session) redirect("/login");
  return (
    <div id="dashboard-inbox-page" className="flex h-full min-h-0 flex-col bg-[#262626] text-white">
      <div className="min-h-0 flex-1">
        <Suspense fallback={null}>
          <TicketsInbox />
        </Suspense>
      </div>
    </div>
  );
}
