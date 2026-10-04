import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2, Code2, Inbox, Ticket, Users, UserRound } from "lucide-react";
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
type SiteTag = { id: string; status?: string };

// Never renders the customer's actual message, only what happened to the conversation, so the dashboard
// can't leak chat content to anyone glancing at the screen.
function activityLabel(conversation: Conversation, memberName: string | null) {
  if (conversation.status === "resolved") return "Resolved";
  if (conversation.assignedUserId) return memberName ? `${memberName} is replying` : "A teammate is replying";
  return "AI is handling this";
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.length ? parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") : "?";
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
  let sites: SiteTag[] = [];

  if (workspace) {
    // Lazily creates the workspace-service Company row, same as the Inbox's
    // own conversations fetch does — a workspace created before this wiring
    // existed would otherwise 404 on every call below. Guarded like the rest:
    // the gateway being unreachable must degrade to empty state, not a 500.
    await callGateway("/api/workspace/companies", { organizationId: workspace.id, name: workspace.name }).catch(() => null);

    const [conversationsResult, contactsResult, ticketsResult, availabilityResult, sitesResult] = await Promise.all([
      callGateway<{ conversations?: Conversation[] }>(`/api/workspace/conversations?companyId=${encodeURIComponent(workspace.id)}`).catch(() => null),
      callGateway<{ customers?: Contact[] }>(`/api/workspace/customers?companyId=${encodeURIComponent(workspace.id)}`).catch(() => null),
      callGateway<{ tickets?: IssueTicket[] }>("/api/workspace/agent/tickets", { companyId: workspace.id, limit: 3 }).catch(() => null),
      callGateway<{ id: string; name: string }[]>(`/api/workspace/conversations/availability?companyId=${encodeURIComponent(workspace.id)}`).catch(() => null),
      callGateway<{ sites?: SiteTag[] }>(`/api/workspace/sites?companyId=${encodeURIComponent(workspace.id)}`).catch(() => null),
    ]);
    conversations = conversationsResult?.conversations ?? [];
    contacts = contactsResult?.customers ?? [];
    issues = ticketsResult?.tickets ?? [];
    members = Array.isArray(availabilityResult) ? availabilityResult : [];
    sites = sitesResult?.sites ?? [];
  }

  const memberNameById = new Map(members.map((member) => [member.id, member.name]));
  const openCount = conversations.filter((c) => c.status !== "resolved").length;
  const teamCount = conversations.filter((c) => c.assignedUserId).length;
  const aiCount = conversations.filter((c) => !c.assignedUserId).length;
  const peopleCount = contacts.length;
  const recentConversations = conversations.slice(0, 6);
  const widgetInstalled = sites.some((site) => site.status === "verified");

  const stats = [
    { label: "Open now", value: openCount, hint: "Not resolved yet", href: "/dashboard/inbox", icon: Inbox },
    { label: "Handled by AI", value: aiCount, hint: "No teammate needed", href: "/dashboard/inbox?view=ai", icon: Bot },
    { label: "With your team", value: teamCount, hint: "A teammate joined", href: "/dashboard/inbox", icon: UserRound },
    { label: "Contacts", value: peopleCount, hint: "People who left details", href: "/dashboard/contacts", icon: Users },
  ];

  return (
    <section id="dashboard-home" className="dh-page min-h-full px-4 py-7 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1100px]">
        <p className="dh-t text-[15px]">{date}</p>
        <h1 className="dh-h mt-1.5 text-[30px] font-semibold tracking-[-0.03em] sm:text-[38px]">{greeting}, {firstName}</h1>
        <p className="dh-t mt-1.5 text-[16px]">
          {conversations.length === 0 ? "Your support activity will appear here as conversations arrive." : openCount > 0 ? `You have ${openCount} open conversation${openCount === 1 ? "" : "s"}.` : "You're all caught up. Nothing is waiting."}
        </p>

        {!widgetInstalled && (
          <article className="dh-card mt-7 flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="dh-icon flex size-11 shrink-0 items-center justify-center rounded-xl"><Code2 size={20} /></span>
              <div>
                <h2 className="dh-h text-[17px] font-semibold">Install the chat widget</h2>
                <p className="dh-t mt-0.5 max-w-xl text-[14.5px] leading-6">Add one line to your website so visitors can start chatting with your AI.</p>
              </div>
            </div>
            <Link href="/dashboard/settings/tags" className="dh-btn flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border px-6 text-[15px] font-medium transition">Install widget <ArrowRight size={15} /></Link>
          </article>
        )}

        <div id="activity" className="mt-7 grid scroll-mt-4 grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map(({ label, value, hint, href, icon: Icon }) => (
            <Link key={label} href={href} className="dh-card dh-link group flex flex-col rounded-2xl border p-5 transition">
              <span className="flex items-center justify-between">
                <span className="dh-icon flex size-10 items-center justify-center rounded-xl"><Icon size={18} /></span>
                <ArrowRight size={16} className="dh-t transition group-hover:translate-x-0.5" />
              </span>
              <span className="dh-h mt-4 text-[34px] font-semibold leading-none tracking-[-0.03em]">{value}</span>
              <span className="dh-h mt-2 text-[15px] font-medium">{label}</span>
              <span className="dh-t text-[13.5px]">{hint}</span>
            </Link>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-5">
          <article data-tour="recent-activity" className="dh-card rounded-2xl border p-5 lg:col-span-3">
            <div className="flex items-center justify-between">
              <h2 className="dh-h text-[18px] font-semibold">Recent conversations</h2>
              <Link href="/dashboard/inbox" className="dh-t flex items-center gap-1.5 text-[14px] font-medium hover:underline">Open inbox <ArrowRight size={14} /></Link>
            </div>
            {recentConversations.length > 0 ? (
              <ul className="mt-3">
                {recentConversations.map((conversation) => (
                  <li key={conversation.id} className="dh-divide border-t first:border-t-0">
                    <Link href={`/dashboard/inbox?conversation=${encodeURIComponent(conversation.id)}`} className="dh-row -mx-2 flex items-center gap-3.5 rounded-xl px-2 py-3">
                      <span className="dh-icon flex size-10 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold">{initials(conversation.name)}</span>
                      <span className="min-w-0 flex-1">
                        <span className="dh-h block truncate text-[15px] font-medium">{conversation.name}</span>
                        <span className="dh-t block truncate text-[14px]">{activityLabel(conversation, conversation.assignedUserId ? memberNameById.get(conversation.assignedUserId) ?? null : null)}</span>
                      </span>
                      <span className="dh-t shrink-0 text-[13px]">{relativeTime(conversation.time)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center px-4 py-12 text-center">
                <span className="dh-icon flex size-12 items-center justify-center rounded-xl"><CheckCircle2 size={22} /></span>
                <p className="dh-h mt-4 text-[17px] font-semibold">No conversations yet</p>
                <p className="dh-t mt-1.5 max-w-[260px] text-[14.5px] leading-6">Chats from your website will show up here.</p>
              </div>
            )}
          </article>

          <article data-tour="issues" className="dh-card rounded-2xl border p-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="dh-h text-[18px] font-semibold">Issues</h2>
              <Link href="/dashboard/issues" className="dh-t flex items-center gap-1.5 text-[14px] font-medium hover:underline">View all <ArrowRight size={14} /></Link>
            </div>
            {issues.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {issues.map((issue) => (
                  <li key={`${issue.provider}-${issue.id}`} className="dh-box flex min-h-12 items-center gap-3 rounded-xl border px-4 py-2.5">
                    <Ticket size={16} className="dh-t shrink-0" />
                    <span className="dh-h truncate text-[14.5px]">{issue.title}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center px-4 py-12 text-center">
                <span className="dh-icon flex size-12 items-center justify-center rounded-xl"><Ticket size={22} /></span>
                <p className="dh-h mt-4 text-[17px] font-semibold">No issues yet</p>
                <p className="dh-t mt-1.5 max-w-[240px] text-[14.5px] leading-6">Tickets you file from a conversation, or connect from Trello and Asana, show up here.</p>
              </div>
            )}
          </article>
        </div>
      </div>
    </section>
  );
}
