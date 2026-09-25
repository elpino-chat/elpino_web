"use client";

import { useEffect, useState } from "react";
import { Check, ExternalLink, LoaderCircle, MessageSquare, Ticket, X } from "lucide-react";

type Issue = { id: string; title: string; provider: string; url?: string | null; conversationId: string; createdAt: string; resolved?: boolean; source?: string; reason?: string | null };

type IssueDetail = {
  ticket: { provider: string; id: string; url: string | null; title: string; resolved: boolean; source: string; reason: string | null; createdAt: string };
  conversation: { id: string; topic: string | null; status: string; handledBy: string; createdAt: string; site: { domain: string; name: string | null } | null } | null;
  customer: {
    name: string; email: string | null; emailVerified: boolean; phone: string | null; signedIn: boolean; location: string | null;
    userAgent: string | null; customFields: Record<string, string>; firstSeen: string; lastSeen: string;
  } | null;
  messages: { senderType: string; body: string; createdAt: string }[];
};

// Where a ticket lives and who raised it. "elpino" means no project tool was
// connected, so the ticket exists on this page only.
function issueLabel(issue: Issue) {
  const where = issue.provider === "elpino" ? "Not sent to a project tool" : `${issue.provider[0]?.toUpperCase() ?? ""}${issue.provider.slice(1)} ticket`;
  const who = issue.source === "close_review" ? "Flagged by AI review" : issue.source === "escalation" ? "Filed at AI handoff" : null;
  return [who, where, issue.resolved ? "resolved" : null].filter(Boolean).join(" · ");
}

function raisedBy(source: string) {
  return source === "close_review" ? "Flagged by AI review of a closed conversation" : source === "escalation" ? "Filed by the AI when it handed the chat to your team" : "Filed by a teammate";
}

function providerName(provider: string) {
  return provider === "elpino" ? "Elpino only (no project tool connected)" : `${provider[0]?.toUpperCase() ?? ""}${provider.slice(1)}`;
}

// A readable "Chrome on Windows" from the raw user agent, which is all that is stored.
function describeBrowser(userAgent: string | null) {
  if (!userAgent) return null;
  const browser = /Edg\//.test(userAgent) ? "Edge" : /OPR\//.test(userAgent) ? "Opera" : /Firefox\//.test(userAgent) ? "Firefox" : /Chrome\//.test(userAgent) ? "Chrome" : /Safari\//.test(userAgent) ? "Safari" : null;
  const system = /Windows/.test(userAgent) ? "Windows" : /Android/.test(userAgent) ? "Android" : /iPhone|iPad|iOS/.test(userAgent) ? "iOS" : /Mac OS X/.test(userAgent) ? "macOS" : /Linux/.test(userAgent) ? "Linux" : null;
  return [browser, system].filter(Boolean).join(" on ") || null;
}

const formatDateTime = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3 py-1.5 text-[13px]">
      <dt className="text-white/40">{label}</dt>
      <dd className="min-w-0 break-words text-white/85">{children}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-white/[0.07] px-6 py-5">
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/40">{title}</h3>
      {children}
    </section>
  );
}

function IssueDrawer({ issue, onClose, onToggleResolved }: { issue: Issue; onClose: () => void; onToggleResolved: (issue: Issue) => void }) {
  const [detail, setDetail] = useState<IssueDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    setDetail(null);
    fetch(`/api/workspace/tickets/detail?provider=${encodeURIComponent(issue.provider)}&id=${encodeURIComponent(issue.id)}`, { cache: "no-store" })
      .then((response) => (response.ok ? (response.json() as Promise<IssueDetail>) : Promise.reject(new Error("failed"))))
      .then((data) => { if (!cancelled) setDetail(data); })
      .catch(() => { if (!cancelled) setFailed(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [issue.provider, issue.id]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const customer = detail?.customer;
  const conversation = detail?.conversation;
  const browser = describeBrowser(customer?.userAgent ?? null);
  const customFields = Object.entries(customer?.customFields ?? {}).filter(([, value]) => String(value ?? "").trim());
  const conversationHref = `/dashboard/inbox?conversation=${encodeURIComponent(issue.conversationId)}`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <aside role="dialog" aria-modal="true" aria-label="Issue details" className="flex h-full w-full max-w-[480px] flex-col border-l border-white/10 bg-[#292a2b] shadow-2xl">
        <header className="flex items-start gap-3 px-6 py-5">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/40">Issue</p>
            <h2 className={`mt-1 break-words text-[18px] font-semibold leading-6 ${issue.resolved ? "text-white/45 line-through" : "text-white/85"}`}>{issue.title}</h2>
            <p className="mt-1 text-[12px] text-white/45">Created {formatDateTime(issue.createdAt)}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white/55 hover:bg-white/[0.04]">
            <X size={16} />
          </button>
        </header>

        <div className="flex flex-wrap items-center gap-2 px-6 pb-5">
          <button
            type="button"
            onClick={() => onToggleResolved(issue)}
            aria-pressed={!!issue.resolved}
            className="inline-flex h-8 items-center gap-2 rounded-lg border border-white/20 px-3 text-[12.5px] font-medium text-white/85 hover:bg-white/[0.04]"
          >
            <span className={`flex h-4 w-4 items-center justify-center rounded border ${issue.resolved ? "border-[#35b92c] bg-[#35b92c]" : "border-white/20"}`}>
              {issue.resolved && <Check size={11} className="text-black" strokeWidth={3} />}
            </span>
            {issue.resolved ? "Resolved" : "Mark as resolved"}
          </button>
          <a href={conversationHref} className="inline-flex h-8 items-center gap-2 rounded-lg border border-white/20 px-3 text-[12.5px] font-medium text-white/85 hover:bg-white/[0.04]">
            <MessageSquare size={14} /> Open conversation
          </a>
          {issue.url && (
            <a href={issue.url} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-2 rounded-lg border border-white/20 px-3 text-[12.5px] font-medium text-white/85 hover:bg-white/[0.04]">
              <ExternalLink size={14} /> Open in {providerName(issue.provider)}
            </a>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <Section title="Description">
            <p className="whitespace-pre-wrap text-[13px] leading-6 text-white/85">
              {issue.reason?.trim() || detail?.ticket.reason?.trim() || "No summary was saved with this ticket. The recent messages below show what happened."}
            </p>
            <dl className="mt-3">
              <Field label="Raised by">{raisedBy(issue.source ?? "manual")}</Field>
              <Field label="Sent to">{providerName(issue.provider)}</Field>
            </dl>
          </Section>

          {loading && (
            <div className="flex items-center justify-center gap-2 border-t border-white/[0.07] py-10 text-[12.5px] text-white/45"><LoaderCircle size={15} className="animate-spin" /> Loading details</div>
          )}
          {failed && <p className="border-t border-white/[0.07] px-6 py-8 text-center text-[12.5px] text-white/45">Could not load the customer and conversation details. Close this and try again.</p>}

          {customer && (
            <Section title="Client details">
              <dl>
                <Field label="Name">{customer.name}</Field>
                <Field label="Email">
                  {customer.email ? (
                    <span>{customer.email}{customer.emailVerified && <span className="ml-2 rounded-full border border-white/20 px-2 py-0.5 text-[10.5px] text-white/55">Verified</span>}</span>
                  ) : "Not given"}
                </Field>
                <Field label="Phone">{customer.phone || "Not given"}</Field>
                <Field label="Account">{customer.signedIn ? "Signed in on your site" : "Anonymous visitor"}</Field>
                {customer.location && <Field label="Location">{customer.location}</Field>}
                {browser && <Field label="Device">{browser}</Field>}
                <Field label="First seen">{formatDateTime(customer.firstSeen)}</Field>
                <Field label="Last seen">{formatDateTime(customer.lastSeen)}</Field>
                {customFields.map(([key, value]) => <Field key={key} label={key}>{String(value)}</Field>)}
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

          {!!detail?.messages.length && (
            <Section title="Recent messages">
              <ul className="space-y-2.5">
                {detail.messages.map((message, index) => (
                  <li key={index} className="rounded-xl border border-white/[0.07] px-3.5 py-2.5">
                    <p className="flex items-center justify-between text-[11px] text-white/40">
                      <span className="font-semibold">{message.senderType === "customer" ? customer?.name || "Customer" : message.senderType === "ai" ? "AI" : "Team"}</span>
                      <span>{formatDateTime(message.createdAt)}</span>
                    </p>
                    <p className="mt-1 whitespace-pre-wrap break-words text-[13px] leading-5 text-white/85">{message.body}</p>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      </aside>
    </div>
  );
}

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [openKey, setOpenKey] = useState<string | null>(null);
  useEffect(() => { fetch("/api/workspace/tickets", { cache: "no-store" }).then((r) => r.ok ? r.json() : { tickets: [] }).then((d: { tickets?: Issue[] }) => setIssues(d.tickets ?? [])).catch(() => undefined); }, []);

  const keyOf = (issue: Issue) => `${issue.provider}-${issue.id}`;
  const openIssue = issues.find((issue) => keyOf(issue) === openKey) ?? null;

  async function toggleResolved(issue: Issue) {
    const resolved = !issue.resolved;
    const apply = (value: boolean) => setIssues((current) => current.map((item) => (keyOf(item) === keyOf(issue) ? { ...item, resolved: value } : item)));
    apply(resolved);
    const response = await fetch("/api/workspace/tickets/resolve", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ provider: issue.provider, id: issue.id, resolved }),
    }).catch(() => null);
    if (!response?.ok) apply(!resolved);
  }

  return (
    <section id="dashboard-issues" className="min-h-full bg-[#262626] px-6 py-8 text-white lg:px-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-normal">Issues</h1>
        <p className="mt-2 text-sm text-white/45">Tickets created from support conversations. Select one to see its details.</p>
        <div className="mt-7 overflow-hidden rounded-xl border border-white/10 bg-[#292a2b]">
          {issues.map((issue) => (
            <div key={keyOf(issue)} className="flex items-center gap-3 border-b border-white/[0.07] p-4 last:border-0 hover:bg-white/[0.04]">
              <button
                type="button"
                onClick={() => void toggleResolved(issue)}
                aria-pressed={!!issue.resolved}
                title={issue.resolved ? "Mark as unresolved" : "Mark as resolved"}
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${issue.resolved ? "border-[#35b92c] bg-[#35b92c]" : "border-white/20 hover:border-white/40"}`}
              >
                {issue.resolved && <Check size={13} className="text-black" strokeWidth={3} />}
              </button>
              <button type="button" onClick={() => setOpenKey(keyOf(issue))} className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left">
                <Ticket size={18} className="shrink-0 text-white/40" />
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-sm ${issue.resolved ? "text-white/45 line-through" : "text-white/85"}`}>{issue.title}</span>
                  <span className="mt-1 block text-xs text-white/40">{issueLabel(issue)} · {formatDateTime(issue.createdAt)}</span>
                  {issue.source === "close_review" && issue.reason && (
                    <span className="mt-1 block truncate text-xs text-white/55" title={issue.reason}>{issue.reason}</span>
                  )}
                </span>
              </button>
            </div>
          ))}
          {issues.length === 0 && (
            <div className="py-16 text-center">
              <Ticket className="mx-auto text-white/20" />
              <p className="mt-3 text-sm text-white/40">No issues have been created yet.</p>
            </div>
          )}
        </div>
      </div>
      {openIssue && <IssueDrawer issue={openIssue} onClose={() => setOpenKey(null)} onToggleResolved={(issue) => void toggleResolved(issue)} />}
    </section>
  );
}
