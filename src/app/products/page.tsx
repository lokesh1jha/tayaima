"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { Sidebar, SidebarBody } from "@/components/ui/sidebar";
import { SkeletonProductCard, Skeleton } from "@/components/ui/Skeleton";
import ProductCard from "@/components/ProductCard";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { IconMenu2, IconX, IconChevronDown, IconChevronRight } from "@tabler/icons-react";

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const categoryIdFromUrl = searchParams.get('categoryId');
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(categoryIdFromUrl);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set()); // State for expanded parent categories
  const categoryRef = useRef<HTMLDivElement>(null);

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
    setIsCategoryOpen(false); // Close category sidebar on mobile after selection
  };

  // Handle parent category toggle
  const toggleParentCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Handle click outside to close category sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    };

    if (isCategoryOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCategoryOpen]);

  // Loading state for initial load
  if (categoriesLoading) {
    return (
      <div className="w-full py-8">
        <div className="grid grid-cols-[100px_1fr] md:grid-cols-[280px_1fr] gap-4 md:gap-0">
          {/* Sidebar Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-16" />
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </div>
          
          {/* Main Content Skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-10 w-full max-w-md" />
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <SkeletonProductCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error states
  if (categoriesError) {
    return (
      <div className="w-full py-8">
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
      <div className="w-full py-8">
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
    <div className="w-full py-4 md:py-8">
      <div className="relative">
        {/* Mobile Category Toggle Button */}
        <div className="md:hidden mb-4 px-4">
          <button
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium"
          >
            {isCategoryOpen ? <IconX className="w-4 h-4" /> : <IconMenu2 className="w-4 h-4" />}
            Categories
          </button>
        </div>

        {/* Category Sidebar - Mobile (Overlay) */}
        {isCategoryOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setIsCategoryOpen(false)}>
            <div 
              ref={categoryRef}
              className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Categories
                  </h3>
                  <button
                    onClick={() => setIsCategoryOpen(false)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  >
                    <IconX className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex flex-col gap-1">
                  {categories
                    .filter(cat => !cat.parentId) // Only show parent categories
                    .map((parentCategory) => {
                      const isExpanded = expandedCategories.has(parentCategory.id);
                      const hasChildren = parentCategory.children && parentCategory.children.length > 0;
                      
                      return (
                        <div key={parentCategory.id} className="space-y-1">
                          {/* Parent Category */}
                          <button
                            onClick={() => hasChildren ? toggleParentCategory(parentCategory.id) : handleCategorySelect(parentCategory.id)}
                            className={`w-full text-left px-3 py-2 rounded text-sm transition flex items-center justify-between ${
                              selectedCategoryId === parentCategory.id 
                                ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium" 
                                : "hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-base">{parentCategory.icon}</span>
                              <span className="truncate">{parentCategory.name}</span>
                            </div>
                            {hasChildren && (
                              <div className="text-gray-400">
                                {isExpanded ? (
                                  <IconChevronDown className="w-4 h-4" />
                                ) : (
                                  <IconChevronRight className="w-4 h-4" />
                                )}
                              </div>
                            )}
                          </button>

                          {/* Sub-categories */}
                          {hasChildren && isExpanded && (
                            <div className="ml-4 space-y-1">
                              {parentCategory.children!.map((child) => (
                                <button
                                  key={child.id}
                                  onClick={() => handleCategorySelect(child.id)}
                                  className={`w-full text-left px-2 py-1.5 rounded text-xs transition flex items-center justify-between ${
                                    selectedCategoryId === child.id 
                                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium" 
                                      : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                                  }`}
                                >
                                  <span className="truncate">{child.name}</span>
                                  {child._count && child._count.products > 0 && (
                                    <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded-full">
                                      {child._count.products}
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div className="grid grid-cols-[280px_1fr] gap-6">
          {/* Desktop Category Sidebar */}
          <div className="bg-white dark:bg-gray-900 p-6 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Categories
            </h3>
            <div className="flex flex-col gap-1">
              {categories
                .filter(cat => !cat.parentId) // Only show parent categories
                .map((parentCategory) => {
                  const isExpanded = expandedCategories.has(parentCategory.id);
                  const hasChildren = parentCategory.children && parentCategory.children.length > 0;
                  
                  return (
                    <div key={parentCategory.id} className="space-y-1">
                      {/* Parent Category */}
                      <button
                        onClick={() => hasChildren ? toggleParentCategory(parentCategory.id) : handleCategorySelect(parentCategory.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                          selectedCategoryId === parentCategory.id 
                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-sm" 
                            : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{parentCategory.icon}</span>
                          <span className="truncate">{parentCategory.name}</span>
                        </div>
                        {hasChildren && (
                          <div className="text-gray-400">
                            {isExpanded ? (
                              <IconChevronDown className="w-4 h-4" />
                            ) : (
                              <IconChevronRight className="w-4 h-4" />
                            )}
                          </div>
                        )}
                      </button>

                      {/* Sub-categories */}
                      {hasChildren && isExpanded && (
                        <div className="ml-4 space-y-1">
                          {parentCategory.children!.map((child) => (
                            <button
                              key={child.id}
                              onClick={() => handleCategorySelect(child.id)}
                              className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 flex items-center justify-between ${
                                selectedCategoryId === child.id 
                                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800" 
                                  : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                              }`}
                            >
                              <span className="truncate">{child.name}</span>
                              {child._count && child._count.products > 0 && (
                                <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded-full">
                                  {child._count.products}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Desktop Products */}
          <div className="min-h-screen">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Our Products</h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Discover fresh groceries and daily essentials
                  </p>
                </div>
                {productsFetching && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
                    <div className="w-4 h-4 bg-gray-300 rounded animate-pulse" />
                    <span>Loading products...</span>
                  </div>
                )}
              </div>

              <div className="max-w-lg">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-base"
                />
              </div>
            </div>

            {/* Desktop Products Grid */}
            {productsLoading ? (
              <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <SkeletonProductCard key={i} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm p-12">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">No products found</h3>
                  <p className="text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    {searchTerm 
                      ? "Try adjusting your search terms or browse our categories" 
                      : "No products available for this category at the moment"
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
          </div>
        </div>

        {/* Mobile Products */}
        <div className="md:hidden px-4">
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-lg font-bold">Our Products</h1>
              {productsFetching && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-3 h-3 bg-gray-300 rounded animate-pulse" />
                  <span>Loading...</span>
                </div>
              )}
            </div>

            <div className="max-w-sm">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>

          {/* Mobile Products Grid */}
          {productsLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <SkeletonProductCard key={i} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <Card className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">No products found</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {searchTerm 
                  ? "Try adjusting your search terms or browse our categories" 
                  : "No products available for this category at the moment"
                }
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        {/* Cache Status Debug Info (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 md:mt-8 p-3 md:p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs mx-4 md:mx-0">
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
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="w-full py-8">
        <div className="grid grid-cols-[100px_1fr] md:grid-cols-[280px_1fr] gap-4 md:gap-0">
          <div className="space-y-4">
            <Skeleton className="h-6 w-16" />
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-10 w-full max-w-md" />
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <SkeletonProductCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}
