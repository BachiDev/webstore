"use client";

import { useCart } from "../../lib/CartContext";
import Image from "next/image";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getProducts, Product, Price } from "@invertase/firestore-stripe-payments";
import { payments } from "@/lib/firebase";
import { createCartCheckout } from "@/lib/createCheckout";
import toast from "react-hot-toast";
import { CheckCircle2, Trash2, XCircle } from "lucide-react";
import { TestModeCallout } from "../../components/ui/TestModeCallout";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState, PriceTag, QtyStepper, Skeleton } from "../../components/ui/ShopBits";
import { formatPrice } from "@/lib/format";

interface CartProduct extends Product {
  price: Price;
  quantity: number;
}

const CartPageInner = () => {
  const { cartItems, removeFromCart, clearCart, updateQuantity } = useCart();
  const searchParams = useSearchParams();
  const checkoutSuccess = searchParams.get("success") === "true";
  const checkoutCanceled = searchParams.get("canceled") === "true";
  const clearedAfterSuccess = useRef(false);
  const [cartProducts, setCartProducts] = useState<CartProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [isTotalTooHigh, setIsTotalTooHigh] = useState(false);

  useEffect(() => {
    const fetchCartProducts = async () => {
      if (cartItems.length === 0) {
        setCartProducts([]);
        setTotal(0);
        setLoading(false);
        return;
      }

      try {
        const allProducts = await getProducts(payments, {
          includePrices: true,
          activeOnly: true,
        });

        const productsInCart: CartProduct[] = [];
        let currentTotal = 0;

        cartItems.forEach((item) => {
          const product = allProducts.find((p) =>
            p.prices?.some((price) => price.id === item.priceId),
          );
          if (product) {
            const price = product.prices?.find((p) => p.id === item.priceId);
            if (price?.unit_amount != null) {
              productsInCart.push({
                ...product,
                price: price,
                quantity: item.quantity,
              });
              currentTotal += (price.unit_amount / 100) * item.quantity;
            }
          }
        });

        setCartProducts(productsInCart);
        setTotal(currentTotal);
        setIsTotalTooHigh(currentTotal > 999999.0); // Stripe test-mode amount cap
      } catch (error) {
        console.error("Failed to fetch cart products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartProducts();
  }, [cartItems]);

  // Returning from Stripe with ?success=true: thank the buyer and clear once.
  useEffect(() => {
    if (checkoutSuccess && !clearedAfterSuccess.current) {
      clearedAfterSuccess.current = true;
      clearCart();
    }
  }, [checkoutSuccess, clearCart]);

  const handleCheckout = async () => {
    if (cartProducts.length === 0) return;

    setIsProcessingCheckout(true);
    try {
      const checkoutItems = cartProducts.map((p) => ({ price: p.price.id, quantity: p.quantity }));
      const origin = window.location.origin;
      await createCartCheckout(checkoutItems, {
        successUrl: `${origin}/cart?success=true`,
        cancelUrl: `${origin}/cart?canceled=true`,
      });
      clearCart(); // Clear cart after successful checkout initiation
    } catch (error) {
      console.error("Error during checkout:", error);
      toast.error("Checkout failed. Please try again.");
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const handleClearCart = () => {
    if (window.confirm("Remove all items from your cart?")) {
      clearCart();
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <TestModeCallout />
      <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-brand-400">
        Review & pay
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-50 md:text-4xl">Your Cart</h1>
      {checkoutSuccess && (
        <div
          className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4"
          role="status"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" aria-hidden="true" />
          <div>
            <p className="font-semibold text-emerald-200">Payment successful — thank you!</p>
            <p className="mt-1 text-sm text-zinc-400">
              Your test payment went through. Receipts live in{" "}
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
              No worries — your cart is kept as it was. Try again whenever you’re ready.
            </p>
          </div>
        </div>
      )}
      {loading ? (
        <div className="mt-10 flex flex-col gap-4" role="status" aria-label="Loading cart">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : cartItems.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="Your cart is empty"
            lede="Browse the store and add a demo product — checkout uses the Stripe test card."
            action={<Button href="/store">Browse products</Button>}
          />
        </div>
      ) : (
        <div className="mt-10">
          <div className="flex flex-col gap-4">
            {cartProducts.map((product) => {
              const itemTotal = (product.price.unit_amount! / 100) * product.quantity;
              return (
                <Card
                  key={product.price.id}
                  className="flex-row items-center justify-between gap-4 p-4 hover:border-white/10 hover:shadow-none md:flex"
                >
                  <div className="flex items-center gap-4">
                    {product.images && product.images[0] && (
                      <Image
                        unoptimized
                        src={product.images[0]}
                        alt={product.name ?? "Product image"}
                        width={80}
                        height={80}
                        className="h-20 w-20 rounded-lg object-cover"
                        sizes="80px"
                      />
                    )}
                    <div className="flex flex-col gap-1">
                      <h2 className="text-lg font-bold text-zinc-100">{product.name}</h2>
                      <p className="font-mono text-sm text-zinc-400">
                        {formatPrice(product.price.unit_amount, product.price.currency)} each
                      </p>
                      <QtyStepper
                        id={`quantity-cart-${product.price.id}`}
                        value={product.quantity}
                        onChange={(next) => updateQuantity(product.price.id, next)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-mono text-lg font-bold text-zinc-100">
                      {formatPrice(itemTotal * 100, product.price.currency)}
                    </p>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeFromCart(product.price.id)}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Remove
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
          <Card className="mt-8 items-end gap-3 p-6">
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-400">Total</span>
              <PriceTag unitAmount={Math.round(total * 100)} currency="eur" className="text-base" />
            </div>
            {isTotalTooHigh && (
              <p className="text-sm text-red-400" role="alert">
                This total exceeds the Stripe test-mode amount limit — remove some items to check
                out.
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleCheckout}
                disabled={isProcessingCheckout || cartProducts.length === 0 || isTotalTooHigh}
              >
                {isTotalTooHigh
                  ? "Total too high"
                  : isProcessingCheckout
                    ? "Please wait..."
                    : "Proceed to Checkout"}
              </Button>
              <Button variant="secondary" onClick={handleClearCart}>
                Clear Cart
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

const CartPage = () => (
  // useSearchParams requires a Suspense boundary (static prerender).
  <Suspense
    fallback={
      <div className="mx-auto w-full max-w-6xl px-4 py-12" role="status" aria-label="Loading cart">
        <Skeleton className="h-28" />
      </div>
    }
  >
    <CartPageInner />
  </Suspense>
);

export default CartPage;
