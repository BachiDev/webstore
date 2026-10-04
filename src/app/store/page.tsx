"use client";

import { getCatalog, oneTimeProducts } from "@/lib/catalog";
import ProductCard from "../../components/ProductCard";
import type { Product } from "@invertase/firestore-stripe-payments";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { CardSkeletonGrid, EmptyState } from "../../components/ui/ShopBits";

type SortKey = "featured" | "name" | "price-asc" | "price-desc";

const lowestPrice = (product: Product): number => {
  const amounts = (product.prices ?? [])
    .filter((price) => price.active && price.unit_amount != null)
    .map((price) => price.unit_amount as number);
  return amounts.length > 0 ? Math.min(...amounts) : Number.POSITIVE_INFINITY;
};

const StorePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProducts(oneTimeProducts(await getCatalog()));
      } catch (error) {
        console.error("Failed to fetch store products:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? products.filter(
          (p) => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q),
        )
      : [...products];
    switch (sort) {
      case "name":
        return filtered.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
      case "price-asc":
        return filtered.sort((a, b) => lowestPrice(a) - lowestPrice(b));
      case "price-desc":
        return filtered.sort((a, b) => lowestPrice(b) - lowestPrice(a));
      default:
        return filtered;
    }
  }, [products, query, sort]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-brand-400">
        One-time payments
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-50 md:text-4xl">Store</h1>
      <p className="mt-3 max-w-2xl text-lg text-zinc-400">
        Demo products with secure Stripe test checkout — no real charges.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative grow">
          <span className="sr-only">Search products</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-full border border-white/10 bg-white/[0.03] py-2 pl-10 pr-4 text-sm text-zinc-100 placeholder:text-zinc-400 focus:border-brand-500/50 focus:outline-none"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-400">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="cursor-pointer rounded-full border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-zinc-100 focus:border-brand-500/50 focus:outline-none"
          >
            <option value="featured">Featured</option>
            <option value="name">Name A–Z</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </label>
      </div>
      <div className="mt-10">
        {loading ? (
          <CardSkeletonGrid />
        ) : error ? (
          <EmptyState title="Could not load products" lede="Check your connection and try again." />
        ) : products.length === 0 ? (
          <EmptyState
            title="No products yet"
            lede="Check back soon — the catalog is managed via Stripe."
          />
        ) : visible.length === 0 ? (
          <EmptyState
            title="No matches"
            lede={`Nothing matches “${query.trim()}”. Try a different search.`}
            action={
              <Button variant="secondary" onClick={() => setQuery("")}>
                Clear search
              </Button>
            }
          />
        ) : (
          <>
            <p className="mb-4 font-mono text-xs text-zinc-400" role="status">
              {visible.length} of {products.length} products
            </p>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StorePage;
