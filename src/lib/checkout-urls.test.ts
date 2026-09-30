import { describe, expect, it } from "vitest";
import { buildCheckoutUrls } from "./createCheckout";

const ORIGIN = "https://bachidev-webstore.web.app";

describe("buildCheckoutUrls", () => {
  it("defaults to the profile return and origin cancel", () => {
    expect(buildCheckoutUrls(ORIGIN)).toEqual({
      success_url: `${ORIGIN}/profile`,
      cancel_url: ORIGIN,
    });
  });

  it("honors contextual success/cancel URLs (cart + subscription flows)", () => {
    expect(
      buildCheckoutUrls(ORIGIN, {
        successUrl: `${ORIGIN}/cart?success=true`,
        cancelUrl: `${ORIGIN}/cart?canceled=true`,
      }),
    ).toEqual({
      success_url: `${ORIGIN}/cart?success=true`,
      cancel_url: `${ORIGIN}/cart?canceled=true`,
    });
    expect(
      buildCheckoutUrls(ORIGIN, {
        successUrl: `${ORIGIN}/subscription?success=true&plan=Pro`,
        cancelUrl: `${ORIGIN}/subscription?canceled=true`,
      }),
    ).toEqual({
      success_url: `${ORIGIN}/subscription?success=true&plan=Pro`,
      cancel_url: `${ORIGIN}/subscription?canceled=true`,
    });
  });

  it("allows partial overrides", () => {
    expect(buildCheckoutUrls(ORIGIN, { successUrl: `${ORIGIN}/thanks` })).toEqual({
      success_url: `${ORIGIN}/thanks`,
      cancel_url: ORIGIN,
    });
  });
});
