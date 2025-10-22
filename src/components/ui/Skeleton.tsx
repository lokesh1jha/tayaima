"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-700",
        className
      )}
    />
  );
}

// Specific skeleton components for common patterns
export function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-3/4" : "w-full" // Last line is shorter
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3", className)}>
      <Skeleton className="h-6 w-3/4" />
      <SkeletonText lines={2} />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-20" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonProductCard({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn(
      "rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-gray-800",
      compact ? 'p-2 sm:p-2' : 'p-2 sm:p-3 md:p-4',
      className
    )}>
      {/* Image with gradient animation */}
      <div className={cn("aspect-square relative mb-2 sm:mb-3 md:mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden", compact && 'mb-2')}>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse" />
      </div>
      
      {/* Product Name */}
      <Skeleton className={cn(
        "h-4 w-full mb-2",
        compact ? 'h-3 sm:h-4' : 'h-3 sm:h-4 md:h-5'
      )} />
      <Skeleton className={cn(
        "h-4 w-3/4 mb-2",
        compact ? 'h-3 sm:h-4' : 'h-3 sm:h-4 md:h-5'
      )} />
      
      {/* Category */}
      <Skeleton className={cn(
        "h-3 w-1/2 mb-2",
        compact ? 'h-2 sm:h-3' : 'h-2 sm:h-3 md:h-4'
      )} />
      
      {/* Price and Variant Row */}
      <div className={cn("flex items-center justify-between gap-2", compact ? 'mt-2' : 'mt-2 sm:mt-3')}>
        <Skeleton className={cn(
          "h-4 w-16",
          compact ? 'h-3 sm:h-4' : 'h-3 sm:h-4 xl:h-5'
        )} />
        
        {/* Variant Dropdown Skeleton */}
        <Skeleton className={cn(
          "h-6 w-16 rounded-md",
          compact ? 'h-5 w-12' : 'h-5 sm:h-6 w-12 sm:w-16'
        )} />
      </div>

      {/* Cart Button Row */}
      <div className={cn("flex justify-center", compact ? 'mt-2' : 'mt-2')}>
        <Skeleton className={cn(
          "h-8 w-full rounded-md",
          compact ? 'h-6' : 'h-6 sm:h-7'
        )} />
      </div>
    </div>
  );
}

export function SkeletonCategoryDropdown({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      <Skeleton className="h-4 w-32" />
      <div className="relative">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonCategoryDetails({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      
      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-6 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-4 w-28 mb-2" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        </div>
        
        {/* Right Column */}
        <div className="space-y-4">
          <div>
            <Skeleton className="h-4 w-28 mb-2" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div>
            <Skeleton className="h-4 w-28 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonForm({ fields = 3, className }: { fields?: number; className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
}

export function SkeletonStats({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}
