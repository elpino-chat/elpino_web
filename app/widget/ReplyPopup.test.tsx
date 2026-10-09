import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { popupAgo, ReplyPopup } from "./ReplyPopup";

const NOW = Date.parse("2026-10-09T10:00:00Z");
const reply = (id: string, body: string, secondsAgo: number) => ({ id, body, createdAt: new Date(NOW - secondsAgo * 1000).toISOString() });
const html = (replies: ReturnType<typeof reply>[]) => renderToStaticMarkup(<ReplyPopup replies={replies} botName="Elpino AI" now={NOW} onOpen={() => {}} onDismiss={() => {}} />);

describe("ReplyPopup", () => {
  it("shows a single reply with no stack behind it", () => {
    const out = html([reply("a", "Hello **there**", 3)]);
    expect(out).toContain("Hello there");
    expect(out).not.toContain("data-stack-layer");
    // No wrapper around a lone card: the card itself is the measured element.
    expect(out.startsWith('<div id="elpino-reply-preview" class="relative w-full cursor-pointer')).toBe(true);
    expect(out).not.toContain("more");
  });

  it("stacks earlier replies behind the newest and says how many", () => {
    const out = html([reply("a", "first", 90), reply("b", "second", 40), reply("c", "newest", 10)]);
    expect(out.match(/data-stack-layer/g)).toHaveLength(2);
    expect(out).toContain("newest");
    expect(out).not.toContain(">first<");
    expect(out).toContain("+2 more");
    expect(out).toContain("10s ago");
  });
});

describe("popupAgo", () => {
  it.each([[2, "Just now"], [10, "10s ago"], [50, "50s ago"], [60, "1 min ago"], [150, "2 min ago"], [3600, "1 hr ago"], [86400 * 2, "2d ago"]])("%is -> %s", (seconds, label) => {
    expect(popupAgo(NOW - seconds * 1000, NOW)).toBe(label);
  });
});
