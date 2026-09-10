// Razorpay Checkout runs entirely in the browser: we hand it a subscription
// (or order) id created server-side and it renders the payment modal itself.
// There is no redirect URL to send the customer to, which is why callers open
// the modal rather than navigating.
//
// Nothing here is trusted to change billing state — the modal's success
// callback only tells us to refresh. Plans, seats, and allowances move only
// when Razorpay's signed webhook reaches workspace-service.

const CHECKOUT_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

type RazorpayInstance = { open: () => void; on: (event: string, handler: (payload: unknown) => void) => void };
type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

let scriptPromise: Promise<void> | null = null;

/** Loads checkout.js once per page, reusing the same promise for later calls. */
function loadCheckoutScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Razorpay Checkout needs a browser"));
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CHECKOUT_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      // Let a later attempt retry rather than caching the failure forever.
      scriptPromise = null;
      reject(new Error("Could not reach Razorpay Checkout. Check your connection and try again."));
    };
    document.body.appendChild(script);
  });
  return scriptPromise;
}

export type CheckoutOptions = {
  keyId: string;
  /** Exactly one of these: a recurring plan subscription, or a one-off order. */
  subscriptionId?: string;
  orderId?: string;
  /** Shown in the modal header. */
  description: string;
  prefill?: { name?: string; email?: string };
  amountPaise?: number;
};

/**
 * Opens the payment modal and resolves once the customer has paid, or rejects
 * if they dismiss it. Resolving means "Razorpay accepted the payment" — not
 * "the workspace has been upgraded"; the webhook decides that, so callers
 * should refetch entitlement rather than assume the new plan is live.
 */
export async function openRazorpayCheckout(options: CheckoutOptions): Promise<void> {
  await loadCheckoutScript();
  const Razorpay = window.Razorpay;
  if (!Razorpay) throw new Error("Razorpay Checkout failed to initialise.");

  return new Promise<void>((resolve, reject) => {
    const checkout = new Razorpay({
      key: options.keyId,
      name: "Elpino",
      description: options.description,
      ...(options.subscriptionId ? { subscription_id: options.subscriptionId } : {}),
      ...(options.orderId ? { order_id: options.orderId } : {}),
      ...(options.amountPaise ? { amount: options.amountPaise, currency: "INR" } : {}),
      prefill: options.prefill ?? {},
      theme: { color: "#11120f" },
      handler: () => resolve(),
      modal: {
        ondismiss: () => reject(new Error("Payment was cancelled.")),
      },
    });

    checkout.on("payment.failed", (payload: unknown) => {
      const description = (payload as { error?: { description?: string } })?.error?.description;
      reject(new Error(description ?? "The payment could not be completed."));
    });

    checkout.open();
  });
}
