'use client';

import { UserProvider } from '../lib/UserContext';
import { CartProvider } from '../lib/CartContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingActionButton from './FloatingActionButton';

// Import the necessary components and the 'ui' object from your setup file
import { ConfigProvider } from '@firebase-ui/react';
import { ui } from '../lib/firebase'; // Adjust the import path as needed

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    // Wrap your entire app with the FirebaseUI ConfigProvider
    <ConfigProvider ui={ui}>
      <CartProvider>
        <UserProvider>
          <Navbar />
          <Toaster />
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
          <FloatingActionButton />
        </UserProvider>
      </CartProvider>
    </ConfigProvider>
  );
};

export default Providers;
