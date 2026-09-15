// Short notification sounds, synthesized with the Web Audio API rather than
// shipping audio files — one less binary asset to keep in sync with a note
// or two.
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

function playNotes(notes: Array<[frequency: number, startOffset: number]>, peak: number, length: number) {
  const ctx = getContext();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();

  for (const [frequency, startOffset] of notes) {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    const startAt = ctx.currentTime + startOffset;
    const endAt = startAt + length;
    gain.gain.setValueAtTime(0, startAt);
    gain.gain.linearRampToValueAtTime(peak, startAt + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, endAt);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(startAt);
    oscillator.stop(endAt + 0.02);
  }
}

/** "A conversation was just assigned to you": a brief two-note chime — rising, not alarming. */
export function playAssignmentChime() {
  playNotes([[660, 0], [880, 0.11]], 0.18, 0.16);
}

/** A new message: one soft note, quieter and shorter than the assignment chime so the two are easy to tell apart. */
export function playMessageChime() {
  playNotes([[784, 0]], 0.12, 0.14);
}

/**
 * Plays the message chime in only one of the user's open dashboard tabs.
 * A visible tab claims it straight away; background tabs wait a moment so a
 * visible one wins. The lock is held for a few seconds so every other tab
 * has tried (background timers are throttled to about a second) and finds
 * it taken. Without Web Locks every tab plays, which is noisy but not wrong.
 */
export async function playMessageChimeOnce(messageId: string) {
  if (typeof navigator === "undefined" || !("locks" in navigator)) {
    playMessageChime();
    return;
  }
  if (document.hidden) await new Promise((resolve) => window.setTimeout(resolve, 300));
  await navigator.locks.request(`elpino-message-sound:${messageId}`, { ifAvailable: true }, async (lock) => {
    if (!lock) return;
    playMessageChime();
    await new Promise((resolve) => window.setTimeout(resolve, 5000));
  });
}

// The tab title while the dashboard is in the background:
// "(3) New messages · <original title>", restored once the tab is visible.
let unseenMessages = 0;
let titleBeforeUnseen: string | null = null;

export function countUnseenMessage() {
  if (typeof document === "undefined") return;
  if (titleBeforeUnseen === null) titleBeforeUnseen = document.title;
  unseenMessages += 1;
  document.title = `(${unseenMessages}) New ${unseenMessages === 1 ? "message" : "messages"} · ${titleBeforeUnseen}`;
}

export function clearUnseenMessages() {
  if (typeof document === "undefined") return;
  if (titleBeforeUnseen !== null) document.title = titleBeforeUnseen;
  unseenMessages = 0;
  titleBeforeUnseen = null;
}
