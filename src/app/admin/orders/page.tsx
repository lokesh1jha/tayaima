import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Card from "@/components/ui/Card";

export default async function AdminOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") return null;

  const orders = await prisma.order.findMany({
    include: { items: { include: { variant: { include: { product: true } } } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Orders</h1>
      <Card className="p-4">
        <div className="grid gap-3">
          {orders.map((o) => (
            <div key={o.id} className="flex justify-between border-b last:border-b-0 border-gray-200 dark:border-gray-800 py-2 text-sm">
              <div>
                <div className="font-medium">#{o.id.slice(-6)}</div>
                <div className="text-gray-600 dark:text-gray-300">{new Date(o.createdAt).toLocaleString()}</div>
              </div>
              <div className="capitalize">{o.status.toLowerCase()}</div>
              <div>{o.items.length} items</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
