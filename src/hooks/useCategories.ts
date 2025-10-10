import { useQuery } from '@tanstack/react-query';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  parentId?: string | null;
  sortOrder?: number;
  parent?: {
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
  };
  children?: Category[];
  _count?: {
    products: number;
  };
}

interface CategoriesResponse {
  categories: Category[];
}

async function fetchCategories(): Promise<Category[]> {
  const response = await fetch('/api/categories');
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  const data: CategoriesResponse = await response.json();
  return data.categories;
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes - categories don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes cache time
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
