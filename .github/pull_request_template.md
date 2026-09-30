# PR checklist — attach evidence before requesting review

## Smoke matrix (against preview channel or emulator)

- [ ] Landing → store → product detail → cart → Stripe test checkout (`4242 4242 4242 4242`) → thank-you → profile receipts
- [ ] Subscription checkout → success panel names the plan → gated content unlocks → customer portal opens
- [ ] Guest upgrade: continue as guest → add to cart → sign up with email → cart + UID preserved (anon linked)
- [ ] Firestore rules matrix: anon / signed-in / owner / stranger × products, customers, content collections
- [ ] Zero console errors during the full flow

## Quality gates

- [ ] `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` green
- [ ] `npm run test:rules` green if `firestore.rules` changed
- [ ] Lighthouse on `/` + `/store` (target ≥90/90/90/100)
- [ ] Keyboard-only walkthrough: nav menu, search/sort, qty steppers, checkout buttons, auth toggle
- [ ] axe clean; `prefers-reduced-motion` respected (Reveal + smooth scroll off)
- [ ] OG preview renders (`/og-cover.png`, 1200×630)

## Demo honesty

- [ ] Test-mode microcopy present at every payment step; no real-charge language
- [ ] No secrets or build output committed (`.env.local`, `functions/lib/`)
