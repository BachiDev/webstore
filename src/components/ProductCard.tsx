import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

const ProductCard = ({ id, name, description, price, imageUrl }: ProductCardProps) => {
  return (
    <Link href={`/products/${id}`}>
      <div className="max-w-sm rounded-lg overflow-hidden shadow-lg bg-neutral-900 hover:bg-neutral-700 cursor-pointer">
        <Image src={imageUrl} alt={name} width={300} height={200} className="w-full h-48 object-cover" />
        <div className="px-6 py-4">
          <div className="font-bold text-xl mb-2">{name}</div>
          <p className="text-gray-400 text-base mb-2">
            {description}
          </p>
          <p className="text-white text-lg font-bold">${price.toFixed(2)}</p>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;