import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { percentOff, ReplyCards, splitAtCards, type ReplyCard } from "./ReplyCards";

const html = (cards: ReplyCard[]) => renderToStaticMarkup(<ReplyCards cards={cards} />);

describe("percentOff", () => {
  it.each([["$149.00", "$169.00", 12], ["$34.00", "$44.00", 23], ["$10", "$10", null], ["$12", "$10", null], [undefined, "$10", null], ["free", "$10", null]])("%s vs %s -> %s", (price, was, expected) => {
    expect(percentOff(price, was)).toBe(expected);
  });
});

describe("product cards", () => {
  const jacket = { name: "StormShell Rain Jacket", price: "$149.00", comparePrice: "$169.00", imageUrl: "https://img.shop.example/j.jpg", url: "https://shop.example/p/jacket" };

  it("shows the picture, name, price, the old price struck through and the saving, as a link", () => {
    const out = html([{ type: "products", items: [jacket] }]);
    expect(out).toContain('src="https://img.shop.example/j.jpg"');
    expect(out).toContain("StormShell Rain Jacket");
    expect(out).toContain("$149.00");
    expect(out).toContain("line-through");
    expect(out).toContain("-12%");
    expect(out).toContain('href="https://shop.example/p/jacket"');
    expect(out).toContain('rel="noopener noreferrer"');
  });

  it("falls back to the product's initial without a picture, and is not a link without a url", () => {
    const out = html([{ type: "products", items: [{ name: "Daypack", price: "$89.00" }] }]);
    expect(out).not.toContain("<img");
    expect(out).toContain(">D<");
    expect(out).not.toContain("<a ");
  });

  it("shows a course's instructor, star rating and how many rated it", () => {
    const out = html([{ type: "products", items: [{ name: "Complete Python Bootcamp", subtitle: "Ana Reyes", rating: 4.7, ratingCount: "412,873", price: "$19.99", comparePrice: "$109.99", badge: "Bestseller" }] }]);
    expect(out).toContain("Ana Reyes");
    expect(out).toContain("4.7");
    expect(out).toContain("(412,873)");
    expect(out).toContain('aria-label="Rated 4.7 out of 5"');
    expect(out).toContain("Bestseller");
    expect(out).toContain("-82%");
  });

  it("marks an out-of-stock product", () => {
    expect(html([{ type: "products", items: [{ name: "Camp Slide Sandal", price: "$39.00", badge: "Out of stock" }] }])).toContain("Out of stock");
  });

  it("shows no saving when there is no real markdown", () => {
    expect(html([{ type: "products", items: [{ name: "Tent", price: "$329.00", comparePrice: "$329.00" }] }])).not.toContain("line-through");
  });
});

describe("order tracker", () => {
  const order = { number: "TH-10455", status: "Delayed", stage: 2, tone: "warn" as const, placedOn: "2026-09-29", shipTo: "Chicago, IL", eta: "2026-10-11", items: ["1x Summit GTX Hiking Boot"], total: "$189.00", carrier: "FedEx", trackingNumber: "794644790138", trackingUrl: "https://track.example/fedex/794644790138", note: "Held at the Memphis hub by weather.", history: [{ date: "2026-09-30", event: "Shipped" }] };

  it("shows the number, status, route, estimate, progress and the weather note", () => {
    const out = html([{ type: "order", order }]);
    expect(out).toContain("#TH-10455");
    expect(out).toContain("Delayed");
    expect(out).toContain("Placed 2026-09-29 · Ship to Chicago, IL");
    expect(out).toContain("Estimated delivery");
    expect(out).toContain("2026-10-11");
    expect(out).toContain('aria-label="Order progress: Shipped"');
    expect(out).toContain("Held at the Memphis hub by weather.");
  });

  it("offers Details, Carrier and History tabs, starting on the details", () => {
    const out = html([{ type: "order", order }]);
    expect(out).toContain(">Details<");
    expect(out).toContain(">Carrier<");
    expect(out).toContain(">History<");
    expect(out).toContain("1x Summit GTX Hiking Boot");
    expect(out).toContain("$189.00");
  });

  it("leaves out the tabs it has nothing for, and the progress bar for a cancelled order", () => {
    const out = html([{ type: "order", order: { number: "#43", status: "Cancelled", stage: 0, tone: "bad" } }]);
    expect(out).toContain("#43");
    expect(out).toContain("Cancelled");
    expect(out).not.toContain("Order progress");
    expect(out).not.toContain('role="tab"');
  });
});

describe("splitAtCards", () => {
  const body = "We've got one shoe right now:\n\nIt has a Vibram outsole.\n\nIs it for trail running?";

  it("puts the first paragraphs before the cards and the rest after", () => {
    expect(splitAtCards(body, 2)).toEqual({ before: "We've got one shoe right now:\n\nIt has a Vibram outsole.", after: "Is it for trail running?" });
    expect(splitAtCards(body, 1)).toEqual({ before: "We've got one shoe right now:", after: "It has a Vibram outsole.\n\nIs it for trail running?" });
  });

  it("keeps everything before the cards without a usable position", () => {
    for (const at of [undefined, null, 0, 3, 9, -1, 1.5]) expect(splitAtCards(body, at)).toEqual({ before: body, after: "" });
  });
});
