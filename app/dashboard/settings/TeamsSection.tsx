"use client";

import { useEffect, useState } from "react";
import { Check, LoaderCircle, Pencil, Plus, Trash2, Users, X } from "lucide-react";
import { PlanLock } from "@/app/components/dashboard/PlanLock";

type Person = { id: string; email: string; name: string | null; avatarUrl: string | null };
type Team = { id: string; name: string; description: string | null; members: Person[] };

const label = (person: { name: string | null; email: string }) => person.name?.trim() || person.email;

/**
 * Settings → Members → Teams. A team is a group by what people handle
 * (Sales, Tech, Billing): the AI hands a chat to the team that fits, only
 * they are alerted, and a teammate can forward a chat to one. The
 * description is what the AI reads when choosing, so it is worth a line.
 */
export function TeamsSection({ members, isOwner, onChanged }: { members: Person[]; isOwner: boolean; onChanged: () => void }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ name: "", description: "" });
  const [editing, setEditing] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState({ name: "", description: "" });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function load() {
    return fetch("/api/teams", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { teams?: Team[] } | null) => setTeams(data?.teams ?? []))
      .catch(() => undefined);
  }
  useEffect(() => { void load().finally(() => setLoading(false)); }, []);

  /** Runs one change, then refreshes both this list and the members table above (it shows each person's teams). */
  async function run(key: string, request: () => Promise<Response>, fallback: string) {
    setBusy(key);
    setError(null);
    try {
      const response = await request();
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { message?: string };
        setError(data.message ?? fallback);
        return false;
      }
      await load();
      onChanged();
      return true;
    } finally {
      setBusy(null);
    }
  }

  async function createTeam() {
    const name = draft.name.trim();
    if (!name) return;
    if (teams.some((team) => team.name.toLowerCase() === name.toLowerCase())) {
      setError(`There's already a team called ${name}.`);
      return;
    }
    const ok = await run("create", () => fetch("/api/teams", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, description: draft.description }) }), "Could not create that team.");
    if (ok) {
      setDraft({ name: "", description: "" });
      setCreating(false);
    }
  }

  async function saveEdit(team: Team) {
    const name = editDraft.name.trim();
    if (!name) return;
    const ok = await run(team.id, () => fetch(`/api/teams/${encodeURIComponent(team.id)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, description: editDraft.description }) }), "Could not save that team.");
    if (ok) setEditing(null);
  }

  const smallBtn = "inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--b-border)] px-4 text-[12.5px] font-medium transition hover:bg-[var(--b-surface-2)] disabled:opacity-50";
  const input = "h-9 w-full rounded-lg border border-[var(--b-border)] bg-transparent px-3 text-[13px] outline-none placeholder:text-[var(--b-muted)] focus:border-[var(--b-text)]";

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-[20px] font-normal tracking-[-0.03em]">Teams</h3>
          <p className="mt-0.5 max-w-2xl text-[12.5px] text-[var(--b-muted)]">Group people by what they handle, like Sales or Tech. The AI hands each chat to the team that fits and only alerts them, and anyone can forward a chat to a team.</p>
        </div>
        {isOwner && !creating && (
          <PlanLock feature="teams">
            <button type="button" onClick={() => { setCreating(true); setError(null); }} className="inline-flex h-9 items-center gap-2 rounded-full bg-[var(--b-ink)] px-4 text-[13px] font-medium text-[var(--b-ink-text)] transition hover:opacity-85">
            <Plus size={13} /> New team
          </button>
          </PlanLock>
        )}
      </div>

      {error && <p role="alert" className="mt-3 rounded-[10px] bg-[var(--b-bad-bg)] px-4 py-3 text-[13px] text-[var(--b-bad)]">{error}</p>}

      {creating && (
        <div className="mt-4 grid gap-2 rounded-[10px] border border-[var(--b-border)] p-4 sm:grid-cols-[1fr_2fr_auto]">
          <input autoFocus value={draft.name} maxLength={60} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} onKeyDown={(event) => { if (event.key === "Enter") void createTeam(); }} placeholder="Team name, e.g. Sales" className={input} />
          <input value={draft.description} maxLength={200} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} onKeyDown={(event) => { if (event.key === "Enter") void createTeam(); }} placeholder="What they handle, e.g. pricing, demos and upgrades" className={input} />
          <div className="flex gap-2">
            <button type="button" onClick={() => void createTeam()} disabled={!draft.name.trim() || busy === "create"} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--b-ink)] px-4 text-[12.5px] font-medium text-[var(--b-ink-text)] disabled:opacity-50">
              {busy === "create" ? <LoaderCircle size={13} className="animate-spin" /> : <Check size={13} />} Create
            </button>
            <button type="button" onClick={() => { setCreating(false); setDraft({ name: "", description: "" }); }} className={smallBtn}>Cancel</button>
          </div>
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-[10px] border border-[var(--b-border)]">
        {loading ? (
          <div className="flex justify-center px-5 py-8 text-[var(--b-muted)]"><LoaderCircle size={16} className="animate-spin" /></div>
        ) : teams.length === 0 ? (
          <div className="px-5 py-10 text-center text-[13px] text-[var(--b-muted)]">
            <Users size={18} className="mx-auto mb-2" />
            No teams yet. {isOwner ? "Create one, or pick a team when you invite someone." : "A workspace owner can create them."}
          </div>
        ) : (
          teams.map((team) => {
            const outside = members.filter((member) => !team.members.some((m) => m.id === member.id));
            const isEditing = editing === team.id;
            return (
              <div key={team.id} className="border-b border-[var(--b-border)] px-5 py-4 last:border-b-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  {isEditing ? (
                    <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[1fr_2fr]">
                      <input autoFocus value={editDraft.name} maxLength={60} onChange={(event) => setEditDraft((current) => ({ ...current, name: event.target.value }))} className={input} />
                      <input value={editDraft.description} maxLength={200} onChange={(event) => setEditDraft((current) => ({ ...current, description: event.target.value }))} placeholder="What they handle" className={input} />
                    </div>
                  ) : (
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium">{team.name} <span className="text-[12px] font-normal text-[var(--b-muted)]">· {team.members.length} {team.members.length === 1 ? "person" : "people"}</span></p>
                      {team.description && <p className="mt-0.5 text-[12.5px] text-[var(--b-muted)]">{team.description}</p>}
                    </div>
                  )}
                  {isOwner && (
                    <div className="flex items-center gap-1.5">
                      {isEditing ? (
                        <>
                          <button type="button" onClick={() => void saveEdit(team)} disabled={!editDraft.name.trim() || busy === team.id} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[var(--b-ink)] px-3.5 text-[12.5px] font-medium text-[var(--b-ink-text)] disabled:opacity-50">
                            {busy === team.id ? <LoaderCircle size={13} className="animate-spin" /> : <Check size={13} />} Save
                          </button>
                          <button type="button" onClick={() => setEditing(null)} className="inline-flex h-8 items-center rounded-full border border-[var(--b-border)] px-3.5 text-[12.5px] font-medium hover:bg-[var(--b-surface-2)]">Cancel</button>
                        </>
                      ) : confirmDelete === team.id ? (
                        <>
                          <span className="text-[12.5px] text-[var(--b-muted)]">Delete {team.name}?</span>
                          <button type="button" disabled={busy === team.id} onClick={() => void run(team.id, () => fetch(`/api/teams/${encodeURIComponent(team.id)}`, { method: "DELETE" }), "Could not delete that team.").then(() => setConfirmDelete(null))} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[var(--b-bad-bg)] px-3.5 text-[12.5px] font-medium text-[var(--b-bad)] disabled:opacity-50">
                            {busy === team.id ? <LoaderCircle size={13} className="animate-spin" /> : <Trash2 size={13} />} Delete
                          </button>
                          <button type="button" onClick={() => setConfirmDelete(null)} className="inline-flex h-8 items-center rounded-full border border-[var(--b-border)] px-3.5 text-[12.5px] font-medium hover:bg-[var(--b-surface-2)]">Keep</button>
                        </>
                      ) : (
                        <>
                          <button type="button" aria-label={`Edit ${team.name}`} onClick={() => { setEditing(team.id); setEditDraft({ name: team.name, description: team.description ?? "" }); }} className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[var(--b-surface-2)]"><Pencil size={14} /></button>
                          <button type="button" aria-label={`Delete ${team.name}`} onClick={() => setConfirmDelete(team.id)} className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--b-bad)] transition hover:bg-[var(--b-bad-bg)]"><Trash2 size={14} /></button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {team.members.map((person) => (
                    <span key={person.id} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--b-border)] py-1 pl-1 pr-2 text-[12.5px]">
                      <span className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-[var(--b-surface-2)] text-[10px] font-semibold">
                        {person.avatarUrl ? <img src={person.avatarUrl} alt="" className="h-full w-full object-cover" /> : label(person).charAt(0).toUpperCase()}
                      </span>
                      {label(person)}
                      {isOwner && (
                        <button type="button" aria-label={`Remove ${label(person)} from ${team.name}`} disabled={busy === `${team.id}:${person.id}`} onClick={() => void run(`${team.id}:${person.id}`, () => fetch(`/api/teams/${encodeURIComponent(team.id)}/members?userId=${encodeURIComponent(person.id)}`, { method: "DELETE" }), "Could not remove them from the team.")} className="flex size-4 items-center justify-center rounded-full text-[var(--b-muted)] transition hover:bg-[var(--b-surface-2)] hover:text-[var(--b-text)]">
                          <X size={11} />
                        </button>
                      )}
                    </span>
                  ))}
                  {isOwner && outside.length > 0 && (
                    <select
                      value=""
                      aria-label={`Add someone to ${team.name}`}
                      disabled={busy?.startsWith(team.id)}
                      onChange={(event) => {
                        const userId = event.target.value;
                        if (userId) void run(`${team.id}:${userId}`, () => fetch(`/api/teams/${encodeURIComponent(team.id)}/members`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ userId }) }), "Could not add them to the team.");
                      }}
                      className="h-7 cursor-pointer rounded-full border border-dashed border-[var(--b-border)] bg-transparent px-2.5 text-[12.5px] text-[var(--b-muted)] outline-none"
                    >
                      <option value="">+ Add person</option>
                      {outside.map((member) => <option key={member.id} value={member.id}>{label(member)}</option>)}
                    </select>
                  )}
                  {team.members.length === 0 && !isOwner && <span className="text-[12.5px] text-[var(--b-muted)]">Nobody in this team yet.</span>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
