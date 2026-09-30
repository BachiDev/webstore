# WebStore - A Full-Stack E-commerce Demo

A demo storefront by [Fabian Bachmayer](https://bachi.dev) proving auth → products → cart → Stripe checkout → subscriptions → gated content on Next.js + Firebase. Styled with the [bachi.dev](https://bachi.dev) dark design system (violet brand ramp, Inter + Geist Mono).

## Live Demo

[Check Out Live](https://bachidev-webstore.web.app/)

> **Test mode — no real charges anywhere.** Use card `4242 4242 4242 4242`, any future expiry, any 3-digit CVC. ([Stripe test docs](https://docs.stripe.com/testing?testing-method=card-numbers#cards))

## Demo flow

1. **Sign in** — continue as guest or sign in. Signing in _links_ the guest account, so purchases stay on your account (the cart itself lives in this browser).
2. **Browse** — search, sort, and open product detail pages in the store; plans live under subscriptions.
3. **Check out** — cart returns to a thank-you panel; subscriptions return with the plan name. Cancel keeps your cart.
4. **Manage** — receipts, active plans, and the Stripe customer portal in your profile. Plans unlock role-gated content (`Starter` → `Pro` → `Premium`).

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Firebase web config (public by design)
npm run dev                  # Next.js with Turbopack
```

| Script               | What it does                             |
| -------------------- | ---------------------------------------- |
| `npm run dev`        | Start dev server (Turbopack)             |
| `npm run build`      | Production build (plain `next build`)    |
| `npm run start`      | Serve the production build               |
| `npm run typecheck`  | `tsc --noEmit`                           |
| `npm run lint`       | ESLint (next + typescript)               |
| `npm test`           | Vitest unit suite (`src/**/*.test.ts`)   |
| `npm run test:rules` | Firestore rules vs emulator (needs Java) |
| `npm run format`     | Prettier write (config in `.prettierrc`) |

Regenerate the link-preview cover after copy changes: `node scripts/generate-og-cover.mjs` (needs `sharp`, a Next.js dependency).

## Testing

- **Unit** (`npm test`, runs in CI): role ranking (`roles.ts`), price/date formatting (`format.ts`), auth error copy (`auth.ts`), cart storage validation (`CartContext`), checkout URL builder (`createCheckout.ts`). Pinned to vitest 3 (`@types/node` 20); `@firebase/rules-unit-testing` pinned to v4 (peers firebase 11).
- **Rules** (`npm run test:rules`, local + pre-deploy): anon/signed-in/owner/stranger matrix over products, customer trees, gated content, and default-deny — spins up the Firestore emulator automatically. Not in CI (emulator downloads + Java); run it before every rules deploy.

## Environment

All client config lives in `NEXT_PUBLIC_*` vars (see `.env.example`); `src/lib/env.ts` centralizes access with safe fallbacks:

- `NEXT_PUBLIC_FIREBASE_*` — Firebase web config (API key is public by design, kept out of git anyway)
- `NEXT_PUBLIC_STRIPE_PORTAL_REGION` — region of the Stripe-extension portal callable (`europe-west3`)
- `NEXT_PUBLIC_DEMO_BANNER` — set to `false` to hide the test-mode callout

## Firebase console prerequisites

Passwordless auth needs two providers enabled (**Authentication → Sign-in method**):

- **Google** — enable and pick a support email.
- **Email/Password** — enable, then turn on the **Email link (passwordless sign-in)** toggle.

Also confirm the hosting domain is listed under **Authentication → Settings → Authorized domains** (`localhost` and `*.web.app` are authorized by default; add any custom domain).

## Firebase emulator + rules

```bash
firebase emulators:start   # auth :9099, functions :5001, firestore :8080, UI enabled
```

Firestore rules (`firestore.rules`) are least-privilege:

- `products` (+ `prices` subcollection): public read, no client writes (written by the Stripe extension)
- `customers/{uid}` (+ `checkout_sessions` / `subscriptions` / `payments`): owner-only
- `content-starter|pro|premium`: signed-in read, no client writes — the Starter/Pro/Premium hierarchy is enforced in the client (`src/lib/roles.ts`); everything else denies by default

Verify with a read/write matrix (anon / signed-in / owner / stranger × each collection) before deploying rules:

```bash
firebase deploy --only firestore:rules
```

## Deploy

Pushes to `master` deploy to Firebase Hosting via `.github/workflows/firebase-hosting-merge.yml` (runs `typecheck` + `lint` + `build` first). PRs get preview channels via `firebase-hosting-pull-request.yml`. Hosting uses the webframeworks backend (`europe-west1`); note Firestore lives in `europe-west3`.

`functions/` is an empty placeholder — the real backend is the Run Payments with Stripe extension (`ext-firestore-stripe-payments-*`). The `@invertase/firestore-stripe-payments` client lib is archived; a direct-Stripe-SDK migration is tracked in `PLAN.md` Phase 4.

## Features

- **User Authentication:**
  - Guest sessions (explicit "Continue as Guest") + passwordless sign-in: Google or email magic link — no passwords, no sign-in/sign-up split.
  - Signing in as a guest _links_ the anonymous account, so purchases stay on your account (the cart itself lives in this browser's `localStorage`). Magic links verify email inherently.
  - Protected routes via `withAuth` / guest-aware `withGuest`.
- **Product Management:**
  - Products + prices from Firestore (synced from Stripe), search/sort, product detail pages with related items.
- **Shopping Cart:**
  - Add, remove, and step quantities (validated, persisted in `localStorage` with no-clobber hydration).
  - Review page with order summary, Stripe test-mode cap explainer, thank-you / canceled return states.
- **Payments and Subscriptions:**
  - Stripe Checkout for one-time and recurring prices, contextual success/cancel URLs, current-plan hints.
  - Receipts and active plans in the profile + Stripe customer portal link.
- **Role-gated content:** `Starter`/`Pro`/`Premium` pages with upgrade upsells; multi-subscription customers resolve to the highest plan.

## Technologies Used

### Frontend

- **Next.js 15:** App Router, server-first landing + client islands, route metadata, `loading`/`error`/`not-found` boundaries.
- **React 19:** Context state (`UserContext`, `CartContext`), Suspense for search-param states.
- **Tailwind CSS v4:** `@theme` brand tokens ported from bachi.dev; shared `ui/` primitives (`Button`, `Card`, `Pill`, `Section`, `DataTable`, `QtyStepper`, …).
- **Custom passwordless auth UI** (Google sign-in + email magic link, anonymous linking) — no auth UI kit.
- **TypeScript + Lucide icons + `Intl` formatting** (locale-aware prices/dates, no hardcoded currency).

### Backend

- **Firebase:**
  - **Authentication:** guest + email accounts with anon linking.
  - **Firestore:** products/prices catalog, per-user Stripe collections, gated content docs.
  - **Firebase Hosting:** Next.js via webframeworks.
- **Stripe (test mode):**
  - Checkout Sessions for payments and subscriptions, customer portal for self-service.

## Project structure

```
src/
  app/                    # routes: page (RSC landing), store (+ [id]), subscription,
                          # cart, auth, profile, content/*, robots/sitemap/manifest,
                          # loading/error/not-found, per-route metadata layouts
  components/
    ui/                   # design-system primitives (Button, Card, Pill, Section,
                          # DataTable, ShopBits, TestModeCallout, Reveal)
    HomeIslands.tsx       # landing client islands (guest note, featured products)
    Navbar.tsx Footer.tsx Providers.tsx withAuth.tsx withGuest.tsx
    ProductCard.tsx SubscriptionCard.tsx PaymentsTable.tsx SubscriptionsTable.tsx
  data/site.ts            # nav, links, demo copy, test-card details
  lib/
    firebase.ts env.ts cn.ts format.ts roles.ts
    UserContext.tsx CartContext.tsx useRole.ts useContent.ts
    products helpers: createCheckout.ts (contextual success/cancel URLs)
scripts/generate-og-cover.mjs  # link-preview cover generator
PLAN.md                   # overhaul plan (Phases 0–4) — start here for context
```

## Technical Deep Dive

### Authentication

Firebase Authentication with guest + permanent accounts, managed globally via `UserContext` (`user` / `loading` / `role`).

- **Guest sessions:** explicit opt-in ("Continue as Guest") mints an anonymous user; a `logged_out` flag in `localStorage` prevents silent re-login after logout.
- **Anonymous upgrade:** Google and magic-link sign-in _link_ (instead of replacing) the guest account via `linkWithPopup` / `linkWithCredential` (`src/lib/auth.ts`) — cart items and the Stripe customer mapping survive. `/auth` stays reachable for guests (`withGuest` only redirects email accounts). If the address already belongs to another account, sign-in falls back to that account with a toast.
- **Magic link flow:** `sendSignInLinkToEmail` remembers the address per device; `/auth/finish` completes via `signInWithEmailLink` — or asks for the address when the link opens on another device. Links expire after ~1h and are single-use.
- **Role:** resolved from active Stripe subscriptions with highest-rank-wins (`src/lib/roles.ts`: Starter < Pro < Premium); `useRole()` exposes `isStarter` / `isPro` / `isPremium` for the hierarchy.

### Stripe Integration

Via `@invertase/firestore-stripe-payments` against the Run Payments with Stripe extension:

- **Products and Prices:** created in Stripe, synced to Firestore (`products` + `prices` subcollections) by the extension.
- **Checkout:** `src/lib/createCheckout.ts` builds sessions with contextual `success_url` / `cancel_url` (`/cart?success…`, `/subscription?success&plan=…`), validates the returned URL, and surfaces failures with toasts instead of silent redirects.
- **Subscriptions:** yearly/monthly plans filtered client-side from the active catalog (no `!=` Firestore query, so no composite index needed).
- **Customer Portal:** callable `ext-firestore-stripe-payments-createPortalLink` (region centralized in `env.ts`) for receipts, payment methods, and cancellations.

### Frontend Architecture

- **Server-first:** the landing is a Server Component; interactivity lives in client islands (auth/cart/checkout/nav/gated lists). `useSearchParams` states sit behind Suspense boundaries for clean prerendering.
- **State:** `CartContext` (validated `localStorage` persistence, hydrated-flag against clobbering) and `UserContext` (auth + role).
- **Styling:** one palette (violet `brand-300…600` on `zinc-950`), two fonts (Inter body, Geist Mono accents), one card/table/button language across every route.
- **Robustness:** skeletons/empty/error states on every data route, `try/catch` + toasts on every mutation, accessible tables (`caption`, `scope`), labeled steppers, `aria-current` nav, skip link, reduced-motion support.
