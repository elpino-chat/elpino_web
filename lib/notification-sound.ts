// A short two-tone chime for "a conversation was just assigned to you",
// synthesized with the Web Audio API rather than shipping an audio file —
// one less binary asset to keep in sync with a two-note sound.
//
// Browsers refuse to play ANY audio in a tab until the user has interacted
// with it at least once — a WebSocket push is not an interaction, so the
// very first notification after a fresh page load can arrive silently.
// primeOnFirstInteraction() closes that gap: it creates and resumes the
// AudioContext on the page's first click/keydown/touch, after which it
// stays usable for the rest of the tab's life. This is a real browser
// constraint, not something worth working around with autoplay tricks.

let audioContext: AudioContext | null = null;
let primed = false;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioContext) audioContext = new AudioContextClass();
  return audioContext;
}

export function primeOnFirstInteraction() {
  if (primed || typeof window === "undefined") return;
  const unlock = () => {
    primed = true;
    const ctx = getContext();
    if (ctx?.state === "suspended") void ctx.resume();
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };
  window.addEventListener("pointerdown", unlock, { once: true });
  window.addEventListener("keydown", unlock, { once: true });
}

/** A brief, unobtrusive two-note chime — rising, not alarming. */
export function playAssignmentChime() {
  const ctx = getContext();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();

  const notes: Array<[frequency: number, startOffset: number]> = [
    [660, 0],
    [880, 0.11],
  ];

  for (const [frequency, startOffset] of notes) {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    const startAt = ctx.currentTime + startOffset;
    const endAt = startAt + 0.16;
    gain.gain.setValueAtTime(0, startAt);
    gain.gain.linearRampToValueAtTime(0.18, startAt + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, endAt);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(startAt);
    oscillator.stop(endAt + 0.02);
  }
}
