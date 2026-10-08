"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CallPeer,
  playRemoteAudio,
  requestMicrophone,
  stopRemoteAudio,
  stopStream,
  type PeerSignal,
} from "@/lib/webrtc-call";

// The visitor's side of a voice call from the team. While the visitor has a conversation, the widget keeps a
// socket open to the gateway (whichever tab of the widget they are on); when a teammate rings, the call shows
// up here, and nothing is heard or sent until the visitor presses Accept.
export type WidgetCallPhase = "ringing" | "connecting" | "active" | "ended";

export type WidgetCall = {
  callId: string;
  agentName: string;
  phase: WidgetCallPhase;
  seconds: number;
  muted: boolean;
  // What to tell the visitor when it ended, or could not be answered.
  notice: string | null;
};

const CONNECT_TIMEOUT_MS = 20_000;
const DISCONNECT_GRACE_MS = 8_000;
const RING_PATTERN_MS = 2400;
// Said when the two browsers could not find a network path for the audio, usually a strict firewall or NAT.
const NETWORK_BLOCKED = "Couldn't connect the audio. Your network may be blocking calls.";

// A phone-like double tone. Browsers may refuse sound in a frame the visitor has not touched yet; the visible
// incoming-call screen is the call-to-action either way, so a refusal is silent.
function startRingtone(): () => void {
  let context: AudioContext | null = null;
  let timer: number | undefined;
  const beep = (frequency: number, startAt: number, length: number) => {
    if (!context) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, context.currentTime + startAt);
    gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + startAt + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + startAt + length);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(context.currentTime + startAt);
    oscillator.stop(context.currentTime + startAt + length + 0.05);
  };
  try {
    const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioCtor) {
      context = new AudioCtor();
      const ring = () => { beep(440, 0, 0.4); beep(480, 0, 0.4); beep(440, 0.6, 0.4); beep(480, 0.6, 0.4); };
      ring();
      timer = window.setInterval(ring, RING_PATTERN_MS);
    }
  } catch {
    // No sound available; the screen still rings.
  }
  try { navigator.vibrate?.([300, 150, 300]); } catch { /* not supported */ }
  return () => {
    window.clearInterval(timer);
    try { navigator.vibrate?.(0); } catch { /* not supported */ }
    void context?.close().catch(() => undefined);
  };
}

type Params = {
  gatewayWsOrigin: string;
  siteKey: string;
  hostname: string;
  visitorToken: string;
  conversationId: string;
  // Called the moment a call starts ringing, so the widget panel can open if it was minimised.
  onRing: () => void;
};

export function useWidgetCall({ gatewayWsOrigin, siteKey, hostname, visitorToken, conversationId, onRing }: Params) {
  const [call, setCall] = useState<WidgetCall | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const callRef = useRef<{ callId: string; iceServers: RTCIceServer[] } | null>(null);
  const peerRef = useRef<CallPeer | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stopRingRef = useRef<(() => void) | null>(null);
  const timersRef = useRef<{ tick?: number; connect?: number; drop?: number }>({});
  const onRingRef = useRef(onRing);
  useEffect(() => { onRingRef.current = onRing; }, [onRing]);

  const send = (message: unknown) => {
    const socket = socketRef.current;
    if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
  };

  // Ends the call on this side and shows why (nothing, for a plain hang-up).
  const finish = useCallback((notice: string | null) => {
    const timers = timersRef.current;
    window.clearInterval(timers.tick);
    window.clearTimeout(timers.connect);
    window.clearTimeout(timers.drop);
    timersRef.current = {};
    stopRingRef.current?.();
    stopRingRef.current = null;
    peerRef.current?.close();
    peerRef.current = null;
    stopRemoteAudio(audioRef.current);
    audioRef.current = null;
    stopStream(streamRef.current);
    streamRef.current = null;
    callRef.current = null;
    setCall((current) => (current ? { ...current, phase: "ended", notice } : current));
  }, []);

  useEffect(() => {
    if (!conversationId || !visitorToken) return;
    let closed = false;
    let reconnectTimer: number | null = null;
    let reconnectDelay = 1000;

    const connect = () => {
      if (closed) return;
      const params = new URLSearchParams({ key: siteKey, hostname, visitorToken, conversationId });
      const socket = new WebSocket(`${gatewayWsOrigin}/rt/widget?${params.toString()}`);
      socketRef.current = socket;
      socket.onopen = () => { reconnectDelay = 1000; };
      socket.onmessage = (event) => {
        if (closed) return;
        let message: { type?: string; callId?: string; agentName?: string; iceServers?: RTCIceServer[]; state?: string; data?: PeerSignal };
        try { message = JSON.parse(event.data as string); } catch { return; }

        if (message.type === "call_ring" && message.callId) {
          // One call at a time: a second ring while one is up is ignored (the server allows one per chat).
          if (callRef.current) return;
          callRef.current = { callId: message.callId, iceServers: message.iceServers ?? [] };
          setCall({ callId: message.callId, agentName: message.agentName || "Support", phase: "ringing", seconds: 0, muted: false, notice: null });
          stopRingRef.current?.();
          stopRingRef.current = startRingtone();
          onRingRef.current();
        } else if (message.type === "call_signal" && message.callId === callRef.current?.callId && message.data) {
          void peerRef.current?.handleSignal(message.data).catch(() => finish("The call could not connect."));
        } else if (message.type === "call_state" && message.callId === callRef.current?.callId && message.state) {
          // Cancelled or missed while ringing, answered in another tab, or ended by the team.
          finish(message.state === "taken" ? "This call was answered in another window." : message.state === "ended" ? "The call ended." : message.state === "cancelled" ? "The call was cancelled." : message.state === "missed" ? "Missed call." : message.state === "failed" ? "The call could not connect. The team can try again." : null);
        }
      };
      socket.onclose = (event) => {
        if (socketRef.current === socket) socketRef.current = null;
        if (callRef.current && !closed) finish("The call connection was lost.");
        if (closed || event.code >= 4000) return;
        reconnectTimer = window.setTimeout(connect, reconnectDelay);
        reconnectDelay = Math.min(reconnectDelay * 2, 30000);
      };
      socket.onerror = () => socket.close();
    };
    connect();

    return () => {
      closed = true;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      if (callRef.current) { send({ type: "call_end", callId: callRef.current.callId }); finish(null); }
      socketRef.current?.close();
      socketRef.current = null;
    };
    // `send` and `finish` are stable for this purpose; the socket is rebuilt only when the chat changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gatewayWsOrigin, siteKey, hostname, visitorToken, conversationId]);

  const accept = useCallback(async () => {
    const current = callRef.current;
    if (!current) return;
    try {
      // The microphone is asked for here, inside the tap, which is what lets the browser prompt.
      const stream = await requestMicrophone();
      if (callRef.current?.callId !== current.callId) { stopStream(stream); return; }
      streamRef.current = stream;
      stopRingRef.current?.();
      stopRingRef.current = null;

      const peer = new CallPeer({
        role: "callee",
        iceServers: current.iceServers,
        stream,
        send: (signal) => send({ type: "call_signal", callId: current.callId, data: signal }),
        onRemoteStream: (remote) => { stopRemoteAudio(audioRef.current); audioRef.current = playRemoteAudio(remote); },
        onConnectionState: (state) => {
          if (state === "connected") {
            window.clearTimeout(timersRef.current.connect);
            window.clearTimeout(timersRef.current.drop);
            setCall((existing) => (existing && existing.phase !== "active" ? { ...existing, phase: "active", seconds: 0 } : existing));
            if (!timersRef.current.tick) timersRef.current.tick = window.setInterval(() => setCall((existing) => (existing ? { ...existing, seconds: existing.seconds + 1 } : existing)), 1000);
          } else if (state === "failed") {
            send({ type: "call_end", callId: current.callId });
            finish(NETWORK_BLOCKED);
          } else if (state === "disconnected") {
            window.clearTimeout(timersRef.current.drop);
            timersRef.current.drop = window.setTimeout(() => { send({ type: "call_end", callId: current.callId }); finish("The call lost its connection."); }, DISCONNECT_GRACE_MS);
          }
        },
      });
      peerRef.current = peer;
      setCall((existing) => (existing ? { ...existing, phase: "connecting" } : existing));
      timersRef.current.connect = window.setTimeout(() => { send({ type: "call_end", callId: current.callId }); finish(NETWORK_BLOCKED); }, CONNECT_TIMEOUT_MS);
      // The peer exists before the team is told, so the offer that follows is never missed.
      send({ type: "call_accept", callId: current.callId });
    } catch (error) {
      // No microphone: the team is told it was declined, and the visitor is told why.
      send({ type: "call_decline", callId: current.callId });
      finish(error instanceof Error ? error.message : "Could not start the microphone.");
    }
  }, [finish]);

  const decline = useCallback(() => {
    const current = callRef.current;
    if (!current) return;
    send({ type: "call_decline", callId: current.callId });
    finish(null);
    setCall(null);
  }, [finish]);

  const hangUp = useCallback(() => {
    const current = callRef.current;
    if (!current) return;
    send({ type: "call_end", callId: current.callId });
    finish(null);
    setCall(null);
  }, [finish]);

  const toggleMute = useCallback(() => {
    setCall((existing) => {
      if (!existing) return existing;
      const muted = !existing.muted;
      peerRef.current?.setMuted(muted);
      return { ...existing, muted };
    });
  }, []);

  const dismiss = useCallback(() => setCall(null), []);

  return { call, accept, decline, hangUp, toggleMute, dismiss };
}
