import { payments } from "./firebase";
import { createCheckoutSession } from "@invertase/firestore-stripe-payments";

export const createCheckout = async (priceId: string) => {
  const sessionId = await createCheckoutSession(payments, {
    price: priceId,
    success_url: `${window.location.origin}/profile`,
    cancel_url: window.location.origin,
  });
  window.location.assign(sessionId.url);
};

export const createCartCheckout = async (line_items: { price: string; quantity?: number }[]) => {
  const sessionId = await createCheckoutSession(payments, {
    mode: 'payment',
    line_items: line_items,
    success_url: `${window.location.origin}/profile`,
    cancel_url: window.location.origin,
  });
  window.location.assign(sessionId.url);
};