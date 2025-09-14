"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import dynamic from "next/dynamic";
import { LoadingPage } from "@/components/ui/LoadingSpinner";

const AdminProductImagesField = dynamic(() => import("@/components/admin/AdminProductImagesField"), { ssr: false });

interface ProductVariant {
  id: string;
  unit: string;
  amount: number;
  price: number;
  stock: number;
  sku?: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  images: string[];
  variants: ProductVariant[];
  createdAt: string;
}

interface Category { id: string; name: string; slug: string }

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (e) {
      setCategories([]);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price / 100);
  };

  const formatUnit = (unit: string, amount: number) => {
    const unitMap: { [key: string]: string } = {
      PIECE: "piece",
      KG: "kg",
      G: "g",
      LITER: "L",
      ML: "ml",
      OTHER: "unit"
    };
    return `${amount}${unitMap[unit] || unit.toLowerCase()}`;
  };

  const getTotalStock = (variants: ProductVariant[]) => {
    return variants.reduce((sum, v) => sum + v.stock, 0);
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setProducts(products.filter(p => p.id !== productId));
        alert("Product deleted successfully");
      } else {
        alert("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Error deleting product");
    }
  };

  if (loading) {
    return <LoadingPage message="Loading products..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Products
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage your product catalog
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Card className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">No products found</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {searchTerm ? "Try adjusting your search terms" : "No products available. Add your first product to get started."}
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowAddForm(true)}>
              Add First Product
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-square relative bg-gray-100 dark:bg-gray-800">
                {product.images.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                  {product.name}
                </h3>
                
                {product.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Variants:</span> {product.variants.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Total Stock:</span> {getTotalStock(product.variants)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Price Range:</span>{" "}
                    {formatPrice(Math.min(...product.variants.map(v => v.price)))} -{" "}
                    {formatPrice(Math.max(...product.variants.map(v => v.price)))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/admin/products/${product.id}` as any} className="flex-1">
                    <Button variant="secondary" className="w-full">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() => deleteProduct(product.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Add New Product</h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-500"
                >
                  ✕
                </Button>
              </div>
              
              <form className="space-y-4" onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const name = (form.elements.namedItem("name") as HTMLInputElement).value;
                const slug = (form.elements.namedItem("slug") as HTMLInputElement).value;
                const description = (form.elements.namedItem("description") as HTMLTextAreaElement).value;
                const imagesJson = (form.elements.namedItem("imagesJson") as HTMLInputElement)?.value || "[]";
                const categoryId = (form.elements.namedItem("categoryId") as HTMLSelectElement).value || undefined;
                const images = JSON.parse(imagesJson || "[]");

                const res = await fetch("/api/admin/products", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name,
                    slug,
                    description,
                    images,
                    variants: [{ unit: "PIECE", amount: 1, price: 10000, stock: 0 }],
                    categoryId,
                  }),
                });
                if (res.ok) {
                  setShowAddForm(false);
                  fetchProducts();
                } else {
                  alert("Failed to add product");
                }
              }}>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Product Name *
                  </label>
                  <Input
                    name="name"
                    type="text"
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
                    placeholder="product-slug"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category
                  </label>
                  <select
                    name="categoryId"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter product description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Images</label>
                  <AdminProductImagesField />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1">
                    Add Product
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
