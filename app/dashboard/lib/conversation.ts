// Shared between the Team Inbox and AI Assist views under /dashboard/inbox.
// Both render the same conversation from the same API, so the grouping rules,
// the visitor formatting, and the message shape have to agree — when they
// drifted, the same thread looked like two different conversations depending
// on which page you opened it from.

export type Message = {
  id: string;
  // "system" is a thread event — a teammate joining or leaving, a secure
  // handover — not something a person said. Rendered as a centered notice,
  // never as a message from anyone.
  senderType: "customer" | "agent" | "ai" | "system";
  senderId: string | null;
  body: string;
  attachmentUrl?: string | null;
  attachmentType?: string | null;
  attachmentName?: string | null;
  createdAt: string;
};

export type VisitorLocation = {
  ip: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  userAgent: string | null;
  seenAt: string | null;
};

// Consecutive messages from the same person become one run: one avatar, one
// timestamp. Three AI replies in a row are the bot saying three things, not
// three separate events, and stamping each one makes the thread read as far
// busier than it is.
//
// A run breaks on a change of speaker, on a system notice, or after a gap long
// enough that the next message is a new thought rather than a continuation.
const GROUP_GAP_MS = 5 * 60 * 1000;

export type MessageGroup = {
  key: string;
  kind: "message" | "system";
  senderType: Message["senderType"];
  senderId: string | null;
  messages: Message[];
};

export function groupMessages(messages: Message[]): MessageGroup[] {
  const groups: MessageGroup[] = [];

  for (const message of messages) {
    const previous = groups[groups.length - 1];
    const gap = previous
      ? new Date(message.createdAt).getTime() - new Date(previous.messages[previous.messages.length - 1].createdAt).getTime()
      : Infinity;

    const continues =
      previous !== undefined &&
      previous.kind === "message" &&
      message.senderType !== "system" &&
      previous.senderType === message.senderType &&
      // Two different teammates both post as "agent", so the run has to break
      // between them or Sam's reply appears under Priya's name.
      previous.senderId === message.senderId &&
      gap < GROUP_GAP_MS;

    if (continues) {
      previous.messages.push(message);
      continue;
    }

    groups.push({
      key: message.id,
      kind: message.senderType === "system" ? "system" : "message",
      senderType: message.senderType,
      senderId: message.senderId,
      messages: [message],
    });
  }

  return groups;
}

export function formatTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/** "Bengaluru, Karnataka, IN" from whichever parts the edge actually resolved. */
export function formatPlace(location: VisitorLocation | undefined | null): string | null {
  if (!location) return null;
  const parts = [location.city, location.region, location.country].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

/** A readable browser/OS guess. Deliberately coarse — this is a hint, not forensics. */
export function formatDevice(userAgent: string | null | undefined): string | null {
  if (!userAgent) return null;
  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /OPR\//.test(userAgent)
      ? "Opera"
      : /Chrome\//.test(userAgent)
        ? "Chrome"
        : /Safari\//.test(userAgent)
          ? "Safari"
          : /Firefox\//.test(userAgent)
            ? "Firefox"
            : null;
  const platform = /iPhone|iPad/.test(userAgent)
    ? "iOS"
    : /Android/.test(userAgent)
      ? "Android"
      : /Mac OS X/.test(userAgent)
        ? "macOS"
        : /Windows/.test(userAgent)
          ? "Windows"
          : /Linux/.test(userAgent)
            ? "Linux"
            : null;
  if (!browser && !platform) return null;
  return [browser, platform].filter(Boolean).join(" · ");
}

