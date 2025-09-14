import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ROUTES, NAV_ITEMS } from "@/lib/constants";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") {
    redirect(ROUTES.LOGIN);
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 shrink-0 border-r border-gray-200 dark:border-gray-800 p-4">
        <div className="text-xl font-semibold mb-4">Admin</div>
        <nav className="grid gap-1 text-sm">
          {NAV_ITEMS.ADMIN.map((n) => (
            <Link key={n.href} href={n.href as any} className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
              {n.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
