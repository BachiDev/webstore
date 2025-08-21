'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CartItem {
  priceId: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (priceId: string, quantity?: number) => void;
  removeFromCart: (priceId: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (priceId: string, quantity: number = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.priceId === priceId);
      if (existingItem) {
        return prevItems.map(item =>
          item.priceId === priceId ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        return [...prevItems, { priceId, quantity }];
      }
    });
  };

  const removeFromCart = (priceId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.priceId !== priceId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    // This will be implemented later when we fetch product prices
    return 0;
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, getCartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
