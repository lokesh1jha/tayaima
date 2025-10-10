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
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);

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

  // Auto-expand category that contains the selected category
  useEffect(() => {
    if (selectedCategoryId && categories.length > 0) {
      // Find the parent category of the selected category
      const parentCategory = categories.find(category => 
        category.children?.some(child => child.id === selectedCategoryId)
      );
      
      if (parentCategory) {
        setExpandedCategoryId(parentCategory.id);
      } else {
        // If selected category is a parent category itself, expand it
        const isParentCategory = categories.find(category => category.id === selectedCategoryId);
        if (isParentCategory) {
          setExpandedCategoryId(selectedCategoryId);
        }
      }
    }
  }, [selectedCategoryId, categories]);

  // Fetch products for selected category (cached per categoryId)
  const { 
    data: products = [], 
    isLoading: productsLoading, 
    error: productsError,
    isFetching: productsFetching
  } = useProducts({ 
    categoryId: selectedCategoryId,
    limit: 20,
    page: 1,
    enabled: !!selectedCategoryId // Only fetch when we have a category
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

  // Handle category expansion (for parent categories)
  const handleCategoryExpand = (categoryId: string) => {
    if (expandedCategoryId === categoryId) {
      // If clicking on already expanded category, collapse it
      setExpandedCategoryId(null);
    } else {
      // Expand the clicked category
      setExpandedCategoryId(categoryId);
    }
  };

  // Loading state for initial load
  if (categoriesLoading) {
    return <LoadingPage message="Loading categories..." />;
  }

  // Error states
  if (categoriesError) {
    console.error('Categories error:', categoriesError);
    return (
      <div className="container max-w-screen-2xl py-8">
        <Card className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2 text-red-600">Error Loading Categories</h3>
          <p className="text-gray-600 dark:text-gray-300">
            {categoriesError instanceof Error ? categoriesError.message : 'Failed to load categories'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Reload Page
          </button>
        </Card>
      </div>
    );
  }

  if (productsError) {
    console.error('Products error:', productsError);
    return (
      <div className="container max-w-screen-2xl py-8">
        <Card className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2 text-red-600">Error Loading Products</h3>
          <p className="text-gray-600 dark:text-gray-300">
            {productsError instanceof Error ? productsError.message : 'Failed to load products'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Reload Page
          </button>
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
                  {categories.map((category) => {
                    const isExpanded = expandedCategoryId === category.id;
                    const hasChildren = category.children && category.children.length > 0;
                    
                    return (
                      <div key={category.id} className="flex flex-col">
                        {/* Parent Category */}
                        <div className="flex items-center">
                          <button
                            onClick={() => handleCategorySelect(category.id)}
                            className={`flex-1 text-left px-3 py-2 rounded-md text-sm font-medium transition ${
                              selectedCategoryId === category.id 
                                ? "bg-white dark:bg-neutral-700 shadow" 
                                : "hover:bg-white/60 dark:hover:bg-neutral-700/60"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {category.icon && <span className="text-lg">{category.icon}</span>}
                              <span>{category.name}</span>
                            </div>
                          </button>
                          
                          {/* Expand/Collapse Button */}
                          {hasChildren && (
                            <button
                              onClick={() => handleCategoryExpand(category.id)}
                              className="ml-1 p-1 rounded hover:bg-white/40 dark:hover:bg-neutral-700/40 transition"
                              aria-label={isExpanded ? "Collapse" : "Expand"}
                            >
                              <svg
                                className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
                                  isExpanded ? "rotate-90" : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          )}
                        </div>
                        
                        {/* Child Categories - Only show when expanded */}
                        {hasChildren && isExpanded && category.children && (
                          <div className="ml-4 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
                            {category.children.map((child) => (
                              <button
                                key={child.id}
                                onClick={() => handleCategorySelect(child.id)}
                                className={`text-left px-3 py-1.5 rounded-md text-xs transition w-full ${
                                  selectedCategoryId === child.id 
                                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" 
                                    : "hover:bg-white/40 dark:hover:bg-neutral-700/40 text-gray-600 dark:text-gray-300"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-400 dark:text-gray-500">•</span>
                                  <span>{child.name}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
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
              <div className="space-y-2">
                {categories.map((category) => {
                  const isExpanded = expandedCategoryId === category.id;
                  const hasChildren = category.children && category.children.length > 0;
                  
                  return (
                    <div key={category.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                      {/* Parent Category */}
                      <div className="flex items-center">
                        <button
                          onClick={() => handleCategorySelect(category.id)}
                          className={`flex-1 text-left px-3 py-2 text-sm font-medium transition ${
                            selectedCategoryId === category.id 
                              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" 
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {category.icon && <span className="text-lg">{category.icon}</span>}
                            <span>{category.name}</span>
                          </div>
                        </button>
                        
                        {/* Expand/Collapse Button */}
                        {hasChildren && (
                          <button
                            onClick={() => handleCategoryExpand(category.id)}
                            className="p-2 text-gray-500 dark:text-gray-400"
                          >
                            <svg
                              className={`w-4 h-4 transition-transform ${
                                isExpanded ? "rotate-90" : ""
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        )}
                      </div>
                      
                      {/* Child Categories */}
                      {hasChildren && isExpanded && category.children && (
                        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                          {category.children.map((child) => (
                            <button
                              key={child.id}
                              onClick={() => handleCategorySelect(child.id)}
                              className={`w-full text-left px-6 py-2 text-sm transition ${
                                selectedCategoryId === child.id 
                                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" 
                                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400 dark:text-gray-500">•</span>
                                <span>{child.name}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
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

            {/* Breadcrumb Navigation */}
            {selectedCategoryId && (
              <div className="mb-4">
                <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <button
                    onClick={() => handleCategorySelect('')}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    All Products
                  </button>
                  {(() => {
                    const selectedCategory = categories.find(c => c.id === selectedCategoryId);
                    if (selectedCategory) {
                      return (
                        <>
                          <span>/</span>
                          <span className="text-gray-900 dark:text-gray-100 font-medium">
                            {selectedCategory.name}
                          </span>
                        </>
                      );
                    }
                    return null;
                  })()}
                </nav>
              </div>
            )}

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
              <p>Categories: {categoriesLoading ? 'Loading' : 'Cached'} ({categories.length} total)</p>
              <p>Products ({selectedCategoryId}): {productsLoading ? 'Loading' : productsFetching ? 'Fetching' : 'Cached'}</p>
              <p>Selected Category: {categories.find(c => c.id === selectedCategoryId)?.name || 'None'}</p>
              <p>Products Count: {products.length}</p>
              <p>Filtered Count: {filteredProducts.length}</p>
              <div className="mt-2">
                <p className="font-semibold">Category Hierarchy:</p>
                {categories.map(category => (
                  <div key={category.id} className="ml-2">
                    <p>• {category.name}</p>
                    {category.children?.map(child => (
                      <p key={child.id} className="ml-4">  - {child.name}</p>
                    ))}
                  </div>
                ))}
              </div>
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
