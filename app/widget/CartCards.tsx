"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, LoaderCircle, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import type { CartBridge, CartChange, CartSnapshot, ProductCard } from "./ReplyCards";
import { CART_CHANGED } from "./use-cart-bridge";

const INK = "#18181b";
const MUTED = "rgba(24,24,27,.55)";
const BORDER = "#e4e6ea";
const SOFT = "#f4f5f7";

const originOf = (url?: string | null): string | null => { try { return url ? new URL(url).origin : null; } catch { return null; } };

/** Where a visitor who is not on the store's own page can add an item: the store adds it when the page opens. */
export function addToCartLink(productId: number, productUrl?: string): string | null {
  const origin = originOf(productUrl);
  return origin ? `${origin}/?add-to-cart=${productId}` : null;
}

const pill = "inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-full px-3.5 text-[12.5px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

/** The button under a product card. Pressing it is the shopper's own, explicit choice to add that one product. */
export function AddToCartButton({ product, cart }: { product: ProductCard; cart: CartBridge }) {
  const [phase, setPhase] = useState<"idle" | "busy" | "added" | "error">("idle");
  const [error, setError] = useState("");
  const id = product.productId;
  if (!id) return null;
  if (product.hasOptions) {
    return product.url ? <a href={product.url} target="_blank" rel="noopener noreferrer" className={`${pill} w-full border`} style={{ borderColor: BORDER, color: INK }}>Choose options</a> : null;
  }
  if (!product.canAdd) return null;

  if (!cart.available) {
    const link = addToCartLink(id, product.url);
    return link ? <a href={link} target="_blank" rel="noopener noreferrer" className={`${pill} w-full text-white`} style={{ backgroundColor: INK }}><ShoppingCart size={13} /> Add to cart</a> : null;
  }
  async function add() {
    setPhase("busy");
    const result = await cart.call("add", { productId: id, quantity: 1 });
    if (result.ok) setPhase("added");
    else { setError(result.error ?? "Could not add it."); setPhase("error"); }
  }
  async function undo() {
    setPhase("busy");
    const result = await cart.call("remove", { productId: id, name: product.name });
    setPhase(result.ok ? "idle" : "added");
  }
  if (phase === "added") {
    return (
      <div className="flex items-center justify-between gap-2 text-[12px]" role="status">
        <span className="inline-flex items-center gap-1 font-semibold" style={{ color: "#1f7a4d" }}><Check size={13} strokeWidth={3} /> Added</span>
        <span className="flex items-center gap-2.5">
          {cart.cartUrl && <a href={cart.cartUrl} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2">View cart</a>}
          <button type="button" onClick={() => void undo()} className="cursor-pointer underline underline-offset-2" style={{ color: MUTED }}>Undo</button>
        </span>
      </div>
    );
  }
  return (
    <div>
      <button type="button" disabled={phase === "busy"} onClick={() => void add()} className={`${pill} w-full text-white`} style={{ backgroundColor: INK }}>
        {phase === "busy" ? <LoaderCircle size={13} className="animate-spin" /> : <ShoppingCart size={13} />} Add to cart
      </button>
      {phase === "error" && <p role="alert" className="mt-1 text-[11px] leading-4 text-[#b42318]">{error}</p>}
    </div>
  );
}

// What the shopper decided about a confirmation, kept so reopening the chat cannot offer the same change twice.
type Decision = "done" | "dismissed";
const decisionKey = (id: string) => `elpino:cart-change:${id}`;
function readDecision(id: string): Decision | null {
  try { const value = window.localStorage.getItem(decisionKey(id)); return value === "done" || value === "dismissed" ? value : null; } catch { return null; }
}
function writeDecision(id: string, value: Decision) {
  try { window.localStorage.setItem(decisionKey(id), value); } catch { /* the card still works for this visit */ }
}

/**
 * The AI's offer to change the cart, with the product, the quantity and a Confirm button. Nothing happens until the
 * shopper presses it; "Not now" changes nothing. Where the page has no cart, an add becomes a link to the store.
 */
export function CartChangeCard({ change, cart, storageId }: { change: CartChange; cart: CartBridge; storageId: string }) {
  const [decision, setDecision] = useState<Decision | null>(null);
  const [phase, setPhase] = useState<"idle" | "busy" | "error">("idle");
  const [error, setError] = useState("");
  const [after, setAfter] = useState<CartSnapshot | null>(null);
  useEffect(() => { setDecision(readDecision(storageId)); }, [storageId]);

  const adding = change.action === "add";
  async function confirm() {
    setPhase("busy");
    const result = await cart.call(adding ? "add" : "remove", { productId: change.productId, name: change.name, quantity: change.quantity, options: change.options });
    if (result.ok) { setAfter(result.cart ?? null); writeDecision(storageId, "done"); setDecision("done"); setPhase("idle"); }
    else { setError(result.error ?? "The store would not change the cart."); setPhase("error"); }
  }
  function dismiss() { writeDecision(storageId, "dismissed"); setDecision("dismissed"); }

  const detail = [change.options?.map((o) => `${o.attribute}: ${o.value}`).join(", "), change.quantity > 1 ? `Qty ${change.quantity}` : null].filter(Boolean).join(" · ");
  const fallback = adding ? addToCartLink(change.productId, change.url) : (originOf(change.url) ? `${originOf(change.url)}/cart/` : null);

  return (
    <div className="w-full max-w-[360px] rounded-2xl border bg-white p-3.5 shadow-sm" style={{ borderColor: BORDER, color: INK }}>
      <div className="flex items-center gap-3">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl text-[18px] font-semibold" style={{ backgroundColor: SOFT, color: MUTED }}>
          {change.imageUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={change.imageUrl} alt="" className="h-full w-full object-cover" />
            : change.name.charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: MUTED }}>{adding ? "Add to your cart?" : "Remove from your cart?"}</span>
          <span className="mt-0.5 line-clamp-2 block text-[13.5px] font-semibold leading-[18px]">{change.name}</span>
          <span className="mt-0.5 block text-[12px]" style={{ color: MUTED }}>{[change.price, detail].filter(Boolean).join(" · ")}</span>
        </span>
      </div>

      {decision === "done" ? (
        <div role="status" className="mt-3 rounded-xl px-3 py-2.5 text-[12.5px]" style={{ backgroundColor: "#e8f6ee", color: "#1f7a4d" }}>
          <span className="flex items-center gap-1.5 font-semibold"><Check size={14} strokeWidth={3} /> {adding ? "Added to your cart" : "Removed from your cart"}</span>
          {after && <span className="mt-0.5 block text-[12px]">{after.count} {after.count === 1 ? "item" : "items"} · {after.total}</span>}
          <span className="mt-1.5 flex gap-3 font-semibold">
            {(after?.cartUrl ?? cart.cartUrl) && <a href={(after?.cartUrl ?? cart.cartUrl) as string} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">View cart</a>}
            {(after?.checkoutUrl ?? cart.checkoutUrl) && <a href={(after?.checkoutUrl ?? cart.checkoutUrl) as string} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">Checkout</a>}
          </span>
        </div>
      ) : decision === "dismissed" ? (
        <p className="mt-3 text-[12.5px]" style={{ color: MUTED }}>Okay, no changes made.</p>
      ) : !cart.available ? (
        <div className="mt-3 text-[12.5px]" style={{ color: MUTED }}>
          <p>I can only change your cart from the store&apos;s own pages.</p>
          {fallback && <a href={fallback} target="_blank" rel="noopener noreferrer" className={`${pill} mt-2 text-white`} style={{ backgroundColor: INK }}>{adding ? "Add it on the store" : "Open your cart"}</a>}
        </div>
      ) : (
        <>
          <div className="mt-3 flex gap-2">
            <button type="button" disabled={phase === "busy"} onClick={() => void confirm()} className={`${pill} flex-1 text-white`} style={{ backgroundColor: INK }}>
              {phase === "busy" ? <LoaderCircle size={13} className="animate-spin" /> : adding ? <ShoppingCart size={13} /> : <Trash2 size={13} />}
              {adding ? "Confirm: add to cart" : "Confirm: remove"}
            </button>
            <button type="button" disabled={phase === "busy"} onClick={dismiss} className={`${pill} border`} style={{ borderColor: BORDER, color: INK }}>Not now</button>
          </div>
          {phase === "error" && <p role="alert" className="mt-2 text-[12px] leading-4 text-[#b42318]">{error}</p>}
        </>
      )}
    </div>
  );
}

/** The shopper's cart as it is right now, read from the store page: change a quantity, remove a line, check out. */
export function LiveCart({ cart }: { cart: CartBridge }) {
  const [snapshot, setSnapshot] = useState<CartSnapshot | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "unavailable">("loading");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!cart.available) { setState("unavailable"); return; }
    const result = await cart.call("get");
    if (result.ok && result.cart) { setSnapshot(result.cart); setState("ready"); } else { setError(result.error ?? ""); setState("unavailable"); }
  }, [cart]);
  useEffect(() => {
    void load();
    const onChanged = () => void load();
    window.addEventListener(CART_CHANGED, onChanged);
    return () => window.removeEventListener(CART_CHANGED, onChanged);
  }, [load]);

  async function change(op: "update" | "remove", key: string, quantity?: number) {
    setBusyKey(key);
    setError("");
    const result = await cart.call(op, { key, quantity });
    if (result.ok && result.cart) setSnapshot(result.cart); else setError(result.error ?? "Could not change the cart.");
    setBusyKey(null);
  }

  return (
    <div className="w-full max-w-[360px] rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: BORDER, color: INK }}>
      <p className="flex items-center gap-2 text-[15px] font-semibold"><ShoppingCart size={16} /> Your cart</p>
      {state === "loading" && <p className="mt-3 flex items-center gap-2 text-[12.5px]" style={{ color: MUTED }}><LoaderCircle size={14} className="animate-spin" /> Reading your cart…</p>}
      {state === "unavailable" && (
        <p className="mt-3 text-[12.5px] leading-5" style={{ color: MUTED }}>
          {cart.available ? error || "I couldn't read your cart just now." : "I can only show your cart from the store's own pages."}
          {cart.cartUrl && <> <a href={cart.cartUrl} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2" style={{ color: INK }}>Open your cart</a></>}
        </p>
      )}
      {state === "ready" && snapshot && (snapshot.items.length === 0 ? (
        <p className="mt-3 text-[12.5px]" style={{ color: MUTED }}>Your cart is empty. Tell me what you&apos;re looking for and I&apos;ll help you find it.</p>
      ) : (
        <>
          <ul className="mt-3 divide-y" style={{ borderColor: BORDER }}>
            {snapshot.items.map((item) => (
              <li key={item.key} className="flex items-center gap-3 py-2.5" style={{ borderColor: BORDER }}>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg text-[14px] font-semibold" style={{ backgroundColor: SOFT, color: MUTED }}>
                  {item.imageUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                    : item.name.charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 block text-[13px] font-semibold">{item.name}</span>
                  <span className="block text-[11.5px]" style={{ color: MUTED }}>{[item.options, item.price].filter(Boolean).join(" · ")}</span>
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full border px-1" style={{ borderColor: BORDER }}>
                    <button type="button" aria-label={`One fewer ${item.name}`} disabled={busyKey === item.key || item.quantity <= 1} onClick={() => void change("update", item.key, item.quantity - 1)} className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-30"><Minus size={11} /></button>
                    <span className="min-w-[16px] text-center text-[12px] font-semibold tabular-nums" aria-live="polite">{busyKey === item.key ? "…" : item.quantity}</span>
                    <button type="button" aria-label={`One more ${item.name}`} disabled={busyKey === item.key || item.quantity >= 20} onClick={() => void change("update", item.key, item.quantity + 1)} className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-30"><Plus size={11} /></button>
                  </span>
                </span>
                <span className="flex flex-col items-end gap-1">
                  <span className="text-[13px] font-semibold tabular-nums">{item.lineTotal}</span>
                  <button type="button" aria-label={`Remove ${item.name} from your cart`} disabled={busyKey === item.key} onClick={() => void change("remove", item.key)} className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full hover:bg-black/5 disabled:opacity-40" style={{ color: MUTED }}><Trash2 size={13} /></button>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 flex items-center justify-between border-t pt-2.5 text-[14px] font-semibold" style={{ borderColor: BORDER }}><span>Total</span><span className="tabular-nums">{snapshot.total}</span></p>
          {error && <p role="alert" className="mt-2 text-[12px] text-[#b42318]">{error}</p>}
          <div className="mt-3 flex gap-2">
            <a href={snapshot.checkoutUrl} target="_blank" rel="noopener noreferrer" className={`${pill} flex-1 text-white`} style={{ backgroundColor: INK }}>Checkout</a>
            <a href={snapshot.cartUrl} target="_blank" rel="noopener noreferrer" className={`${pill} border`} style={{ borderColor: BORDER, color: INK }}>View cart</a>
          </div>
        </>
      ))}
    </div>
  );
}
