"use client";

import { Skeleton, SkeletonProductCard, SkeletonText } from "@/components/ui/Skeleton";

export function BannerSkeleton() {
  return (
    <div className="w-full aspect-[21/8] sm:aspect-[21/4] bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 animate-pulse">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}

export function CategoryChipsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap gap-2 justify-center">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-24 rounded-full" />
        ))}
      </div>
    </div>
  );
}

export function FeaturedProductsSkeleton() {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <Skeleton className="h-8 w-64 mx-auto mb-4" />
        <SkeletonText lines={2} className="max-w-2xl mx-auto" />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonProductCard key={i} />
        ))}
      </div>
    </section>
  );
}

export function CategorySectionSkeleton() {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <Skeleton className="h-8 w-48 mx-auto mb-4" />
        <SkeletonText lines={1} className="max-w-xl mx-auto" />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonProductCard key={i} />
        ))}
      </div>
    </section>
  );
}

export function TestimonialsSkeleton() {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <Skeleton className="h-8 w-64 mx-auto mb-4" />
        <SkeletonText lines={2} className="max-w-2xl mx-auto" />
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <SkeletonText lines={3} />
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, j) => (
                <Skeleton key={j} className="w-4 h-4 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TrustedStoreSkeleton() {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <Skeleton className="h-8 w-64 mx-auto mb-4" />
        <SkeletonText lines={3} className="max-w-3xl mx-auto" />
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="text-center space-y-3">
            <Skeleton className="w-16 h-16 mx-auto rounded-full" />
            <Skeleton className="h-5 w-32 mx-auto" />
            <SkeletonText lines={2} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function LandingPageSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Banner */}
      <section className="w-full pt-4">
        <BannerSkeleton />
      </section>

      {/* Category Chips */}
      <CategoryChipsSkeleton />

      {/* Featured Products */}
      <FeaturedProductsSkeleton />

      {/* Category Sections */}
      {Array.from({ length: 2 }).map((_, i) => (
        <CategorySectionSkeleton key={i} />
      ))}

      {/* Testimonials */}
      <TestimonialsSkeleton />

      {/* Trusted Store */}
      <TrustedStoreSkeleton />
    </div>
  );
}
