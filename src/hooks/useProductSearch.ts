import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  images: string[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
  variants: {
    id: string;
    unit: string;
    amount: number;
    price: number;
    stock: number;
  }[];
}

interface SearchResult {
  products: Product[];
  meta: {
    query: string;
    total: number;
    limit: number;
    cached?: boolean;
    cachedAt?: string;
    fetchedAt?: string;
  };
}

interface UseProductSearchOptions {
  isAdmin?: boolean;
  limit?: number;
  debounceMs?: number;
}

async function searchProducts(
  query: string, 
  isAdmin: boolean = false, 
  limit: number = 20
): Promise<SearchResult> {
  const endpoint = isAdmin ? '/api/admin/products/search' : '/api/products/search';
  const params = new URLSearchParams({
    q: query,
    limit: String(limit)
  });

  const response = await fetch(`${endpoint}?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }
  
  return response.json();
}

export function useProductSearch({
  isAdmin = false,
  limit = 20,
  debounceMs = 300
}: UseProductSearchOptions = {}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchQuery, debounceMs]);

  // Only search if query is at least 3 characters
  const shouldSearch = debouncedQuery.trim().length >= 3;

  const {
    data: searchResult,
    isLoading,
    error,
    isFetching
  } = useQuery({
    queryKey: ['productSearch', debouncedQuery, isAdmin, limit],
    queryFn: () => searchProducts(debouncedQuery, isAdmin, limit),
    enabled: shouldSearch,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
  }, []);

  return {
    searchQuery,
    debouncedQuery,
    searchResult: searchResult?.products || [],
    meta: searchResult?.meta,
    isLoading: isLoading || isFetching,
    error,
    handleSearch,
    clearSearch,
    shouldSearch
  };
}
