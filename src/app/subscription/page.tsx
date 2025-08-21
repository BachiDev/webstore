'use client';

import { payments } from '@/lib/firebase';
import SubscriptionCard from '../../components/SubscriptionCard';
import { getProducts, Product } from "@invertase/firestore-stripe-payments";
import { useEffect, useState } from 'react';
import PaymentNotice from '../../components/PaymentNotice';

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
      products.sort((a, b) => {
        const aPrice = a.prices?.find(price => price.interval === 'year')?.unit_amount || 0;
        const bPrice = b.prices?.find(price => price.interval === 'year')?.unit_amount || 0;
        return aPrice - bPrice;
      });
      setProducts(products);
    };
    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <PaymentNotice />
      <h1 className="text-2xl font-bold mb-4 text-black">Subscription Products</h1>
      <div className="flex justify-center items-center mb-4">
        <button onClick={() => setBillingInterval("year")} className={`px-4 py-2 rounded-l-md cursor-pointer ${billingInterval === "year" ? "bg-black text-white" : "bg-neutral-400"}`}>Yearly</button>
        <button onClick={() => setBillingInterval("month")} className={`px-4 py-2 rounded-r-md cursor-pointer ${billingInterval === "month" ? "bg-black text-white" : "bg-neutral-400"}`}>Monthly</button>
      </div>
      <div className="h-6 text-center mb-8">{billingInterval === "year" && <p className="text-black text-xl text-bold">Save 2 months with yearly billing!</p>}</div>
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
