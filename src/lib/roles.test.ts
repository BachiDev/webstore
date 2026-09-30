import { describe, expect, it } from "vitest";
import { pickHighestRole, roleRank } from "./roles";

describe("roleRank", () => {
  it("ranks the plan hierarchy Starter < Pro < Premium", () => {
    expect(roleRank("Starter")).toBe(1);
    expect(roleRank("Pro")).toBe(2);
    expect(roleRank("Premium")).toBe(3);
  });

  it("ranks missing and unknown roles as 0", () => {
    expect(roleRank(null)).toBe(0);
    expect(roleRank(undefined)).toBe(0);
    expect(roleRank("Enterprise")).toBe(0);
    expect(roleRank("")).toBe(0);
  });
});

describe("pickHighestRole", () => {
  it("returns null for no subscriptions", () => {
    expect(pickHighestRole([])).toBeNull();
    expect(pickHighestRole([null, undefined])).toBeNull();
  });

  it("returns a single role", () => {
    expect(pickHighestRole(["Pro"])).toBe("Pro");
  });

  it("picks the highest rank regardless of order", () => {
    expect(pickHighestRole(["Starter", "Premium", "Pro"])).toBe("Premium");
    expect(pickHighestRole(["Premium", "Starter"])).toBe("Premium");
    expect(pickHighestRole(["Pro", "Starter"])).toBe("Pro");
  });

  it("ignores unknown roles unless nothing known exists", () => {
    expect(pickHighestRole(["Bogus", "Starter"])).toBe("Starter");
    expect(pickHighestRole(["Bogus"])).toBeNull();
  });
});
