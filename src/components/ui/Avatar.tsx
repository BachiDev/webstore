import Image from "next/image";
import { useState } from "react";
import type { User } from "firebase/auth";
import { cn } from "@/lib/cn";

/** Best-effort photo URL: top-level profile first, then linked providers. */
export function resolveAvatarUrl(user: User | null | undefined): string | null {
  if (!user) return null;
  if (user.photoURL) return user.photoURL;
  const providerPhoto = user.providerData.find((profile) => profile.photoURL)?.photoURL;
  return providerPhoto ?? null;
}

/** Initial for the fallback disc: display name → email → Guest. */
export function avatarInitial(user: User | null | undefined): string {
  const source = user?.displayName?.trim() || user?.email?.trim() || "Guest";
  return source.charAt(0).toUpperCase();
}

/**
 * Account avatar with graceful degradation:
 * photoURL → provider photo → initial disc. Google's image CDN can refuse
 * requests depending on referrer handling, so we send no referrer and fall
 * back to initials on any load error instead of a broken image.
 */
export function Avatar({
  user,
  size = 32,
  className,
}: {
  user: User | null | undefined;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = failed ? null : resolveAvatarUrl(user);
  const label = user?.displayName || user?.email || "Guest";

  if (!src) {
    return (
      <span
        role="img"
        aria-label={`${label} (no profile picture)`}
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-fuchsia-600 font-bold text-white",
          className,
        )}
        style={{ width: size, height: size, fontSize: Math.max(10, size * 0.42) }}
      >
        {avatarInitial(user)}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={`${label} profile picture`}
      width={size}
      height={size}
      sizes={`${size}px`}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={cn("shrink-0 rounded-full object-cover", className)}
      unoptimized
    />
  );
}
