"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";
import { toast } from "sonner";
import { LoadingPage } from "@/components/ui/LoadingSpinner";
import AdminProductImagesField from "@/components/admin/AdminProductImagesField";
import ProductVariantManager, { ProductVariant } from "@/components/admin/ProductVariantManager";
import MetadataManager from "@/components/admin/MetadataManager";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  images: string[];
  categoryId: string | null;
  meta: Record<string, any> | null;
  variants: ProductVariant[];
  category?: {
    id: string;
    name: string;
  } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function AdminProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [metadata, setMetadata] = useState<Record<string, any>>({});

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
      fetchCategories();
    }
  }, [params.id]);

  useEffect(() => {
    if (product) {
      setVariants(product.variants || []);
      setMetadata(product.meta || {});
    }
  }, [product]);

  const fetchProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/products/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      } else {
        toast.error("Failed to fetch product");
        router.push("/admin/products");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to fetch product");
      router.push("/admin/products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!product) return;

    setSaving(true);
    const form = e.currentTarget as HTMLFormElement;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const slug = (form.elements.namedItem("slug") as HTMLInputElement).value;
    const description = (form.elements.namedItem("description") as HTMLTextAreaElement).value;
    const imagesJson = (form.elements.namedItem("imagesJson") as HTMLInputElement)?.value || "[]";
    const variantsJson = (form.elements.namedItem("variantsJson") as HTMLInputElement)?.value || "[]";
    const metaJson = (form.elements.namedItem("metaJson") as HTMLInputElement)?.value || "{}";
    const categoryId = (form.elements.namedItem("categoryId") as HTMLSelectElement).value || undefined;

    try {
      const images = JSON.parse(imagesJson || "[]");
      const variants = JSON.parse(variantsJson || "[]");
      const meta = JSON.parse(metaJson || "{}");

      // Validation
      if (!name.trim()) {
        toast.error("Product name is required");
        return;
      }
      if (!slug.trim()) {
        toast.error("Product slug is required");
        return;
      }
      if (variants.length === 0) {
        toast.error("At least one variant is required");
        return;
      }

      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || null,
          images,
          variants,
          meta: Object.keys(meta).length > 0 ? meta : null,
          categoryId: categoryId || null,
        }),
      });

      if (response.ok) {
        toast.success("Product updated successfully!");
        router.push("/admin/products");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product. Please check your input.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <LoadingPage message="Loading product..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-8">
        <Card className="p-8 text-center">
          <p className="text-red-600">Product not found</p>
          <Link href="/admin/products">
            <Button variant="secondary" className="mt-4">
              Back to Products
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit Product</h1>
        <Link href="/admin/products">
          <Button variant="secondary">Back to Products</Button>
        </Link>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Product Name *
              </label>
              <Input
                name="name"
                type="text"
                defaultValue={product.name}
                placeholder="Enter product name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Slug *
              </label>
              <Input
                name="slug"
                type="text"
                defaultValue={product.slug}
                placeholder="product-slug"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Category
            </label>
            <select
              name="categoryId"
              defaultValue={product.categoryId || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 dark:border-gray-700"
            >
              <option value="">-- Select category --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              name="description"
              defaultValue={product.description || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Enter product description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Images</label>
            <AdminProductImagesField initial={product.images || []} />
          </div>

          {/* Product Variants */}
          <div>
            <ProductVariantManager 
              name="variantsJson"
              initialVariants={variants}
              onChange={setVariants}
            />
          </div>

          {/* Product Metadata */}
          <div>
            <MetadataManager 
              name="metaJson"
              initialMeta={metadata}
              onChange={setMetadata}
            />
          </div>

          <div className="flex gap-4">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={saving}
            >
              {saving ? "Saving..." : "Update Product"}
            </Button>
            <Link href="/admin/products" className="flex-1">
              <Button
                type="button"
                variant="secondary"
                className="w-full"
              >
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}