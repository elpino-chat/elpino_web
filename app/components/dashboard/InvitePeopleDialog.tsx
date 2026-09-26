"use client";

import { useState } from "react";
import { Check, LoaderCircle, Mail, Plus, X } from "lucide-react";
import { openRazorpayCheckout } from "@/lib/razorpay-checkout";
import posthog from "posthog-js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SeatPurchaseResult = {
  orderId?: string;
  keyId?: string;
  amountPaise?: number;
  seatsGranted?: number;
  seatsAllowed?: number;
  billedOnNextInvoice?: boolean;
  message?: string;
  upgradeRequired?: boolean;
};

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
  const [result, setResult] = useState<{ invited: string[]; skipped: { email: string; reason: string; seatLimitReached?: boolean }[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [buyingSeat, setBuyingSeat] = useState(false);
  const [seatError, setSeatError] = useState<string | null>(null);
  const [seatMessage, setSeatMessage] = useState<string | null>(null);

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
    setSeatError(null);
    setSeatMessage(null);
  }

  /**
   * The backend has fully supported this for a while — POST /api/billing/seats
   * returns either a Razorpay order (Free plan: no invoice to attach an addon
   * to, so the browser has to pay for it directly) or an immediate grant
   * billed on the next invoice (any paid plan). Nothing in the UI ever called
   * it, so a seat-limited invite just showed the seat-price message as
   * inert text with no way to act on it.
   */
  async function buySeat() {
    if (buyingSeat) return;
    setBuyingSeat(true);
    setSeatError(null);
    setSeatMessage(null);
    try {
      const response = await fetch("/api/billing/seats", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ quantity: 1 }),
      });
      const data = (await response.json().catch(() => ({}))) as SeatPurchaseResult;
      if (!response.ok) {
        if (data.upgradeRequired) {
          setSeatError(`${data.message ?? "This plan doesn't support extra seats."} Upgrade your plan from the header.`);
        } else {
          setSeatError(data.message ?? "Could not add a seat");
        }
        return;
      }

      if (data.orderId && data.keyId) {
        await openRazorpayCheckout({
          keyId: data.keyId,
          orderId: data.orderId,
          amountPaise: data.amountPaise,
          description: "Extra seats",
        });
      }

      // Either the addon just landed on the next invoice, or Razorpay
      // accepted payment — either way the actual entitlement change only
      // lands once the webhook confirms it, same caveat as plan checkout.
      // Refill the chips that failed with a seat limit so "Send invites" is
      // one click away instead of retyping every address.
      const stillPending = (result?.skipped ?? []).filter((item) => item.seatLimitReached).map((item) => item.email);
      if (stillPending.length) setChips((current) => [...new Set([...current, ...stillPending])]);
      setSeatMessage(
        data.billedOnNextInvoice
          ? "Seat added to your plan. It's billed with your plan every month from your next invoice. Click Send invites to try again."
          : "Payment received — the seat will be ready in a moment. Click Send invites to try again.",
      );
    } catch (checkoutIssue) {
      setSeatError(checkoutIssue instanceof Error ? checkoutIssue.message : "Could not add a seat");
    } finally {
      setBuyingSeat(false);
    }
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
      const invitedCount = data.invited?.length ?? 0;
      if (invitedCount > 0) {
        posthog.capture("team_invitations_sent", {
          invitation_count: invitedCount,
        });
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

  // Authored light by default, like every other themed dashboard surface —
  // .dashboard-invite-surface (and the other dashboard-invite-* hooks below)
  // get overridden for dark theme in globals.css. This used to be hardcoded
  // dark (bg-[#17191C], text-white, no class hook on the actual dialog
  // surface at all) with zero light variant, so it rendered wrong — either
  // a jarring dark popup over a light dashboard, or illegibly if something
  // upstream ever assumed a light default here.
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b0f14]/40 p-4 backdrop-blur-[2px]" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDialog(); }}>
      <div className="dashboard-invite-panel w-full max-w-[520px] rounded-2xl bg-gradient-to-br from-[#4f8bf0] via-[#7b6be8] to-[#f5943c] p-[1.5px] shadow-[0_24px_70px_rgba(15,23,42,0.35)]">
        <div role="dialog" aria-modal="true" aria-label="Invite people" className="dashboard-invite-surface flex max-h-[min(720px,calc(100vh-32px))] w-full flex-col overflow-hidden rounded-[15px] bg-[#17191c] text-white/90">
          <div className="dashboard-invite-header shrink-0 px-7 pt-6">
            <div className="flex items-start justify-end">
              <button type="button" onClick={closeDialog} aria-label="Close" className="dashboard-invite-close flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/[0.08] hover:text-white/90"><X size={18} /></button>
            </div>
            <h3 className="mt-1 text-[20px] font-semibold tracking-[-0.02em] text-white/90">Invite people</h3>
            <p className="mt-1 text-[12.5px] leading-5 text-white/55">Bring your team into this workspace.</p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-7 pb-7 pt-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="dashboard-invite-label text-[12.5px] font-semibold text-white/90">Email addresses</span>
            <div
              onClick={(event) => { if (event.currentTarget === event.target) (event.currentTarget.querySelector("input") as HTMLInputElement | null)?.focus(); }}
              className={`dashboard-invite-input-shell mt-2 flex min-h-[52px] w-full flex-wrap items-center gap-2 rounded-xl border bg-[#1d2023] px-3 py-2 transition ${invalidDraft ? "border-[#e0707c]" : "border-white/[0.18] focus-within:border-[#7b6be8] focus-within:ring-2 focus-within:ring-[#7b6be8]/25"}`}
            >
              {chips.map((email) => (
                <span key={email} className="dashboard-invite-chip flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 py-1 pl-3 pr-1.5 text-[12px] font-medium text-white/90">
                  {email}
                  <button type="button" onClick={() => removeChip(email)} aria-label={`Remove ${email}`} className="flex h-4 w-4 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white/90">
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
                className="dashboard-invite-input min-w-[160px] flex-1 bg-transparent text-[13px] text-white/90 outline-none placeholder:text-white/35"
              />
            </div>
            <p className="mt-1.5 max-w-[360px] text-[12.5px] font-normal leading-5 text-white/50">Type an email and press Enter, comma, or Tab to add it. You can add several at once.</p>
            {invalidDraft && <p className="mt-1.5 text-[11px] text-[#f0838f]">That doesn&apos;t look like a valid email.</p>}

            {error && <p className="mt-4 text-[12px] text-[#f0838f]">{error}</p>}
            {result && (
              <div className="dashboard-invite-result mt-4 space-y-1.5 rounded-xl border border-white/[0.12] bg-white/[0.04] p-4 text-[12px]">
                {result.invited.length > 0 && (
                  <p className="flex items-center gap-1.5 text-[#5fc98d]"><Check size={13} /> Invited {result.invited.join(", ")}</p>
                )}
                {result.skipped.map((item) => (
                  <p key={item.email} className="text-white/55">{item.email} — {item.reason}</p>
                ))}
                {result.skipped.some((item) => item.seatLimitReached) && (
                  <div className="pt-1">
                    <button
                      type="button"
                      disabled={buyingSeat}
                      onClick={() => void buySeat()}
                      className="flex h-8 items-center gap-1.5 rounded-lg bg-white/90 px-3 text-[11.5px] font-semibold text-[#17181a] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {buyingSeat ? <LoaderCircle size={12} className="animate-spin" /> : <Plus size={12} />}
                      {buyingSeat ? "Adding seats…" : "Add a seat pack — from $2/month"}
                    </button>
                    {seatMessage && <p className="mt-2 flex items-center gap-1.5 text-[#5fc98d]"><Check size={12} /> {seatMessage}</p>}
                    {seatError && <p className="mt-2 text-[#f0838f]">{seatError}</p>}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="dashboard-invite-footer flex shrink-0 items-center gap-3 border-t border-white/[0.08] px-7 py-5">
            <button
              type="button"
              disabled={sending || !canSend}
              onClick={() => void sendInvites()}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-[#428CE5] text-[13px] font-semibold text-white shadow-[0_6px_16px_rgba(66,140,229,0.35)] disabled:cursor-not-allowed disabled:bg-white/[0.06] disabled:text-white/30 disabled:shadow-none"
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
