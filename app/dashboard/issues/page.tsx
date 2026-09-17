"use client";

import { useEffect, useState } from "react";
import { Check, ExternalLink, Ticket } from "lucide-react";

type Issue = { id: string; title: string; provider: string; url?: string | null; conversationId: string; createdAt: string; resolved?: boolean; source?: string; reason?: string | null };

// Where a ticket lives and who raised it. "elpino" means no project tool was
// connected, so the ticket exists on this page only.
function issueLabel(issue: Issue) {
  const where = issue.provider === "elpino" ? "Not sent to a project tool" : `${issue.provider[0]?.toUpperCase() ?? ""}${issue.provider.slice(1)} ticket`;
  const who = issue.source === "close_review" ? "Flagged by AI review" : issue.source === "escalation" ? "Filed at AI handoff" : null;
  return [who, where, issue.resolved ? "resolved" : null].filter(Boolean).join(" · ");
}

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  useEffect(() => { fetch("/api/workspace/tickets", { cache: "no-store" }).then((r) => r.ok ? r.json() : { tickets: [] }).then((d: { tickets?: Issue[] }) => setIssues(d.tickets ?? [])).catch(() => undefined); }, []);

  async function toggleResolved(issue: Issue) {
    const resolved = !issue.resolved;
    setIssues((current) => current.map((item) => (item === issue ? { ...item, resolved } : item)));
    const response = await fetch("/api/workspace/tickets/resolve", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ provider: issue.provider, id: issue.id, resolved }),
    }).catch(() => null);
    if (!response?.ok) setIssues((current) => current.map((item) => (item === issue ? { ...item, resolved: !resolved } : item)));
  }

  return (
    <section className="min-h-full bg-[#262626] px-6 py-8 text-white lg:px-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-normal">Issues</h1>
        <p className="mt-2 text-sm text-white/45">Tickets created from support conversations.</p>
        <div className="mt-7 overflow-hidden rounded-xl border border-white/10 bg-[#292a2b]">
          {issues.map((issue) => (
            <div key={`${issue.provider}-${issue.id}`} className="flex items-center gap-3 border-b border-white/[0.07] p-4 last:border-0 hover:bg-white/[0.04]">
              <button
                type="button"
                onClick={() => void toggleResolved(issue)}
                aria-pressed={!!issue.resolved}
                title={issue.resolved ? "Mark as unresolved" : "Mark as resolved"}
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${issue.resolved ? "border-[#35b92c] bg-[#35b92c]" : "border-white/20 hover:border-white/40"}`}
              >
                {issue.resolved && <Check size={13} className="text-black" strokeWidth={3} />}
              </button>
              <a
                href={issue.url || `/dashboard/inbox?conversation=${encodeURIComponent(issue.conversationId)}`}
                target={issue.url ? "_blank" : undefined}
                rel={issue.url ? "noreferrer" : undefined}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <Ticket size={18} className="shrink-0 text-white/40" />
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-sm ${issue.resolved ? "text-white/45 line-through" : "text-white/85"}`}>{issue.title}</span>
                  <span className="mt-1 block text-xs text-white/40">{issueLabel(issue)}</span>
                  {issue.source === "close_review" && issue.reason && (
                    <span className="mt-1 block truncate text-xs text-white/55" title={issue.reason}>{issue.reason}</span>
                  )}
                </span>
                {issue.url && <ExternalLink size={15} className="shrink-0 text-white/30" />}
              </a>
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
    </section>
  );
}
