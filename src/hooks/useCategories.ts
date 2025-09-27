import { useQuery } from '@tanstack/react-query';

export interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategoriesResponse {
  categories: Category[];
}

async function fetchCategories(): Promise<Category[]> {
  const response = await fetch('/api/categories');
  
  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.statusText}`);
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
  });
}
