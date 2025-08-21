'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { products } from '../../../lib/products';

const ProductPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { id } = params;
  const product = products.find(p => p.id === id);

  if (!product) {
    return <div className="container mx-auto p-4 text-center">Product not found</div>;
  }

  const handleBuy = () => {
    alert(`Buying ${product.name} for $${product.price.toFixed(2)}`);
    // Here you would integrate with your payment gateway (e.g., Stripe)
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
          <Image src={product.imageUrl} alt={product.name} width={600} height={400} className="rounded-lg shadow-lg" />
        </div>
        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold mb-4 text-black">{product.name}</h1>
          <p className="text-gray-500 text-lg mb-4">{product.description}</p>
         <p className="text-2xl font-bold mb-6 text-black">${product.price.toFixed(2)}</p>
          <button onClick={handleBuy} className="px-6 py-3 bg-neutral-700 text-white rounded-md hover:bg-neutral-600 text-lg cursor-pointer"> 
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;