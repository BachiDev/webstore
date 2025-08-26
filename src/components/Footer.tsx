import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-black text-white p-4 text-center mt-8">
      <div className="container mx-auto">
        <p>&copy; {new Date().getFullYear()} Fabian Bachmayer. All rights reserved. | <Link href="https://bachidev.github.io/#imprint" className="hover:text-gray-400">Imprint</Link></p>
      </div>
    </footer>
  );
};

export default Footer;
