import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Card from "@/components/ui/Card";

export default async function AdminOverviewPage() {
  const session = await getServerSession(authOptions);
  // layout.tsx already guards; keeping a soft guard here too
  if (!session || (session.user as any)?.role !== "ADMIN") return null;

  const [productsCount, ordersCount, usersCount] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
  ]);

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-600 dark:text-gray-300">Products</div>
          <div className="text-2xl font-bold">{productsCount}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 dark:text-gray-300">Orders</div>
          <div className="text-2xl font-bold">{ordersCount}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600 dark:text-gray-300">Customers</div>
          <div className="text-2xl font-bold">{usersCount}</div>
        </Card>
      </div>
    </div>
  );
}
