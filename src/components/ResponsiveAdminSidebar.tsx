"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const links = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/products", label: "Products", icon: "📦" },
  { href: "/admin/categories", label: "Categories", icon: "🏷️" },
  { href: "/admin/orders", label: "Orders", icon: "📋" },
  { href: "/admin/customers", label: "Customers", icon: "👥" },
  { href: "/admin/admins", label: "Admins", icon: "👨‍💼" },
  { href: "/admin/analytics", label: "Analytics", icon: "📈" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

export default function ResponsiveAdminSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md"
          aria-label="Toggle menu"
        >
          <div className="w-6 h-6 flex flex-col justify-center items-center">
            <span
              className={clsx(
                "block h-0.5 w-6 bg-gray-600 dark:bg-gray-300 transition-all duration-300",
                isMobileMenuOpen ? "rotate-45 translate-y-1" : "-translate-y-1"
              )}
            />
            <span
              className={clsx(
                "block h-0.5 w-6 bg-gray-600 dark:bg-gray-300 transition-all duration-300",
                isMobileMenuOpen ? "opacity-0" : "opacity-100"
              )}
            />
            <span
              className={clsx(
                "block h-0.5 w-6 bg-gray-600 dark:bg-gray-300 transition-all duration-300",
                isMobileMenuOpen ? "-rotate-45 -translate-y-1" : "translate-y-1"
              )}
            />
          </div>
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:transform-none",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Admin Panel
              </h1>
              {/* Close button for mobile */}
              <button
                onClick={closeMobileMenu}
                className="lg:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Close menu"
              >
                <span className="block w-6 h-6 text-gray-500 dark:text-gray-400">✕</span>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 overflow-y-auto">
            <div className="space-y-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href as any}
                  onClick={closeMobileMenu}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors w-full",
                    pathname === link.href
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  )}
                >
                  <span className="text-lg flex-shrink-0">{link.icon}</span>
                  <span className="truncate">{link.label}</span>
                </Link>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              TaYaima Admin
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
