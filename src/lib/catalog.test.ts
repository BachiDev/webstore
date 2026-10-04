import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Product } from "@invertase/firestore-stripe-payments";
import { clearCatalogCache, getCatalog, oneTimeProducts, subscriptionProducts } from "./catalog";

const { mockGetProducts } = vi.hoisted(() => ({ mockGetProducts: vi.fn() }));

vi.mock("@invertase/firestore-stripe-payments", () => ({
  getProducts: mockGetProducts,
  // Used by ./firebase at import time; stubbed, never called here.
  getStripePayments: vi.fn(() => ({})),
}));

const product = (overrides: Partial<Product> = {}): Product =>
  ({
    id: "prod_1",
    name: "Demo",
    metadata: {},
    prices: [],
    ...overrides,
  }) as Product;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(0);
  clearCatalogCache();
  mockGetProducts.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("getCatalog", () => {
  it("fetches once and serves repeat callers from cache", async () => {
    const products = [product()];
    mockGetProducts.mockResolvedValue(products);

    const first = await getCatalog();
    const second = await getCatalog();

    expect(first).toBe(products);
    expect(second).toBe(products);
    expect(mockGetProducts).toHaveBeenCalledTimes(1);
    expect(mockGetProducts).toHaveBeenCalledWith(expect.anything(), {
      includePrices: true,
      activeOnly: true,
    });
  });

  it("dedupes concurrent callers onto one request", async () => {
    mockGetProducts.mockResolvedValue([product()]);
    const [a, b] = await Promise.all([getCatalog(), getCatalog()]);
    expect(a).toBe(b);
    expect(mockGetProducts).toHaveBeenCalledTimes(1);
  });

  it("refetches after the TTL expires", async () => {
    mockGetProducts.mockResolvedValue([product()]);
    await getCatalog();
    vi.setSystemTime(60_001);
    await getCatalog();
    expect(mockGetProducts).toHaveBeenCalledTimes(2);
  });

  it("retries after a failure instead of caching the error", async () => {
    mockGetProducts.mockRejectedValueOnce(new Error("offline"));
    await expect(getCatalog()).rejects.toThrow("offline");
    mockGetProducts.mockResolvedValue([product()]);
    await expect(getCatalog()).resolves.toHaveLength(1);
    expect(mockGetProducts).toHaveBeenCalledTimes(2);
  });
});

describe("catalog filters", () => {
  it("splits one-time and subscription products", () => {
    const oneTime = product({ id: "once" });
    const sub = product({ id: "sub", metadata: { firebaseRole: "Pro" } });
    expect(oneTimeProducts([oneTime, sub])).toEqual([oneTime]);
    expect(subscriptionProducts([oneTime, sub])).toEqual([sub]);
  });

  it("sorts subscriptions by yearly price", () => {
    type Price = NonNullable<Product["prices"]>[number];
    const price = (amount: number, interval: string): Price =>
      ({ id: `${interval}-${amount}`, interval, unit_amount: amount, active: true }) as Price;
    const expensive = product({
      id: "exp",
      metadata: { firebaseRole: "Premium" },
      prices: [price(12000, "year")],
    });
    const cheap = product({
      id: "cheap",
      metadata: { firebaseRole: "Starter" },
      prices: [price(6000, "year")],
    });
    expect(subscriptionProducts([expensive, cheap]).map((p) => p.id)).toEqual(["cheap", "exp"]);
  });
});
