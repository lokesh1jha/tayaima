"use client";

import { Skeleton, SkeletonProductCard } from "@/components/ui/Skeleton";

export function CategoriesSidebarSkeleton() {
  return (
    <div className="hidden md:block">
      <div className="h-full w-full bg-neutral-100 dark:bg-neutral-800 p-4 border-r border-gray-200 dark:border-gray-800">
        <div className="mb-3">
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="flex flex-col gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center">
              <Skeleton className="flex-1 h-10 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductsGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
      {Array.from({ length: 10 }).map((_, i) => (
        <SkeletonProductCard key={i} />
      ))}
    </div>
  );
}

export function ProductsPageSkeleton() {
  return (
    <div className="container max-w-screen-2xl py-8">
      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-0">
        {/* Categories Sidebar */}
        <CategoriesSidebarSkeleton />

        {/* Products Section */}
        <div className="md:pl-0">
          <div className="mb-4 md:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
              <Skeleton className="h-8 w-48" />
            </div>
            
            {/* Mobile Category Drawer Toggle */}
            <div className="md:hidden mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          </div>

          {/* Breadcrumb Navigation */}
          <div className="mb-3 md:mb-4">
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Products Grid */}
          <ProductsGridSkeleton />
        </div>
      </div>
    </div>
  );
}

export function ProductsLoadingSkeleton() {
  return (
    <div className="container max-w-screen-2xl py-8">
      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-0">
        {/* Categories Sidebar */}
        <CategoriesSidebarSkeleton />

        {/* Products Section */}
        <div className="md:pl-0">
          <div className="mb-4 md:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
              <Skeleton className="h-8 w-48" />
            </div>
            
            {/* Mobile Category Drawer Toggle */}
            <div className="md:hidden mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          </div>

          {/* Breadcrumb Navigation */}
          <div className="mb-3 md:mb-4">
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Products Grid */}
          <ProductsGridSkeleton />
        </div>
      </div>
    </div>
  );
}
