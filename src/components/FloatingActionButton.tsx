import Link from 'next/link';
import Image from 'next/image';

const FloatingActionButton = () => {
  return (
    <div className="fixed bottom-4 right-4">
      <Link href="https://github.com/BachiDev/webstore" target="_blank" rel="noopener noreferrer">
        <button className="bg-black text-white p-3 rounded-full shadow-lg hover:bg-neutral-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
          <Image src="./github.svg" alt="GitHub" width={24} height={24} className='dark:invert'/>
        </button>
      </Link>
    </div>
  );
};

export default FloatingActionButton;
