// src/data/site.ts — single source of truth for site copy + links.

export const site = {
  name: "Webstore Demo",
  tagline: "Next.js + Firebase + Stripe in test mode",
  description:
    "A demo storefront proving auth → products → cart → Stripe checkout → subscriptions → gated content, all with test payments.",
  sourceUrl: "https://github.com/BachiDev/webstore",
  authorUrl: "https://bachi.dev",
  imprintUrl: "https://bachi.dev/#imprint",
} as const;

export const navItems = [
  { href: "/store", label: "Store" },
  { href: "/subscription", label: "Subscriptions" },
] as const;

export const footerNav = [
  { href: "/", label: "Home" },
  { href: "/store", label: "Store" },
  { href: "/subscription", label: "Subscriptions" },
  { href: "/cart", label: "Cart" },
  { href: "/profile", label: "Profile" },
] as const;

export const demoTestCard = {
  number: "4242 4242 4242 4242",
  expiry: "any future date",
  cvc: "any 3-digit number",
  docsUrl: "https://docs.stripe.com/testing?testing-method=card-numbers#cards",
} as const;

export const demoFlow = [
  {
    step: "01",
    title: "Sign in",
    lede: "Guest is fine for a quick look — sign in to keep purchases across sessions. Logging out as a guest clears everything.",
  },
  {
    step: "02",
    title: "Add to cart",
    lede: "One-time products live in the store; plans under subscriptions.",
  },
  {
    step: "03",
    title: "Test checkout",
    lede: "Pay with card 4242 4242 4242 4242. No real charges, ever.",
  },
  {
    step: "04",
    title: "Manage",
    lede: "Receipts and plans in your profile via the Stripe customer portal.",
  },
] as const;
