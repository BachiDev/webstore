'use client';

import { payments } from '@/lib/firebase';
import ProductCard from '../../components/ProductCard';
import { getProducts, Product } from "@invertase/firestore-stripe-payments";
import { useEffect, useState } from 'react';

const OneTimePaymentPage = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const allProducts = await getProducts(payments, {
        includePrices: true,
        activeOnly: true,
      });
      const oneTimeProducts = allProducts.filter(product => !product.metadata.firebaseRole);
      setProducts(oneTimeProducts);
    };
    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-black">One-Time Payment Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.map(product => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
};

export default OneTimePaymentPage;