"use client";

import { Download, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatTalkTime } from "@/lib/webrtc-call";

// A voice-note style player for call recordings: a round play button, a waveform you can click or drag to
// seek, the time, and a speed button. The recording is fetched once and decoded, which gives the waveform and
// the real length. (A file recorded in the browser carries no duration of its own, so the plain <audio>
// control cannot show one or seek reliably.)
const BARS = 44;
const SPEEDS = [1, 1.5, 2];

type Loaded = { url: string; duration: number; peaks: number[] };

// One bar per slice of the recording, as tall as that slice is loud, scaled so the loudest bar fills the height.
function peaksOf(buffer: AudioBuffer): number[] {
  const samples = buffer.getChannelData(0);
  const size = Math.max(1, Math.floor(samples.length / BARS));
  const bars: number[] = [];
  for (let bar = 0; bar < BARS; bar += 1) {
    let sum = 0;
    for (let i = bar * size; i < Math.min(samples.length, (bar + 1) * size); i += 1) sum += samples[i] * samples[i];
    bars.push(Math.sqrt(sum / size));
  }
  const loudest = Math.max(...bars, 0.0001);
  return bars.map((value) => Math.max(0.12, value / loudest));
}

export default function VoiceNotePlayer({ src, label, fileName }: { src: string; label?: string; fileName?: string | null }) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);

  // Fetch and decode the recording, and keep an object URL to play it from.
  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    (async () => {
      try {
        const response = await fetch(src);
        if (!response.ok) throw new Error("not found");
        const blob = await response.blob();
        const context = new AudioContext();
        const decoded = await context.decodeAudioData(await blob.arrayBuffer()).finally(() => void context.close().catch(() => undefined));
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setLoaded({ url: objectUrl, duration: decoded.duration, peaks: peaksOf(decoded) });
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play().catch(() => setPlaying(false));
    else audio.pause();
  }, []);

  const seekTo = useCallback((clientX: number) => {
    const audio = audioRef.current;
    const bar = barRef.current;
    if (!audio || !bar || !loaded) return;
    const rect = bar.getBoundingClientRect();
    const fraction = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    audio.currentTime = fraction * loaded.duration;
    setTime(audio.currentTime);
  }, [loaded]);

  const cycleSpeed = () => {
    const next = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length];
    setSpeed(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  };

  if (failed) {
    return <p className="mx-auto rounded-xl border border-[var(--chat-divider)] px-3 py-2 text-[12px] text-[var(--chat-muted)]">The recording could not be loaded.</p>;
  }

  const duration = loaded?.duration ?? 0;
  const progress = duration ? Math.min(1, time / duration) : 0;

  return (
    <div
      className="mx-auto flex w-full max-w-[380px] items-center gap-3 rounded-2xl border border-[var(--chat-divider)] bg-[var(--chat-surface)] px-3 py-2.5 shadow-sm"
      role="group"
      aria-label={label ?? "Call recording"}
    >
      {loaded && (
        <audio
          ref={audioRef}
          src={loaded.url}
          preload="auto"
          onLoadedMetadata={(event) => {
            // A recording made in the browser reports an endless length until the browser has scanned to the end,
            // and seeking misbehaves until it has. Jump to the end once, then back, to make it settle.
            const audio = event.currentTarget;
            if (audio.duration !== Infinity) return;
            const settle = () => { audio.removeEventListener("timeupdate", settle); audio.currentTime = 0; };
            audio.addEventListener("timeupdate", settle);
            audio.currentTime = 1e101;
          }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => { setPlaying(false); setTime(0); if (audioRef.current) audioRef.current.currentTime = 0; }}
          onTimeUpdate={() => { if (!dragging.current && audioRef.current) setTime(audioRef.current.currentTime); }}
        />
      )}
      <button
        type="button"
        onClick={toggle}
        disabled={!loaded}
        aria-label={playing ? "Pause the recording" : "Play the recording"}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--chat-team-bg)] text-[var(--chat-team-text)] transition hover:opacity-85 disabled:opacity-40"
      >
        {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="translate-x-px" />}
      </button>

      <div className="min-w-0 flex-1">
        <div
          ref={barRef}
          role="slider"
          tabIndex={loaded ? 0 : -1}
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(time)}
          onPointerDown={(event) => { if (!loaded) return; dragging.current = true; event.currentTarget.setPointerCapture(event.pointerId); seekTo(event.clientX); }}
          onPointerMove={(event) => { if (dragging.current) seekTo(event.clientX); }}
          onPointerUp={() => { dragging.current = false; }}
          onKeyDown={(event) => {
            const audio = audioRef.current;
            if (!audio || !loaded) return;
            if (event.key === "ArrowRight") audio.currentTime = Math.min(loaded.duration, audio.currentTime + 5);
            else if (event.key === "ArrowLeft") audio.currentTime = Math.max(0, audio.currentTime - 5);
            else return;
            setTime(audio.currentTime);
          }}
          className="flex h-8 cursor-pointer touch-none items-center gap-[2px]"
        >
          {(loaded?.peaks ?? Array.from({ length: BARS }, () => 0.2)).map((height, index) => (
            <span
              key={index}
              className={`w-full rounded-full transition-colors ${index / BARS < progress ? "bg-[var(--chat-team-bg)]" : "bg-[color-mix(in_srgb,var(--chat-muted)_40%,transparent)]"} ${loaded ? "" : "animate-pulse"}`}
              style={{ height: `${Math.round(height * 100)}%` }}
            />
          ))}
        </div>
        <div className="mt-0.5 flex items-center justify-between text-[11px] tabular-nums text-[var(--chat-muted)]">
          <span>{formatTalkTime(time)}</span>
          <span>{loaded ? formatTalkTime(duration) : "…"}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={cycleSpeed}
        disabled={!loaded}
        aria-label={`Playback speed ${speed}x`}
        title="Playback speed"
        className="shrink-0 rounded-full bg-[var(--chat-customer-bg)] px-2 py-1 text-[11px] font-semibold tabular-nums disabled:opacity-40"
      >
        {speed}x
      </button>
      <a href={src} download={fileName ?? "call-recording"} aria-label="Download the recording" title="Download" className="shrink-0 rounded-lg p-1.5 text-[var(--chat-muted)] hover:text-inherit">
        <Download size={15} />
      </a>
    </div>
  );
}
