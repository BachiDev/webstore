import { describe, expect, it } from "vitest";
import { isValidCartItem } from "./CartContext";

describe("isValidCartItem", () => {
  it("accepts well-formed items", () => {
    expect(isValidCartItem({ priceId: "price_1", quantity: 2 })).toBe(true);
  });

  it("rejects corrupt storage payloads instead of crashing hydration", () => {
    expect(isValidCartItem(null)).toBe(false);
    expect(isValidCartItem(undefined)).toBe(false);
    expect(isValidCartItem("price_1")).toBe(false);
    expect(isValidCartItem([])).toBe(false);
    expect(isValidCartItem({})).toBe(false);
    expect(isValidCartItem({ priceId: 42, quantity: 1 })).toBe(false);
    expect(isValidCartItem({ priceId: "price_1", quantity: "2" })).toBe(false);
    expect(isValidCartItem({ priceId: "price_1", quantity: 0 })).toBe(false);
    expect(isValidCartItem({ priceId: "price_1", quantity: -1 })).toBe(false);
    expect(isValidCartItem({ priceId: "price_1", quantity: NaN })).toBe(false);
    expect(isValidCartItem({ priceId: "price_1", quantity: 1.5 })).toBe(true);
  });
});
