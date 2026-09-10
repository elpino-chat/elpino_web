"use client";

import { useState } from "react";
import { Check, LoaderCircle, Mail, X } from "lucide-react";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * The compose-and-send invite modal — shared by the dashboard header's
 * "Invite people" button and Settings → People, so there is one
 * implementation instead of two that quietly drift apart.
 *
 * Deliberately controlled from outside (`open`/`onClose`) rather than owning
 * its own trigger: the header just wants the dialog, Settings also wants the
 * pending-invitations list and revoke action around it, and those stay where
 * they are — this component is only the part both callers need identically.
 */
export function InvitePeopleDialog({
  open,
  onClose,
  onInvited,
}: {
  open: boolean;
  onClose: () => void;
  /** Called after a successful send, so a caller showing a pending-invites list can refresh it. */
  onInvited?: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [chips, setChips] = useState<string[]>([]);
  const [invalidDraft, setInvalidDraft] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ invited: string[]; skipped: { email: string; reason: string }[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function addChipsFrom(raw: string) {
    const candidates = raw.split(/[\s,;]+/).map((value) => value.trim()).filter(Boolean);
    if (!candidates.length) return;
    setChips((current) => {
      const next = [...current];
      for (const candidate of candidates) {
        const normalized = candidate.toLowerCase();
        if (EMAIL_PATTERN.test(normalized) && !next.includes(normalized)) next.push(normalized);
      }
      return next;
    });
    setDraft("");
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === "," || event.key === "Tab") {
      if (!draft.trim()) return;
      event.preventDefault();
      if (!EMAIL_PATTERN.test(draft.trim().toLowerCase())) {
        setInvalidDraft(true);
        return;
      }
      setInvalidDraft(false);
      addChipsFrom(draft);
    } else if (event.key === "Backspace" && !draft && chips.length) {
      setChips((current) => current.slice(0, -1));
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    const text = event.clipboardData.getData("text");
    if (/[\s,;]/.test(text)) {
      event.preventDefault();
      addChipsFrom(text);
    }
  }

  function removeChip(email: string) {
    setChips((current) => current.filter((item) => item !== email));
  }

  function closeDialog() {
    onClose();
    setDraft("");
    setChips([]);
    setInvalidDraft(false);
    setResult(null);
    setError(null);
  }

  async function sendInvites() {
    const pending = [...chips];
    if (draft.trim() && EMAIL_PATTERN.test(draft.trim().toLowerCase())) pending.push(draft.trim().toLowerCase());
    if (!pending.length || sending) return;

    setSending(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ emails: pending }),
      });
      const data = (await response.json().catch(() => ({}))) as { invited?: string[]; skipped?: { email: string; reason: string }[]; message?: string };
      if (!response.ok) {
        setError(data.message ?? "Could not send invitations");
        return;
      }
      setResult({ invited: data.invited ?? [], skipped: data.skipped ?? [] });
      setChips([]);
      setDraft("");
      onInvited?.();
    } finally {
      setSending(false);
    }
  }

  if (!open) return null;

  const canSend = chips.length > 0 || EMAIL_PATTERN.test(draft.trim().toLowerCase());

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b0f14]/40 p-4 backdrop-blur-[2px]" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDialog(); }}>
      <div className="dashboard-invite-panel w-full max-w-[520px] rounded-2xl bg-gradient-to-br from-[#4f8bf0] via-[#7b6be8] to-[#f5943c] p-[1.5px] shadow-[0_24px_70px_rgba(15,23,42,0.35)]">
        <div role="dialog" aria-modal="true" aria-label="Invite people" className="flex max-h-[min(720px,calc(100vh-32px))] w-full flex-col overflow-hidden rounded-[15px] bg-[#17191C]">
          <div className="dashboard-invite-header shrink-0 px-7 pt-6">
            <div className="flex items-start justify-end">
              <button type="button" onClick={closeDialog} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-lg text-white transition hover:bg-white/10"><X size={18} /></button>
            </div>
            <h3 className="mt-1 text-[20px] font-semibold tracking-[-0.02em] text-white">Invite people</h3>
            <p className="mt-1 text-[12.5px] leading-5 text-white/60">Bring your team into this workspace.</p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-7 pb-7 pt-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="dashboard-invite-label text-[12.5px] font-semibold text-white/80">Email addresses</span>
            <div
              onClick={(event) => { if (event.currentTarget === event.target) (event.currentTarget.querySelector("input") as HTMLInputElement | null)?.focus(); }}
              className={`dashboard-invite-input-shell mt-2 flex min-h-[52px] w-full flex-wrap items-center gap-2 rounded-xl border px-3 py-2 transition ${invalidDraft ? "border-[#e0707c]" : "border-white/15 focus-within:border-[#7b6be8] focus-within:ring-2 focus-within:ring-[#7b6be8]/25"}`}
            >
              {chips.map((email) => (
                <span key={email} className="dashboard-invite-chip flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 py-1 pl-3 pr-1.5 text-[12px] font-medium text-white">
                  {email}
                  <button type="button" onClick={() => removeChip(email)} aria-label={`Remove ${email}`} className="flex h-4 w-4 items-center justify-center rounded-full text-white/60 hover:bg-white/20 hover:text-white">
                    <X size={11} />
                  </button>
                </span>
              ))}
              <input
                value={draft}
                onChange={(event) => { setDraft(event.target.value); setInvalidDraft(false); }}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                onBlur={() => { if (draft.trim() && EMAIL_PATTERN.test(draft.trim().toLowerCase())) addChipsFrom(draft); }}
                placeholder={chips.length ? "" : "name@company.com"}
                autoFocus
                className="min-w-[160px] flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-white/35"
              />
            </div>
            <p className="mt-1.5 max-w-[360px] text-[12.5px] font-normal leading-5 text-white/50">Type an email and press Enter, comma, or Tab to add it. You can add several at once.</p>
            {invalidDraft && <p className="mt-1.5 text-[11px] text-[#f28b96]">That doesn&apos;t look like a valid email.</p>}

            {error && <p className="mt-4 text-[12px] text-[#f28b96]">{error}</p>}
            {result && (
              <div className="dashboard-invite-result mt-4 space-y-1.5 rounded-xl border border-white/10 bg-white/5 p-4 text-[12px]">
                {result.invited.length > 0 && (
                  <p className="flex items-center gap-1.5 text-[#5fd39a]"><Check size={13} /> Invited {result.invited.join(", ")}</p>
                )}
                {result.skipped.map((item) => (
                  <p key={item.email} className="text-white/50">{item.email} — {item.reason}</p>
                ))}
              </div>
            )}
          </div>

          <div className="dashboard-invite-footer flex shrink-0 items-center gap-3 border-t border-white/10 px-7 py-5">
            <button
              type="button"
              disabled={sending || !canSend}
              onClick={() => void sendInvites()}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-[#428CE5] text-[13px] font-semibold text-white shadow-[0_6px_16px_rgba(66,140,229,0.35)] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30 disabled:shadow-none"
            >
              {sending ? <LoaderCircle size={14} className="animate-spin" /> : <Mail size={14} />}
              {sending ? "Sending…" : "Send invites"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
