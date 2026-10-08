"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CallPeer,
  endedMessage,
  playRemoteAudio,
  requestMicrophone,
  stopRemoteAudio,
  stopStream,
  type PeerSignal,
} from "@/lib/webrtc-call";

// The teammate's side of a voice call to a visitor's widget. Pressing Call asks for the microphone, has the
// server ring the widget, and then follows the call over its signalling socket: ringing, answered (the audio
// is set up directly with the visitor's browser), and however it ends.
export type AgentCallPhase = "idle" | "starting" | "ringing" | "connecting" | "active" | "ended";

type CallStart = { callId: string; iceServers: RTCIceServer[]; wsUrl: string; token: string };

export type AgentCall = {
  phase: AgentCallPhase;
  // Set when the call ended, or could not start: what to tell the teammate.
  notice: string | null;
  seconds: number;
  muted: boolean;
  conversationId: string | null;
};

const IDLE: AgentCall = { phase: "idle", notice: null, seconds: 0, muted: false, conversationId: null };
// How long a call may sit "connecting" before it is given up on.
const CONNECT_TIMEOUT_MS = 20_000;
// A brief drop in the audio path (wifi blip) is waited out before the call is ended.
const DISCONNECT_GRACE_MS = 8_000;
// Said when the two browsers could not find a network path for the audio, usually a strict firewall or NAT.
const NETWORK_BLOCKED = "Couldn't connect the audio. The customer's network may be blocking calls.";

export function useAgentCall() {
  const [call, setCall] = useState<AgentCall>(IDLE);
  const socketRef = useRef<WebSocket | null>(null);
  const peerRef = useRef<CallPeer | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timersRef = useRef<{ tick?: number; connect?: number; drop?: number }>({});
  const callIdRef = useRef<string | null>(null);
  const finishedRef = useRef(true);
  // The offer and network candidates are prepared while the visitor's widget rings, and held here until they
  // answer (the gateway only relays signalling for an answered call). Sending them the moment they accept
  // saves the setup round trip that otherwise happened after Accept.
  const acceptedRef = useRef(false);
  const outboxRef = useRef<PeerSignal[]>([]);

  const clearTimers = () => {
    const timers = timersRef.current;
    window.clearInterval(timers.tick);
    window.clearTimeout(timers.connect);
    window.clearTimeout(timers.drop);
    timersRef.current = {};
  };

  // Tears everything down once and leaves the panel showing why it ended.
  const finish = useCallback((notice: string | null) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    clearTimers();
    peerRef.current?.close();
    peerRef.current = null;
    stopRemoteAudio(audioRef.current);
    audioRef.current = null;
    stopStream(streamRef.current);
    streamRef.current = null;
    const socket = socketRef.current;
    socketRef.current = null;
    socket?.close();
    callIdRef.current = null;
    setCall((current) => ({ ...current, phase: "ended", notice }));
  }, []);

  const sendSignal = (message: unknown) => {
    const socket = socketRef.current;
    if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
  };

  const start = useCallback(async (conversationId: string, iceFallback: RTCIceServer[] = []) => {
    if (!finishedRef.current) return;
    finishedRef.current = false;
    acceptedRef.current = false;
    outboxRef.current = [];
    setCall({ ...IDLE, phase: "starting", conversationId });

    try {
      // Ask for the microphone first, inside the click, so a refusal ends it before anything rings.
      const stream = await requestMicrophone();
      if (finishedRef.current) { stopStream(stream); return; }
      streamRef.current = stream;

      const response = await fetch(`/api/workspace/conversations/${encodeURIComponent(conversationId)}/call`, { method: "POST" });
      const data = (await response.json().catch(() => ({}))) as Partial<CallStart> & { message?: string };
      if (!response.ok || !data.callId || !data.wsUrl || !data.token) throw new Error(data.message ?? "Could not start the call.");
      callIdRef.current = data.callId;

      const socket = new WebSocket(`${data.wsUrl}?token=${encodeURIComponent(data.token)}`);
      socketRef.current = socket;
      const iceServers = data.iceServers?.length ? data.iceServers : iceFallback;

      const sendPeerSignal = (signal: PeerSignal) => {
        if (acceptedRef.current) sendSignal({ type: "call_signal", data: signal });
        else outboxRef.current.push(signal);
      };
      const peer = new CallPeer({
        role: "caller",
        iceServers,
        stream,
        send: sendPeerSignal,
        onRemoteStream: (remote) => { stopRemoteAudio(audioRef.current); audioRef.current = playRemoteAudio(remote); },
        onConnectionState: (state) => {
          if (state === "connected") {
            window.clearTimeout(timersRef.current.connect);
            window.clearTimeout(timersRef.current.drop);
            setCall((current) => (current.phase === "active" ? current : { ...current, phase: "active", seconds: 0 }));
            if (!timersRef.current.tick) timersRef.current.tick = window.setInterval(() => setCall((current) => ({ ...current, seconds: current.seconds + 1 })), 1000);
          } else if (state === "failed") {
            sendSignal({ type: "call_end" });
            finish(NETWORK_BLOCKED);
          } else if (state === "disconnected") {
            window.clearTimeout(timersRef.current.drop);
            timersRef.current.drop = window.setTimeout(() => { sendSignal({ type: "call_end" }); finish("The call dropped: the connection was lost."); }, DISCONNECT_GRACE_MS);
          }
        },
      });
      peerRef.current = peer;
      // Start gathering now, while it rings.
      void peer.start().catch(() => finish("Could not set up the call audio in this browser."));

      socket.onmessage = (event) => {
        if (finishedRef.current) return;
        let message: { type?: string; callId?: string; state?: string; data?: PeerSignal };
        try { message = JSON.parse(event.data as string); } catch { return; }
        if (message.callId !== callIdRef.current) return;

        if (message.type === "call_signal" && message.data) {
          void peerRef.current?.handleSignal(message.data).catch(() => finish(NETWORK_BLOCKED));
          return;
        }
        if (message.type !== "call_state") return;

        if (message.state === "ringing") {
          setCall((current) => ({ ...current, phase: "ringing" }));
        } else if (message.state === "accepted") {
          if (acceptedRef.current) return;
          // The visitor said yes: send what was prepared while it rang, and give the audio a deadline.
          acceptedRef.current = true;
          setCall((current) => ({ ...current, phase: "connecting" }));
          for (const signal of outboxRef.current.splice(0)) sendSignal({ type: "call_signal", data: signal });
          timersRef.current.connect = window.setTimeout(() => { sendSignal({ type: "call_end" }); finish(NETWORK_BLOCKED); }, CONNECT_TIMEOUT_MS);
        } else if (message.state) {
          // declined, missed, cancelled, taken, failed, ended: the server has already recorded how it went.
          finish(message.state === "ended" ? null : endedMessage(message.state));
        }
      };
      socket.onclose = (event) => finish(event.code === 4001 || event.code === 4004
        ? "Could not reach the call service. Refresh the page and try again."
        : "The call dropped: the connection to the call service was lost.");
      socket.onerror = () => undefined;
    } catch (error) {
      finishedRef.current = false;
      finish(error instanceof Error ? error.message : "Could not start the call.");
    }
  }, [finish]);

  const hangUp = useCallback(() => {
    if (finishedRef.current) return;
    sendSignal({ type: "call_end" });
    finish(null);
  }, [finish]);

  const toggleMute = useCallback(() => {
    setCall((current) => {
      const muted = !current.muted;
      peerRef.current?.setMuted(muted);
      return { ...current, muted };
    });
  }, []);

  const dismiss = useCallback(() => setCall(IDLE), []);

  // Leaving the page ends the call rather than leaving the visitor's phone ringing or the mic open.
  useEffect(() => () => {
    if (finishedRef.current) return;
    sendSignal({ type: "call_end" });
    finish(null);
  }, [finish]);

  return { call, start, hangUp, toggleMute, dismiss };
}
