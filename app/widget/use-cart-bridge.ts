"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CartBridge, CartResult } from "./ReplyCards";

const TIMEOUT_MS = 15_000;
/** Fired inside the chat frame whenever the cart changed, so every cart card on screen reads it again. */
export const CART_CHANGED = "elpino:cart-changed";

/**
 * The chat frame's line to the shopper's cart. The cart lives in the store page's own session, which this frame cannot
 * reach, so each change is a message to the tag script on that page (which answers only this frame). `available` is
 * false on a page with no cart (any site that is not a WooCommerce store), and then nothing offers to change one.
 */
export function useCartBridge(): CartBridge {
  const [info, setInfo] = useState<{ available: boolean; cartUrl: string | null; checkoutUrl: string | null }>({ available: false, cartUrl: null, checkoutUrl: null });
  const waiting = useRef(new Map<string, (result: CartResult) => void>());

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.source !== window.parent) return;
      const data = event.data as { type?: string; available?: boolean; cartUrl?: string; checkoutUrl?: string; id?: string; ok?: boolean; error?: string; cart?: CartResult["cart"] } | null;
      if (!data || typeof data !== "object") return;
      if (data.type === "elpino:cart-capability") {
        setInfo({ available: data.available === true, cartUrl: typeof data.cartUrl === "string" ? data.cartUrl : null, checkoutUrl: typeof data.checkoutUrl === "string" ? data.checkoutUrl : null });
      } else if (data.type === "elpino:cart-result" && typeof data.id === "string") {
        const done = waiting.current.get(data.id);
        if (!done) return;
        waiting.current.delete(data.id);
        done({ ok: data.ok === true, error: typeof data.error === "string" ? data.error : undefined, cart: data.cart });
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const call = useCallback<CartBridge["call"]>((op, args = {}) => new Promise<CartResult>((resolve) => {
    const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
    const timer = window.setTimeout(() => { if (waiting.current.delete(id)) resolve({ ok: false, error: "The store did not answer. Please try again." }); }, TIMEOUT_MS);
    waiting.current.set(id, (result) => {
      window.clearTimeout(timer);
      if (result.ok && op !== "get") window.dispatchEvent(new CustomEvent(CART_CHANGED));
      resolve(result);
    });
    window.parent.postMessage({ type: "elpino:cart", id, op, ...args }, "*");
  }), []);

  return useMemo(() => ({ ...info, call }), [info, call]);
}
