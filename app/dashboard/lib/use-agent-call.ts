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

export function useAgentCall() {
  const [call, setCall] = useState<AgentCall>(IDLE);
  const socketRef = useRef<WebSocket | null>(null);
  const peerRef = useRef<CallPeer | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timersRef = useRef<{ tick?: number; connect?: number; drop?: number }>({});
  const callIdRef = useRef<string | null>(null);
  const finishedRef = useRef(true);

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

      socket.onmessage = (event) => {
        if (finishedRef.current) return;
        let message: { type?: string; callId?: string; state?: string; data?: PeerSignal };
        try { message = JSON.parse(event.data as string); } catch { return; }
        if (message.callId !== callIdRef.current) return;

        if (message.type === "call_signal" && message.data) {
          void peerRef.current?.handleSignal(message.data).catch(() => finish("The call could not connect."));
          return;
        }
        if (message.type !== "call_state") return;

        if (message.state === "ringing") {
          setCall((current) => ({ ...current, phase: "ringing" }));
        } else if (message.state === "accepted") {
          // The visitor said yes: set up the audio path, and give it a deadline.
          setCall((current) => ({ ...current, phase: "connecting" }));
          const peer = new CallPeer({
            role: "caller",
            iceServers,
            stream,
            send: (signal) => sendSignal({ type: "call_signal", data: signal }),
            onRemoteStream: (remote) => { stopRemoteAudio(audioRef.current); audioRef.current = playRemoteAudio(remote); },
            onConnectionState: (state) => {
              if (state === "connected") {
                window.clearTimeout(timersRef.current.connect);
                window.clearTimeout(timersRef.current.drop);
                setCall((current) => (current.phase === "active" ? current : { ...current, phase: "active", seconds: 0 }));
                if (!timersRef.current.tick) timersRef.current.tick = window.setInterval(() => setCall((current) => ({ ...current, seconds: current.seconds + 1 })), 1000);
              } else if (state === "failed") {
                sendSignal({ type: "call_end" });
                finish("The call lost its connection.");
              } else if (state === "disconnected") {
                window.clearTimeout(timersRef.current.drop);
                timersRef.current.drop = window.setTimeout(() => { sendSignal({ type: "call_end" }); finish("The call lost its connection."); }, DISCONNECT_GRACE_MS);
              }
            },
          });
          peerRef.current = peer;
          timersRef.current.connect = window.setTimeout(() => { sendSignal({ type: "call_end" }); finish("The call could not connect."); }, CONNECT_TIMEOUT_MS);
          void peer.start().catch(() => finish("The call could not connect."));
        } else if (message.state) {
          // declined, missed, cancelled, taken, failed, ended: the server has already recorded how it went.
          finish(message.state === "ended" ? null : endedMessage(message.state));
        }
      };
      socket.onclose = () => finish("The call connection was lost.");
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
