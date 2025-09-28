import { SkeletonProductCard, Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="container max-w-[1400px] py-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-8 w-48 mb-4" />
        
        {/* Category Chips Skeleton */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        
        {/* Search Bar Skeleton */}
        <div className="max-w-md">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
      
      {/* Products Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
        {Array.from({ length: 18 }).map((_, i) => (
          <SkeletonProductCard key={i} className="h-full" />
        ))}
      </div>
      
      {/* Pagination Skeleton */}
      <div className="flex justify-center mt-8">
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-10 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}


