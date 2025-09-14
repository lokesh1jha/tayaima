import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Card from "@/components/ui/Card";

export default async function AdminCategoriesPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") return null;

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Categories</h1>
      <Card className="p-4">
        <form className="flex gap-2" action={async (formData) => {
          "use server";
          const name = (formData.get("name") as string)?.trim();
          const slug = (formData.get("slug") as string)?.trim();
          if (!name || !slug) return;
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/admin/categories`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, slug }),
          });
        }}>
          <input name="name" placeholder="Name" className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" />
          <input name="slug" placeholder="slug" className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" />
          <button className="px-3 py-2 rounded border bg-gray-100 dark:bg-gray-800">Add</button>
        </form>
      </Card>
      <Card className="p-4">
        <div className="grid gap-2 text-sm">
          {categories.map((c) => (
            <div key={c.id} className="flex justify-between border-b last:border-b-0 border-gray-200 dark:border-gray-800 py-2">
              <div>{c.name}</div>
              <div className="text-gray-500">{c.slug}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
