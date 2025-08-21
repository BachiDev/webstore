'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '../lib/UserContext';
import { useCart } from '../lib/CartContext';
import { useState } from 'react';
import { User } from 'firebase/auth';

interface NavItem {
  href: string;
  label: string;
  authRequired?: boolean;
  guestOnly?: boolean;
  roleRequired?: boolean;
}

const navItems: NavItem[] = [
  { href: "/one-time-payment", label: "One-Time Payment" },
  { href: "/subscription", label: "Subscription"},
];

const NavLink = ({ href, children, onClick, className = "" }: { href: string; children: React.ReactNode; onClick?: () => void; className?: string }) => (
  <Link href={href} onClick={onClick} className={`hover:text-gray-400 ${className}`}>
    {children}
  </Link>
);

const ProfileButton = ({ user, onClick }: { user: User, onClick?: () => void }) => (
  <Link href="/profile" onClick={onClick} className="flex items-center space-x-2 bg-white text-black hover:text-black hover:bg-gray-200       │
 │       rounded-full p-2 px-4">
    <Image src={user.photoURL || 'https://www.gravatar.com/avatar/?d=mp'} alt="Profile" width={32} height={32} className="rounded-full" />
    <span>{user.email || 'Guest'}</span>
  </Link>
);

const LoginButton = ({ onClick }: { onClick?: () => void }) => (
  <Link href="/auth" onClick={onClick} className="flex items-center space-x-2 bg-white text-black hover:text-blac hover:bg-gray-200           │
 │       rounded-full p-2 px-4">Login</Link>
);

const Navbar = () => {
  const { user, loading, role } = useUser();
  const { cartItems } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const filteredNavItems = navItems.filter(item => {
    if (item.authRequired && !user) return false;
    if (item.guestOnly && user) return false;
    if (item.roleRequired && !role) return false;
    return true;
  });

  return (
    <nav className="bg-gray-900 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <NavLink href="/" className="text-2xl font-bold flex items-center space-x-2">
          <Image src="/logo.png" alt="WebStore Logo" width={32} height={32} />
          <span>WebStore</span>
        </NavLink>
        <div className="hidden md:flex space-x-4 items-center">
          {filteredNavItems.map(item => (
            <NavLink key={item.href} href={item.href}>{item.label}</NavLink>
          ))}
          <NavLink href="/cart" className="relative inline-block !block">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 relative" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center z-50 !important">
                {cartItems.length}
              </span>
            )}
          </NavLink>
          {loading ? (
            <div className="flex items-center space-x-2">
              <span className="w-8 h-8 rounded-full bg-gray-700 animate-pulse"></span>
              <span className="text-sm text-gray-400">Loading...</span>
            </div>
          ) : user ? (
            <ProfileButton user={user} />
          ) : (
            <LoginButton />
          )}
        </div>
        <div className="md:hidden">
          <button onClick={toggleMenu}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden mt-4">
          {filteredNavItems.map(item => (
            <NavLink key={item.href} href={item.href} onClick={toggleMenu} className="block py-2 px-4 hover:bg-gray-700">{item.label}</NavLink>
          ))}
          {loading ? (
            <div className="block py-2 px-4 text-gray-400">Loading...</div>
          ) : user ? (
            <ProfileButton user={user} onClick={toggleMenu} />
          ) : (
            <LoginButton onClick={toggleMenu} />
          )}
                    <NavLink href="/cart" onClick={toggleMenu} className="block py-2 px-4 hover:bg-gray-700 relative inline-block !block">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block mr-2 relative" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Cart
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -left-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center z-50 !important">
                {cartItems.length}
              </span>
            )}
          </NavLink>
        </div>
      )}
    </nav>
  );
};

export default Navbar;