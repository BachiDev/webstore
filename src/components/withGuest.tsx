"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "../lib/UserContext";
import type { ComponentType, FC } from "react";
import { Skeleton } from "./ui/ShopBits";

/**
 * Guest-only gate: permanent accounts (email) are sent to /profile, but
 * anonymous guests may stay — /auth is where they upgrade to a full account
 * (sign-in links the anon account instead of replacing it).
 */
const withGuest = <P extends object>(WrappedComponent: ComponentType<P>): FC<P> => {
  const WithGuestComponent: FC<P> = (props) => {
    const { user, loading } = useUser();
    const router = useRouter();
    const isPermanent = !!user?.email;

    useEffect(() => {
      if (!loading && isPermanent) {
        router.push("/profile");
      }
    }, [isPermanent, loading, router]);

    if (loading) {
      return (
        <div className="mx-auto w-full max-w-md px-4 py-12" role="status" aria-label="Loading">
          <Skeleton className="h-64" />
        </div>
      );
    }

    if (isPermanent) {
      return null; // Redirecting to /profile via the effect above.
    }

    return <WrappedComponent {...props} />;
  };

  WithGuestComponent.displayName = `withGuest(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;

  return WithGuestComponent;
};

export default withGuest;
