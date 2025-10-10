// Cache for categories (they change infrequently)
let categoriesCache: { data: any; timestamp: number } | null = null;
const CATEGORIES_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Clear cache function for when structure changes
export function clearCategoriesCache() {
  categoriesCache = null;
}

// Get cache function
export function getCategoriesCache() {
  return categoriesCache;
}

// Set cache function
export function setCategoriesCache(data: any) {
  categoriesCache = { data, timestamp: Date.now() };
}

// Check if cache is valid
export function isCategoriesCacheValid(): boolean {
  return categoriesCache !== null && Date.now() - categoriesCache.timestamp < CATEGORIES_CACHE_TTL;
}
