import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import AdminProductImagesField from "@/components/admin/AdminProductImagesField";

export default async function AdminProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "ADMIN") return null;
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { variants: true, category: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) return <div className="text-sm text-red-600">Product not found</div>;

  async function save(formData: FormData) {
    "use server";
    const name = (formData.get("name") as string)?.trim();
    const slug = (formData.get("slug") as string)?.trim();
    const description = (formData.get("description") as string) || "";
    const imagesJson = (formData.get("imagesJson") as string) || "";
    const categoryId = (formData.get("categoryId") as string) || "";

    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        slug,
        description,
        images: imagesJson ? JSON.parse(imagesJson) : [],
        categoryId: categoryId || null,
      }),
    });
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit Product</h1>
        <Link href={"/admin/products" as any}>
          <Button variant="secondary">Back</Button>
        </Link>
      </div>
      <Card className="p-6">
        <form action={save} className="grid gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input name="name" defaultValue={product.name} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Slug</label>
            <input name="slug" defaultValue={product.slug} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select name="categoryId" defaultValue={product.categoryId || ""} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900">
              <option value="">-- None --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea name="description" defaultValue={product.description || ""} rows={4} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Images</label>
            <AdminProductImagesField initial={product.images || []} />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
