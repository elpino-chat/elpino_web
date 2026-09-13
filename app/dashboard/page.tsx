import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Inbox, Sparkles, Ticket } from "lucide-react";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";
import { selectedWorkspace } from "@/app/api/_lib/workspace";
import { callGateway } from "@/app/api/auth/_lib/gateway";

export const metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

type Conversation = {
  id: string;
  name: string;
  preview: string;
  time: string;
  status: "open" | "waiting" | "resolved";
  assignedUserId?: string | null;
  handledBy?: string;
};
type Contact = { id: string };
type IssueTicket = { id: string; title: string; provider: string };
type TeamMember = { id: string; name: string };

// Never renders the customer's actual message — only what happened to the
// conversation — so the dashboard's activity feed can't leak chat content to
// anyone glancing at the screen.
function activityLabel(conversation: Conversation, memberName: string | null) {
  if (conversation.status === "resolved") return `Conversation with ${conversation.name} was resolved`;
  if (conversation.assignedUserId) return memberName ? `${memberName} joined the conversation with ${conversation.name}` : `A teammate joined the conversation with ${conversation.name}`;
  return `AI is handling a conversation with ${conversation.name}`;
}

// "3h ago", "2d ago" — short enough for a one-line activity row.
function relativeTime(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(ms / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export default async function DashboardPage() {
  const session = await requireSession();
  if (!session) redirect("/login");

  const firstName = session.name?.trim().split(/\s+/)[0] || "there";
  const now = new Date();
  const date = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "Asia/Kolkata" }).format(now);
  const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Kolkata" }).format(now));
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const workspace = await selectedWorkspace(session.email);

  let conversations: Conversation[] = [];
  let contacts: Contact[] = [];
  let issues: IssueTicket[] = [];
  let members: TeamMember[] = [];

  if (workspace) {
    // Lazily creates the workspace-service Company row, same as the Inbox's
    // own conversations fetch does — a workspace created before this wiring
    // existed would otherwise 404 on every call below. Guarded like the rest:
    // the gateway being unreachable must degrade to empty state, not a 500.
    await callGateway("/api/workspace/companies", { organizationId: workspace.id, name: workspace.name }).catch(() => null);

    const [conversationsResult, contactsResult, ticketsResult, availabilityResult] = await Promise.all([
      callGateway<{ conversations?: Conversation[] }>(`/api/workspace/conversations?companyId=${encodeURIComponent(workspace.id)}`).catch(() => null),
      callGateway<{ customers?: Contact[] }>(`/api/workspace/customers?companyId=${encodeURIComponent(workspace.id)}`).catch(() => null),
      callGateway<{ tickets?: IssueTicket[] }>("/api/workspace/agent/tickets", { companyId: workspace.id, limit: 3 }).catch(() => null),
      callGateway<{ id: string; name: string }[]>(`/api/workspace/conversations/availability?companyId=${encodeURIComponent(workspace.id)}`).catch(() => null),
    ]);
    conversations = conversationsResult?.conversations ?? [];
    contacts = contactsResult?.customers ?? [];
    issues = ticketsResult?.tickets ?? [];
    members = Array.isArray(availabilityResult) ? availabilityResult : [];
  }

  const memberNameById = new Map(members.map((member) => [member.id, member.name]));
  const assignedCount = conversations.filter((c) => c.assignedUserId).length;
  const automatedCount = conversations.filter((c) => !c.assignedUserId).length;
  const peopleCount = contacts.length;
  const recentConversations = conversations.slice(0, 5);

  return (
    <section className="min-h-full bg-[#262626] px-6 py-7 text-white lg:px-10">
      <div className="mx-auto max-w-[1200px]">
        <p className="text-sm font-normal text-white/70">{date}</p>
        <h1 className="mt-2 text-3xl font-normal tracking-[-0.03em] sm:text-4xl">{greeting}, {firstName}</h1>

        <div className="mt-7 grid gap-4 xl:grid-cols-2">
          <article id="activity" className="min-h-[300px] scroll-mt-4 rounded-xl border border-white/10 bg-[#262626] p-6">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2.5 text-xl font-normal"><Inbox size={21} className="text-[#8db8ff]" /> Inbox</h2>
              <Link href="/dashboard/inbox" className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white">Open inbox <ArrowRight size={14} /></Link>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-2 border-y border-white/[0.07] py-5 text-center">
              {([
                ["Assigned", assignedCount],
                ["Automated", automatedCount],
                ["People", peopleCount],
              ] as const).map(([label, value]) => (
                <div key={label}>
                  <p className="text-2xl font-normal text-white/90">{value}</p>
                  <p className="mt-1 text-xs text-white/40">{label}</p>
                </div>
              ))}
            </div>
            <p className="mt-7 text-sm text-white/45">
              {conversations.length === 0 ? "Your support activity will appear here as conversations arrive." : `${conversations.length} conversation${conversations.length === 1 ? "" : "s"} total.`}
            </p>
          </article>

          <article className="min-h-[300px] rounded-xl border border-white/10 bg-[#262626] p-6">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2.5 text-xl font-normal"><Ticket size={21} className="text-[#7dd3a8]" /> Issues</h2>
              <Link href="/dashboard/issues" className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white">View issues <ArrowRight size={14} /></Link>
            </div>
            {issues.length > 0 ? (
              <div className="mt-8 space-y-2">
                {issues.map((issue) => (
                  <div key={`${issue.provider}-${issue.id}`} className="flex h-12 items-center gap-3 rounded-lg border border-white/[0.07] bg-white/[0.025] px-4 text-sm text-white/55">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#7dd3a8]" />
                    <span className="truncate">{issue.title}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-8 flex min-h-[140px] flex-col items-center justify-center rounded-lg border border-dashed border-white/[0.12] px-4 py-8 text-center">
                <p className="text-sm text-white/55">No issues yet</p>
                <p className="mt-1 max-w-[240px] text-xs text-white/35">Tickets you file from a conversation, or connect from Trello and Asana, will show up here.</p>
              </div>
            )}
          </article>
        </div>

        <article className="mt-4 rounded-xl border border-white/10 bg-[#262626] p-6">
          <h2 className="flex items-center gap-2.5 text-xl font-normal"><Sparkles size={20} className="text-[#e2b64a]" /> Recent activity</h2>
          {recentConversations.length > 0 ? (
            <div className="mt-5 divide-y divide-white/[0.07]">
              {recentConversations.map((conversation) => (
                <Link
                  key={conversation.id}
                  href={`/dashboard/inbox?conversation=${encodeURIComponent(conversation.id)}`}
                  className="flex items-center gap-3 py-3.5 text-sm transition hover:bg-white/[0.03]"
                >
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${conversation.status === "resolved" ? "bg-white/25" : conversation.assignedUserId ? "bg-[#8db8ff]" : "bg-[#7dd3a8]"}`} />
                  <span className="min-w-0 flex-1 truncate text-white/80">
                    {activityLabel(conversation, conversation.assignedUserId ? memberNameById.get(conversation.assignedUserId) ?? null : null)}
                  </span>
                  <span className="shrink-0 text-xs text-white/35">{relativeTime(conversation.time)}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-sm text-white/45">Nothing's happened yet — activity from your conversations will show up here.</p>
          )}
        </article>
      </div>
    </section>
  );
}
