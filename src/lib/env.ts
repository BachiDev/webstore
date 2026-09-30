// src/lib/env.ts — centralized env access (Phase 0).
// Firebase web API keys are public by design; env keeps them out of git
// and allows per-environment overrides. All getters have safe fallbacks so
// the demo still runs when env is unset (e.g. existing Hosting deploy).

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyDlx6CHU-i50nv_MYCRckoyNTwMtA6_pxk",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "bachidev-webstore.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "bachidev-webstore",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "bachidev-webstore.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "1004951580520",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:1004951580520:web:e7fdf51d4a097c628d30dd",
};

/** Region of the Stripe-extension portal callable. */
export const stripePortalRegion = process.env.NEXT_PUBLIC_STRIPE_PORTAL_REGION ?? "europe-west3";

/** Show the test-mode callout with the Stripe test card. Env-gated so
 *  production-looking UI never leaks demo chrome by accident. */
export const isDemoBannerEnabled = process.env.NEXT_PUBLIC_DEMO_BANNER !== "false";
