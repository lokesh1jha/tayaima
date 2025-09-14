"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const links = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/products", label: "Products", icon: "📦" },
  { href: "/admin/orders", label: "Orders", icon: "📋" },
  { href: "/admin/customers", label: "Customers", icon: "👥" },
  { href: "/admin/analytics", label: "Analytics", icon: "📈" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Admin Panel
        </h1>
      </div>
      
      <nav className="px-4 pb-4">
        <div className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href as any}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              )}
            >
              <span className="text-lg">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  );
}
