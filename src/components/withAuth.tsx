"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "../lib/UserContext";
import type { ComponentType, FC } from "react";
import { Skeleton } from "./ui/ShopBits";

const withAuth = <P extends object>(WrappedComponent: ComponentType<P>): FC<P> => {
  const WithAuthComponent: FC<P> = (props) => {
    const { user, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push("/auth");
      }
    }, [user, loading, router]);

    if (loading) {
      return (
        <div className="mx-auto w-full max-w-6xl px-4 py-12" role="status" aria-label="Loading">
          <Skeleton className="h-64" />
        </div>
      );
    }

    if (!user) {
      return null; // Redirecting to /auth via the effect above.
    }

    return <WrappedComponent {...props} />;
  };

  WithAuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;

  return WithAuthComponent;
};

export default withAuth;
