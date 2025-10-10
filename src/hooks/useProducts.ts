import { useQuery } from '@tanstack/react-query';

export interface ProductVariant {
  id: string;
  unit: string;
  amount: number;
  price: number;
  stock: number;
  sku?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  images: string[];
  variants?: ProductVariant[]; // Optional since API might not include variants
  createdAt: string;
  categoryId?: string | null;
}

interface ProductsResponse {
  data: Product[];
}

interface UseProductsOptions {
  categoryId?: string | null;
  limit?: number;
  page?: number;
  enabled?: boolean;
}

async function fetchProducts({ 
  categoryId, 
  limit = 20, 
  page = 1 
}: {
  categoryId?: string | null;
  limit?: number;
  page?: number;
}): Promise<Product[]> {
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  params.set('page', String(page));
  params.set('includeVariants', 'true'); // Include variants for cart functionality
  
  if (categoryId) {
    params.set('categoryId', categoryId);
  }
  
  const response = await fetch(`/api/products?${params.toString()}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch products: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data: ProductsResponse = await response.json();
  return data.data;
}

export function useProducts({ 
  categoryId, 
  limit = 20, 
  page = 1, 
  enabled = true 
}: UseProductsOptions = {}) {
  return useQuery({
    queryKey: ['products', { categoryId, limit, page }],
    queryFn: () => fetchProducts({ categoryId, limit, page }),
    enabled: enabled, // Always enabled, categoryId can be null to show all products
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes cache time
    retry: (failureCount, error) => {
      // Don't retry on 404 errors
      if (error instanceof Error && error.message.includes('404')) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Hook for infinite scrolling (optional enhancement)
export function useInfiniteProducts({ categoryId }: { categoryId?: string | null }) {
  return useQuery({
    queryKey: ['products', 'infinite', categoryId],
    queryFn: () => fetchProducts({ categoryId, limit: 20, page: 1 }),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}
