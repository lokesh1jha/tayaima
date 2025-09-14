import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Card from "@/components/ui/Card";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") return null;

  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 50 });

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Customers</h1>
      <Card className="p-4">
        <div className="grid gap-2 text-sm">
          {users.map((u) => (
            <div key={u.id} className="flex justify-between border-b last:border-b-0 border-gray-200 dark:border-gray-800 py-2">
              <div className="font-medium">{u.name || "Unnamed"}</div>
              <div className="text-gray-600 dark:text-gray-300">{u.email}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
