import { Skeleton, SkeletonCard } from "./Skeleton";

export function CheckoutSkeleton() {
  return (
    <div className="container max-w-[1400px] py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Address & Payment */}
        <div className="lg:col-span-2 space-y-8">
          <SkeletonCard className="p-6 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </SkeletonCard>
          
          <SkeletonCard className="p-6 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </SkeletonCard>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-1 space-y-8">
          <SkeletonCard className="p-6 space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
            <Skeleton className="h-10 w-full mt-4" />
          </SkeletonCard>
        </div>
      </div>
    </div>
  );
}
