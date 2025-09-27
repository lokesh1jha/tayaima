"use client";

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductsPrefetchProps {
  categories: Category[];
}

/**
 * Component to prefetch products for the first category
 * This improves performance when users navigate to /products
 */
export default function ProductsPrefetch({ categories }: ProductsPrefetchProps) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Prefetch products for the first category
    if (categories.length > 0) {
      const firstCategoryId = categories[0].id;
      
      // Prefetch products for first category
      queryClient.prefetchQuery({
        queryKey: ['products', { categoryId: firstCategoryId, limit: 20, page: 1 }],
        queryFn: async () => {
          const params = new URLSearchParams();
          params.set('limit', '20');
          params.set('page', '1');
          params.set('categoryId', firstCategoryId);
          
          const response = await fetch(`/api/products?${params.toString()}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch products: ${response.statusText}`);
          }
          
          const data = await response.json();
          return data.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
      });

      // Also prefetch categories if not already cached
      queryClient.prefetchQuery({
        queryKey: ['categories'],
        queryFn: async () => {
          const response = await fetch('/api/categories');
          if (!response.ok) {
            throw new Error(`Failed to fetch categories: ${response.statusText}`);
          }
          const data = await response.json();
          return data.categories;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
      });
    }
  }, [categories, queryClient]);

  // This component doesn't render anything
  return null;
}
