import Image from 'next/image';
import { Price, Product } from "@invertase/firestore-stripe-payments";
import { createCheckout } from "@/lib/createCheckout";
import { useState } from "react";

const SubscriptionCard = ({ product, billingInterval }: { product: Product, billingInterval: "month" | "year" }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [clickedPriceId, setClickedPriceId] = useState<string | null>(null);

  const handleCheckout = async (priceId: string) => {
    setIsLoading(true);
    setClickedPriceId(priceId);
    await createCheckout(priceId);
    // No need to reset isLoading here as the page will redirect
  };

  const yearlyPrice = product.prices?.find(price => price.interval === "year");
  const monthlyPrice = product.prices?.find(price => price.interval === "month");

  return (
    <div className="max-w-sm rounded-lg overflow-hidden shadow-lg bg-neutral-900 hover:bg-neutral-700 py-4">
      {product.images && product.images[0] && <Image src={product.images[0]} alt={product.name!} width={300} height={200} className="w-full h-48 object-cover" />}
      <div className="px-6 py-4">
        <div className="text-center font-bold text-xl mb-2">{product.name}</div>
        <p className="text-gray-400 text-base mb-2 py-4">
          {product.description}
        </p>
      </div>
      <div className="px-6 py-4">
        {billingInterval === "year" && yearlyPrice && (
          <div className="text-center">
            <p className="text-white text-lg font-bold">€ {yearlyPrice.unit_amount! / 100} / year</p>
            <button
              onClick={() => handleCheckout(yearlyPrice.id)}
              className="bg-white hover:bg-neutral-300 text-black font-bold py-2 px-4 rounded mt-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading && clickedPriceId === yearlyPrice.id ? "Please wait..." : "Buy Now"}
            </button>
          </div>
        )}
        {billingInterval === "month" && monthlyPrice && (
          <div className="text-center">
            <p className="text-white text-lg font-bold">${monthlyPrice.unit_amount! / 100} / month</p>
            <button
              onClick={() => handleCheckout(monthlyPrice.id)}
              className="bg-white hover:bg-neutral-300 text-black font-bold py-2 px-4 rounded mt-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading && clickedPriceId === monthlyPrice.id ? "Please wait..." : "Buy Now"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionCard;