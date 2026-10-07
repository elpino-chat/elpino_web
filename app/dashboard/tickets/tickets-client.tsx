"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ExternalLink, LoaderCircle, MessageSquare, Sparkles, Ticket, X } from "lucide-react";
import { MenuSelect, shortAge } from "@/app/components/dashboard/inbox-list-ui";
import { fetchConversations } from "@/app/lib/fetch-conversations";

// Inbox → Tickets: every ticket filed from a conversation, kept in Elpino (a Trello/Asana copy, when one was
// sent, is linked from the detail). The Inbox sidebar picks the queue (?category=); this page lists that
// queue beside the selected ticket's details.

export type TicketCategory = "billing" | "sales" | "technical" | "support";
export const TICKET_CATEGORIES: { value: TicketCategory; label: string }[] = [
  { value: "billing", label: "Billing" },
  { value: "sales", label: "Sales" },
  { value: "technical", label: "Technical" },
  { value: "support", label: "Support" },
];

export type InboxTicket = {
  provider: string;
  id: string;
  url: string | null;
  title: string;
  conversationId: string;
  createdAt: string;
  resolved?: boolean;
  source?: string;
  reason?: string | null;
  category?: string;
  note?: string | null;
  customerName?: string | null;
};

type TicketDetail = {
  ticket: { category?: string; note?: string | null; reason: string | null; source: string };
  conversation: { id: string; topic: string | null; status: string; handledBy: string; createdAt: string; site: { domain: string; name: string | null } | null } | null;
  customer: { name: string; email: string | null; emailVerified: boolean; phone: string | null; signedIn: boolean; location: string | null; firstSeen: string; lastSeen: string } | null;
  messages: { senderType: string; body: string; createdAt: string }[];
};

type StatusFilter = "open" | "resolved" | "all";
const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "resolved", label: "Closed" },
  { value: "all", label: "All" },
];

const POLL_MS = 10_000;
export function categoryOf(ticket: InboxTicket): TicketCategory {
  return TICKET_CATEGORIES.some((option) => option.value === ticket.category) ? (ticket.category as TicketCategory) : "support";
}
const categoryLabel = (value: TicketCategory) => TICKET_CATEGORIES.find((option) => option.value === value)?.label ?? "Support";
const keyOf = (ticket: InboxTicket) => `${ticket.provider}:${ticket.id}`;
const formatDateTime = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

function raisedBy(source?: string) {
  if (source === "escalation") return "The AI, when it handed the chat to your team";
  if (source === "close_review") return "The AI, reviewing a closed conversation";
  return "A teammate";
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3 py-1.5 text-[13px]">
      <dt className="ticket-muted">{label}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="ticket-divider border-t px-6 py-5">
      <h3 className="ticket-muted mb-2 text-[11px] font-semibold uppercase tracking-[0.08em]">{title}</h3>
      {children}
    </section>
  );
}

function TicketDetailPane({ ticket, onBack, onToggleResolved }: { ticket: InboxTicket; onBack: () => void; onToggleResolved: (ticket: InboxTicket) => void }) {
  const [detail, setDetail] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  // The summary of the conversation behind this ticket: the AI's handoff notes when it wrote some, otherwise
  // one written on request. It stands in for the raw messages, which stay in the conversation.
  const [summary, setSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  // Who the conversation is with now: a teammate, the AI agent, or nobody yet.
  const [assignedTo, setAssignedTo] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    setDetail(null);
    fetch(`/api/workspace/tickets/detail?provider=${encodeURIComponent(ticket.provider)}&id=${encodeURIComponent(ticket.id)}`, { cache: "no-store" })
      .then((response) => (response.ok ? (response.json() as Promise<TicketDetail>) : Promise.reject(new Error("failed"))))
      .then((data) => { if (!cancelled) setDetail(data); })
      .catch(() => { if (!cancelled) setFailed(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [ticket.provider, ticket.id]);

  useEffect(() => {
    let cancelled = false;
    setSummary(null);
    setSummaryError(null);
    setAssignedTo(null);
    fetchConversations()
      .then((response) => (response.ok ? response.json() : null))
      .then(async (data: { conversations?: { id: string; escalationSummary?: string | null; assignedUserId?: string | null; handledBy?: string }[] } | null) => {
        const row = data?.conversations?.find((item) => item.id === ticket.conversationId);
        const notes = row?.escalationSummary?.trim();
        // A handoff the AI could not summarise leaves only a log of the thread ("ai: … customer: …"); that is no summary.
        if (!cancelled && notes && (notes.match(/^(ai|agent|customer):/gim)?.length ?? 0) < 2) setSummary(notes);
        if (!row || cancelled) return;
        if (!row.assignedUserId) { setAssignedTo(row.handledBy === "ai" ? "AI agent" : "Unassigned"); return; }
        const members = await fetch("/api/team-members", { cache: "no-store" })
          .then((response) => (response.ok ? response.json() : null))
          .then((result: { members?: { id: string; name?: string | null; email?: string }[] } | null) => result?.members ?? [])
          .catch(() => []);
        const member = members.find((item) => item.id === row.assignedUserId);
        if (!cancelled) setAssignedTo(member?.name?.trim() || member?.email || "A teammate");
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [ticket.conversationId]);

  async function summarize() {
    if (summarizing) return;
    setSummarizing(true);
    setSummaryError(null);
    try {
      const response = await fetch(`/api/workspace/conversations/${encodeURIComponent(ticket.conversationId)}/summarize`, { method: "POST" });
      const data = (await response.json().catch(() => ({}))) as { summary?: string; message?: string };
      if (!response.ok || !data.summary) setSummaryError(data.message ?? "Could not summarize this conversation.");
      else setSummary(data.summary);
    } finally {
      setSummarizing(false);
    }
  }

  const customer = detail?.customer;
  const conversation = detail?.conversation;
  const description = (ticket.note ?? detail?.ticket.note)?.trim() || (ticket.reason ?? detail?.ticket.reason)?.trim() || "";
  const copiedTo = ticket.provider === "asana" ? "Asana" : ticket.provider === "trello" ? "Trello" : null;

  return (
    <div className="ticket-card flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="ticket-divider flex items-start gap-3 border-b px-6 py-5">
        <div className="min-w-0 flex-1">
          <h1 className={`break-words text-[18px] font-semibold leading-6 ${ticket.resolved ? "ticket-muted line-through" : ""}`}>{ticket.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11.5px]">
            <span className="ticket-chip rounded-full px-2 py-0.5 font-medium">{categoryLabel(categoryOf(ticket))}</span>
            <span className={`ticket-chip rounded-full px-2 py-0.5 font-medium ${ticket.resolved ? "ticket-chip-done" : ""}`}>{ticket.resolved ? "Closed" : "Open"}</span>
            <span className="ticket-muted">Created {formatDateTime(ticket.createdAt)}</span>
          </div>
        </div>
        <button type="button" onClick={onBack} aria-label="Close" className="ticket-button flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
          <X size={16} />
        </button>
      </header>

      <div className="ticket-divider flex flex-wrap items-center gap-2 border-b px-6 py-3.5">
        <button type="button" onClick={() => onToggleResolved(ticket)} aria-pressed={!!ticket.resolved} className="ticket-button inline-flex h-8 items-center gap-2 rounded-full px-3.5 text-[12.5px] font-semibold">
          <Check size={14} /> {ticket.resolved ? "Reopen" : "Close ticket"}
        </button>
        <Link href={`/dashboard/inbox?view=all&conversation=${encodeURIComponent(ticket.conversationId)}`} className="ticket-button inline-flex h-8 items-center gap-2 rounded-full px-3.5 text-[12.5px] font-semibold">
          <MessageSquare size={14} /> Open conversation
        </Link>
        {ticket.url && copiedTo && (
          <a href={ticket.url} target="_blank" rel="noreferrer" className="ticket-button inline-flex h-8 items-center gap-2 rounded-full px-3.5 text-[12.5px] font-semibold">
            <ExternalLink size={14} /> Open in {copiedTo}
          </a>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* The ticket at a glance: where it stands, who has it, and where it came from. */}
        <section className="ticket-divider border-b px-6 py-4">
          <dl>
            <Field label="Status">{ticket.resolved ? "Closed" : "Open"}</Field>
            <Field label="Category">{categoryLabel(categoryOf(ticket))}</Field>
            <Field label="Assigned to">{assignedTo ?? "…"}</Field>
            <Field label="Customer">{ticket.customerName || customer?.name || "…"}</Field>
          </dl>
          <dl className="mt-1">
            <Field label="Created">{formatDateTime(ticket.createdAt)}</Field>
            <Field label="Raised by">{raisedBy(ticket.source)}</Field>
            <Field label="Kept in">{copiedTo ? `Elpino, with a copy in ${copiedTo}` : "Elpino"}</Field>
            <Field label="Ticket ref">#{ticket.id.replace(/-/g, "").slice(0, 8).toUpperCase()}</Field>
          </dl>
        </section>

        {loading && <div className="ticket-divider ticket-muted flex items-center justify-center gap-2 border-b py-6 text-[12.5px]"><LoaderCircle size={15} className="animate-spin" /> Loading details</div>}
        {failed && <p className="ticket-divider ticket-muted border-b px-6 py-6 text-center text-[12.5px]">Could not load the customer and conversation details.</p>}

        <div>
          <div>
            <Section title="Details">
              <p className="whitespace-pre-wrap text-[13px] leading-6">{description || "No details were saved with this ticket."}</p>
            </Section>
            <Section title="Summary">
              {summary ? (
                <>
                  <p className="whitespace-pre-wrap text-[13px] leading-6">{summary}</p>
                  <button type="button" onClick={() => void summarize()} disabled={summarizing} className="ticket-muted mt-3 inline-flex items-center gap-1.5 text-[12px] underline-offset-4 hover:underline disabled:opacity-60">
                    {summarizing ? <LoaderCircle size={12} className="animate-spin" /> : <Sparkles size={12} />} {summarizing ? "Summarizing…" : "Summarize again with AI"}
                  </button>
                </>
              ) : (
                <button type="button" onClick={() => void summarize()} disabled={summarizing} className="ticket-button inline-flex h-8 items-center gap-2 rounded-full px-3.5 text-[12.5px] font-semibold disabled:opacity-60">
                  {summarizing ? <LoaderCircle size={14} className="animate-spin" /> : <Sparkles size={14} />} {summarizing ? "Summarizing…" : "Summarize with AI"}
                </button>
              )}
              {summaryError && <p className="mt-2 text-[12px] text-[#c0554f]">{summaryError}</p>}
            </Section>
          </div>

          <div>
            {customer && (
              <Section title="Customer">
                <dl>
                  <Field label="Name">{customer.name}</Field>
                  <Field label="Email">{customer.email ? `${customer.email}${customer.emailVerified ? " (verified)" : ""}` : "Not given"}</Field>
                  <Field label="Phone">{customer.phone || "Not given"}</Field>
                  <Field label="Account">{customer.signedIn ? "Signed in on your site" : "Anonymous visitor"}</Field>
                  {customer.location && <Field label="Location">{customer.location}</Field>}
                  <Field label="Last seen">{formatDateTime(customer.lastSeen)}</Field>
                </dl>
              </Section>
            )}
            {conversation && (
              <Section title="Conversation">
                <dl>
                  {conversation.topic && <Field label="Topic">{conversation.topic}</Field>}
                  <Field label="Status"><span className="capitalize">{conversation.status}</span></Field>
                  <Field label="Handled by">{conversation.handledBy === "ai" ? "AI" : "Your team"}</Field>
                  {conversation.site && <Field label="Website">{conversation.site.name || conversation.site.domain}</Field>}
                  <Field label="Started">{formatDateTime(conversation.createdAt)}</Field>
                </dl>
              </Section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TicketsInbox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const category = TICKET_CATEGORIES.some((option) => option.value === categoryParam) ? (categoryParam as TicketCategory) : null;

  const [tickets, setTickets] = useState<InboxTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<StatusFilter>("open");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  // Customer names by conversation, for tickets whose own record carries none (older servers send no name).
  const [names, setNames] = useState<Record<string, string>>({});
  useEffect(() => {
    let cancelled = false;
    fetchConversations()
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { conversations?: { id: string; name?: string }[] } | null) => {
        if (cancelled || !data?.conversations) return;
        setNames(Object.fromEntries(data.conversations.filter((item) => item.name).map((item) => [item.id, item.name as string])));
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = () => fetch("/api/workspace/tickets", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { tickets?: InboxTicket[] } | null) => { if (!cancelled && data) setTickets(data.tickets ?? []); })
      .catch(() => undefined)
      .finally(() => { if (!cancelled) setLoading(false); });
    void load();
    const interval = window.setInterval(load, POLL_MS);
    return () => { cancelled = true; window.clearInterval(interval); };
  }, []);

  const inQueue = useMemo(() => tickets.filter((ticket) => !category || categoryOf(ticket) === category), [tickets, category]);
  const statusCounts = useMemo(() => {
    const resolved = inQueue.filter((ticket) => ticket.resolved).length;
    return { open: inQueue.length - resolved, resolved, all: inQueue.length };
  }, [inQueue]);
  const visible = useMemo(
    () => inQueue.filter((ticket) => status === "all" || (status === "resolved" ? ticket.resolved : !ticket.resolved)),
    [inQueue, status],
  );
  const selected = tickets.find((ticket) => keyOf(ticket) === selectedKey) ?? null;

  async function toggleResolved(ticket: InboxTicket) {
    const resolved = !ticket.resolved;
    const apply = (value: boolean) => setTickets((current) => current.map((item) => (keyOf(item) === keyOf(ticket) ? { ...item, resolved: value } : item)));
    apply(resolved);
    const response = await fetch("/api/workspace/tickets/resolve", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ provider: ticket.provider, id: ticket.id, resolved }),
    }).catch(() => null);
    if (!response?.ok) apply(!resolved);
  }

  return (
    <div id="dashboard-tickets" className="flex h-full min-h-0 flex-col">
      <div className="ticket-card il-root flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="il-head px-4 pb-2 pt-2">
          <div className="flex h-[52px] items-center gap-2">
            <Ticket size={16} className="il-name shrink-0" />
            <h1 className="il-name min-w-0 flex-1 truncate text-[17px] font-semibold">{category ? `${categoryLabel(category)} tickets` : "All tickets"}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div role="tablist" aria-label="Ticket status" className="flex items-center gap-6">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="tab"
                  aria-selected={status === option.value}
                  onClick={() => setStatus(option.value)}
                  className="ticket-tab flex cursor-pointer items-center gap-2 border-b-2 border-transparent pb-2.5 pt-1 text-[14px]"
                >
                  {option.label}
                  <span className="ticket-tab-count rounded-full px-1.5 text-[11.5px] tabular-nums">{statusCounts[option.value]}</span>
                </button>
              ))}
            </div>
            {/* The queues are the third sidebar from xl up; below that they are picked here. */}
            <div className="xl:hidden">
              <MenuSelect
                label="Queue"
                value={category ?? "all"}
                options={[{ value: "all", label: "All tickets" }, ...TICKET_CATEGORIES]}
                onChange={(value) => router.push(value === "all" ? "/dashboard/tickets" : `/dashboard/tickets?category=${value}`)}
              />
            </div>
          </div>
        </div>

        {/* Column titles, from md up; on a phone each row stacks its own details. */}
        <div className="ticket-divider ticket-muted hidden border-y px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] md:grid md:grid-cols-[minmax(0,2.4fr)_minmax(0,1.3fr)_110px_90px_70px] md:gap-4">
          <span>Ticket</span><span>Customer</span><span>Category</span><span>Status</span><span className="text-right">Created</span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {loading && <div className="ticket-muted flex items-center justify-center gap-2 py-10 text-[12.5px]"><LoaderCircle size={15} className="animate-spin" /> Loading tickets</div>}
          {visible.map((ticket) => {
            const open = keyOf(ticket) === selectedKey;
            return (
              <button
                key={keyOf(ticket)}
                type="button"
                onClick={() => setSelectedKey(keyOf(ticket))}
                aria-haspopup="dialog"
                className={`ticket-row ticket-divider grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 border-b px-4 py-3 text-left transition-colors md:grid-cols-[minmax(0,2.4fr)_minmax(0,1.3fr)_110px_90px_70px] ${open ? "ticket-row-on" : ""}`}
              >
                <span className={`min-w-0 truncate text-[13.5px] font-medium ${ticket.resolved ? "ticket-muted line-through" : ""}`}>{ticket.title}</span>
                <span className="ticket-muted truncate text-right text-[12px] md:hidden">{shortAge(ticket.createdAt)}</span>
                <span className="ticket-muted col-span-2 truncate text-[12.5px] md:col-span-1">{ticket.customerName || names[ticket.conversationId] || "—"}</span>
                <span className="col-span-2 md:col-span-1"><span className="ticket-chip inline-block rounded-full px-2 py-0.5 text-[11.5px] font-medium">{categoryLabel(categoryOf(ticket))}</span></span>
                <span className="col-span-2 md:col-span-1"><span className={`ticket-chip inline-block rounded-full px-2 py-0.5 text-[11.5px] font-medium ${ticket.resolved ? "ticket-chip-done" : ""}`}>{ticket.resolved ? "Closed" : "Open"}</span></span>
                <span className="ticket-muted hidden text-right text-[12px] tabular-nums md:block">{shortAge(ticket.createdAt)}</span>
              </button>
            );
          })}
          {!loading && visible.length === 0 && (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <Ticket size={22} className="ticket-muted" />
              <p className="mt-3 text-[14px] font-semibold">No tickets here</p>
              <p className="ticket-muted mt-1 max-w-[300px] text-[13px] leading-5">
                {status === "open" ? "Nothing open in this queue." : "Nothing matches this filter."} Tickets are filed from a conversation, or by the AI when it hands a chat to your team.
              </p>
            </div>
          )}
        </div>
      </div>

      {selected && <TicketDrawer ticket={{ ...selected, customerName: selected.customerName || names[selected.conversationId] || null }} onClose={() => setSelectedKey(null)} onToggleResolved={(ticket) => void toggleResolved(ticket)} />}
    </div>
  );
}

// The ticket's details slide in from the right over the list; a click outside it, or Escape, slides it away.
function TicketDrawer({ ticket, onClose, onToggleResolved }: { ticket: InboxTicket; onClose: () => void; onToggleResolved: (ticket: InboxTicket) => void }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setShown(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[80]" role="presentation">
      <div onClick={onClose} className={`absolute inset-0 bg-black/30 transition-opacity duration-200 ${shown ? "opacity-100" : "opacity-0"}`} aria-hidden="true" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Ticket details"
        className={`ticket-drawer absolute inset-y-0 right-0 flex w-full max-w-[560px] flex-col shadow-[-16px_0_40px_rgba(15,18,22,0.22)] transition-transform duration-300 ease-out ${shown ? "translate-x-0" : "translate-x-full"}`}
      >
        <TicketDetailPane ticket={ticket} onBack={onClose} onToggleResolved={onToggleResolved} />
      </aside>
    </div>
  );
}
