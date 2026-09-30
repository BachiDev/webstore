import { describe, expect, it } from "vitest";
import { friendlyAuthError } from "./auth";

const err = (code: string) => ({ code });

describe("friendlyAuthError", () => {
  it("maps known Firebase codes to human copy (never leaks the raw code)", () => {
    const cases: Array<[string, RegExp]> = [
      ["auth/invalid-email", /email/i],
      ["auth/unauthorized-continue-uri", /authorized domains/i],
      ["auth/quota-exceeded", /too many attempts/i],
      ["auth/limits-exceeded", /too many attempts/i],
      ["auth/popup-closed-by-user", /closed/i],
      ["auth/cancelled-popup-request", /closed/i],
      ["auth/popup-blocked", /popups/i],
      ["auth/expired-action-code", /expired/i],
      ["auth/invalid-action-code", /invalid or already used/i],
      ["auth/network-request-failed", /network/i],
      ["auth/user-disabled", /disabled/i],
    ];
    for (const [code, pattern] of cases) {
      const message = friendlyAuthError(err(code));
      expect(message).toMatch(pattern);
      expect(message).not.toContain(code);
    }
  });

  it("falls back to generic copy for unknown shapes", () => {
    expect(friendlyAuthError(err("auth/something-new"))).toBe(
      "Something went wrong — please try again.",
    );
    expect(friendlyAuthError(undefined)).toBe("Something went wrong — please try again.");
    expect(friendlyAuthError({})).toBe("Something went wrong — please try again.");
  });
});
