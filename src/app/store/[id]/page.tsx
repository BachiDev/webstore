"use client";

import { getCatalog, oneTimeProducts } from "@/lib/catalog";
import { Product } from "@invertase/firestore-stripe-payments";
import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/CartContext";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import { PriceTag, QtyStepper, Skeleton } from "@/components/ui/ShopBits";
import { formatPrice } from "@/lib/format";
import ProductCard from "@/components/ProductCard";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const oneTime = oneTimeProducts(await getCatalog());
        const found = oneTime.find((p) => p.id === id) ?? null;
        setProduct(found);
        setRelated(oneTime.filter((p) => p.id !== id).slice(0, 3));
        const firstActive = found?.prices?.find((price) => price.active) ?? null;
        setSelectedPriceId(firstActive?.id ?? null);
        if (!found) setMissing(true);
      } catch (error) {
        console.error("Failed to fetch product:", error);
        setMissing(true);
      }
    };
    fetchProduct();
  }, [id]);

  if (missing) {
    notFound();
  }

  if (!product) {
    return (
      <div
        className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-16"
        role="status"
        aria-label="Loading product"
      >
        <Skeleton className="h-6 w-32" />
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <Skeleton className="aspect-[4/3]" />
          <div className="flex flex-col gap-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-24" />
            <Skeleton className="h-12 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  const activePrices = (product.prices ?? []).filter((price) => price.active);
  const selectedPrice = activePrices.find((price) => price.id === selectedPriceId) ?? null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <Link
        href="/store"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 underline-offset-4 hover:text-zinc-100 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to store
      </Link>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name ?? "Product image"}
              width={800}
              height={600}
              className="aspect-[4/3] w-full rounded-xl border border-white/10 object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              unoptimized // Firebase tools 14.x ignores remotePatterns on Next 15.5
            />
          ) : (
            <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl border border-dashed border-white/15 text-sm text-zinc-400">
              No image
            </div>
          )}
          {product.images && product.images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {product.images.slice(1, 4).map((src) => (
                <Image
                  key={src}
                  src={src}
                  alt=""
                  width={120}
                  height={90}
                  className="h-20 w-28 rounded-lg border border-white/10 object-cover"
                  sizes="112px"
                  unoptimized // Firebase tools 14.x ignores remotePatterns on Next 15.5
                />
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <Pill>One-time payment</Pill>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50 md:text-4xl">
            {product.name}
          </h1>
          <p className="leading-relaxed text-zinc-400">{product.description}</p>
          {activePrices.length > 1 && (
            <fieldset>
              <legend className="mb-2 font-mono text-xs uppercase tracking-wider text-zinc-400">
                Choose a price
              </legend>
              <div className="flex flex-wrap gap-2">
                {activePrices.map((price) => (
                  <button
                    key={price.id}
                    type="button"
                    onClick={() => setSelectedPriceId(price.id)}
                    aria-pressed={selectedPriceId === price.id}
                    className={cn(
                      "cursor-pointer rounded-full px-4 py-2 font-mono text-sm ring-1 transition-colors",
                      selectedPriceId === price.id
                        ? "bg-brand-500/15 text-brand-300 ring-brand-500/50"
                        : "bg-white/5 text-zinc-300 ring-white/10 hover:ring-white/25",
                    )}
                  >
                    {formatPrice(price.unit_amount, price.currency)}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          <div className="flex items-center gap-3">
            {selectedPrice ? (
              <PriceTag
                unitAmount={selectedPrice.unit_amount}
                currency={selectedPrice.currency}
                className="text-base"
              />
            ) : (
              <p className="text-sm text-zinc-400">No active price.</p>
            )}
          </div>
          {selectedPrice && (
            <div className="flex flex-wrap items-center gap-3">
              <QtyStepper
                id={`quantity-detail-${product.id}`}
                value={quantity}
                onChange={setQuantity}
              />
              <Button onClick={() => addToCart(selectedPrice.id, quantity)}>
                <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                Add to Cart
              </Button>
            </div>
          )}
          <p className="font-mono text-xs text-zinc-400">
            Test mode — pay with card {`4242 4242 4242 4242`}, no real charges.
          </p>
        </div>
      </div>
      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="mt-20">
          <h2 id="related-heading" className="text-2xl font-bold tracking-tight text-zinc-50">
            Related products
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ProductCard key={item.id} {...item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
