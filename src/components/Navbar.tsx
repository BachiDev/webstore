'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '../lib/UserContext';
import { useState } from 'react';
import { User } from 'firebase/auth';

interface NavItem {
  href: string;
  label: string;
  authRequired?: boolean;
  guestOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: "/one-time-payment", label: "One-Time Payment" },
  { href: "/subscription", label: "Subscription" },
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
  const { user, loading } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="bg-gray-900 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <NavLink href="/" className="text-2xl font-bold flex items-center space-x-2">
          <Image src="/logo.png" alt="WebStore Logo" width={32} height={32} />
          <span>WebStore</span>
        </NavLink>
        <div className="hidden md:flex space-x-4 items-center">
          {navItems.map(item => (
            <NavLink key={item.href} href={item.href}>{item.label}</NavLink>
          ))}
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
          {navItems.map(item => (
            <NavLink key={item.href} href={item.href} onClick={toggleMenu} className="block py-2 px-4 hover:bg-gray-700">{item.label}</NavLink>
          ))}
          {loading ? (
            <div className="block py-2 px-4 text-gray-400">Loading...</div>
          ) : user ? (
            <ProfileButton user={user} onClick={toggleMenu} />
          ) : (
            <LoginButton onClick={toggleMenu} />
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;