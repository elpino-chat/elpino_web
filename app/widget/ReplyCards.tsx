"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Star, Truck } from "lucide-react";

// Rich cards under an AI reply: products it recommended, or the order it looked up. The shape is validated by
// workspace-service (agent/cards.util.ts) before it is saved, so every field here is plain text or a web link.
export type ProductCard = { name: string; subtitle?: string; rating?: number; ratingCount?: string; price?: string; comparePrice?: string; imageUrl?: string; url?: string; badge?: string; description?: string };
export type OrderCard = {
  number: string; status: string; stage: number; tone: "ok" | "warn" | "bad";
  placedOn?: string; eta?: string; shipTo?: string; total?: string; items?: string[];
  carrier?: string; trackingNumber?: string; trackingUrl?: string; note?: string; history?: { date: string; event: string }[];
};
export type ReplyCard = { type: "products"; items: ProductCard[] } | { type: "order"; order: OrderCard };

const INK = "#18181b";
const MUTED = "rgba(24,24,27,.55)";
const BORDER = "#e4e6ea";
const SOFT = "#f4f5f7";

const TONES = {
  ok: { bg: "#e8f6ee", fg: "#1f7a4d", bar: INK },
  warn: { bg: "#fff4e0", fg: "#9a6200", bar: "#e09b1a" },
  bad: { bg: "#fdecec", fg: "#b42318", bar: "#b8bcc4" },
} as const;

const STAGES = ["Ordered", "Packed", "Shipped", "Out for delivery", "Delivered"];

/**
 * A reply's text around its cards: the first `cardsAt` paragraphs come before them and the rest (usually a closing
 * question) after. Without a position, or when it would leave nothing on one side, all of the text comes first.
 */
export function splitAtCards(body: string, cardsAt: number | null | undefined): { before: string; after: string } {
  const paragraphs = body.split(/\n{2,}/);
  if (typeof cardsAt !== "number" || !Number.isInteger(cardsAt) || cardsAt < 1 || cardsAt >= paragraphs.length) return { before: body, after: "" };
  return { before: paragraphs.slice(0, cardsAt).join("\n\n"), after: paragraphs.slice(cardsAt).join("\n\n") };
}

/** "$169.00" and "$149.00" -> 12, the percent off; null when it cannot be worked out. */
export function percentOff(price?: string, comparePrice?: string): number | null {
  const now = Number((price ?? "").replace(/[^0-9.]/g, ""));
  const was = Number((comparePrice ?? "").replace(/[^0-9.]/g, ""));
  if (!now || !was || was <= now) return null;
  const percent = Math.round(((was - now) / was) * 100);
  return percent >= 1 ? percent : null;
}

function ProductImage({ product }: { product: ProductCard }) {
  const [failed, setFailed] = useState(false);
  if (product.imageUrl && !failed) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={product.imageUrl} alt={product.name} loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-cover" />;
  }
  // No picture (or it did not load): the product's initial on a soft tile, so a card never looks broken.
  return <span className="flex h-full w-full items-center justify-center text-[34px] font-semibold" style={{ backgroundColor: SOFT, color: MUTED }}>{product.name.charAt(0).toUpperCase()}</span>;
}

function ProductTile({ product }: { product: ProductCard }) {
  const off = percentOff(product.price, product.comparePrice);
  const body = (
    <>
      <span className="relative block aspect-square w-full overflow-hidden" style={{ backgroundColor: SOFT }}>
        <ProductImage product={product} />
        {product.badge && (
          <span className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10.5px] font-semibold" style={{ backgroundColor: product.badge === "Out of stock" ? INK : "#fff4e0", color: product.badge === "Out of stock" ? "#fff" : "#9a6200" }}>{product.badge}</span>
        )}
      </span>
      <span className="block px-3 pb-3 pt-2.5">
        <span className="line-clamp-2 block text-[13px] font-semibold leading-[18px]">{product.name}</span>
        {product.subtitle && <span className="mt-0.5 block truncate text-[11.5px]" style={{ color: MUTED }}>{product.subtitle}</span>}
        {product.rating !== undefined && (
          <span className="mt-1 flex items-center gap-1 text-[11.5px]" aria-label={`Rated ${product.rating} out of 5`}>
            <span className="font-semibold">{product.rating.toFixed(1)}</span>
            <Star size={11} fill="#e0a21a" stroke="#e0a21a" aria-hidden="true" />
            {product.ratingCount && <span style={{ color: MUTED }}>({product.ratingCount})</span>}
          </span>
        )}
        {product.price && (
          <span className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5">
            <span className="text-[14px] font-bold">{product.price}</span>
            {product.comparePrice && off !== null && <span className="text-[12px] line-through" style={{ color: MUTED }}>{product.comparePrice}</span>}
            {off !== null && <span className="rounded-full px-1.5 py-px text-[10.5px] font-semibold" style={{ backgroundColor: "#e8f6ee", color: "#1f7a4d" }}>-{off}%</span>}
          </span>
        )}
      </span>
    </>
  );
  const className = "block w-[158px] shrink-0 snap-start overflow-hidden rounded-2xl border bg-white text-left transition hover:-translate-y-0.5 hover:shadow-md";
  return product.url
    ? <a href={product.url} target="_blank" rel="noopener noreferrer" className={`${className} cursor-pointer`} style={{ borderColor: BORDER, color: INK }} aria-label={`${product.name}, ${product.price ?? ""}`}>{body}</a>
    : <div className={className} style={{ borderColor: BORDER, color: INK }}>{body}</div>;
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={copied ? "Copied" : label}
      title={copied ? "Copied" : label}
      onClick={() => {
        // The widget lives in an iframe, where the clipboard can be blocked: failing quietly is fine.
        void navigator.clipboard?.writeText(value).then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 1500); }).catch(() => undefined);
      }}
      className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full transition hover:bg-black/5"
      style={{ color: MUTED }}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

/** The five stops of an order with the truck at the one it has reached. */
function Progress({ order }: { order: OrderCard }) {
  const tone = TONES[order.tone];
  const last = STAGES.length - 1;
  const percent = (order.stage / last) * 100;
  return (
    <div className="mt-4" role="img" aria-label={`Order progress: ${STAGES[order.stage]}`}>
      <div className="relative mx-3 h-8">
        <span className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full" style={{ backgroundColor: "#eceef0" }} />
        <span className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full transition-all" style={{ width: `${percent}%`, backgroundColor: tone.bar }} />
        {STAGES.map((stage, index) => (
          <span key={stage} className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white" style={{ left: `${(index / last) * 100}%`, borderColor: index <= order.stage ? tone.bar : "#d3d6db", backgroundColor: index <= order.stage ? tone.bar : "#fff" }} />
        ))}
        <span className="absolute top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white shadow-md" style={{ left: `${percent}%`, backgroundColor: tone.bar }}>
          <Truck size={15} />
        </span>
      </div>
      <div className="mt-1 flex justify-between text-center text-[10px] leading-3" style={{ color: MUTED }}>
        {STAGES.map((stage, index) => (
          <span key={stage} className="w-[19%] first:text-left last:text-right" style={{ color: index === order.stage ? INK : MUTED, fontWeight: index === order.stage ? 600 : 400 }}>{stage}</span>
        ))}
      </div>
    </div>
  );
}

type Tab = "details" | "carrier" | "history";

function OrderTracker({ order }: { order: OrderCard }) {
  const tone = TONES[order.tone];
  const tabs = ([
    ["details", "Details", Boolean(order.items?.length || order.total || order.shipTo)],
    ["carrier", "Carrier", Boolean(order.carrier || order.trackingNumber)],
    ["history", "History", Boolean(order.history?.length)],
  ] as [Tab, string, boolean][]).filter(([, , available]) => available);
  const [tab, setTab] = useState<Tab>(tabs[0]?.[0] ?? "details");
  // A cancelled or refunded order never moved along the route, so a progress bar would say nothing.
  const showProgress = !(order.tone === "bad" && order.stage < 2);

  return (
    <div className="w-full max-w-[360px] rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: BORDER, color: INK }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: MUTED }}>Order</p>
          <div className="flex items-center gap-1">
            <p className="truncate text-[20px] font-semibold leading-7 tabular-nums">{order.number.startsWith("#") ? order.number : `#${order.number}`}</p>
            <CopyButton value={order.number.replace(/^#/, "")} label="Copy order number" />
          </div>
        </div>
        <span className="mt-1 shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-semibold" style={{ backgroundColor: tone.bg, color: tone.fg }}>{order.status}</span>
      </div>

      {(order.placedOn || order.shipTo) && (
        <p className="mt-1 text-[12px]" style={{ color: MUTED }}>{[order.placedOn && `Placed ${order.placedOn}`, order.shipTo && `Ship to ${order.shipTo}`].filter(Boolean).join(" · ")}</p>
      )}

      {showProgress && <Progress order={order} />}

      {order.eta && (
        <div className="mt-3 flex items-center justify-between rounded-xl px-3 py-2 text-[12.5px]" style={{ backgroundColor: SOFT }}>
          <span style={{ color: MUTED }}>Estimated delivery</span>
          <span className="font-semibold">{order.eta}</span>
        </div>
      )}
      {order.note && <p className="mt-2 rounded-xl px-3 py-2 text-[12px] leading-[17px]" style={{ backgroundColor: tone.bg, color: tone.fg }}>{order.note}</p>}

      {tabs.length > 0 && (
        <>
          <div role="tablist" aria-label="Order information" className="mt-3 flex gap-1.5">
            {tabs.map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className="cursor-pointer rounded-full border px-3 py-1 text-[12px] font-medium transition"
                style={tab === id ? { borderColor: INK, backgroundColor: INK, color: "#fff" } : { borderColor: BORDER, color: MUTED }}
              >
                {label}
              </button>
            ))}
          </div>

          <div role="tabpanel" className="mt-3 text-[12.5px] leading-5">
            {tab === "details" && (
              <div className="space-y-1.5">
                {order.items?.map((item) => <p key={item}>{item}</p>)}
                {order.total && <p className="flex justify-between border-t pt-1.5 font-semibold" style={{ borderColor: BORDER }}><span>Total</span><span>{order.total}</span></p>}
              </div>
            )}
            {tab === "carrier" && (
              <div className="space-y-2">
                {order.carrier && <p className="flex justify-between"><span style={{ color: MUTED }}>Carrier</span><span className="font-semibold">{order.carrier}</span></p>}
                {order.trackingNumber && (
                  <p className="flex items-center justify-between gap-2">
                    <span style={{ color: MUTED }}>Tracking</span>
                    <span className="flex min-w-0 items-center gap-1 font-mono text-[12px]"><span className="truncate">{order.trackingNumber}</span><CopyButton value={order.trackingNumber} label="Copy tracking number" /></span>
                  </p>
                )}
                {order.trackingUrl && (
                  <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="mt-1 flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-full text-[12.5px] font-semibold text-white transition hover:opacity-90" style={{ backgroundColor: INK }}>
                    Track package <ExternalLink size={13} />
                  </a>
                )}
              </div>
            )}
            {tab === "history" && (
              <ol className="space-y-2.5">
                {order.history?.map((entry, index) => (
                  <li key={`${entry.date}-${index}`} className="flex gap-2.5">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: index === (order.history?.length ?? 1) - 1 ? tone.bar : "#c7cbd1" }} />
                    <span><span className="block font-medium">{entry.event}</span><span className="block text-[11.5px]" style={{ color: MUTED }}>{entry.date}</span></span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/** Everything a reply carries, under its text: an order tracker for each order and one carousel of products. */
export function ReplyCards({ cards }: { cards: ReplyCard[] }) {
  return (
    <div className="mt-1 space-y-2.5">
      {cards.map((card, index) => card.type === "order"
        ? <OrderTracker key={`order-${card.order.number}-${index}`} order={card.order} />
        : (
          <div key={`products-${index}`} className="-mx-1 flex snap-x gap-2.5 overflow-x-auto px-1 pb-1.5 pt-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="list" aria-label="Products">
            {card.items.map((product) => <div key={product.name} role="listitem" className="contents"><ProductTile product={product} /></div>)}
          </div>
        ))}
    </div>
  );
}
