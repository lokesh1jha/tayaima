"use client";

import { useCategoryNavigation } from "@/hooks/useCategoryNavigation";
import Card from "./ui/Card";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  parentId?: string | null;
  sortOrder?: number;
  parent?: {
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
  } | null;
  children?: Category[];
  _count?: {
    products: number;
  };
}

interface CategoryChipsProps {
  categories: Category[];
}

export default function CategoryChips({ categories }: CategoryChipsProps) {
  const { navigateToCategory } = useCategoryNavigation();

  if (categories.length === 0) return null;

  // Show only parent categories (super categories)
  const parentCategories = categories.filter(cat => !cat.parentId);

  // Color palette for parent categories
  const getCategoryColor = (index: number) => {
    const colors = [
      { bg: 'from-green-500 to-green-600', hover: 'hover:border-green-200 dark:hover:border-green-800', text: 'group-hover:text-green-600 dark:group-hover:text-green-400' },
      { bg: 'from-orange-500 to-orange-600', hover: 'hover:border-orange-200 dark:hover:border-orange-800', text: 'group-hover:text-orange-600 dark:group-hover:text-orange-400' },
      { bg: 'from-purple-500 to-purple-600', hover: 'hover:border-purple-200 dark:hover:border-purple-800', text: 'group-hover:text-purple-600 dark:group-hover:text-purple-400' },
      { bg: 'from-pink-500 to-pink-600', hover: 'hover:border-pink-200 dark:hover:border-pink-800', text: 'group-hover:text-pink-600 dark:group-hover:text-pink-400' },
      { bg: 'from-indigo-500 to-indigo-600', hover: 'hover:border-indigo-200 dark:hover:border-indigo-800', text: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400' },
      { bg: 'from-red-500 to-red-600', hover: 'hover:border-red-200 dark:hover:border-red-800', text: 'group-hover:text-red-600 dark:group-hover:text-red-400' },
    ];
    return colors[index % colors.length];
  };

  return (
    <section className="container max-w-[1400px] py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Shop by Category</h2>
        <p className="text-gray-600 dark:text-gray-400">Browse our wide selection of categories</p>
      </div>
      
      {/* Grid layout for parent categories - consistent sizing */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {parentCategories.map((category, index) => {
          const colorScheme = getCategoryColor(index);
          
          return (
            <button
              key={category.id}
              onClick={() => navigateToCategory(category.id)}
              className="w-full"
            >
              <Card className={`p-2 sm:p-4 text-center hover:shadow-lg transition-all duration-200 cursor-pointer group border-2 border-transparent ${colorScheme.hover} h-full`}>
                <div className="flex flex-col items-center justify-center space-y-1 sm:space-y-2 h-full">
                  {/* Category Icon with dynamic colors - consistent sizing */}
                  <div className={`w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br ${colorScheme.bg} rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-lg group-hover:scale-110 transition-transform duration-200`}>
                    {category.icon || category.name.charAt(0).toUpperCase()}
                  </div>
                  
                  {/* Category Name with dynamic hover colors - consistent text sizing */}
                  <h3 className={`text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 ${colorScheme.text} transition-colors leading-tight`}>
                    {category.name}
                  </h3>
                </div>
              </Card>
            </button>
          );
        })}
      </div>
    </section>
  );
}
