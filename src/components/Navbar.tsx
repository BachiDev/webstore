'use client';

import Link from 'next/link';
import { useUser } from '../lib/UserContext';
import { useState } from 'react';

const Navbar = () => {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gray-900 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">WebStore</Link>
        <div className="hidden md:flex space-x-4 items-center">
          <Link href="/one-time-payment" className="hover:text-gray-400">One-Time Payment</Link>
          <Link href="/subscription" className="hover:text-gray-400">Subscription</Link>
          {user ? (
            <Link href="/profile" className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 rounded-full p-2">
              <img src={user.photoURL || 'https://www.gravatar.com/avatar/?d=mp'} alt="Profile" className="w-8 h-8 rounded-full" />
              <span>{user.email || 'Guest'}</span>
            </Link>
          ) : (
            <Link href="/auth" className="hover:text-gray-400">Login</Link>
          )}
        </div>
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden mt-4">
          <Link href="/one-time-payment" className="block py-2 px-4 hover:bg-gray-700">One-Time Payment</Link>
          <Link href="/subscription" className="block py-2 px-4 hover:bg-gray-700">Subscription</Link>
          {user ? (
            <Link href="/profile" className="block py-2 px-4 hover:bg-gray-700">
              <div className="flex items-center space-x-2">
                <img src={user.photoURL || 'https://www.gravatar.com/avatar/?d=mp'} alt="Profile" className="w-8 h-8 rounded-full" />
                <span>{user.email || 'Guest'}</span>
              </div>
            </Link>
          ) : (
            <Link href="/auth" className="block py-2 px-4 hover:bg-gray-700">Login</Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
