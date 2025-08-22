import Image from 'next/image';
import {Price, Product} from "@invertase/firestore-stripe-payments";
import { useCart } from '../lib/CartContext';
import { useState } from 'react';


const ProductCard = ({ name, description, images, prices }: Product) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="max-w-sm rounded-lg overflow-hidden shadow-lg bg-neutral-900 hover:bg-neutral-700">
      {images && images[0] && <Image src={images[0]} alt={name!} width={300} height={200} className="w-full h-48 object-cover" unoptimized/>}
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">{name}</div>
        <p className="text-gray-400 text-base mb-2">
          {description}
        </p>
      </div>
      <div className="px-6 py-4">
        {prices?.filter(price => price.active).map((price: Price) => (
          <div key={price.id} className="flex flex-col items-start">
            <p className="text-white text-lg font-bold mb-2">€ {(price.unit_amount! / 100).toFixed(2)}</p>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max="99"
                value={quantity}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value >= 1 && value <= 99) {
                    setQuantity(value);
                  }
                }}
                className="w-16 p-2 border rounded text-white bg-neutral-800"
              />
              <button onClick={() => addToCart(price.id, quantity)} className="bg-white hover:bg-neutral-300 text-black font-bold py-2 px-4 rounded cursor-pointer">
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductCard;