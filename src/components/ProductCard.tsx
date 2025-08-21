import Link from 'next/link';
import Image from 'next/image';
import {Price, Product} from "@invertase/firestore-stripe-payments";
import {createCheckout} from "@/lib/createCheckout";

const ProductCard = ({ id, name, description, images, prices }: Product) => {
  const handleCheckout = async (priceId: string) => {
    await createCheckout(priceId);
  }

  return (
    <div className="max-w-sm rounded-lg overflow-hidden shadow-lg bg-neutral-900 hover:bg-neutral-700 cursor-pointer">
      <Link href={`/products/${id}`}>
        <Image src={images[0]} alt={name!} width={300} height={200} className="w-full h-48 object-cover" />
        <div className="px-6 py-4">
          <div className="font-bold text-xl mb-2">{name}</div>
          <p className="text-gray-400 text-base mb-2">
            {description}
          </p>
        </div>
      </Link>
      <div className="px-6 py-4">
        {prices?.map((price: Price) => (
          <div key={price.id} className="flex justify-between items-center">
            <p className="text-white text-lg font-bold">${price.unit_amount! / 100}</p>
            <button onClick={() => handleCheckout(price.id)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Buy Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductCard;