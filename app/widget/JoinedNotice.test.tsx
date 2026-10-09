import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { JoinedNotice } from "./JoinedNotice";

describe("JoinedNotice", () => {
  it("shows the teammate's photo, name and how long ago they joined", () => {
    const out = renderToStaticMarkup(<JoinedNotice name="Emily James" avatarUrl="https://cdn.example/emily.jpg" ago="1 min ago" />);
    expect(out).toContain('src="https://cdn.example/emily.jpg"');
    expect(out).toContain("Emily James</span> joined the chat");
    expect(out).toContain("1 min ago");
    expect(out).toContain('role="status"');
  });

  it("falls back to their initial without a photo", () => {
    const out = renderToStaticMarkup(<JoinedNotice name="jagdeep" avatarUrl={null} ago="Just now" />);
    expect(out).not.toContain("<img");
    expect(out).toContain(">J<");
  });
});
