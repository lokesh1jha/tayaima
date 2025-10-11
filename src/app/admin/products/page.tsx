"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { LoadingPage } from "@/components/ui/LoadingSpinner";
import { SkeletonProductCard, SkeletonForm, Skeleton } from "@/components/ui/Skeleton";
import Modal, { ConfirmModal } from "@/components/ui/Modal";
import { toast } from "sonner";
import ProductVariantManager, { ProductVariant } from "@/components/admin/ProductVariantManager";
import MetadataManager from "@/components/admin/MetadataManager";
import AdminProductImagesField from "@/components/admin/AdminProductImagesField";
import { slugify } from "@/lib/slugify";
import { useDebounce } from "@/hooks/useDebounce";

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  images: string[];
  variants: ProductVariant[];
  createdAt: string;
  categoryId?: string | null;
}

interface Category { id: string; name: string; slug: string }

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categorySearch, setCategorySearch] = useState<string>("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const productsPerPage = 20;
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [metadata, setMetadata] = useState<Record<string, any>>({});
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    productId: string;
    productName: string;
  }>({
    isOpen: false,
    productId: "",
    productName: "",
  });

  // Add Category Modal state
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategorySlug, setNewCategorySlug] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [formCategoryId, setFormCategoryId] = useState<string>("");

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // Fetch products when search term, category, or page changes
  useEffect(() => {
    fetchProducts();
  }, [debouncedSearchTerm, selectedCategory, currentPage]);

  // Reset to page 1 when search or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedCategory]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: productsPerPage.toString(),
      });

      if (debouncedSearchTerm && debouncedSearchTerm.trim().length >= 3) {
        params.append('search', debouncedSearchTerm.trim());
      }

      if (selectedCategory) {
        params.append('categoryId', selectedCategory);
      }

      const response = await fetch(`/api/admin/products/search?${params}`);
      const data = await response.json();

      if (response.ok) {
        setProducts(data.products || []);
        setTotalProducts(data.pagination?.totalCount || 0);
        setTotalPages(data.pagination?.totalPages || 1);
        setHasNext(data.pagination?.hasNext || false);
        setHasPrev(data.pagination?.hasPrev || false);
      } else {
        console.error("Error fetching products:", data.error);
        toast.error("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories || []);
      return data.categories || [];
    } catch (e) {
      setCategories([]);
      return [] as Category[];
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

  const deleteProduct = async (productId: string, productName: string) => {
    setDeleteModal({
      isOpen: true,
      productId,
      productName,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`/api/admin/products/${deleteModal.productId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setProducts(products.filter(p => p.id !== deleteModal.productId));
        toast.success(`Product "${deleteModal.productName}" deleted successfully`);
      } else {
        const error = await response.text();
        toast.error(`Failed to delete product: ${error}`);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Error deleting product");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-9 w-32 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>

        {/* Filters Skeleton */}
        <div className="flex gap-4 items-end">
          <div className="flex-1 max-w-xs">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonProductCard key={i} />
          ))}
        </div>
      </div>
    );
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

      {/* Filters */}
      <div className="flex gap-4 items-end">
        {/* Category Filter */}
        <div className="flex-1 max-w-xs" ref={categoryDropdownRef}>
          <label className="block text-sm font-medium mb-1">Filter by Category</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search categories..."
              value={categorySearch}
              onChange={(e) => {
                setCategorySearch(e.target.value);
                setShowCategoryDropdown(true);
              }}
              onFocus={() => setShowCategoryDropdown(true)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 dark:border-gray-700"
            />
            {showCategoryDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                <div
                  className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => {
                    setSelectedCategory("");
                    setCategorySearch("");
                    setShowCategoryDropdown(false);
                    setCurrentPage(1);
                  }}
                >
                  All Categories
                </div>
                {categories
                  .filter(cat => cat.name.toLowerCase().includes(categorySearch.toLowerCase()))
                  .map(category => (
                    <div
                      key={category.id}
                      className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setCategorySearch(category.name);
                        setShowCategoryDropdown(false);
                        setCurrentPage(1); // Reset to first page when filtering
                      }}
                    >
                      {category.name}
                    </div>
                  ))}
              </div>
            )}
          </div>
          {selectedCategory && (
            <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Filtered by: {categories.find(c => c.id === selectedCategory)?.name}
              <button
                onClick={() => {
                  setSelectedCategory("");
                  setCategorySearch("");
                  setCurrentPage(1);
                }}
                className="ml-2 text-red-600 hover:text-red-700"
              >
                Clear
              </button>
            </div>
          )}
        </div>


        {/* Clear Filters Button */}
        {selectedCategory && (
          <div className="flex items-end">
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedCategory("");
                setCategorySearch("");
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="cursor-pointer" 
              onClick={() => window.location.href = `/admin/products/${product.id}`}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
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
              
              <div className="p-3">
                <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                  {product.name}
                </h3>
                
                <div className="space-y-1 mb-3">
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Variants:</span> {product.variants.length}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Stock:</span> {getTotalStock(product.variants)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Price:</span>{" "}
                    {formatPrice(Math.min(...product.variants.map(v => v.price)))}
                    {product.variants.length > 1 && ` - ${formatPrice(Math.max(...product.variants.map(v => v.price)))}`}
                  </div>
                </div>

                <div className="flex gap-1">
                  <Button 
                    variant="secondary" 
                    className="flex-1 text-xs py-1 h-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/admin/products/${product.id}`;
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProduct(product.id, product.name);
                    }}
                    className="text-red-600 hover:text-red-700 text-xs py-1 h-7 px-2"
                  >
                    Del
                  </Button>
                </div>
              </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="ghost"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2"
          >
            ←
          </Button>
          
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "secondary" : "ghost"}
                onClick={() => setCurrentPage(pageNum)}
                className="px-3 py-2 min-w-[40px]"
              >
                {pageNum}
              </Button>
            ))}
          </div>
          
          <Button
            variant="ghost"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2"
          >
            →
          </Button>
        </div>
      )}

      {/* Products Summary */}
      {totalProducts > 0 && (
        <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
          Showing {((currentPage - 1) * productsPerPage) + 1} to {Math.min(currentPage * productsPerPage, totalProducts)} of {totalProducts} products
          {selectedCategory && ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
          {searchTerm && ` matching "${searchTerm}"`}
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
                  if (variants.length === 0) {
                    toast.error("At least one variant is required");
                    return;
                  }

                  const res = await fetch("/api/admin/products", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name: name.trim(),
                      description: description.trim() || null,
                      images,
                      variants,
                      meta: Object.keys(meta).length > 0 ? meta : null,
                      categoryId: categoryId || null,
                    }),
                  });
                  
                  if (res.ok) {
                    setShowAddForm(false);
                    setVariants([]);
                    setMetadata({});
                    setCurrentPage(1);
                    fetchProducts();
                    toast.success("Product added successfully!");
                  } else {
                    const error = await res.json();
                    toast.error(error.error || "Failed to add product");
                  }
                } catch (error) {
                  console.error("Error adding product:", error);
                  toast.error("Failed to add product. Please check your input.");
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
                  <p className="text-xs text-gray-500 mt-1">
                    URL slug will be generated automatically from the product name
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category
                  </label>
                  <div className="flex items-start gap-2">
                    <select
                      name="categoryId"
                      value={formCategoryId}
                      onChange={(e) => setFormCategoryId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900"
                    >
                      <option value="">-- Select category --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setNewCategoryName("");
                        setNewCategorySlug("");
                        setShowAddCategoryModal(true);
                      }}
                    >
                      Add new Category
                    </Button>
                  </div>
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

                {/* Product Variants */}
                <div>
                  <ProductVariantManager 
                    name="variantsJson"
                    onChange={setVariants}
                  />
                </div>

                {/* Product Metadata */}
                <div>
                  <MetadataManager 
                    name="metaJson"
                    onChange={setMetadata}
                  />
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteModal.productName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Add Category Modal */}
      <Modal
        isOpen={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        title="Add New Category"
        size="sm"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const name = newCategoryName.trim();
            const slug = newCategorySlug.trim();
            if (!name) {
              toast.error("Category name is required");
              return;
            }
            try {
              setCreatingCategory(true);
              const res = await fetch("/api/admin/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, slug: slug || undefined }) // Let API auto-generate if empty
              });
              if (res.ok) {
                const created = await res.json();
                await fetchCategories();
                setFormCategoryId(created.id);
                setShowAddCategoryModal(false);
                setNewCategoryName("");
                setNewCategorySlug("");
                toast.success("Category added");
              } else {
                const err = await res.json().catch(() => ({ error: "Failed to add category" }));
                toast.error(err.error || "Failed to add category");
              }
            } catch (error) {
              toast.error("Failed to add category");
            } finally {
              setCreatingCategory(false);
            }
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={newCategoryName}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewCategoryName(val);
                  setNewCategorySlug(slugify(val));
                }}
                placeholder="e.g. Snacks"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug (Auto-generated)</label>
              <Input
                value={newCategorySlug}
                onChange={(e) => setNewCategorySlug(e.target.value)}
                placeholder="e.g. snacks (auto-generated from name)"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL-friendly version. Auto-generated from name but can be customized.
              </p>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAddCategoryModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={creatingCategory}>
              {creatingCategory ? "Adding..." : "Add Category"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
