"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, Search, Users, UserRound, X } from "lucide-react";

type Member = { id: string; email: string; name: string | null; avatarUrl?: string | null; presenceStatus?: string; teams?: { id: string; name: string }[] };
type Team = { id: string; name: string; description: string | null; members: { id: string }[] };
type Target = { kind: "member"; id: string } | { kind: "team"; id: string };

const PRESENCE_DOT: Record<string, string> = { online: "bg-[#3fb27f]", away: "bg-[#e5a23c]", offline: "bg-[#b9c0c6]" };

/**
 * "Let me forward you to a colleague": passes the open chat to a named
 * teammate (they are alerted and join from there) or to a whole team (all of
 * them are alerted). The note travels with it for the team only — the
 * customer just sees that someone is being brought in.
 */
export function ForwardChatDialog({
  open,
  conversationId,
  myAccountId,
  onClose,
  onForwarded,
}: {
  open: boolean;
  conversationId: string | null;
  myAccountId: string | null;
  onClose: () => void;
  onForwarded: (result: { assignedUserId: string | null; teamName: string | null }) => void;
}) {
  const [tab, setTab] = useState<"member" | "team">("member");
  const [members, setMembers] = useState<Member[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  // Mounted only while open (see the inbox), so every opening starts clean.
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [target, setTarget] = useState<Target | null>(null);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    Promise.all([
      fetch("/api/team-members", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/teams", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ])
      .then(([membersData, teamsData]: [{ members?: Member[] } | null, { teams?: Team[] } | null]) => {
        setMembers((membersData?.members ?? []).filter((member) => member.id !== myAccountId));
        setTeams(teamsData?.teams ?? []);
      })
      .finally(() => setLoading(false));
  }, [open, myAccountId]);

  if (!open) return null;

  const term = search.trim().toLowerCase();
  const shownMembers = members
    .filter((member) => !term || (member.name ?? "").toLowerCase().includes(term) || member.email.toLowerCase().includes(term) || member.teams?.some((team) => team.name.toLowerCase().includes(term)))
    // Online people first: they are the ones who can take it now.
    .sort((a, b) => Number(b.presenceStatus === "online") - Number(a.presenceStatus === "online"));
  const shownTeams = teams.filter((team) => !term || team.name.toLowerCase().includes(term));
  const onlineIn = (team: Team) => team.members.filter((m) => members.find((member) => member.id === m.id)?.presenceStatus === "online").length;

  async function send() {
    if (!conversationId || !target || sending) return;
    setSending(true);
    setError(null);
    try {
      const response = await fetch(`/api/workspace/conversations/${encodeURIComponent(conversationId)}/forward`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(target.kind === "member" ? { toUserId: target.id, note } : { toTeamId: target.id, note }),
      });
      const data = (await response.json().catch(() => ({}))) as { message?: string; assignedUserId?: string | null };
      if (!response.ok) {
        setError(data.message ?? "Could not forward this chat.");
        return;
      }
      onForwarded({ assignedUserId: data.assignedUserId ?? null, teamName: target.kind === "team" ? teams.find((team) => team.id === target.id)?.name ?? null : null });
      onClose();
    } finally {
      setSending(false);
    }
  }

  const rowClass = (selected: boolean) =>
    `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] transition ${selected ? "bg-[var(--chat-customer-bg)] ring-1 ring-[var(--chat-divider)]" : "hover:bg-[var(--chat-customer-bg)]"}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b0f14]/40 p-4 backdrop-blur-[2px]" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label="Forward chat" className="flex max-h-[min(640px,calc(100vh-32px))] w-full max-w-[460px] flex-col rounded-2xl border border-[var(--chat-divider)] bg-[var(--chat-surface)] shadow-[0_24px_70px_rgba(15,23,42,0.24)]">
        <div className="flex items-start justify-between gap-3 px-6 pt-5">
          <div>
            <h3 className="text-[17px] font-semibold">Forward chat</h3>
            <p className="mt-1 text-[12.5px] leading-5 text-[var(--chat-muted)]">Pass this customer to a colleague or a team. They&apos;re alerted right away.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--chat-muted)] hover:bg-[var(--chat-customer-bg)]"><X size={16} /></button>
        </div>

        <div className="mt-4 flex gap-1 px-6" role="tablist">
          {(["member", "team"] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              onClick={() => { setTab(value); setTarget(null); }}
              className={`flex h-8 items-center gap-1.5 rounded-full px-3.5 text-[12.5px] font-semibold transition ${tab === value ? "bg-[var(--chat-customer-bg)] text-[var(--chat-text,inherit)]" : "text-[var(--chat-muted)] hover:bg-[var(--chat-customer-bg)]"}`}
            >
              {value === "member" ? <UserRound size={13} /> : <Users size={13} />}
              {value === "member" ? "Teammate" : "Team"}
            </button>
          ))}
        </div>

        <div className="mx-6 mt-3 flex h-9 items-center gap-2 rounded-lg border border-[var(--chat-divider)] px-3">
          <Search size={13} className="text-[var(--chat-muted)]" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={tab === "member" ? "Search people or teams" : "Search teams"} className="w-full bg-transparent text-[13px] outline-none placeholder:text-[var(--chat-muted)]" />
        </div>

        <div className="mt-2 min-h-[120px] flex-1 overflow-y-auto px-3">
          {loading ? (
            <div className="flex justify-center py-8 text-[var(--chat-muted)]"><LoaderCircle size={18} className="animate-spin" /></div>
          ) : tab === "member" ? (
            shownMembers.length ? shownMembers.map((member) => {
              const selected = target?.kind === "member" && target.id === member.id;
              return (
                <button key={member.id} type="button" onClick={() => setTarget({ kind: "member", id: member.id })} className={rowClass(selected)} aria-pressed={selected}>
                  <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--chat-customer-bg)] text-[12px] font-semibold">
                    {member.avatarUrl ? <img src={member.avatarUrl} alt="" className="h-full w-full object-cover" /> : (member.name?.trim() || member.email).charAt(0).toUpperCase()}
                    <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-[var(--chat-surface)] ${PRESENCE_DOT[member.presenceStatus ?? "offline"] ?? PRESENCE_DOT.offline}`} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{member.name?.trim() || member.email}</span>
                    <span className="block truncate text-[11.5px] text-[var(--chat-muted)]">{member.teams?.length ? member.teams.map((team) => team.name).join(", ") : member.email}</span>
                  </span>
                </button>
              );
            }) : <p className="px-3 py-8 text-center text-[13px] text-[var(--chat-muted)]">{members.length ? "Nobody matches that search." : "There's nobody else in this workspace yet."}</p>
          ) : shownTeams.length ? shownTeams.map((team) => {
            const selected = target?.kind === "team" && target.id === team.id;
            const online = onlineIn(team);
            return (
              <button key={team.id} type="button" onClick={() => setTarget({ kind: "team", id: team.id })} className={rowClass(selected)} aria-pressed={selected}>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--chat-customer-bg)]"><Users size={14} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{team.name}</span>
                  <span className="block truncate text-[11.5px] text-[var(--chat-muted)]">
                    {team.members.length} {team.members.length === 1 ? "person" : "people"}{online ? ` · ${online} online` : " · nobody online"}
                  </span>
                </span>
              </button>
            );
          }) : <p className="px-3 py-8 text-center text-[13px] text-[var(--chat-muted)]">{teams.length ? "No team matches that search." : "No teams yet. An owner can create them in Settings → Members."}</p>}
        </div>

        <div className="border-t border-[var(--chat-divider)] px-6 pb-5 pt-4">
          <label htmlFor="forward-note" className="text-[12px] font-semibold">Note for your colleague <span className="font-normal text-[var(--chat-muted)]">(optional, the customer won&apos;t see it)</span></label>
          <textarea id="forward-note" value={note} onChange={(event) => setNote(event.target.value)} maxLength={1000} rows={2} placeholder="e.g. Wants a custom quote for 50 seats" className="mt-1.5 w-full resize-none rounded-lg border border-[var(--chat-divider)] bg-transparent px-3 py-2 text-[13px] outline-none placeholder:text-[var(--chat-muted)] focus:border-[#7b6be8]" />
          {error && <p role="alert" className="mt-2 text-[12px] text-[#d6454f]">{error}</p>}
          <div className="mt-3 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="flex h-10 items-center rounded-lg border border-[var(--chat-divider)] px-4 text-[13px] font-semibold hover:bg-[var(--chat-customer-bg)]">Cancel</button>
            <button type="button" disabled={!target || sending} onClick={() => void send()} className="chat-action-primary flex h-10 items-center gap-2 rounded-lg px-4 text-[13px] font-semibold disabled:opacity-50">
              {sending ? <LoaderCircle size={15} className="animate-spin" /> : null}
              Forward
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
