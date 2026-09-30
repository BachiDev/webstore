import { describe, expect, it } from "vitest";
import { formatDate, formatPrice } from "./format";

describe("formatPrice", () => {
  it("formats minor units with an explicit locale exactly", () => {
    expect(formatPrice(199900, "eur", "en-US")).toBe("€1,999.00");
    expect(formatPrice(100, "usd", "en-US")).toBe("$1.00");
  });

  it("formats with the de-AT default locale", () => {
    const formatted = formatPrice(199900);
    expect(formatted).toContain("€");
    expect(formatted).toContain("1.999");
  });

  it("returns an em dash for missing or non-finite amounts", () => {
    expect(formatPrice(null)).toBe("—");
    expect(formatPrice(undefined)).toBe("—");
    expect(formatPrice(NaN)).toBe("—");
  });

  it("falls back to a plain amount string for malformed currencies", () => {
    // A 2-letter code is not a valid ISO currency and throws in Intl.
    expect(formatPrice(1999, "eu", "en-US")).toBe("19.99 EU");
  });
});

describe("formatDate", () => {
  it("handles Stripe seconds, JS milliseconds, and ISO strings", () => {
    expect(formatDate(0)).toContain("1970");
    expect(formatDate(0)).toBe(formatDate(0 * 1000));
    expect(formatDate("2026-09-30T00:00:00.000Z")).toContain("2026");
  });

  it("returns an em dash for missing or unparsable values", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate(undefined)).toBe("—");
    expect(formatDate("not-a-date")).toBe("—");
  });
});
