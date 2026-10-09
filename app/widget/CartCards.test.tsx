import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AddToCartButton, addToCartLink, CartChangeCard, LiveCart } from "./CartCards";
import { ReplyCards, type CartBridge, type ProductCard, type ReplyCard } from "./ReplyCards";

const bridge = (over: Partial<CartBridge> = {}): CartBridge => ({ available: true, cartUrl: "https://shop.example/cart/", checkoutUrl: "https://shop.example/checkout/", call: vi.fn(async () => ({ ok: true })), ...over });
const jacket: ProductCard = { name: "StormShell Rain Jacket", price: "$149.00", productId: 21, canAdd: true, url: "https://shop.example/product/stormshell/" };

describe("addToCartLink", () => {
  it("opens the store with the item added, from the product's own address", () => {
    expect(addToCartLink(21, "https://shop.example/product/stormshell/")).toBe("https://shop.example/?add-to-cart=21");
    expect(addToCartLink(21, "http://localhost:8080/product/x/")).toBe("http://localhost:8080/?add-to-cart=21");
    expect(addToCartLink(21, undefined)).toBeNull();
    expect(addToCartLink(21, "not a url")).toBeNull();
  });
});

describe("AddToCartButton", () => {
  it("offers Add to cart on a product that can be added, when the page has a cart", () => {
    expect(renderToStaticMarkup(<AddToCartButton product={jacket} cart={bridge()} />)).toContain("Add to cart");
  });

  it("becomes a link that adds it on the store when the page has no cart", () => {
    const out = renderToStaticMarkup(<AddToCartButton product={jacket} cart={bridge({ available: false })} />);
    expect(out).toContain('href="https://shop.example/?add-to-cart=21"');
    expect(out).toContain('rel="noopener noreferrer"');
  });

  it("sends a product with sizes to its page to choose, and offers nothing for a sold-out or id-less one", () => {
    expect(renderToStaticMarkup(<AddToCartButton product={{ ...jacket, canAdd: false, hasOptions: true }} cart={bridge()} />)).toContain("Choose options");
    expect(renderToStaticMarkup(<AddToCartButton product={{ ...jacket, canAdd: false }} cart={bridge()} />)).toBe("");
    expect(renderToStaticMarkup(<AddToCartButton product={{ ...jacket, productId: undefined }} cart={bridge()} />)).toBe("");
  });
});

describe("CartChangeCard", () => {
  const add = { action: "add" as const, productId: 60, name: "Merino Hiking Socks", quantity: 2, price: "$24.00", options: [{ attribute: "Size", value: "S" }] };

  it("asks first: the product, its size and quantity, and Confirm and Not now buttons", () => {
    const out = renderToStaticMarkup(<CartChangeCard change={add} cart={bridge()} storageId="m1:0" />);
    expect(out).toContain("Add to your cart?");
    expect(out).toContain("Merino Hiking Socks");
    expect(out).toContain("$24.00 · Size: S · Qty 2");
    expect(out).toContain("Confirm: add to cart");
    expect(out).toContain("Not now");
    expect(out).not.toContain("Added to your cart");
  });

  it("asks about a removal in its own words", () => {
    const out = renderToStaticMarkup(<CartChangeCard change={{ ...add, action: "remove", options: undefined, quantity: 1 }} cart={bridge()} storageId="m2:0" />);
    expect(out).toContain("Remove from your cart?");
    expect(out).toContain("Confirm: remove");
  });

  it("without a cart on the page, says so and links to the store instead of offering Confirm", () => {
    const out = renderToStaticMarkup(<CartChangeCard change={{ ...add, url: "https://shop.example/product/socks/" }} cart={bridge({ available: false })} storageId="m3:0" />);
    expect(out).toContain("only change your cart from the store");
    expect(out).toContain('href="https://shop.example/?add-to-cart=60"');
    expect(out).not.toContain("Confirm: add to cart");
  });
});

describe("LiveCart", () => {
  it("starts by reading the cart, and says plainly when the page has none", () => {
    expect(renderToStaticMarkup(<LiveCart cart={bridge()} />)).toContain("Reading your cart");
    const none = renderToStaticMarkup(<LiveCart cart={bridge({ available: false })} />);
    expect(none).toContain("Your cart");
  });
});

describe("ReplyCards with a cart", () => {
  const cards: ReplyCard[] = [{ type: "products", items: [jacket] }, { type: "cart_change", change: { action: "add", productId: 21, name: "StormShell Rain Jacket", quantity: 1 } }, { type: "cart" }];

  it("shows purchase buttons and the cart cards in the shopper's widget", () => {
    const out = renderToStaticMarkup(<ReplyCards cards={cards} cart={bridge()} messageId="m1" />);
    expect(out).toContain("Add to cart");
    expect(out).toContain("Add to your cart?");
    expect(out).toContain("Your cart");
  });

  it("shows only the products, with no buttons, to the team in the inbox", () => {
    const out = renderToStaticMarkup(<ReplyCards cards={cards} />);
    expect(out).toContain("StormShell Rain Jacket");
    expect(out).not.toContain("Add to cart");
    expect(out).not.toContain("Add to your cart?");
    expect(out).not.toContain("Your cart");
  });
});
