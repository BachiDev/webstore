"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useUser } from "../lib/UserContext";
import { useCart } from "../lib/CartContext";
import { useEffect, useState } from "react";
import { Menu, ShoppingCart, X } from "lucide-react";
import { User } from "firebase/auth";
import { cn } from "@/lib/cn";
import { navItems, site } from "@/data/site";
import { Avatar } from "./ui/Avatar";

const roleNavItems = [
  { href: "/content/starter", label: "Starter", roleRequired: "Starter" },
  { href: "/content/pro", label: "Pro", roleRequired: "Pro" },
  { href: "/content/premium", label: "Premium", roleRequired: "Premium" },
];

const NavLink = ({
  href,
  children,
  onClick,
  className = "",
  active = false,
  ariaLabel,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  active?: boolean;
  ariaLabel?: string;
}) => (
  <Link
    href={href}
    onClick={onClick}
    aria-current={active ? "page" : undefined}
    aria-label={ariaLabel}
    className={cn(
      "text-sm font-medium text-zinc-300 underline-offset-4 transition-colors hover:text-white hover:underline",
      active && "text-white underline",
      className,
    )}
  >
    {children}
  </Link>
);

const ProfileButton = ({ user, onClick }: { user: User; onClick?: () => void }) => (
  <Link
    href="/profile"
    onClick={onClick}
    className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-sm text-zinc-100 ring-1 ring-white/15 transition-colors hover:bg-white/10"
  >
    <Avatar user={user} size={24} />
    <span className="max-w-24 truncate">{user.email || "Guest"}</span>
  </Link>
);

const LoginButton = ({ onClick }: { onClick?: () => void }) => (
  <Link
    href="/auth"
    onClick={onClick}
    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-brand-500/25 transition-colors hover:from-brand-600 hover:to-fuchsia-700"
  >
    Login
  </Link>
);

const CartIcon = ({ onClick }: { onClick?: () => void }) => {
  const { cartItems } = useCart();
  const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <NavLink
      href="/cart"
      onClick={onClick}
      className="relative inline-flex"
      ariaLabel={`Cart, ${count} items`}
    >
      <ShoppingCart className="h-6 w-6" aria-hidden="true" />
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 font-mono text-xs font-bold text-white">
          {count}
        </span>
      )}
    </NavLink>
  );
};

const Navbar = () => {
  const { user, loading, role } = useUser();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const filteredNavItems = navItems.filter((item) => {
    if (item.href === "/subscription" && (!user || role)) return false;
    return true;
  });

  const filteredRoleNavItems = roleNavItems.filter((item) => {
    if (!user || !role) return false;
    if (
      item.roleRequired === "Starter" &&
      (role === "Starter" || role === "Pro" || role === "Premium")
    )
      return true;
    if (item.roleRequired === "Pro" && (role === "Pro" || role === "Premium")) return true;
    if (item.roleRequired === "Premium" && role === "Premium") return true;
    return false;
  });

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-zinc-950/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
        <NavLink href="/" className="flex items-center gap-2 text-base font-bold text-zinc-100">
          <Image
            src="/logo-64.webp"
            alt={`${site.name} logo`}
            width={24}
            height={24}
            className="h-6 w-6"
            unoptimized
          />
          <span>{site.name}</span>
        </NavLink>
        <nav className="hidden items-center gap-4 md:flex" aria-label="Primary">
          {filteredNavItems.map((item) => (
            <NavLink key={item.href} href={item.href} active={pathname === item.href}>
              {item.label}
            </NavLink>
          ))}
          {filteredRoleNavItems.map((item) => (
            <NavLink key={item.href} href={item.href} active={pathname === item.href}>
              {item.label}
            </NavLink>
          ))}
          <CartIcon />
          {loading ? (
            <span
              className="h-8 w-24 animate-pulse rounded-full bg-white/10"
              aria-label="Loading account"
              role="status"
            />
          ) : user ? (
            <ProfileButton user={user} />
          ) : (
            <LoginButton />
          )}
        </nav>
        <div className="flex items-center gap-2 md:hidden">
          <CartIcon />
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 items-center justify-center rounded-md text-zinc-200 hover:bg-white/5"
          >
            {isOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
      {isOpen && (
        <div id="mobile-menu" className="border-t border-white/10 bg-zinc-950/95 md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4" aria-label="Mobile">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                active={pathname === item.href}
                className="block rounded-md px-3 py-2 hover:bg-white/5"
              >
                {item.label}
              </NavLink>
            ))}
            {filteredRoleNavItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                active={pathname === item.href}
                className="block rounded-md px-3 py-2 hover:bg-white/5"
              >
                {item.label}
              </NavLink>
            ))}
            <div className="px-3 py-2">
              {loading ? (
                <span className="text-sm text-zinc-400">Loading…</span>
              ) : user ? (
                <ProfileButton user={user} onClick={() => setIsOpen(false)} />
              ) : (
                <LoginButton onClick={() => setIsOpen(false)} />
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
