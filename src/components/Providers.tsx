'use client';

import { UserProvider } from '../lib/UserContext';
import { CartProvider } from '../lib/CartContext';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingActionButton from './FloatingActionButton';

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <CartProvider>
      <UserProvider>
        <Navbar />
        <div className="flex-grow">
          {children}
        </div>
        <Footer />
        <FloatingActionButton />
      </UserProvider>
    </CartProvider>
  );
};

export default Providers;
