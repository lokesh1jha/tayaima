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

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
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
      <div className="container flex h-16 items-center justify-between">
        <Link href={ROUTES.HOME} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Image
            src="/tayaima-logo.jpeg"
            alt="TaYaima Logo"
            width={40}
            height={40}
            className="rounded-lg object-contain"
            priority
          />
          <span className="font-bold text-xl text-blue-600 dark:text-blue-400">
            Tayaima Store
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          {/* Desktop Navigation - Products and Cart */}
          <Link href={ROUTES.PRODUCTS} className="hidden md:block text-sm font-medium transition-colors hover:opacity-80 text-gray-700 dark:text-gray-300">
            Products
          </Link>

          {/* Desktop Cart button */}
          <button onClick={openCart} className="hidden md:flex relative text-sm font-medium transition-colors hover:opacity-80 items-center gap-1 text-gray-700 dark:text-gray-300">
            <span>🛒</span>
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold bg-red-500">
                {cartCount}
              </span>
            )}
          </button>
          
          {status === "authenticated" ? (
            <>
              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <Button
                  variant="ghost"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || "U"}
                  </div>
                  <span className="hidden sm:block">{session?.user?.name || session?.user?.email}</span>
                </Button>
                
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                    {/* Mobile Navigation Links */}
                    <div className="md:hidden">
                      <Link
                        href={ROUTES.PRODUCTS}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        🛍️ Products
                      </Link>
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          openCart();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        🛒 Cart {cartCount > 0 && `(${cartCount})`}
                      </button>
                      <hr className="my-1 border-gray-200 dark:border-gray-700" />
                    </div>
                    
                    {!isAdmin && (
                      <>
                        <Link
                          href={ROUTES.PROFILE_ORDERS}
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          My Orders
                        </Link>
                        <Link
                          href={ROUTES.PROFILE}
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          Profile
                        </Link>
                      </>
                    )}
                    {isAdmin && (
                      <Link
                        href={ROUTES.ADMIN}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <hr className="my-1 border-gray-200 dark:border-gray-700" />
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Mobile Menu for Non-authenticated Users */}
              <div className="md:hidden relative" ref={dropdownRef}>
                <Button
                  variant="ghost"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    ☰
                  </div>
                </Button>
                
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                    <Link
                      href={ROUTES.PRODUCTS}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      🛍️ Products
                    </Link>
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        openCart();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      🛒 Cart {cartCount > 0 && `(${cartCount})`}
                    </button>
                    <hr className="my-1 border-gray-200 dark:border-gray-700" />
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        signIn();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Login
                    </button>
                  </div>
                )}
              </div>
              
              {/* Desktop Login Button */}
              <Button onClick={() => signIn()} variant="secondary" className="hidden md:block">Login</Button>
            </>
          )}

          {mounted && (
            <Button
              variant="ghost"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {theme === "dark" ? "🌙" : "☀️"}
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}