import Image from "next/image";
import Link from "next/link";
import { Price, Product } from "@invertase/firestore-stripe-payments";
import { useCart } from "../lib/CartContext";
import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { PriceTag, QtyStepper } from "./ui/ShopBits";

const ProductCard = ({ id, name, description, images, prices }: Product) => {
  const { addToCart } = useCart();
  // Per-price quantities — the old shared `quantity` state leaked across prices.
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const qtyFor = (priceId: string) => quantities[priceId] ?? 1;

  return (
    <Card className="overflow-hidden p-0">
      {images && images[0] && (
        <Image
          src={images[0]}
          alt={name ?? "Product image"}
          width={400}
          height={300}
          className="aspect-[4/3] w-full object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
          unoptimized // Firebase tools 14.x ignores remotePatterns on Next 15.5 — optimizer 400s live
        />
      )}
      <div className="flex grow flex-col gap-3 p-6">
        <Link
          href={`/store/${id}`}
          className="font-bold text-xl text-zinc-100 underline-offset-4 hover:text-white hover:underline"
        >
          {name}
        </Link>
        <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
        <div className="mt-auto flex flex-col gap-4 pt-2">
          {prices
            ?.filter((price) => price.active)
            .map((price: Price) => (
              <div key={price.id} className="flex flex-col items-start gap-2">
                <PriceTag
                  unitAmount={price.unit_amount}
                  currency={price.currency}
                  interval={price.interval}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <QtyStepper
                    id={`quantity-${id}-${price.id}`}
                    value={qtyFor(price.id)}
                    onChange={(next) => setQuantities((prev) => ({ ...prev, [price.id]: next }))}
                  />
                  <Button size="sm" onClick={() => addToCart(price.id, qtyFor(price.id))}>
                    <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
