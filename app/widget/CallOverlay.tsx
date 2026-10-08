"use client";

import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { formatTalkTime } from "@/lib/webrtc-call";
import type { WidgetCall } from "./use-widget-call";

// The incoming-call screen: it covers the widget while a teammate is ringing, and stays up for the call.
export function CallOverlay({
  call,
  avatarUrl,
  accent,
  onAccept,
  onDecline,
  onHangUp,
  onToggleMute,
  onDismiss,
}: {
  call: WidgetCall;
  avatarUrl: string | null;
  accent: string;
  onAccept: () => void;
  onDecline: () => void;
  onHangUp: () => void;
  onToggleMute: () => void;
  onDismiss: () => void;
}) {
  const initial = call.agentName.trim().charAt(0).toUpperCase() || "S";
  const ringing = call.phase === "ringing";
  const ended = call.phase === "ended";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ringing ? `Incoming call from ${call.agentName}` : `Call with ${call.agentName}`}
      className="absolute inset-0 z-[60] flex flex-col items-center justify-between px-6 pb-10 pt-16 text-white"
      style={{ background: "linear-gradient(180deg, #1c1c1e 0%, #111112 100%)" }}
    >
      <div className="flex flex-col items-center text-center">
        <span className={`relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full text-[34px] font-semibold ${ringing ? "elpino-call-pulse" : ""}`} style={{ backgroundColor: accent }}>
          {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : initial}
        </span>
        <h2 className="mt-5 text-[22px] font-semibold">{call.agentName}</h2>
        <p className="mt-1.5 text-[14px] text-white/65" aria-live="polite">
          {ringing ? "is calling you…"
            : call.phase === "connecting" ? "Connecting…"
            : call.phase === "active" ? formatTalkTime(call.seconds)
            : call.notice ?? "Call ended"}
        </p>
        {ringing && <p className="mt-6 max-w-[240px] text-[12.5px] leading-5 text-white/45">This call will be recorded. Tap Accept to talk; your microphone is used only while the call is open.</p>}
        {call.phase === "active" && <p className="mt-2 flex items-center gap-1.5 text-[12px] text-white/55"><span className="h-2 w-2 rounded-full bg-[#e5484d]" aria-hidden="true" />Recording</p>}
      </div>

      {ringing ? (
        <div className="flex w-full max-w-[260px] items-center justify-between">
          <button type="button" onClick={onDecline} className="flex flex-col items-center gap-2 text-[12.5px] text-white/80">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e5484d]"><PhoneOff size={26} /></span>
            Decline
          </button>
          <button type="button" onClick={onAccept} className="flex flex-col items-center gap-2 text-[12.5px] text-white/80">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#30a46c]"><Phone size={26} /></span>
            Accept
          </button>
        </div>
      ) : ended ? (
        <button type="button" onClick={onDismiss} className="rounded-full bg-white/12 px-6 py-3 text-[14px] font-medium hover:bg-white/20">Back to chat</button>
      ) : (
        <div className="flex w-full max-w-[260px] items-center justify-center gap-7">
          <button type="button" onClick={onToggleMute} aria-pressed={call.muted} className="flex flex-col items-center gap-2 text-[12.5px] text-white/80">
            <span className={`flex h-14 w-14 items-center justify-center rounded-full ${call.muted ? "bg-white text-[#111]" : "bg-white/15"}`}>{call.muted ? <MicOff size={22} /> : <Mic size={22} />}</span>
            {call.muted ? "Unmute" : "Mute"}
          </button>
          <button type="button" onClick={onHangUp} className="flex flex-col items-center gap-2 text-[12.5px] text-white/80">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e5484d]"><PhoneOff size={22} /></span>
            End call
          </button>
        </div>
      )}

      <style>{`
        @keyframes elpino-call-pulse { 0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.35); } 70% { box-shadow: 0 0 0 26px rgba(255,255,255,0); } 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); } }
        .elpino-call-pulse { animation: elpino-call-pulse 1.6s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) { .elpino-call-pulse { animation: none; } }
      `}</style>
    </div>
  );
}
