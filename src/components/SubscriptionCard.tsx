import Image from "next/image";
import { Price, Product } from "@invertase/firestore-stripe-payments";
import { createCheckout } from "@/lib/createCheckout";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { PriceTag } from "./ui/ShopBits";

const SubscriptionCard = ({
  product,
  billingInterval,
  planName,
}: {
  product: Product;
  billingInterval: "month" | "year";
  /** Used for the contextual Stripe return URL (?plan=…). */
  planName?: string;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [clickedPriceId, setClickedPriceId] = useState<string | null>(null);

  const handleCheckout = async (priceId: string) => {
    setIsLoading(true);
    setClickedPriceId(priceId);
    try {
      const origin = window.location.origin;
      const planParam = planName ? `&plan=${encodeURIComponent(planName)}` : "";
      await createCheckout(priceId, {
        successUrl: `${origin}/subscription?success=true${planParam}`,
        cancelUrl: `${origin}/subscription?canceled=true`,
      });
      // On success the page redirects to Stripe; loading state intentionally kept.
    } catch (error) {
      console.error("Checkout failed:", error);
      toast.error("Checkout failed. Please try again.");
      setIsLoading(false);
      setClickedPriceId(null);
    }
  };

  const yearlyPrice = product.prices?.find((price) => price.interval === "year");
  const monthlyPrice = product.prices?.find((price) => price.interval === "month");
  const activePrice: Price | undefined = billingInterval === "year" ? yearlyPrice : monthlyPrice;

  return (
    <Card className="overflow-hidden p-0">
      {product.images && product.images[0] && (
        <Image
          src={product.images[0]}
          alt={product.name ?? "Subscription plan image"}
          width={400}
          height={300}
          className="aspect-[4/3] w-full object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized // Firebase tools 14.x ignores remotePatterns on Next 15.5 — optimizer 400s live
        />
      )}
      <div className="flex grow flex-col items-center gap-3 p-6 text-center">
        <div className="font-bold text-xl text-zinc-100">{product.name}</div>
        <p className="text-sm leading-relaxed text-zinc-400">{product.description}</p>
        {activePrice && (
          <div className="mt-auto flex flex-col items-center gap-3 pt-2">
            <PriceTag
              unitAmount={activePrice.unit_amount}
              currency={activePrice.currency}
              interval={billingInterval === "year" ? "year" : "month"}
            />
            <Button onClick={() => handleCheckout(activePrice.id)} disabled={isLoading}>
              {isLoading && clickedPriceId === activePrice.id ? "Please wait..." : "Buy Now"}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SubscriptionCard;
