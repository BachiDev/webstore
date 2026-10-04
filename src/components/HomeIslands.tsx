"use client";

import Link from "next/link";
import type { Product } from "@invertase/firestore-stripe-payments";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { getCatalog, oneTimeProducts } from "@/lib/catalog";
import { useUser } from "@/lib/UserContext";
import { Button } from "./ui/Button";
import { CardSkeletonGrid } from "./ui/ShopBits";
import ProductCard from "./ProductCard";

/** Anonymous-account nudge (client island — needs auth state). */
export function HomeGuestNote() {
  const { user, loading } = useUser();
  if (loading || !user || user.email) return null;
  return (
    <p className="text-sm text-zinc-400" role="note">
      Signed in as Guest —{" "}
      <Link href="/auth" className="text-brand-300 underline-offset-4 hover:underline">
        connect an account
      </Link>{" "}
      to keep purchases across sessions/devices.
    </p>
  );
}

/** Featured products teaser (client island — Firestore client fetch). */
export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setProducts(oneTimeProducts(await getCatalog()).slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch featured products:", error);
        setProducts([]);
      }
    };
    fetchFeatured();
  }, []);

  if (products === null) {
    return <CardSkeletonGrid count={3} />;
  }
  if (products.length === 0) {
    return null;
  }
  return (
    <div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
      <div className="mt-8 text-center">
        <Button href="/store" variant="secondary">
          See all products
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
