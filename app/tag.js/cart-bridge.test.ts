// The cart bridge in the tag script, run exactly as served, against a stand-in for WooCommerce's Store API (with its
// one-time token). It is the part that changes a shopper's real cart, so it is worth running for real.
import { beforeEach, describe, expect, it } from "vitest";
import { GET } from "./route";

type Line = { key: string; id: number; name: string; quantity: number; prices: { price: string }; totals: { line_total: string }; images: { thumbnail: string }[]; permalink: string; variation: { attribute: string; value: string }[] };
type Answer = { type: string; id: string; ok: boolean; error?: string; cart?: { items: { productId: number; name: string; quantity: number; price: string; options: string }[]; total: string; cartUrl: string; checkoutUrl: string } };

async function bridgeSource(): Promise<string> {
  const script = await GET(new Request("http://localhost:3000/tag.js")).text();
  const start = script.indexOf("// ---- cart bridge begin");
  const end = script.indexOf("// ---- cart bridge end");
  if (start < 0 || end < 0) throw new Error("the cart bridge is missing from the served script");
  return script.slice(start, end);
}

/** A tiny WooCommerce: a cart, a nonce that can expire, and a product that is out of stock. */
function makeStore() {
  const state = { nonce: "good-nonce", expireOnce: false, hasRestLink: true, calls: [] as string[], items: [] as Line[] };
  const money = (id: number) => (id === 21 ? 14900 : 2400);
  const recount = () => ({ items: state.items, items_count: state.items.reduce((n, i) => n + i.quantity, 0), totals: { total_price: String(state.items.reduce((n, i) => n + Number(i.totals.line_total), 0)), currency_code: "USD", currency_minor_unit: 2 } });
  const reply = (status: number, data: unknown) => ({ ok: status < 400, status, headers: { get: (h: string) => (h.toLowerCase() === "nonce" ? state.nonce : null) }, json: async () => data });

  const fetchStub = async (url: string, init: { method: string; headers?: Record<string, string>; body?: string } = { method: "GET" }) => {
    const path = url.replace("http://shop.example/wp-json/wc/store/v1", "");
    state.calls.push(`${init.method} ${path}`);
    if (path === "/cart" && init.method === "GET") return reply(200, recount());
    if (init.headers?.Nonce !== state.nonce || state.expireOnce) { state.expireOnce = false; state.nonce = "fresh-nonce"; return reply(403, { code: "woocommerce_rest_invalid_nonce", message: "Invalid nonce" }); }
    const body = JSON.parse(init.body ?? "{}") as { id?: number; quantity?: number; key?: string; variation?: { attribute: string; value: string }[] };
    if (path === "/cart/add-item") {
      if (body.id === 14) return reply(400, { code: "out_of_stock", message: "<p>Sorry, &ldquo;Sandal&rdquo; is  out of stock.</p>" });
      const variation = body.variation ?? [];
      const same = state.items.find((i) => i.id === body.id && JSON.stringify(i.variation) === JSON.stringify(variation));
      if (same) { same.quantity += body.quantity ?? 1; same.totals.line_total = String(same.quantity * Number(same.prices.price)); }
      else state.items.push({ key: `k${body.id}${variation.map((v) => v.value).join("")}`, id: variation.length ? (body.id ?? 0) + 1 : body.id ?? 0, name: body.id === 21 ? "StormShell Rain Jacket" : "Merino Hiking Socks", quantity: body.quantity ?? 1, prices: { price: String(money(body.id ?? 0)) }, totals: { line_total: String((body.quantity ?? 1) * money(body.id ?? 0)) }, images: [{ thumbnail: "https://shop.example/i.png" }], permalink: `https://shop.example/p/${body.id}`, variation });
      return reply(200, recount());
    }
    if (path === "/cart/remove-item") { state.items = state.items.filter((i) => i.key !== body.key); return reply(200, recount()); }
    if (path === "/cart/update-item") { const item = state.items.find((i) => i.key === body.key); if (item) { item.quantity = body.quantity ?? 0; item.totals.line_total = String(item.quantity * Number(item.prices.price)); } return reply(200, recount()); }
    return reply(404, {});
  };
  return { state, fetchStub };
}

async function makeBridge() {
  const source = await bridgeSource();
  const store = makeStore();
  const sent: Answer[] = [];
  const entities: Record<string, string> = { "&ldquo;": "“", "&rdquo;": "”" };
  const document = {
    querySelector: (selector: string) => (selector.includes("api.w.org") && store.state.hasRestLink ? {} : null),
    body: { dispatchEvent: () => undefined },
    // A textarea reads its content as text: entities decode and nothing runs.
    createElement: () => { const box = { value: "", set innerHTML(html: string) { box.value = html.replace(/&[a-z]+;/g, (m) => entities[m] ?? m); } }; return box; },
  };
  const globals = { fetch: store.fetchStub, CustomEvent: class {} };
  const make = new Function("window", "document", "location", "postToWidget", "fetch", "CustomEvent", `${source}; return { handleCartRequest, reset: function () { cartNonce = null; cartAvailable = null; } };`);
  const api = make({ ElpinoSettings: { cartUrl: "https://shop.example/basket/" } }, document, { origin: "http://shop.example" }, (m: Answer) => sent.push(m), globals.fetch, globals.CustomEvent) as { handleCartRequest: (data: Record<string, unknown>) => void; reset: () => void };
  const ask = async (data: Record<string, unknown>) => { sent.length = 0; api.handleCartRequest(data); await new Promise((resolve) => setTimeout(resolve, 20)); return sent[0]; };
  return { ask, store, api };
}

describe("the cart bridge in the served tag script", () => {
  let bridge: Awaited<ReturnType<typeof makeBridge>>;
  beforeEach(async () => { bridge = await makeBridge(); });

  it("reads the cart, with the store's own cart link and a checkout link", async () => {
    const answer = await bridge.ask({ id: "a", op: "get" });
    expect(answer).toMatchObject({ type: "elpino:cart-result", id: "a", ok: true });
    expect(answer.cart).toMatchObject({ items: [], cartUrl: "https://shop.example/basket/", checkoutUrl: "http://shop.example/checkout/" });
  });

  it("adds a product with a quantity, and a sized one with its choice", async () => {
    const jackets = await bridge.ask({ id: "a", op: "add", productId: 21, quantity: 2 });
    expect(jackets.cart?.items[0]).toMatchObject({ name: "StormShell Rain Jacket", quantity: 2, price: "$149.00" });
    expect(jackets.cart?.total).toBe("$298.00");
    const socks = await bridge.ask({ id: "b", op: "add", productId: 60, options: [{ attribute: "Size", value: "S" }] });
    // WooCommerce lists a sized line under the size's own id (61 for product 60), named after the product.
    expect(socks.cart?.items[1]).toMatchObject({ productId: 61, name: "Merino Hiking Socks", options: "Size: S" });
  });

  it("changes a quantity and removes the right line by product and size", async () => {
    await bridge.ask({ id: "a", op: "add", productId: 21, quantity: 2 });
    await bridge.ask({ id: "b", op: "add", productId: 60, options: [{ attribute: "Size", value: "S" }] });
    await bridge.ask({ id: "c", op: "add", productId: 60, options: [{ attribute: "Size", value: "L" }] });
    expect((await bridge.ask({ id: "d", op: "update", productId: 21, quantity: 1 })).cart?.items[0].quantity).toBe(1);
    const removed = await bridge.ask({ id: "e", op: "remove", productId: 60, name: "Merino Hiking Socks", options: [{ attribute: "Size", value: "S" }] });
    expect(removed.cart?.items.map((i) => `${i.productId}:${i.options}`)).toEqual(["21:", "61:Size: L"]);
  });

  it("says so when the item is not in the cart, and passes the store's refusal on as plain text", async () => {
    expect(await bridge.ask({ id: "a", op: "remove", productId: 999 })).toMatchObject({ ok: false, error: "That item is not in your cart." });
    expect(await bridge.ask({ id: "b", op: "add", productId: 14 })).toMatchObject({ ok: false, error: "Sorry, “Sandal” is out of stock." });
  });

  it("recovers from an expired one-time token by fetching a fresh one", async () => {
    await bridge.ask({ id: "warm", op: "get" });
    bridge.store.state.expireOnce = true;
    const answer = await bridge.ask({ id: "a", op: "add", productId: 21, quantity: 1 });
    expect(answer.ok).toBe(true);
    expect(answer.cart?.items[0].quantity).toBe(1);
  });

  it("refuses a malformed request and caps a quantity at 20", async () => {
    for (const bad of [{ op: "checkout" }, { op: "add", productId: "x" }, { op: "add", productId: -5 }, { op: "add" }]) {
      expect(await bridge.ask({ id: "bad", ...bad })).toMatchObject({ ok: false, error: "That cart request was not understood." });
    }
    expect((await bridge.ask({ id: "big", op: "add", productId: 21, quantity: 500 })).cart?.items[0].quantity).toBe(20);
  });

  it("makes no request at all on a site that is not WordPress", async () => {
    bridge.store.state.hasRestLink = false;
    const answer = await bridge.ask({ id: "a", op: "get" });
    expect(answer).toMatchObject({ ok: false, error: "The cart is not available on this page." });
    expect(bridge.store.state.calls).toEqual([]);
  });
});
