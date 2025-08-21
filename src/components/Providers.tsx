'use client';

import { UserProvider } from '../lib/UserContext';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingActionButton from './FloatingActionButton';

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <UserProvider>
      <Navbar />
      <div className="flex-grow">
        {children}
      </div>
      <Footer />
      <FloatingActionButton />
    </UserProvider>
  );
};

export default Providers;
