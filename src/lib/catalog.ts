// src/lib/catalog.ts — cached product catalog.
//
// Every storefront view (store, subscriptions, cart, detail, featured) needs
// the full active catalog, and each mount used to refetch it: N billed
// Firestore reads + N round-trips per session. This module caches the catalog
// in memory (60s TTL) and dedupes concurrent callers onto one request.

import { getProducts, type Product } from "@invertase/firestore-stripe-payments";
import { payments } from "./firebase";

const TTL_MS = 60_000;

let cached: { at: number; products: Product[] } | null = null;
let inflight: Promise<Product[]> | null = null;

/** Clear the cache (tests + rare manual invalidation). */
export function clearCatalogCache(): void {
  cached = null;
  inflight = null;
}

/** Active products with prices, cached for 60s, concurrent-safe. */
export async function getCatalog(): Promise<Product[]> {
  if (cached && Date.now() - cached.at < TTL_MS) {
    return cached.products;
  }
  if (!inflight) {
    inflight = getProducts(payments, { includePrices: true, activeOnly: true })
      .then((products) => {
        cached = { at: Date.now(), products };
        return products;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/** One-time catalog products (no subscription role). */
export function oneTimeProducts(products: Product[]): Product[] {
  return products.filter((product) => !product.metadata.firebaseRole);
}

/** Subscription catalog products (have a role), sorted by yearly price. */
export function subscriptionProducts(products: Product[]): Product[] {
  return products
    .filter((product) => product.metadata?.firebaseRole != null)
    .sort((a, b) => {
      const yearly = (p: Product) =>
        p.prices?.find((price) => price.interval === "year")?.unit_amount || 0;
      return yearly(a) - yearly(b);
    });
}
