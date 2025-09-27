"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { Sidebar, SidebarBody } from "@/components/ui/sidebar";
import LoadingSpinner, { LoadingPage } from "@/components/ui/LoadingSpinner";
import ProductCard from "@/components/ProductCard";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const categoryIdFromUrl = searchParams.get('categoryId');
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(categoryIdFromUrl);

  // Fetch categories (cached)
  const { 
    data: categories = [], 
    isLoading: categoriesLoading, 
    error: categoriesError 
  } = useCategories();

  // Set first category as default if no category is selected and categories are loaded
  useEffect(() => {
    if (!selectedCategoryId && categories.length > 0 && !categoryIdFromUrl) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId, categoryIdFromUrl]);

  // Fetch products for selected category (cached per categoryId)
  const { 
    data: products = [], 
    isLoading: productsLoading, 
    error: productsError,
    isFetching: productsFetching
  } = useProducts({ 
    categoryId: selectedCategoryId,
    limit: 20,
    page: 1
  });

  // Filter products by search term
  const filteredProducts = products.filter(product => {
    if (!searchTerm) return true;
    const matchesText = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesText;
  });

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSearchTerm(""); // Clear search when switching categories
  };

  // Loading state for initial load
  if (categoriesLoading) {
    return <LoadingPage message="Loading categories..." />;
  }

  // Error states
  if (categoriesError) {
    return (
      <div className="container max-w-screen-2xl py-8">
        <Card className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2 text-red-600">Error Loading Categories</h3>
          <p className="text-gray-600 dark:text-gray-300">
            {categoriesError instanceof Error ? categoriesError.message : 'Failed to load categories'}
          </p>
        </Card>
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="container max-w-screen-2xl py-8">
        <Card className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2 text-red-600">Error Loading Products</h3>
          <p className="text-gray-600 dark:text-gray-300">
            {productsError instanceof Error ? productsError.message : 'Failed to load products'}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-screen-2xl py-8">
      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-0">
        {/* Left: Category Sidebar - Desktop */}
        <div className="hidden md:block">
          <Sidebar animate={false} open={true}>
            <SidebarBody className="h-full !px-0 !py-0">
              <div className="h-full w-full bg-neutral-100 dark:bg-neutral-800 p-4 border-r border-gray-200 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                  Categories
                  {categoriesLoading && <LoadingSpinner className="inline ml-2 w-4 h-4" />}
                </h3>
                <div className="flex flex-col gap-1">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className={`text-left px-3 py-2 rounded-md text-sm transition ${
                        selectedCategoryId === category.id 
                          ? "bg-white dark:bg-neutral-700 shadow" 
                          : "hover:bg-white/60 dark:hover:bg-neutral-700/60"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </SidebarBody>
          </Sidebar>
        </div>

        {/* Right: Products */}
        <div className="md:pl-0">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-3xl font-bold">Our Products</h1>
              {productsFetching && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <LoadingSpinner className="w-4 h-4" />
                  <span>Loading products...</span>
                </div>
              )}
            </div>
            
            {/* Mobile Category Selector */}
            <div className="md:hidden mb-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Categories</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                      selectedCategoryId === category.id 
                        ? "bg-blue-600 text-white shadow-md" 
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-w-md">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Products Grid */}
          {productsLoading ? (
            <LoadingPage message="Loading products..." />
          ) : filteredProducts.length === 0 ? (
            <Card className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {searchTerm 
                  ? "Try adjusting your search terms" 
                  : "No products available for this category"
                }
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Cache Status Debug Info (remove in production) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs">
              <h4 className="font-semibold mb-2">Cache Status (Dev Only):</h4>
              <p>Categories: {categoriesLoading ? 'Loading' : 'Cached'}</p>
              <p>Products ({selectedCategoryId}): {productsLoading ? 'Loading' : productsFetching ? 'Fetching' : 'Cached'}</p>
              <p>Selected Category: {categories.find(c => c.id === selectedCategoryId)?.name || 'None'}</p>
              <p>Products Count: {products.length}</p>
              <p>Filtered Count: {filteredProducts.length}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<LoadingPage message="Loading..." />}>
      <ProductsPageContent />
    </Suspense>
  );
}
