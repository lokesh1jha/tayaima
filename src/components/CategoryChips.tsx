"use client";

import { useCategoryNavigation } from "@/hooks/useCategoryNavigation";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategoryChipsProps {
  categories: Category[];
}

export default function CategoryChips({ categories }: CategoryChipsProps) {
  const { navigateToCategory } = useCategoryNavigation();

  if (categories.length === 0) return null;

  return (
    <section className="container max-w-[1400px] py-2">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => navigateToCategory(category.id)}
            className="flex-shrink-0 inline-block px-4 py-2 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {category.name}
          </button>
        ))}
      </div>
    </section>
  );
}
