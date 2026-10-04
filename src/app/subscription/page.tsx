"use client";

import { getCatalog, subscriptionProducts } from "@/lib/catalog";
import SubscriptionCard from "../../components/SubscriptionCard";
import type { Product } from "@invertase/firestore-stripe-payments";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { useUser } from "@/lib/UserContext";
import { Button } from "../../components/ui/Button";
import { Pill } from "../../components/ui/Pill";
import { TestModeCallout } from "../../components/ui/TestModeCallout";
import { CardSkeletonGrid, EmptyState, Skeleton } from "../../components/ui/ShopBits";

const SubscriptionPageInner = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("year");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { role } = useUser();
  const searchParams = useSearchParams();
  const checkoutSuccess = searchParams.get("success") === "true";
  const checkoutCanceled = searchParams.get("canceled") === "true";
  const successPlan = searchParams.get("plan");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Client-side role filter (not a `!= null` Firestore query) avoids
        // the composite-index requirement (see firestore.indexes.json).
        setProducts(subscriptionProducts(await getCatalog()));
      } catch (error) {
        console.error("Failed to fetch subscription products:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <TestModeCallout />
      <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-brand-400">
        Recurring payments
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-50 md:text-4xl">
        Subscriptions
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-zinc-400">
        Plans unlock role-gated demo content. Paid with Stripe test mode.
      </p>
      {checkoutSuccess && (
        <div
          className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4"
          role="status"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" aria-hidden="true" />
          <div>
            <p className="font-semibold text-emerald-200">
              Subscription active{successPlan ? ` — welcome to ${successPlan}` : ""}!
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Your gated content is unlocked. Manage everything in{" "}
              <Button href="/profile" variant="ghost" size="sm" className="px-1">
                your profile
              </Button>
              .
            </p>
          </div>
        </div>
      )}
      {checkoutCanceled && !checkoutSuccess && (
        <div
          className="mt-6 flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
          role="status"
        >
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-zinc-400" aria-hidden="true" />
          <div>
            <p className="font-semibold text-zinc-200">Checkout canceled</p>
            <p className="mt-1 text-sm text-zinc-400">
              Nothing was charged. Pick a plan whenever you’re ready.
            </p>
          </div>
        </div>
      )}
      <div
        className="mt-8 inline-flex rounded-full bg-white/5 p-1 ring-1 ring-white/10"
        role="group"
        aria-label="Billing interval"
      >
        {(["year", "month"] as const).map((interval) => (
          <button
            key={interval}
            onClick={() => setBillingInterval(interval)}
            aria-pressed={billingInterval === interval}
            className={cn(
              "cursor-pointer rounded-full px-5 py-2 text-sm font-medium transition-colors",
              billingInterval === interval
                ? "bg-gradient-to-r from-brand-500 to-fuchsia-600 text-white shadow-lg shadow-brand-500/25"
                : "text-zinc-400 hover:text-zinc-100",
            )}
          >
            {interval === "year" ? "Yearly" : "Monthly"}
          </button>
        ))}
      </div>
      <div className="mt-4 h-6">
        {billingInterval === "year" && (
          <p className="font-mono text-sm text-brand-300">Save 2 months with yearly billing!</p>
        )}
      </div>
      <div className="mt-6">
        {loading ? (
          <CardSkeletonGrid count={3} />
        ) : error ? (
          <EmptyState title="Could not load plans" lede="Check your connection and try again." />
        ) : products.length === 0 ? (
          <EmptyState title="No plans yet" lede="Check back soon — plans are managed via Stripe." />
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const planRole =
                typeof product.metadata?.firebaseRole === "string"
                  ? product.metadata.firebaseRole
                  : null;
              const isCurrent = planRole != null && planRole === role;
              return (
                <div key={product.id} className="relative">
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
                      <Pill>Current plan</Pill>
                    </div>
                  )}
                  <SubscriptionCard
                    product={product}
                    billingInterval={billingInterval}
                    planName={planRole ?? undefined}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const SubscriptionPage = () => (
  // useSearchParams requires a Suspense boundary (static prerender).
  <Suspense
    fallback={
      <div className="mx-auto w-full max-w-6xl px-4 py-12" role="status" aria-label="Loading plans">
        <Skeleton className="h-64" />
      </div>
    }
  >
    <SubscriptionPageInner />
  </Suspense>
);

export default SubscriptionPage;
