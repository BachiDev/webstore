import { payments } from "./firebase";
import { createCheckoutSession } from "@invertase/firestore-stripe-payments";

export type CheckoutUrls = {
  successUrl?: string;
  cancelUrl?: string;
};

/** Pure URL builder (exported for tests) — callers pass the page origin. */
export const buildCheckoutUrls = (origin: string, opts: CheckoutUrls = {}) => ({
  success_url: opts.successUrl ?? `${origin}/profile`,
  cancel_url: opts.cancelUrl ?? origin,
});

const urls = (opts: CheckoutUrls = {}) => buildCheckoutUrls(window.location.origin, opts);

export const createCheckout = async (priceId: string, opts?: CheckoutUrls) => {
  const session = await createCheckoutSession(payments, {
    price: priceId,
    ...urls(opts),
  });
  if (!session?.url) {
    throw new Error("Checkout session returned no URL");
  }
  window.location.assign(session.url);
};

export const createCartCheckout = async (
  line_items: { price: string; quantity?: number }[],
  opts?: CheckoutUrls,
) => {
  if (line_items.length === 0) {
    throw new Error("Cannot check out with an empty cart");
  }
  const session = await createCheckoutSession(payments, {
    mode: "payment",
    line_items: line_items,
    ...urls(opts),
  });
  if (!session?.url) {
    throw new Error("Checkout session returned no URL");
  }
  window.location.assign(session.url);
};
