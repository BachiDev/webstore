'use client';

import { useCart } from '../../lib/CartContext';
import { useEffect, useState } from 'react';
import { getProducts, Product, Price } from '@invertase/firestore-stripe-payments';
import { payments } from '@/lib/firebase';
import { createCheckout, createCartCheckout } from '@/lib/createCheckout';

interface CartProduct extends Product {
  price: Price;
  quantity: number;
}

const CartPage = () => {
  const { cartItems, removeFromCart, clearCart } = useCart();
  const [cartProducts, setCartProducts] = useState<CartProduct[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchCartProducts = async () => {
      if (cartItems.length === 0) {
        setCartProducts([]);
        setTotal(0);
        return;
      }

      const allProducts = await getProducts(payments, {
        includePrices: true,
        activeOnly: true,
      });

      const productsInCart: CartProduct[] = [];
      let currentTotal = 0;

      cartItems.forEach(item => {
        const product = allProducts.find(p => p.prices?.some(price => price.id === item.priceId));
        if (product) {
          const price = product.prices?.find(p => p.id === item.priceId);
          if (price) {
            productsInCart.push({
              ...product,
              price: price,
              quantity: item.quantity,
            });
            currentTotal += (price.unit_amount! / 100) * item.quantity;
          }
        }
      });

      setCartProducts(productsInCart);
      setTotal(currentTotal);
    };

    fetchCartProducts();
  }, [cartItems]);

  const handleCheckout = async () => {
    if (cartProducts.length === 0) return;

    const checkoutItems = cartProducts.map(p => ({ price: p.price.id, quantity: p.quantity }));
    await createCartCheckout(checkoutItems);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-black">Your Cart</h1>
      {cartItems.length === 0 ? (
        <p className="text-black">Your cart is empty.</p>
      ) : (
        <div>
          <div className="space-y-4">
            {cartProducts.map(product => (
              <div key={product.id} className="flex items-center justify-between border p-4 rounded-lg bg-neutral-900 text-white">
                <div className="flex items-center space-x-4">
                  {product.images && product.images[0] && (
                    <img src={product.images[0]} alt={product.name!} className="w-16 h-16 object-cover rounded" />
                  )}
                  <div>
                    <h2 className="text-lg font-bold">{product.name}</h2>
                    <p className="text-gray-400">Quantity: {product.quantity}</p>
                    <p className="text-gray-400">€ {(product.price.unit_amount! / 100).toFixed(2)} each</p>
                  </div>
                </div>
                <button onClick={() => removeFromCart(product.price.id)} className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded cursor-pointer">
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="mt-8 text-right">
            <h2 className="text-xl font-bold text-black">Total: € {total.toFixed(2)}</h2>
            <button onClick={handleCheckout} className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg mt-4 cursor-pointer">
              Proceed to Checkout
            </button>
            <button onClick={clearCart} className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-6 rounded-lg mt-4 ml-4 cursor-pointer">
              Clear Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
