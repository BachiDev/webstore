import { describe, expect, it } from "vitest";
import type { User } from "firebase/auth";
import { avatarInitial, resolveAvatarUrl } from "./Avatar";

const user = (overrides: Partial<User> = {}): User =>
  ({
    photoURL: null,
    displayName: null,
    email: null,
    providerData: [],
    ...overrides,
  }) as User;

describe("resolveAvatarUrl", () => {
  it("returns null without a user", () => {
    expect(resolveAvatarUrl(null)).toBeNull();
    expect(resolveAvatarUrl(undefined)).toBeNull();
  });

  it("prefers the top-level photoURL", () => {
    expect(
      resolveAvatarUrl(
        user({
          photoURL: "https://example.com/me.png",
          providerData: [
            { photoURL: "https://example.com/other.png" } as User["providerData"][number],
          ],
        }),
      ),
    ).toBe("https://example.com/me.png");
  });

  it("falls back to linked provider photos (stale top-level URL)", () => {
    expect(
      resolveAvatarUrl(
        user({
          providerData: [
            {
              providerId: "google.com",
              photoURL: "https://lh3.googleusercontent.com/a/pic",
            } as User["providerData"][number],
          ],
        }),
      ),
    ).toBe("https://lh3.googleusercontent.com/a/pic");
  });

  it("returns null when no photo exists anywhere (initial disc takes over)", () => {
    expect(resolveAvatarUrl(user())).toBeNull();
  });
});

describe("avatarInitial", () => {
  it("prefers display name, then email, then Guest", () => {
    expect(avatarInitial(user({ displayName: "Ada", email: "a@x.com" }))).toBe("A");
    expect(avatarInitial(user({ email: "bob@x.com" }))).toBe("B");
    expect(avatarInitial(user())).toBe("G");
    expect(avatarInitial(null)).toBe("G");
  });
});
