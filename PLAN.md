# Webstore Overhaul Plan — bachi.dev portfolio edition

> Goal: take this old Firebase + Stripe demo shop from "functional template" to a polished, credible portfolio piece that looks like it belongs to [bachi.dev](https://bachi.dev) and demonstrates senior-level full-stack craft: coherent dark brand, solid auth/cart/checkout UX, secure Firestore rules, and clean, maintainable Next.js 15 code.

Owner: Fabian Bachmayer (fabian@bachi.dev, bachi.dev). Live demo: https://bachidev-webstore.web.app/ (project `bachidev-webstore`).
For portfolio-site context (design system source of truth): `C:\Users\Fabian\dev\bachidev-github-io\PLAN.md`.

Stack today: Next.js 15.5 + React 19 + TypeScript + Tailwind CSS v4 + Firebase 11 (Auth, Firestore, Functions, Hosting via webframeworks) + Stripe via `@invertase/firestore-stripe-payments` + FirebaseUI v7-alpha. No tests, no design tokens, no data layer abstraction.

---

## 1. Current-state audit (what's good / what's holding it back)

### What's already working — keep it

- Real end-to-end slice: anonymous + email auth → Firestore products → cart → Stripe Checkout (one-time + subscriptions) → customer portal → role-gated content (`starter/pro/premium`). That's the portfolio story; don't regress it.
- File-system routing is sensible: `/`, `/store`, `/subscription`, `/cart`, `/auth`, `/profile`, `/content/{starter,pro,premium}`.
- Context separation (`UserContext`, `CartContext`) is the right instinct; `createCheckout.ts` isolates Stripe session creation.
- Firebase Hosting webframeworks deploy + emulator config + GitHub workflows exist and roughly work.
- README documents architecture honestly (auth, Stripe, contexts) — good base to update, not rewrite.

### Coherence & visual design issues (biggest lever)

1. **No design system; actively broken base.** `globals.css` sets `body { color:#fff; background:#fff }` (white-on-white) and `font-family: var(--font-geist-mono)` (never loaded). Every page then fights the base with one-off `text-black` / `bg-neutral-900` / `bg-gray-900` / `bg-black` overrides. Nav CSS var (`#1c1c1c`) duplicates `bg-gray-900` in `Navbar.tsx`.
2. **Ad-hoc dark grays, no brand.** Cards `bg-neutral-900`, footer/FAB black, nav `bg-gray-900`, inputs `bg-neutral-800`, toggle off `bg-neutral-400`, badge `bg-red-500`. Zero violet/fuchsia accent, zero relation to bachi.dev (`zinc-950` base, `brand-300…600` violet ramp, `white/10` borders).
3. **Typography is mono-or-nothing.** bachi.dev uses Inter (sans body/headings) + Geist Mono (kickers/pills/stats only). Webstore loads no font and falls back to system mono everywhere.
4. **No shared primitives.** `ProductCard`, `SubscriptionCard`, `PaymentsTable`, `PaymentNotice`, auth screens each hand-roll cards/buttons/badges/tables. `Button` doesn't exist; `Navbar` uses `!block` / `!important` hacks; `p-24` hero padding; `€` hardcoded.
5. **Storefront looks like a demo, not a shop.** No hero, no category/featured story, no product detail, thumbnails via Stripe CDN with inconsistent `unoptimized` usage. Red `PaymentNotice` test-card banner on 3 pages screams "tutorial".
6. **Mobile nav is bare.** Toggle with no `aria-expanded`/`aria-label`, no Escape close, no auto-close discipline, `ProfileButton` overflows small screens.

### Content & IA issues

7. **Landing (`/`) is three cards + conditional links.** No value prop ("what does this demo prove?"), no tech-stack strip, no links to source/live Stripe test flow, no guest entry CTA.
8. **No product discovery.** No search, filter, sort, product detail route (`/store/[id]`), stock/related/reviews. Subscription page sorts by yearly price only.
9. **Checkout UX has holes.** No order-review step, no shipping/tax note, `success_url → /profile` (no thank-you state), `cancel → /` (loses cart context), `Total too high >999999` guard with no explainer, `Clear Cart` with no confirm.
10. **Empty/loading states are blank.** Cart empty = one line, no CTA. Store/subscription fetch = blank grid while loading, silent `console.error` on failure. Profile payments table renders nothing when empty. Content pages render raw `<ul><li>`.
11. **Footer is one line.** Copyright + external imprint link only. No source link, no "built with" note, no back-to-top, no demo-disclaimer.

### Code health / tech debt

12. **Everything is `'use client'`.** Every page + Navbar/Providers/contexts/HOCs are client components. Zero RSC, no `loading.tsx` / `error.tsx` / `not-found.tsx`. Products are uncrawlable, SEO is root-only (`title: "Webstore Demo"`, typo `subsription`).
13. **Auth HOCs flicker + trap.** `withAuth`/`withGuest` do client redirects with `Loading...` text. `withGuest` redirects anonymous users too, so `/auth` is unreachable after auto-login; `auth/page.tsx` runs a second `onAuthStateChanged` that pushes _any_ user (incl. guest) to `/profile`.
14. **Cart persistence races.** `localStorage.cartItems` parsed without try/catch; mount effect loads async while save effect on `[cartItems]` can overwrite stored cart with `[]` on slow devices. Badge shows line count, not quantity sum. `ProductCard` shares one `quantity` state across all prices in the card. `getCartTotal()` is an unused `=> 0` stub.
15. **Firebase init is fragile.** `firebase.ts` hardcodes `firebaseConfig` (committed) and calls `initializeApp` without HMR guard; `initializeUI({app})` with no `authConfig`; `getStripePayments` at module top-level.
16. **Stripe path is on a dead library.** `@invertase/firestore-stripe-payments@^0.0.8` is archived (Stripe extension deprecated). No `try/catch` around `getProducts`/checkout; `SubscriptionCard` never resets `isLoading` on failure; portal callable hardcodes `europe-west3`.
17. **Dead code + committed build output.** `src/lib/products.ts` mock (`sand/cloak/hand…`, images not in `public/`) is unused. `functions/src/index.ts` is an empty template. `functions/lib/index.js(.map)` build output is committed. `FloatingActionButton` duplicates the footer GitHub link with a relative `./github.svg` that breaks on nested routes.
18. **Scripts & config gaps.** No `typecheck` / `format` / `test` scripts; `lint` runs bare `eslint` (no path); root `tsconfig` globs `functions/` + `.next` into root `tsc`; `next.config.ts` has `remotePatterns` but `SubscriptionCard` image omits `unoptimized` (optimizer hit on Stripe CDN); `functions/` pins Node 22 + eslint 8 vs root Node-types 20 + eslint 9.
19. **Deps risk.** `@firebase-ui/*` pinned via `https://github.com/.../v7-alpha/...tgz` tarballs — alpha, breaks reproducibility. `firebase-admin` + `firebase-functions` in **root** `package.json` are unused (belong in `functions/` only). Missing: `lucide-react`, `zod`, test runner, `next-sitemap`-equivalent.
20. **A11y/SEO gaps.** Icon buttons lack labels; tables lack `<th scope>`/captions; duplicate `id=quantity-{product.id}` on multi-price cards; `gray-400 on neutral-900` marginal contrast; toasts only on cart add/remove (checkout/auth errors are `console.*` only); no OG/Twitter cards, `robots`/`sitemap`, JSON-LD, `sizes`/`priority` on images.

### Security — read first, fix first

21. **`firestore.rules` is CRITICAL and currently broken-deny.** Rule is `allow read, write: if request.time < timestamp.date(2025, 8, 11)` — expired 2026-09-30, so **all client reads/writes are now denied** (store, subscriptions, payments, content all throw). Before expiry it was world read/write. Must be replaced with per-collection least-privilege rules (see §6.2).
22. **Committed config.** `firebase.ts` hardcodes `apiKey/authDomain/projectId/…`. The `apiKey` is public by design but belongs in `NEXT_PUBLIC_*` env, not in git.
23. **Auth footguns.** Auto-`signInAnonymously` on every visit mints billable anon users; `logged_out` flag in `localStorage` is trivially cleared → re-login loop. Email sign-up does not `linkWithCredential` → anon cart/subs orphaned, new UID loses Stripe `customer` mapping. No email verification, no App Check, no rate limiting.
24. **Client-only gating.** `useContent` fetches `content-*` regardless of role; `subscription/page.tsx` route is unguarded (only the nav link hides); all enforcement depends on the (broken) rules above.

---

## 2. Vision & principles for the overhaul

**Positioning (one line):** _A bachi.dev-styled demo storefront proving I can ship auth → products → cart → Stripe payments/subscriptions → gated content on Firebase, with clean, secure, accessible code._

**Design principles (ported from bachi.dev PLAN §2):**

1. **One brand, everywhere:** single violet ramp (`brand-300…600`), single neutral scale (`zinc-*`), 2 fonts max (Inter + Geist Mono). Webstore must be instantly recognizable as "Fabian's project".
2. **Proof over claims:** landing states the demo flow + test card + links to source, store, subscriptions, and Stripe test mode. Every "feature" links to the route or file proving it.
3. **Calm + fast:** restrained motion, `prefers-reduced-motion` respected, Lighthouse 90+ on all axes, skeletons instead of blank grids.
4. **Server-first where possible:** static shell + metadata as RSC; client islands only for auth/cart/checkout interactivity.
5. **Maintainable:** content/config in `src/data/`, typed lib (`products`, `checkout`, `cart`), linted/formatted, no secrets in git.

**Success metrics (define done):**

- Lighthouse ≥ 90 Performance/Accessibility/Best Practices, 100 SEO (mobile + desktop) on `/` and `/store`.
- Demo conversion: guest can go landing → store → cart → Stripe test checkout with zero console errors and a visible test-card hint (env-gated, not a red banner).
- Zero `console.log`, zero hardcoded config, zero ESLint/TS errors, `npm run build` clean, Firestore rules deployed and verified (owner read/write matrix passes).
- Visual review: side-by-side with bachi.dev, same dark bg, same buttons/cards/pills, same font pairing.

---

## 3. Information architecture (proposed)

Keep route set (deep links + Stripe extension collections depend on it), strengthen order and add discovery:

```
1. Navbar (sticky, active-link highlight, cart badge = quantity sum)
2. / (landing: hero + demo-flow steps + featured products + stack strip + CTA)
3. /store (search + sort + product grid + skeletons/empty state)
4. /store/[id] (NEW — product detail: gallery, price select, qty, related)
5. /subscription (yearly/monthly toggle + plan comparison + current-plan hint)
6. /cart (review step + qty steppers + order summary + thank-you state via ?success)
7. /auth (sign-in/sign-up/guest with honest anon explanation, no redirect trap)
8. /profile (identity + payments + subscriptions + portal + sign-out, real empty states)
9. /content/{starter,pro,premium} (uniform gated layout, upgrade upsell when denied)
10. Footer (brand + demo note + source + sitemap + back-to-top)
```

**Navigation:** Store · Subscriptions · Pricing? (fold into Subscriptions) · role links (when entitled) · Cart · Profile/Login. Mobile menu with proper a11y (mirrors bachi.dev Header requirements).

---

## 4. Design system (port from bachi.dev — make it coherent)

Source of truth: `bachidev-github-io/src/app/globals.css` + `PLAN.md §4`. Do not invent a second palette.

### 4.1 Tokens (Tailwind v4 `@theme` in `webstore/src/app/globals.css`)

- **Colors:**
  - Background: `zinc-950` (`#09090b`) base, `zinc-900` raised surfaces. Delete `#ffffff` body bg, `#1c1c1c` nav var, `gray-900`/`neutral-900` one-offs.
  - Text: `zinc-100` headings / `zinc-300–400` body (≥ 4.5:1; bump small text to `zinc-300`).
  - Accent: violet primary (`brand-400 #a78bfa` / `brand-500 #8b5cf6` / `brand-600 #7c3aed`, fuchsia secondary for gradients only `from-brand-500 to-fuchsia-500`). Migrate badge `red-500` → keep red only for destructive/cart-alert semantics; glow shadows to `brand-500/25`.
  - Borders: `white/10`; success/error states for forms (emerald/red).
- **Typography:**
  - Display/body: `Inter` (variable, `latin` subset via `next/font/google`). Headings tight tracking (`-0.02em`), body `leading-relaxed`.
  - Mono accent only: `Geist_Mono` for kickers, price pills, cart badge, table metadata, `SectionHeading` kicker.
- **Shape & elevation:** `rounded-xl` cards, `rounded-full` pills/buttons; single card style: `border-white/10 bg-white/[0.02]` + hover `border-brand-500/40 + shadow brand`.
- **Spacing rhythm:** sections `py-20 md:py-28`, container `max-w-6xl`, section intro pattern: kicker (mono, uppercase, violet) → H2 (`text-3xl md:text-4xl`) → lede (`text-lg text-zinc-400 max-w-2xl`).
- **Backgrounds:** subtle `bg-grid-pattern` or gradient hairline dividers (copy utility from bachi.dev `globals.css`), not full-bleed color flips.

### 4.2 Shared primitives to build (replace ad-hoc)

Port these from bachi.dev (copy, don't re-derive):

- `Section` (`id`, `eyebrow`, `title`, `lede`, `children`, `tone: 'base'|'raised'`) — kills per-page heading drift.
- `Button` v2 — variants `primary | secondary | ghost`, sizes `sm | md | lg`, `loading/disabled`, renders `<a>` for external, `<Link>` for internal. Replaces hand-rolled white pills in `Navbar`/`ProfileButton`/`LoginButton`.
- `Card`, `Pill/Badge`, `PriceTag`, `QtyStepper`, `EmptyState`, `Skeleton` (card/table), `DataTable` (accessible `<th scope>`, caption).
- `Reveal` (IntersectionObserver fade-up, disabled with `prefers-reduced-motion`).
- `SiteHeader`/`Navbar` refresh + `SiteFooter` (brand + demo note + source + sitemap + back-to-top) — replaces one-line footer + FAB (delete FAB; source link belongs in footer, per bachi.dev Phase 3 decision).
- `SocialLinks`-equivalent is not needed (shop, not personal site) — but reuse the icon discipline: add `lucide-react`, delete inline SVG soup (`Navbar` cart/menu icons → `ShoppingCart/Menu/X/User/LogIn`).

### 4.3 Motion & feedback

- No particles here (that's bachi.dev hero FX). Shop motion = micro-interactions only: button hover, card lift, cart badge pop, `Reveal` on landing sections.
- Toasts: `react-hot-toast` stays, but extend to checkout/portal/auth errors (`toast.error`) instead of `console.error`-only. Keep `<Toaster>` styling dark (`zinc-900`, `white/10` border).

---

## 5. Section-by-section plan

### 5.1 Global shell (`layout.tsx`, `Providers.tsx`, `Navbar.tsx`, `Footer.tsx`)

- `layout.tsx` → full metadata (title template `"%s · Webstore Demo"`, description ~150 chars, `metadataBase: https://bachidev-webstore.web.app`, OG/Twitter with `/og-cover.png`, `theme-color`), `Inter` + `Geist_Mono` via `next/font`, `lang="en"`, skip link, `theme-color`. Keep `Providers` but slim it (auth+cart+toaster only; header/footer rendered in layout, not inside a client provider).
- `Navbar`: sticky with scroll-state border/backdrop, active-link highlight, `aria-expanded`/`aria-label`/Escape close, cart badge = **quantity sum** (fix `cartItems.length`), loading skeleton instead of `Loading...` text, Lucide icons, brand-monogram logo or keep `logo.png` audited (no favicon reuse). Fix `ProfileButton` overflow on small screens.
- `Footer`: 3 columns (brand + demo-stack blurb | sitemap | demo note + source + imprint-link) + bottom row (`© year` dynamic + `Back to top ↑` + "Test mode — no real charges"). Delete `FloatingActionButton.tsx` (fix relative `./github.svg` bug by removal).
- Delete `nav { background: … }` global; all nav styling via Tailwind classes.

### 5.2 Landing (`app/page.tsx`)

- De-client: make it a Server Component composing server-safe sections; only interactive islands (`FeaturedProducts`, cart buttons) are client.
- Hero: kicker `● Demo store · Test mode` (mono, emerald dot) → H1 "Webstore Demo" + subhead "Next.js + Firebase + Stripe: auth, cart, checkout, subscriptions, gated content — all test mode." Dual CTA: `Browse products` (→ `/store`) primary + `See subscriptions` (→ `/subscription`) secondary; tertiary `View source on GitHub`.
- Demo-flow strip (4 steps: Sign in → Add to cart → Test checkout `4242…` → Manage in portal) — replaces red `PaymentNotice` with designed test-mode callout.
- Featured products (3, server-fetched or static fallback if Firestore unreachable) + `See all →`.
- Stack strip (pills: Next.js 15, Firebase Auth/Firestore/Functions/Hosting, Stripe test, Tailwind v4, TypeScript) sourced from `src/data/site.ts`.
- Fix `p-24` → shared `Section` rhythm.

### 5.3 Store (`app/store/page.tsx`, `ProductCard.tsx` NEW `store/[id]/page.tsx`)

- States: skeleton grid while loading, error card with retry, empty result with reset-filters CTA. Never a blank grid.
- Add search (name/description), sort (price asc/desc, name), and price-type filter (one-time only lives here; subscriptions stay on `/subscription`).
- `ProductCard` rebuild on shared `Card` + `Button` v2: Stripe image with `sizes`, uniform aspect ratio (kills CLS), price pills (mono), **per-price quantity** (fix shared `quantity` state bug), `addToCart(price.id, qty)` with `toast.success`, honest "Test mode" microcopy.
- NEW `store/[id]`: gallery, full description, price selector, qty stepper, add-to-cart, related products, back link. Static params where feasible; `not-found.tsx` for unknown ids.
- `PaymentNotice` red banner → replace with shared `TestModeCallout` (amber/zinc info card, env-gated via `NEXT_PUBLIC_DEMO_BANNER=true`, shows test card `4242 4242 4242 4242` + expiry/CVC hint).

### 5.4 Subscriptions (`app/subscription/page.tsx`, `SubscriptionCard.tsx`)

- Keep yearly/monthly toggle; add plan comparison affordance (role hierarchy Starter → Pro → Premium via `useRole`), current-plan hint ("You're on Pro — Premium unlocks X"), and auth CTA when signed out (route stays viewable; checkout requires auth).
- `SubscriptionCard` on shared primitives: per-button loading with reset on failure (`finally { setIsLoading(false) }` + `toast.error`), price display via `PriceTag`, `unoptimized` consistency for Stripe CDN images, success/cancel URLs with context (`?plan=pro&billing=yearly` → thank-you copy; cancel back to `/subscription`, not `/`).
- Sort deterministically (role rank, then monthly price).

### 5.5 Cart (`app/cart/page.tsx`, `CartContext.tsx`)

- Fix persistence: try/catch `JSON.parse`, schema-validate entries, load-then-subscribe (don't clobber stored cart with initial `[]`), sum-quantity badge, `updateQuantity` clamps ≥ 1, `Clear Cart` with confirm, real `getCartTotal(products)` replacing the `=> 0` stub.
- Page: review table (`DataTable`: image, name, unit price, stepper, line total, remove) + order summary card (subtotal, "test mode — no shipping/tax", total) + checkout button with loading/error states + `?success=true` thank-you panel (clears cart once) and `?canceled` info panel. Empty state with `Browse products →` CTA.
- `createCartCheckout`: validate non-empty, `mode: 'payment'`, `success_url` → `/cart?success=true`, `cancel_url` → `/cart?canceled=true`, `toast.error` on failure (no silent `window.location.assign` on undefined).

### 5.6 Auth (`app/auth/page.tsx`, `UserContext.tsx`, `withAuth/withGuest`)

- Fix redirect trap: `withGuest` must allow explicit `/auth` when user is **anonymous** (only redirect permanent users); remove duplicate `onAuthStateChanged` in `auth/page.tsx`; single source of truth in `UserContext`.
- Reconsider auto-anonymous: default to **opt-in guest** ("Continue as guest" button) instead of silent `signInAnonymously` on every visit — fewer orphaned/billable anon users, clearer demo. If auto-anon stays, document why + set `logged_out` semantics explicitly.
- Link anon → permanent on sign-up (`linkWithCredential` where possible) so cart/subs survive; add email verification nudge + password-reset link (FirebaseUI default is fine, but surface it); replace `https://` tarball FirebaseUI with a pinned npm version or a hand-rolled email form if v7-alpha proves unstable.
- Loading: skeleton/suspense, not `Loading...` text. Errors: `toast.error` with human copy.

### 5.7 Profile (`app/profile/page.tsx`, `PaymentsTable.tsx`, `SubscriptionsTable.tsx`)

- Identity card (avatar, email/Guest, UID mono, role `Pill`, verification state) + actions (portal, sign-out with confirm + toast).
- Tables → shared `DataTable` with captions, `<th scope>`, date/currency formatting (`Intl.NumberFormat`, no hardcoded `€` assumption — locale `de-AT` default, currency from Stripe `currency`), real empty states ("No payments yet — browse the store").
- Portal: loading state + `toast.error` on callable failure; don't hardcode region in component (centralize in `src/lib/env.ts`).
- `withAuth` keeps permanent + anonymous both allowed here (portal needs a UID either way); logged-out → `/auth?next=/profile`.

### 5.8 Gated content (`app/content/*/page.tsx`, `useContent.ts`, `useRole.ts`)

- Uniform `GatedPage` layout: title, role requirement `Pill`, content list (typography, not raw `<li>`), upgrade upsell (`You're Starter — Pro unlocks Y → /subscription`) when denied, skeleton while loading.
- `useContent`: don't fetch when role check already fails; surface `error` + `denied` distinctly; rely on **server-enforced rules** (§6.2), not client `if`.
- `useRole`: derive from `subscriptions[0].role` today — document the single-role assumption; handle multi-subscription (highest rank wins) instead of first-row wins.

### 5.9 Global concerns across pages

- `loading.tsx` / `error.tsx` (per-segment where useful) + root `not-found.tsx`. No more blank screens.
- Images: centralize `unoptimized` policy (Firebase Hosting webframeworks supports optimizer — verify; else set `unoptimized: true` explicitly with a comment), add `sizes`, `priority` only on landing hero-adjacent image, fix Gravatar fallback.
- Currency: `Intl.NumberFormat` helper in `src/lib/format.ts`; default `de-AT/EUR`, respect Stripe price `currency`.
- `TestModeCallout` env-gated; never a red full-width banner in production-looking UI.

---

## 6. Technical plan

### 6.1 App structure (target)

```
src/
  app/
    layout.tsx            # metadata, fonts, JSON-LD, skip link
    page.tsx              # Server Component landing
    globals.css           # Tailwind v4 @theme tokens (ported from bachi.dev)
    robots.ts sitemap.ts manifest.ts
    loading.tsx error.tsx not-found.tsx
    store/page.tsx  store/[id]/page.tsx
    subscription/page.tsx cart/page.tsx auth/page.tsx profile/page.tsx
    content/{starter,pro,premium}/page.tsx
    components/
      layout/  (SiteHeader/Navbar, SiteFooter, Section, Container)
      ui/      (Button, Card, Pill, PriceTag, QtyStepper, EmptyState, Skeleton, DataTable, TestModeCallout, Reveal)
      store/   (ProductCard, SubscriptionCard, FeaturedProducts)
      forms/   (AuthForm tentative)
  data/
    site.ts  nav.ts  plans.ts  demo.ts   # copy deck + links + test-card hint
  lib/
    cn.ts  env.ts  format.ts  firebase.ts  products.ts  checkout.ts
    cart/ (CartContext + storage helpers + validation)
    auth/ (UserContext + role helpers)
```

### 6.2 Key refactors (ordered — §6.2.1 is ship-blocking)

**1. Unbreak Firestore (do first, deploys independently).**
Current `firestore.rules` denies everything (expired `timestamp.date(2025, 8, 11)`). Replace with least-privilege:

- `products`, `prices`: public `read` (needed for storefront), no client `write`.
- `customers/{uid}` + subcollections (`checkout_sessions`, `subscriptions`, `payments` — per Stripe extension schema): `read/write` only when `request.auth.uid == uid`.
- `content-starter|content-pro|content-premium`: `read` gated on subscription role — enforce via custom claims or a `customers/{uid}/subscriptions` join check; until that exists, deny client reads and serve content via a callable/endpoint, or gate honestly at "signed-in" level and document the gap. Never ship open `/{document=**}` again.
- Add `firestore.indexes.json` entries for the `metadata.firebaseRole != null`-style queries (or rewrite queries to avoid `!=`).
- Verify with emulator (`firebase emulators:start`) + a read/write matrix (anon / signed-in / owner / stranger × each collection) before deploying rules.

**2. Env + config hygiene.**
`.env.example` with `NEXT_PUBLIC_FIREBASE_{API_KEY,AUTH_DOMAIN,PROJECT_ID,STORAGE_BUCKET,MESSAGING_SENDER_ID,APP_ID}` + `NEXT_PUBLIC_DEMO_BANNER=` + `NEXT_PUBLIC_STRIPE_PORTAL_REGION=`; `src/lib/env.ts` guard with graceful degradation; move `firebaseConfig` out of git; HMR-safe `getApp()` init; document emulator vs prod in README.

**3. De-client pages.** Remove `'use client'` from `page.tsx`/`store`/`subscription` shells; push client boundaries to islands (`ProductGrid`, `SubscriptionToggle`, `CartTable`, `AuthScreens`, `Navbar`, `Providers`). Add `loading/error/not-found`.

**4. Fonts + Tailwind theme.** `next/font/google` — `Inter` sans + `Geist_Mono` accent; `body { font-family: sans }` on `zinc-950`; port `@theme` brand ramp + `bg-grid-pattern` + `skip-link` + `focus-visible` + reduced-motion rules from bachi.dev `globals.css` verbatim; delete `--foreground-rgb`/`--navbar-background` hacks and `nav {}` global.

**5. Primitives + Lucide.** Add `lucide-react`; build `Button/Card/Pill/DataTable/...` on bachi.dev patterns; migrate `Navbar/Footer/ProductCard/SubscriptionCard/Tables/Callout`; delete `FloatingActionButton`, dead `products.ts` mock, committed `functions/lib/`, unused inline SVGs, `!`-overrides.

**6. Cart + checkout correctness.** Storage validation, no-clobber load, quantity-sum badge, per-price qty, real totals, confirm-on-clear, thank-you/cancel states, `try/catch` + toasts everywhere, `isLoading` always reset.

**7. Auth correctness.** Guest-vs-permanent redirect logic, anon-linking, verification/reset surfacing, skeleton states, FirebaseUI pinned or replaced.

**8. Scripts + deps.** `dev / build / start / typecheck / lint / format / format:check`; replace `--turbopack` in `build` if it causes Hosting drift (keep in `dev`); remove root `firebase-admin`/`firebase-functions` (functions dir owns them); align Node types (20 vs 22 — pick 22 + document); pin or replace `@firebase-ui` tarballs; plan Stripe-extension exit (extension is deprecated — evaluate direct `stripe` + Checkout Sessions via callable in Phase 4).

**9. Cleanup `public/`.** Audit `logo.png` (keep or redraw as SVG monogram to match bachi.dev `fb-logo` discipline), keep `favicon.ico`, delete `github.svg` after Lucide migration, add `og-cover.png` (generate like bachi.dev `scripts/generate-og-cover.mjs`), product fallbacks.

### 6.3 SEO

- `layout.tsx` metadata: title template, ~155-char description ("Demo store: Next.js + Firebase + Stripe test payments…"), `metadataBase: https://bachidev-webstore.web.app`, canonical `/`, OG + Twitter cards with `/og-cover.png`, `robots`.
- `robots.ts` + `sitemap.ts` (all static routes; exclude `/profile`, `/cart` internals where sensible), `manifest.ts`.
- JSON-LD: `WebSite` + `ItemList` (store) — keep honest ("DemoSite", test mode).
- Semantic HTML: one `h1` per page, `h2` per section, descriptive `alt`, link text never "click here".

### 6.4 Accessibility (acceptance: axe clean, keyboard-only pass)

- Skip link, visible `:focus-visible` rings (violet), contrast pass (body `zinc-300`+), top-aligned form labels, `aria-live="polite"` on cart/auth/checkout feedback, menu `aria-expanded`/`aria-controls` + Escape, tables with captions/scopes, `prefers-reduced-motion` disables `Reveal`.

### 6.5 Performance budget

- Target: LCP < 2.5 s on Moto G4 / 4G, no CLS (explicit image aspects), ≤ 200 kB first-load JS on `/` (match bachi.dev's 158 kB discipline).
- Levers: server components for shells, dynamic-import FirebaseUI/Stripe helpers, subset fonts, `loading="lazy"` below fold, skeletons (perceived perf), verify Hosting image optimization before relying on it.

### 6.6 Quality gates

- ESLint (next + `jsx-a11y`), Prettier, `tsc --noEmit` in CI before `next build`. Add workflow step for root `lint+typecheck` (today only `build` runs).
- Manual smoke matrix in PR template: anon browse → signup → cart → test checkout → portal → role content; rules matrix; Lighthouse + axe checklist.
- Later: Vitest (cart storage, format, role rank) + Playwright (checkout happy path vs emulator). Not Phase 0.

---

## 7. Content plan (voice & copy)

- **Voice:** direct, senior, honest-demo. "Test mode — no real charges" everywhere money appears. Outcomes > buzzwords. EN only.
- **Copy deck:** draft landing/store/subscription/empty-state/FAQ copy in `src/data/*.ts` (or `COPY.md` during review) so text review doesn't require JSX edits.
- **Proof checklist:** every "I built X" on the bachi.dev `/work` webstore entry must link here or to a file here (rules, checkout lib, gated content). Remove unprovable adjectives.
- **Legal/demo honesty:** keep imprint link; add one-line demo note in footer ("Demo only — test card `4242…`, no real payments, anon accounts deletable on request to fabian@bachi.dev").
- **Assets to produce:** 1 OG cover, logo audit (PNG vs new SVG monogram), Stripe product images audit (CDN vs self-hosted fallbacks).

---

## 8. Phased roadmap (solo-friendly, each phase shippable)

### Phase 0 — Unbreak + foundations (done 2026-09-30)

- [x] Rewrote `firestore.rules` (least-privilege: public product/price read, owner-only customers subcollections, signed-in content read, default deny) + documented `firestore.indexes.json` (no composite index — subscription catalog filters client-side instead of `!=` query); emulator matrix + live re-verify still to run at deploy time.
- [x] Env: `firebaseConfig` moved to `NEXT_PUBLIC_*` via `src/lib/env.ts` (fallbacks keep existing deploys working) + `.env.example`; portal region centralized; `PaymentNotice` env-gated (`NEXT_PUBLIC_DEMO_BANNER=false` hides it).
- [x] Scripts: `typecheck / lint (. explicit) / lint:fix / format / format:check` + Prettier (+ `.prettierrc` mirrored from bachi.dev); `build` dropped `--turbopack`; root `tsconfig` excludes `functions/` + `.next`; `functions/lib/` build output removed (already gitignored).
- [x] Safety: HMR-safe Firebase init; cart `JSON.parse` try/catch + entry validation + hydrated-flag no-clobber load; `createCheckout` validates session URL + non-empty cart; `SubscriptionCard` `try/catch` with loading reset + toast; profile `console.log` removed + portal/logout toasts; store/subscription fetches wrapped in `try/catch`; `UserContext` role fetch failure degrades to `null`.
- [x] Definition of done: `typecheck + lint + build` green (Next 15.5, 12 static routes).

### Phase 1 — Design system port + coherence (done 2026-09-30)

- [x] Ported bachi.dev tokens verbatim: `@theme` brand ramp (`brand-300…600`), Inter + Geist Mono, `zinc-950` body, `focus-visible`, `skip-link`, `bg-grid-pattern`, reduced-motion rules. Deleted white-body/mono-body/nav globals.
- [x] Built primitives: `cn()` + `ui/Button` (primary/secondary/ghost/danger + sm/md/lg, external/download handling) + `ui/Card` + `ui/Pill` + `ui/Section` + `ui/Reveal` + `ui/DataTable` (caption, `scope="col"`) + `ui/ShopBits` (`PriceTag`, `QtyStepper`, `EmptyState`, `Skeleton`/`CardSkeletonGrid`) + `ui/TestModeCallout` (amber, env-gated). Plus `lib/format.ts` (`Intl` price/date) and `data/site.ts` (nav, links, test card).
- [x] `Navbar` (sticky, backdrop-blur, active-link `aria-current`, quantity-**sum** badge, loading skeleton, Lucide `Menu/X/ShoppingCart`, Escape close, `aria-expanded/controls`) + `Footer` (brand + demo note | sitemap | source + back-to-top, dynamic year) + deleted `FloatingActionButton` (+ orphaned `public/github.svg`); dark `Toaster` styling; `main#main` content landmark.
- [x] Migrated `ProductCard` (per-price qty state — shared-qty bug fixed, unique `quantity-{productId}-{priceId}` ids, `PriceTag` instead of hardcoded `€`, uniform 4/3 aspect) / `SubscriptionCard` (single active-price path, `PriceTag`, consistent `unoptimized`) / tables (`DataTable` + `Pill` + `Intl` formatting) / `PaymentNotice` → `TestModeCallout` (file deleted, imports updated).
- [x] Page-level dark pass: home (hero + dual CTA + cards on `Card`), store/subscription (kicker → H1 → lede + skeleton/error/empty states), cart (review cards + summary + confirm-on-clear + Stripe-cap explainer), profile (identity card + empty states), auth (dark card, pill toggle, guest explainer, `console.log` removed), content x3 (plan `Pill`, denied upsell, skeletons). Deleted dead `lib/products.ts` mock.
- [x] Fonts/metadata base (`layout.tsx`: Inter + Geist Mono vars, title template, `metadataBase`, keywords/robots/OG/Twitter, `theme-color`, JSON-LD `WebSite`, noscript reveal fix). `lucide-react` added.
- [x] Definition of done: `typecheck + lint + build` green (12 static routes). Note: first `next build` after dropping `--turbopack` failed on stale `.next` turbopack runtime — cleared `.next`, rebuild green. Visual side-by-side vs bachi.dev still to run in browser.

### Phase 2 — Shop UX that earns "portfolio" status (done 2026-09-30)

- [x] Landing rewritten as RSC shell (`app/page.tsx` server: hero + 4-step demo flow + featured + stack + explore cards, copy from `data/site.ts`) with two client islands (`HomeIslands.tsx`: `HomeGuestNote`, `FeaturedProducts` with skeletons). Old `'use client'` home with conditional cards removed.
- [x] Store: search (name/description) + sort (featured/name/price asc/desc) + result count + clear-search empty state. NEW `store/[id]` detail (dynamic, gallery, price-selector pills, qty + add-to-cart, test-mode hint, related products, `notFound()` on unknown ids); `ProductCard` names link to detail pages.
- [x] Cart: `?success=true` thank-you panel (clears cart once) + `?canceled=true` panel (cart kept) via `useSearchParams` + Suspense; checkout now returns to `/cart?…` instead of dropping context at `/`/`/profile`. Subscription checkout returns to `/subscription?success&plan=…` with plan-named success panel + cancel panel.
- [x] Subscriptions: "Current plan" pill via role match, plan name threaded into the success URL.
- [x] Auth: redirect-trap fixed — `withGuest` only redirects permanent (email) accounts; anonymous guests stay on `/auth` to upgrade. `initializeUI` now uses `autoUpgradeAnonymousUsers()` so sign-up links (not replaces) the anon account — cart/subs survive. Auth page only auto-pushes email users; added password-reset view (`PasswordResetScreen` + back link). HOC loading states are skeletons.
- [x] Profile: email-verification nudge with resend (`sendEmailVerification` + toasts) for unverified email accounts.
- [x] Roles: `lib/roles.ts` rank map + `pickHighestRole` — multi-subscription customers resolve to the highest plan instead of first-row-wins. Dead `getCartTotal() => 0` stub removed from `CartContext`.
- [x] `loading.tsx` / `error.tsx` (retry + home) / `not-found.tsx` (store/home CTAs) + per-route metadata layouts (store incl. `[id]`, subscription, cart, auth, profile, content).
- [x] Definition of done: `typecheck + lint + build` green (13 routes; `/store/[id]` dynamic, rest static). Manual demo-flow + emulator rules-matrix verification still to run at deploy time.

### Phase 3 — SEO / a11y / perf hardening (done 2026-09-30)

- [x] Full metadata (title templates per route via metadata layouts, description, keywords, `metadataBase`) + OG/Twitter cards with generated `og-cover.png` (1200×630, `scripts/generate-og-cover.mjs` ported from bachi.dev) + JSON-LD `WebSite` + `robots.ts`/`sitemap.ts` (public routes only; profile/content excluded, `[id]` runtime-driven)/`manifest.ts` (512px logo + favicon). Verified in build output: `robots.txt`/`sitemap.xml`/`manifest.webmanifest` emitted, absolute `og:image` + `theme-color` + manifest + JSON-LD + skip link present in served HTML.
- [x] A11y: last `zinc-500`-on-dark small text bumped to `zinc-400` (4.5:1); live regions already in place (`role="status"` banners/counts, `aria-live` toasts, `aria-pressed` toggles, captioned/scoped tables, labeled steppers, `aria-current` nav, skip link, focus rings, reduced-motion). Still to run in a real browser: axe + keyboard-only walkthrough (PR template checklist).
- [x] Perf: `sizes` on all content images (cards/detail/cart), `priority` only on detail hero, lazy-by-default elsewhere; FirebaseUI deliberately NOT dynamic-imported — it only loads on the `/auth` route (route-level splitting already isolates it). First Load JS ~241–265 kB/route (shared 102 kB; Firebase/Stripe SDKs dominate — direct-SDK migration in Phase 4 is the real lever).
- [x] CI: `typecheck + lint` steps added to both Hosting workflows (merge + PR preview); `.github/pull_request_template.md` with smoke-matrix + Lighthouse/a11y + demo-honesty checklist.
- [x] README rewritten (demo flow, test card, scripts, env, emulator + rules matrix, deploy, architecture, structure, deep dive).
- [x] Still to run post-deploy (needs live backend/browser): Lighthouse on `/` + `/store` (target ≥90/90/90/100), OG debugger, emulator rules-matrix + end-to-end demo flow.

### Passwordless auth follow-up (done 2026-10-01, supersedes Phase 2 FirebaseUI bits)

- [x] Removed FirebaseUI entirely (`@firebase-ui/*` deps, `initializeUI`/`ConfigProvider`, style import — white-box screens gone). Custom dark `/auth`: Google button (inline G mark) + magic-link email form (validated, `aria-describedby` errors, sending/sent states) + guest CTA. No passwords, no sign-in/sign-up split.
- [x] `src/lib/auth.ts`: `sendMagicLink` / `completeMagicLink` / `signInWithGoogle` with anonymous linking (`linkWithCredential`/`linkWithPopup`, fallback to plain sign-in on already-in-use) + `friendlyAuthError` copy. NEW `/auth/finish` completes the link (stored email, or asks when opened on another device; expired/used links get a fresh-link CTA).
- [x] Removed unused root `firebase-admin`/`firebase-functions` deps (only `functions/` needs them).
- [x] Requires Firebase console setup (documented in README): enable Google provider + Email-link toggle, confirm authorized domains. Old decision §9 #3 resolved as **replace**, not pin.

### Test slice (done 2026-10-01, from code review)

- [x] Vitest 3 + `@firebase/rules-unit-testing` v4 (both pinned for firebase 11 / node-20-compat); `vitest.config.ts` (node env, `@` alias). Unit suite `npm test` (24 tests incl. Avatar fallbacks, runs in CI): roles, format, auth-error copy, cart validation, checkout URLs, avatar resolution. Rules suite `npm run test:rules` (9 tests vs emulator, local/pre-deploy only — not CI). Testability refactors: exported `isValidCartItem`, pure `buildCheckoutUrls(origin, opts)`. `tests/` added to tsconfig so suites typecheck.

### Deploy fix (2026-10-01) — Next.js CVE gate

### Deploy saga (done 2026-10-01 — pipeline green, site live)

- [x] Hosting deploy refused Next 15.5.0 (`CVE-2025-66478`). Upgraded `next` + `eslint-config-next` to 15.5.27. Added `.github/dependabot.yml` (react grouped, firebase major ignored).
- [x] firebase-tools 15.x webframeworks build broke on the repo's hoisted esbuild 0.28.2 (vitest dep). Pinned root `esbuild@0.19.12` (vite keeps nested 0.28.2), then pinned `firebaseToolsVersion: 14.27.0` (last known-good family).
- [x] Project-setup gaps (all owner-side, all resolved): deploy SA got Firebase Extensions Viewer + Cloud Functions Admin + Cloud Run Admin + Service Account User; enabled run/eventarc/artifactregistry/cloudbuild/billing APIs; Blaze confirmed. Last failure was only the Artifact Registry cleanup-policy prompt — fixed with `force: true` on the deploy action (also caps image-storage cost creep).
- [x] Dependabot follow-up fixes: react + react-dom aligned at 19.3.0 (split bumps fail the build); `react` group added so the pair moves together; firebase semver-major ignored (v12 breaks archived peers — deliberate Phase 4 task); preview deploys skipped for `dependabot[bot]` (no secret access, CI signal suffices).

### Phase 4 — Launch & iterate (ongoing)

- [ ] Deploy → verify live (all routes, form/checkout end-to-end, 404-free, OG debugger, Search Console if desired).
- [ ] Update root README (run, env, emulator, deploy, rules matrix, Stripe test card, architecture diagram in words).
- [ ] Update bachi.dev `/work` webstore entry (outcome line + links now point at restyled routes).
- [ ] Evaluate Stripe-extension exit: replace archived `@invertase` lib + deprecated extension with direct `stripe` SDK + checkout-via-callable (needs `functions/` revival + webhook). Stretch — not part of initial overhaul.
- [ ] Consider Vitest + Playwright coverage for cart/auth/checkout-on-emulator.
- [ ] Quarterly: dependency sweep (Next/Firebase/Tailwind), rules review, Stripe test-mode re-verify, copyright year (make dynamic).

**Estimated total:** 4–7 focused days solo. Phase 0 alone restores the demo; Phase 1 alone delivers ~70% of the perceived level-up.

---

## 9. Risks & decisions needed

| #   | Decision                                             | Recommendation                                                                                  | Owner |
| --- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----- |
| 1   | Firestore rules: open vs least-privilege?            | Least-privilege per §6.2.1 (ship-blocking; current rules deny everything)                       | You   |
| 2   | Anonymous auth: silent auto-login vs explicit guest? | Explicit "Continue as guest" (fewer orphaned users, clearer demo); keep auto only if documented | You   |
| 3   | FirebaseUI v7-alpha tarballs: pin vs replace?        | Try pinning to npm first; fall back to hand-rolled email form if alpha keeps breaking `npm ci`  | You   |
| 4   | Stripe extension (deprecated) vs direct SDK?         | Keep extension for this overhaul; plan direct-SDK migration as Phase 4 stretch                  | You   |
| 5   | `store/[id]` detail route: build now or later?       | Build in Phase 2 (cheap, high portfolio value)                                                  | You   |
| 6   | Test-card banner: keep red vs designed callout?      | Designed env-gated `TestModeCallout` (red banner reads as error)                                | You   |
| 7   | Logo: keep `logo.png` vs new SVG monogram?           | Audit PNG; prefer crisp SVG to match bachi.dev icon discipline                                  | You   |
| 8   | Hosting image optimization: rely vs `unoptimized`?   | Verify on Hosting first; document the choice in `next.config.ts`                                | You   |

---

## 10. Acceptance criteria (ship gate)

- [ ] Firestore least-privilege rules deployed; read/write matrix (anon/signed-in/owner/stranger) passes; no `/{document=**}` allow.
- [ ] One palette (violet ramp), two fonts (Inter + Geist Mono), one section pattern across all routes (visual review mobile + desktop vs bachi.dev).
- [ ] Landing states demo value + test-mode + 2 CTAs + source link; no dead-end, no `p-24` hero.
- [ ] Store shows search/sort + skeletons + error/empty states; product detail route works; cart badge = quantity sum.
- [ ] Cart → Stripe test checkout → thank-you → portal → gated content works end-to-end with test card; loading/success/error + toasts everywhere.
- [ ] Auth: no redirect trap, explicit guest path, anon-linking documented, verification/reset surfaced.
- [ ] SEO: OG card renders, sitemap/robots live, JSON-LD valid, single H1 per page, descriptive alts.
- [ ] A11y: keyboard-only flow works, focus visible, contrast pass, reduced-motion respected, axe clean.
- [ ] Perf: Lighthouse ≥90/90/90/100 on `/` + `/store`, no CLS, no blank grids.
- [ ] Legal/demo honesty: demo note present, imprint link kept, test-mode microcopy at every payment step.
- [ ] Repo: no secrets or build output in git, no dead assets/mock, `typecheck+lint+build` green, README updated (run, env, emulator, deploy, rules).

---

## 11. Immediate next actions (if you say "go")

1. Phase 0 rules + env + scripts PR (restores the live demo; deploys independently).
2. Phase 1 design-system PR (tokens + primitives + Navbar/Footer + card/table migration + Lucide).
3. Draft copy deck for landing/store/subscriptions/empty-states in `src/data/` for your review before Phase 2 styling polish.
4. Phase 2 + 3, then launch + README + bachi.dev `/work` entry refresh.

_Suggested commit flow: one PR per phase above; Phase 0 deployable to Hosting independently._

---

### Appendix — files to touch (quick index)

- Keep & refactor: `src/app/{layout,page,globals}.css`, `store/page.tsx`, `subscription/page.tsx`, `cart/page.tsx`, `auth/page.tsx`, `profile/page.tsx`, `content/*/page.tsx`, `components/{Navbar,Footer,ProductCard,SubscriptionCard,PaymentsTable,SubscriptionsTable,PaymentNotice}.tsx`, `lib/{firebase,UserContext,CartContext,createCheckout,useRole,useContent}.ts(x)`, `next.config.ts`, `package.json`, `.github/workflows/firebase-hosting-*.yml`, `firestore.rules`, `firestore.indexes.json`, `public/` (prune + add OG cover).
- Rework or remove: `FloatingActionButton.tsx` (delete), `PaymentNotice.tsx` (→ `TestModeCallout`), `products.ts` mock (delete), `providers` bloat (slim), inline SVGs (→ Lucide), `!`-overrides, `p-24`, hardcoded `€`, red banner, `./github.svg` relative path, committed `functions/lib/`, root `firebase-admin`/`firebase-functions` deps.
- Add: `src/data/*`, `src/app/{robots,sitemap,manifest,loading,error,not-found}.ts(x)`, `src/app/store/[id]/page.tsx`, `components/{layout,ui,store}/*`, `src/lib/{cn,env,format}.ts`, `.env.example`, `og-cover.png`, PR template with smoke/Lighthouse/a11y checklist.
- Do NOT carry over: bachi.dev particles FX (shop needs calm micro-interactions, not hero particles), light-mode defaults, second palette, mono-body typography, open Firestore rules.

(End of file)
