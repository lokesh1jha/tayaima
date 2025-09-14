"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const links = [
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/orders", label: "My Orders" },
  { href: "/dashboard/address", label: "Address" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 shrink-0 border-r border-gray-200 dark:border-gray-800 p-4">
      <nav className="grid gap-1">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href as any}
            className={clsx(
              "rounded-md px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800",
              pathname === l.href && "bg-gray-100 dark:bg-gray-800 font-medium"
            )}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}