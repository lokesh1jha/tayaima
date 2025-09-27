import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Hook for handling category navigation with URL state management
 */
export function useCategoryNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Navigate to products page with specific category
  const navigateToCategory = useCallback((categoryId: string) => {
    const params = new URLSearchParams();
    params.set('categoryId', categoryId);
    router.push(`/products?${params.toString()}`);
  }, [router]);

  // Navigate to products page without category (will show first category)
  const navigateToProducts = useCallback(() => {
    router.push('/products');
  }, [router]);

  // Get current category ID from URL
  const getCurrentCategoryId = useCallback(() => {
    return searchParams.get('categoryId');
  }, [searchParams]);

  return {
    navigateToCategory,
    navigateToProducts,
    getCurrentCategoryId,
  };
}
