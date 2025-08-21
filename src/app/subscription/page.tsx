'use client';

import { payments } from '@/lib/firebase';
import SubscriptionCard from '../../components/SubscriptionCard';
import { getProducts, Product } from "@invertase/firestore-stripe-payments";
import { useEffect, useState } from 'react';

const SubscriptionPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("year");

  useEffect(() => {
    const fetchProducts = async () => {
      const products = await getProducts(payments, {
        includePrices: true,
        activeOnly: true,
        where: [["metadata.firebaseRole", "!=", null]]
      });
      setProducts(products);
    };
    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-black">Subscription Products</h1>
      <div className="flex justify-center items-center mb-4">
        <button onClick={() => setBillingInterval("month")} className={`px-4 py-2 rounded-l-md cursor-pointer ${billingInterval === "month" ? "bg-black text-white" : "bg-neutral-400"}`}>Monthly</button>
        <button onClick={() => setBillingInterval("year")} className={`px-4 py-2 rounded-r-md cursor-pointer ${billingInterval === "year" ? "bg-black text-white" : "bg-neutral-400"}`}>Yearly</button>
      </div>
      <p className="text-center text-gray-400 text-sm mb-4"> {billingInterval === "year" && <span>Save 2 months with yearly billing</span>}</p>
      <div className="flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map(product => (
            <SubscriptionCard key={product.id} product={product} billingInterval={billingInterval} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
