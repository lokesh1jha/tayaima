"use client";

import Link from "next/link";
import Image from "next/image";
import Button from "./ui/Button";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useCart } from "@/hooks/useCart";
import { useCartDrawer } from "@/components/cart/CartDrawerProvider";
import { ROUTES } from "@/lib/constants";
import { IconShoppingCart, IconUser, IconSun, IconMoon, IconLogout, IconPackage, IconSettings, IconSearch } from "@tabler/icons-react";
import ProductSearchBar from "./ui/ProductSearchBar";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { data: session, status } = useSession();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { itemCount } = useCart();
  const { openCart } = useCartDrawer();

  useEffect(() => setMounted(true), []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const cartCount = itemCount;
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  return (
    <header className="border-b backdrop-blur sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 border-gray-200 dark:border-gray-800">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href={ROUTES.HOME} className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-shrink-0">
          <Image
            src="/tayaima-logo.jpeg"
            alt="TaYaima Logo"
            width={40}
            height={40}
            className="rounded-lg object-contain"
            priority
          />
        </Link>
        
        {/* Search Bar - Hidden on mobile, visible on tablet and up */}
        <div className="hidden md:block flex-1 max-w-md mx-4">
          <ProductSearchBar
            placeholder="Search products..."
            isAdmin={false}
            limit={10}
            className="w-full"
          />
        </div>
        
        <nav className="flex items-center gap-2 flex-shrink-0">
          {/* Mobile Search Icon */}
          <button 
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Search Products"
          >
            <IconSearch className="w-5 h-5" />
          </button>
          
          {/* Cart Icon */}
          <button 
            onClick={openCart} 
            className="relative p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Shopping Cart"
          >
            <IconShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold bg-red-500">
                {cartCount}
              </span>
            )}
          </button>
          
          {status === "authenticated" ? (
            <>
              {/* Profile Icon */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  aria-label="Profile Menu"
                >
                  <IconUser className="w-5 h-5" />
                  <span className="text-sm font-medium hidden sm:block">
                    {session?.user?.name || session?.user?.email?.split('@')[0]}
                  </span>
                </button>
                
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                    {/* User Info */}
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {session?.user?.name || session?.user?.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {session?.user?.email}
                      </p>
                    </div>

                    {/* Navigation Links */}
                    <Link
                      href={ROUTES.PRODUCTS}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <IconPackage className="w-4 h-4" />
                      Products
                    </Link>
                    
                    {!isAdmin && (
                      <>
                        <Link
                          href={ROUTES.PROFILE_ORDERS}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          <IconPackage className="w-4 h-4" />
                          My Orders
                        </Link>
                        <Link
                          href={ROUTES.PROFILE}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          <IconSettings className="w-4 h-4" />
                          Profile
                        </Link>
                      </>
                    )}
                    {isAdmin && (
                      <Link
                        href={ROUTES.ADMIN}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        <IconSettings className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    )}

                    {/* Dark/Light Mode Toggle */}
                    <button
                      onClick={() => {
                        setTheme(theme === "dark" ? "light" : "dark");
                        setShowProfileDropdown(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {theme === "dark" ? <IconSun className="w-4 h-4" /> : <IconMoon className="w-4 h-4" />}
                      {theme === "dark" ? "Light Mode" : "Dark Mode"}
                    </button>

                    <hr className="my-1 border-gray-200 dark:border-gray-700" />
                    
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <IconLogout className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Profile Icon for Non-authenticated Users */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  aria-label="Menu"
                >
                  <IconUser className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    Login
                  </span>
                </button>
                
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                    <Link
                      href={ROUTES.PRODUCTS}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <IconPackage className="w-4 h-4" />
                      Products
                    </Link>
                    
                    {/* Dark/Light Mode Toggle */}
                    <button
                      onClick={() => {
                        setTheme(theme === "dark" ? "light" : "dark");
                        setShowProfileDropdown(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {theme === "dark" ? <IconSun className="w-4 h-4" /> : <IconMoon className="w-4 h-4" />}
                      {theme === "dark" ? "Light Mode" : "Dark Mode"}
                    </button>

                    <hr className="my-1 border-gray-200 dark:border-gray-700" />
                    
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        signIn();
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <IconUser className="w-4 h-4" />
                      Login / Signup
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </nav>
      </div>
      
      {/* Mobile Search Bar */}
      {showMobileSearch && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <ProductSearchBar
            placeholder="Search products..."
            isAdmin={false}
            limit={10}
            className="w-full"
          />
        </div>
      )}
    </header>
  );
}