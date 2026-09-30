"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import toast from "react-hot-toast";

interface CartItem {
  priceId: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (priceId: string, quantity?: number) => void;
  removeFromCart: (priceId: string) => void;
  updateQuantity: (priceId: string, newQuantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "cartItems";

export const isValidCartItem = (item: unknown): item is CartItem =>
  typeof item === "object" &&
  item !== null &&
  typeof (item as CartItem).priceId === "string" &&
  typeof (item as CartItem).quantity === "number" &&
  Number.isFinite((item as CartItem).quantity) &&
  (item as CartItem).quantity > 0;

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  // Hydrated only after localStorage has been read — prevents the save
  // effect from clobbering a stored cart with the initial [] on slow devices.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          const parsed: unknown = JSON.parse(savedCart);
          if (Array.isArray(parsed)) {
            setCartItems(parsed.filter(isValidCartItem));
          }
        }
      } catch {
        // Corrupt storage: start empty rather than crashing.
      } finally {
        setHydrated(true);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && hydrated) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      } catch {
        // Storage full / unavailable: cart still works in-memory.
      }
    }
  }, [cartItems, hydrated]);

  const addToCart = (priceId: string, quantity: number = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.priceId === priceId);
      if (existingItem) {
        return prevItems.map((item) =>
          item.priceId === priceId ? { ...item, quantity: item.quantity + quantity } : item,
        );
      } else {
        return [...prevItems, { priceId, quantity }];
      }
    });
    toast.success(`Added ${quantity} item(s) to cart!`);
  };

  const removeFromCart = (priceId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.priceId !== priceId));
    toast.success("Item removed from cart!");
  };

  const clearCart = () => {
    setCartItems([]);
    toast.success("Cart cleared!");
  };

  const updateQuantity = (priceId: string, newQuantity: number) => {
    setCartItems((prevItems) => {
      if (newQuantity <= 0) {
        toast.success("Item removed from cart!");
        return prevItems.filter((item) => item.priceId !== priceId);
      }
      return prevItems.map((item) =>
        item.priceId === priceId ? { ...item, quantity: newQuantity } : item,
      );
    });
  };

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
